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
        $valid_fields = array();



        // Filtrar campos select/radio/checkbox del formulario

        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                if (in_array($field['type'], ['select', 'radio', 'checkbox'])) {
                    $valid_fields[] = $field;
                }
            }
        }
        // Si no hay campos válidos, mostrar mensaje
        if (empty($valid_fields)) {
            echo '<div class="notice notice-warning"><p>No se encontraron campos de tipo select, radio o checkbox en el formulario.</p></div>';
            return;
        }

        // Guardar los campos válidos en una variable temporal para usar en la vista
        $this->valid_fields = $valid_fields;
        $fields_for_view = $this->valid_fields;

        // Incluir la vista
        include_once 'views/form-to-map.php';
    }

    public function save_layer_settings()
{
    check_ajax_referer('nm_admin_nonce', 'nonce');

    if (!current_user_can('manage_options')) {
        wp_send_json_error('Permiso denegado');
    }

    $settings = isset($_POST['settings']) ? $_POST['settings'] : array();
    parse_str($settings, $layer_settings);

    $saved_settings = get_option('nm_layer_settings', array());

    // Actualizar los valores
    foreach ($layer_settings['layers'] as $key => $values) {
        if (isset($values['active']) && $values['active'] === 'on') {
            $saved_settings[$key] = array(
                'active' => 'on'
            );

            // Procesar colores y etiquetas
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
                    $saved_settings[$key]['colors'] = $colors;
                }
            }
        } else {
            unset($saved_settings[$key]);
        }
    }

    if (update_option('nm_layer_settings', $saved_settings)) {
        wp_send_json_success();
    } else {
        wp_send_json_error('Error al guardar la configuración');
    }
}

    
}
