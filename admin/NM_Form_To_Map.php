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

        // Filtrar campos por tipo
        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                if (in_array($field['type'], ['select', 'radio', 'checkbox'])) {
                    $select_fields[] = $field;
                } elseif ($field['type'] === 'text') {
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

            $settings = isset($_POST['settings']) ? $_POST['settings'] : '';
            if (empty($settings)) {
                error_log('NexusMap: No settings data received in save_layer_settings');
                wp_send_json_error('No se recibieron datos');
                return;
            }

            parse_str($settings, $layer_settings);
            if (empty($layer_settings)) {
                error_log('NexusMap: Failed to parse settings string in save_layer_settings');
                wp_send_json_error('Error al procesar los datos recibidos');
                return;
            }

            error_log('NexusMap: Received layer settings: ' . print_r($layer_settings, true));
            
            // Inicializar nuevo array de configuraciones
            $new_settings = array();

            // Procesar campos select/radio/checkbox
            if (isset($layer_settings['layers']) && is_array($layer_settings['layers'])) {
                foreach ($layer_settings['layers'] as $key => $values) {
                    if (isset($values['active']) && $values['active'] === 'on') {
                        $new_settings[$key] = array(
                            'active' => 'on',
                            'type' => 'select'
                        );

                        if (isset($values['colors']) && isset($values['labels'])) {
                            $colors = array();
                            $labels = $values['labels'];
                            
                            foreach ($values['colors'] as $index => $color) {
                                if (isset($labels[$index])) {
                                    $label = sanitize_text_field($labels[$index]);
                                    $colors[$label] = sanitize_text_field($color);
                                }
                            }
                            
                            if (!empty($colors)) {
                                $new_settings[$key]['colors'] = $colors;
                            }
                        }
                    }
                }
            }

            // Procesar campos de texto
            if (isset($layer_settings['text_layers']) && is_array($layer_settings['text_layers'])) {
                foreach ($layer_settings['text_layers'] as $key => $values) {
                    if (isset($values['active']) && $values['active'] === 'on') {
                        $new_settings[$key] = array(
                            'active' => 'on',
                            'type' => 'text',
                            'color' => sanitize_text_field($values['color']),
                            'label' => sanitize_text_field($values['label'])
                        );
                    }
                }
            }

            error_log('NexusMap: Attempting to save settings: ' . print_r($new_settings, true));

            $update_result = update_option('nm_layer_settings', $new_settings);
            if ($update_result) {
                error_log('NexusMap: Settings saved successfully');
                wp_send_json_success('Configuración guardada correctamente');
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
