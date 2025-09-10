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
                // Incluir campos de nivel superior que son filtrables
                if (in_array($field['type'], ['select', 'radio', 'checkbox', 'conditional-select'])) {
                    $valid_fields[] = $field;
                }
                
                // Si es un conditional-select, extraer también sus campos delegados
                if ($field['type'] === 'conditional-select' && isset($field['options'])) {
                    foreach ($field['options'] as $option) {
                        if (isset($option['conditional_fields']) && is_array($option['conditional_fields'])) {
                            foreach ($option['conditional_fields'] as $conditional_field) {
                                // Solo incluir campos condicionales que sean filtrables
                                if (in_array($conditional_field['type'], ['select', 'radio', 'checkbox'])) {
                                    // Crear una copia del campo para evitar modificar el original
                                    $filtered_field = $conditional_field;
                                    
                                    // Agregar información del campo padre para distinguirlo
                                    $filtered_field['parent_field'] = $field['name'];
                                    $filtered_field['parent_label'] = $field['label'];
                                    $filtered_field['parent_option'] = $option['id'] ?? $option['value'];
                                    $filtered_field['parent_option_label'] = $option['value'];
                                    $filtered_field['is_conditional'] = true;
                                    
                                    // Crear un nombre único para el campo condicional
                                    $filtered_field['unique_name'] = $field['name'] . '_' . ($option['id'] ?? $option['value']) . '_' . $conditional_field['name'];
                                    
                                    $valid_fields[] = $filtered_field;
                                }
                            }
                        }
                    }
                }
            }
        }

        $this->valid_fields = $valid_fields;
        include_once 'views/form-filters.php';
    }

    /**
     * Método auxiliar para encontrar un campo condicional específico
     */
    private function find_conditional_field($form_data, $parent_field_name, $parent_option, $field_name) {
        if (!isset($form_data['fields'])) {
            return null;
        }
        
        foreach ($form_data['fields'] as $field) {
            if ($field['type'] === 'conditional-select' && $field['name'] === $parent_field_name) {
                foreach ($field['options'] as $option) {
                    if (($option['id'] ?? $option['value']) === $parent_option) {
                        if (isset($option['conditional_fields'])) {
                            foreach ($option['conditional_fields'] as $conditional_field) {
                                if ($conditional_field['name'] === $field_name) {
                                    return $conditional_field;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return null;
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
                    $filter_config = array(
                        'active' => true,
                        'button_text' => sanitize_text_field($values['button_text']),
                        'style' => array(
                            'background' => sanitize_hex_color($values['style']['background']),
                            'color' => sanitize_hex_color($values['style']['color'])
                        )
                    );
                    
                    // Si es un campo condicional, agregar información adicional
                    if (strpos($key, '_') !== false && count(explode('_', $key)) >= 3) {
                        $parts = explode('_', $key);
                        $filter_config['is_conditional'] = true;
                        $filter_config['parent_field'] = $parts[0];
                        $filter_config['parent_option'] = $parts[1];
                        $filter_config['field_name'] = implode('_', array_slice($parts, 2));
                    }
                    
                    $saved_settings[$key] = $filter_config;
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