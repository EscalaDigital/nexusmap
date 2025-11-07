<?php

class NM_Form_To_Map
{
    private $loader;
    private $model;
    private $valid_fields;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();
        
        // Registrar las acciones
        $this->loader->add_action('admin_menu', $this, 'add_form_to_map_menu');
        $this->loader->add_action('wp_ajax_nm_save_layer_settings', $this, 'save_layer_settings');
    }

    public function add_form_to_map_menu()
    {
        add_submenu_page(
            'nm',
            'Gestor de Capas',
            'Gestor de Capas',
            'manage_options',
            'nm-form-to-map',
            array($this, 'render_form_to_map_page')
        );
    }

    public function render_form_to_map_page()
    {
        // Verificar si existe la opción A/B
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);

        if ($ab_option_enabled) {
            echo '<div class="notice notice-warning"><p>Esta funcionalidad no está disponible cuando el modo A/B está activado.</p></div>';
            return;
        }

        // Obtener los datos del formulario usando el modelo
        $form_data = $this->model->get_form(0); // form_type = 0
        $select_fields = array();
        $text_fields = array();

        // Filtrar campos por tipo (e incluir subcampos de selects condicionales)
        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                if (in_array($field['type'], ['select', 'radio', 'checkbox'])) {
                    $select_fields[] = $field;
                } elseif ($field['type'] === 'conditional-select') {
                    // Añadir también el propio select condicional como capa posible
                    // Sus opciones vienen con estructura {id, value}
                    $parentField = $field;
                    // Asegurar estructura mínima
                    $parentField['label'] = isset($parentField['label']) ? $parentField['label'] : ($parentField['name'] ?? '');
                    $parentField['type'] = 'select';
                    $select_fields[] = $parentField;

                    // Explorar opciones y subcampos condicionales como capas posibles
                    if (!empty($field['options']) && is_array($field['options'])) {
                        foreach ($field['options'] as $opt) {
                            $optId = isset($opt['id']) ? $opt['id'] : (isset($opt['value']) ? $opt['value'] : '');
                            if (!empty($opt['conditional_fields']) && is_array($opt['conditional_fields'])) {
                                foreach ($opt['conditional_fields'] as $cfield) {
                                    if (in_array($cfield['type'], ['select', 'radio', 'checkbox'])) {
                                        // Preparar entrada similar a un campo normal, con metadatos condicionales
                                        $cf = array(
                                            'name'  => $cfield['name'] ?? '',
                                            'label' => $cfield['label'] ?? ($cfield['name'] ?? ''),
                                            'type'  => $cfield['type'],
                                            'options' => $cfield['options'] ?? array(),
                                            'is_conditional' => true,
                                            'parent_field' => $field['name'] ?? '',
                                            'parent_option' => $optId,
                                            'field_name' => $cfield['name'] ?? ''
                                        );
                                        $select_fields[] = $cf;
                                    }
                                }
                            }
                        }
                    }
                } elseif (in_array($field['type'], ['text', 'textarea'])) {
                    $text_fields[] = $field;
                }
            }
        }

        // Si no hay campos válidos, mostrar mensaje
        if (empty($select_fields) && empty($text_fields)) {
            echo '<div class="notice notice-warning"><p>No se encontraron campos válidos en el formulario.</p></div>';
            return;
        }

        // Guardar los campos válidos en variables para usar en la vista
        $this->valid_fields = $select_fields;
        $fields_for_view = $this->valid_fields;
        $text_fields_for_view = $text_fields;

        // Incluir la vista
        include_once 'views/form-to-map.php';
    }

    public function save_layer_settings()
    {
        try {
            if (!check_ajax_referer('nm_admin_nonce', 'nonce', false)) {
                error_log('NexusMap: Nonce verification failed in save_layer_settings');
                wp_send_json_error('Error de verificación de seguridad');
                return;
            }
    
            if (!current_user_can('manage_options')) {
                error_log('NexusMap: Permission denied in save_layer_settings');
                wp_send_json_error('Permiso denegado');
                return;
            }
    
            // Recibir los datos
            $settings = isset($_POST['settings']) ? $_POST['settings'] : array();
            
            // Guardar el nombre de la capa de texto
            if (isset($settings['nm_text_layer_name'])) {
                update_option('nm_text_layer_name', sanitize_text_field($settings['nm_text_layer_name']));
            }
            
            // Debug de datos recibidos
            error_log('NexusMap: Raw POST data: ' . print_r($_POST, true));
            error_log('NexusMap: Settings received: ' . print_r($settings, true));
    
            if (empty($settings)) {
                error_log('NexusMap: No settings data received in save_layer_settings');
                wp_send_json_error('No se recibieron datos');
                return;
            }
    
            // Inicializar nuevo array de configuraciones
            $new_settings = array();
    
            // Procesar campos select/radio/checkbox
            if (isset($settings['layers']) && is_array($settings['layers'])) {
                foreach ($settings['layers'] as $key => $layer_data) {
                    if (isset($layer_data['active']) && $layer_data['active'] === 'on') {
                        $new_settings[$key] = array(
                            'active' => 'on',
                            'type' => 'select'
                        );
                        
                        if (isset($layer_data['colors']) && isset($layer_data['labels'])) {
                            $new_settings[$key]['colors'] = array_combine(
                                array_map('sanitize_text_field', $layer_data['labels']),
                                array_map('sanitize_text_field', $layer_data['colors'])
                            );
                        }
                    }
                }
            }
    
            // Procesar campos de texto
            if (isset($settings['text_layers']) && is_array($settings['text_layers'])) {
                foreach ($settings['text_layers'] as $key => $text_data) {
                    if (isset($text_data['active']) && $text_data['active'] === 'on') {
                        $new_settings[$key] = array(
                            'active' => 'on',
                            'type' => 'text',
                            'color' => sanitize_text_field($text_data['color']),
                            'label' => sanitize_text_field($text_data['label'])
                        );
                    }
                }
            }
    
            error_log('NexusMap: Final settings to save: ' . print_r($new_settings, true));
            
            // Guardar la configuración
            $update_result = update_option('nm_layer_settings', $new_settings);
            
            if ($update_result) {
                error_log('NexusMap: Settings saved successfully');
                wp_send_json_success(array(
                    'message' => 'Configuración guardada correctamente',
                    'type' => 'success'
                ));
            } else {
                error_log('NexusMap: Failed to update settings in database');
                wp_send_json_error('Error al guardar la configuración en la base de datos');
            }
    
        } catch (Exception $e) {
            error_log('NexusMap Error in save_layer_settings: ' . $e->getMessage());
            wp_send_json_error('Error interno del servidor: ' . $e->getMessage());
        }
    }
}
