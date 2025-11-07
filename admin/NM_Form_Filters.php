<?php

class NM_Form_Filters {
    private $loader;
    private $model;
    private $valid_fields;
    private $conditional_field_map = array(); // unique_key => meta

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

    global $wpdb;
    $form_data = $this->model->get_form(0);
    $valid_fields = array();
    $this->conditional_field_map = array();

        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                // Incluir campos de nivel superior que son filtrables
                if (in_array($field['type'], ['select', 'radio', 'checkbox'])) {
                    // Campos normales directamente filtrables
                    $valid_fields[] = $field;
                } elseif ($field['type'] === 'conditional-select') {
                    // El propio conditional-select debe ser filtrable (como un select normal)
                    $valid_fields[] = $field;

                    // Obtener subcampos desde la tabla nm_conditional_fields
                    if (!empty($field['select_id'])) {
                        $table = $wpdb->prefix . 'nm_conditional_fields';
                        $rows = $wpdb->get_results(
                            $wpdb->prepare(
                                "SELECT option_id, fields_json FROM {$table} WHERE select_id = %s",
                                $field['select_id']
                            ),
                            ARRAY_A
                        );

                        // Mapa id opcion -> label (value) desde la definición del form
                        $option_labels = array();
                        if (isset($field['options']) && is_array($field['options'])) {
                            foreach ($field['options'] as $optdef) {
                                $oid = $optdef['id'] ?? $optdef['value'];
                                $option_labels[$oid] = $optdef['value'] ?? $oid;
                            }
                        }

                        if ($rows) {
                            foreach ($rows as $row) {
                                $option_id = $row['option_id'];
                                $subfields = json_decode($row['fields_json'], true);
                                if (!is_array($subfields)) continue;
                                foreach ($subfields as $sub) {
                                    if (!is_array($sub) || !isset($sub['type'])) continue;
                                    if (!in_array($sub['type'], ['select','radio','checkbox'])) continue; // sólo filtrables

                                    $filtered_field = $sub; // copia
                                    $filtered_field['parent_field'] = $field['name'];
                                    $filtered_field['parent_label'] = $field['label'];
                                    $filtered_field['parent_option'] = $option_id;
                                    $filtered_field['parent_option_label'] = $option_labels[$option_id] ?? $option_id;
                                    $filtered_field['is_conditional'] = true;
                                    $filtered_field['unique_name'] = $this->build_conditional_unique_key($field['name'], $option_id, $sub['name']);

                                    $this->conditional_field_map[$filtered_field['unique_name']] = array(
                                        'parent_field' => $field['name'],
                                        'parent_option' => $option_id,
                                        'field_name' => $sub['name']
                                    );

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

    private function build_conditional_unique_key($parent_field, $parent_option, $child_field) {
        return $parent_field . '|||'. $parent_option . '|||'. $child_field; // delimitador robusto
    }

    private function rebuild_conditional_map() {
        global $wpdb;
        $map = array();
        $form_data = $this->model->get_form(0);
        if (!isset($form_data['fields']) || !is_array($form_data['fields'])) return $map;
        foreach ($form_data['fields'] as $field) {
            if ($field['type'] !== 'conditional-select' || empty($field['select_id'])) continue;
            $table = $wpdb->prefix . 'nm_conditional_fields';
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT option_id, fields_json FROM {$table} WHERE select_id = %s",
                    $field['select_id']
                ),
                ARRAY_A
            );
            if (!$rows) continue;
            foreach ($rows as $row) {
                $option_id = $row['option_id'];
                $subfields = json_decode($row['fields_json'], true);
                if (!is_array($subfields)) continue;
                foreach ($subfields as $sub) {
                    if (!is_array($sub) || !isset($sub['name']) || !isset($sub['type'])) continue;
                    if (!in_array($sub['type'], ['select','radio','checkbox'])) continue;
                    $pipe_key = $this->build_conditional_unique_key($field['name'], $option_id, $sub['name']);
                    $underscore_key = $field['name'] . '_' . $option_id . '_' . $sub['name']; // compatibilidad vieja
                    $meta = array(
                        'parent_field' => $field['name'],
                        'parent_option' => $option_id,
                        'field_name' => $sub['name']
                    );
                    $map[$pipe_key] = $meta;
                    $map[$underscore_key] = $meta; // permitir lectura de claves antiguas
                }
            }
        }
        return $map;
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
            $conditional_map = $this->rebuild_conditional_map();
            foreach ($filter_settings['filters'] as $key => $values) {
                if (!isset($values['active']) || $values['active'] !== 'on') continue;
                $bg = isset($values['style']['background']) ? sanitize_hex_color($values['style']['background']) : '#ffffff';
                $fg = isset($values['style']['color']) ? sanitize_hex_color($values['style']['color']) : '#000000';
                $filter_config = array(
                    'active' => true,
                    'button_text' => sanitize_text_field($values['button_text']),
                    'style' => array(
                        'background' => $bg,
                        'color' => $fg
                    )
                );
                if (isset($conditional_map[$key])) {
                    $meta = $conditional_map[$key];
                    $filter_config['is_conditional'] = true;
                    $filter_config['parent_field'] = $meta['parent_field'];
                    $filter_config['parent_option'] = $meta['parent_option'];
                    $filter_config['field_name'] = $meta['field_name'];
                }
                $saved_settings[$key] = $filter_config;
            }
        }
    
        if (update_option('nm_filter_settings', $saved_settings)) {
            wp_send_json_success('Configuración guardada correctamente');
        } else {
            wp_send_json_error('Error al guardar la configuración');
        }
    }
}