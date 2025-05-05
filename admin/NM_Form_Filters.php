<?php

class NM_Form_Filters {
    private $loader;
    private $model;
    private $valid_fields;

    public function __construct($loader) {
        $this->loader = $loader;
        $this->model = new NM_Model();
        $this->loader->add_action('admin_menu', $this, 'add_filters_menu');
        $this->loader->add_action('wp_ajax_nm_save_filter_settings', $this, 'save_filter_settings');
    }

    public function add_filters_menu() {
        add_submenu_page(
            'nm',
            'Gestor de Filtros',
            'Gestor de Filtros',
            'manage_options',
            'nm-form-filters',
            array($this, 'render_filters_page')
        );
    }

    public function render_filters_page() {
        if (get_option('nm_ab_option_enabled', 0)) {
            echo '<div class="notice notice-warning"><p>Esta funcionalidad no está disponible cuando el modo A/B está activado.</p></div>';
            return;
        }

        $form_data = $this->model->get_form(0);
        $valid_fields = array();

        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                if (in_array($field['type'], ['select', 'radio', 'checkbox'])) {
                    $valid_fields[] = $field;
                }
            }
        }

        $this->valid_fields = $valid_fields;
        include_once 'views/form-filters.php';
    }

 
    public function save_filter_settings() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
    
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permiso denegado');
            return;
        }
    
        $settings = isset($_POST['settings']) ? $_POST['settings'] : '';
        if (empty($settings)) {
            wp_send_json_error('No se recibieron datos');
            return;
        }
    
        parse_str($settings, $filter_settings);
    
        $saved_settings = array();
    
        if (isset($filter_settings['filters'])) {
            foreach ($filter_settings['filters'] as $key => $values) {
                if (isset($values['active']) && $values['active'] === 'on') {
                    $saved_settings[$key] = array(
                        'active' => true,
                        'button_text' => sanitize_text_field($values['button_text']),
                        'style' => array(
                            'background' => sanitize_hex_color($values['style']['background']),
                            'color' => sanitize_hex_color($values['style']['color'])
                        )
                    );
                }
            }
        }
    
        if (update_option('nm_filter_settings', $saved_settings)) {
            wp_send_json_success('Configuración guardada correctamente');
        } else {
            wp_send_json_error('Error al guardar la configuración');
        }
    }
}