<?php

class NM_Chart_Manager
{
    private $loader;
    private $model;

    public function __construct($loader)
    {
        /**
         * $loader es asumido como una instancia que registra hooks de WordPress.
         * Verifica que realmente haga la llamada al add_action('admin_menu', ...) 
         * y al add_action('wp_ajax_nm_save_chart_settings', ...).
         */
        $this->loader = $loader;
        $this->model  = new NM_Model();

        // Agregamos nuestro submenu en el admin
        $this->loader->add_action('admin_menu', $this, 'add_charts_menu');

        // Acción para manejar la llamada AJAX
        $this->loader->add_action('wp_ajax_nm_save_chart_settings', $this, 'save_chart_settings');
        
        // Acción para obtener datos de gráficos en el admin
        $this->loader->add_action('wp_ajax_nm_get_chart_data_admin', $this, 'get_chart_data_admin');
    }

    /**
     * Añade la página de Gestor de Gráficos como submenu de "nm"
     */
    public function add_charts_menu()
    {
        add_submenu_page(
            'nm',                          // slug del menú principal (verifica que exista)
            'Gestor de Gráficos',          // Título de la página
            'Gestor de Gráficos',          // Título del menú
            'manage_options',              // Capacidad requerida
            'nm-chart-manager',            // Slug del submenu
            array($this, 'render_charts_page') // Callback que renderiza el contenido
        );

        // Agregar página de visualización de gráficos privados
        add_submenu_page(
            'nm',                          // slug del menú principal
            'Ver Gráficos',               // Título de la página
            'Ver Gráficos',               // Título del menú
            'manage_options',              // Capacidad requerida
            'nm-charts-viewer',            // Slug del submenu
            array($this, 'render_charts_viewer_page') // Callback que renderiza el contenido
        );
    }

    /**
     * Renderiza la página con el formulario que selecciona campos numéricos y de categoría
     */
    public function render_charts_page()
    {
        // Verificar si la opción A/B está activa
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);
        if ($ab_option_enabled) {
            echo '<div class="notice notice-warning"><p>Esta funcionalidad no está disponible cuando el modo A/B está activado.</p></div>';
            return;
        }

        // Obtener configuración de visibilidad de gráficos
        $charts_visibility = get_option('nm_charts_visibility', 'public');

        // Obtenemos la info del formulario desde la base de datos (ajusta 0 si corresponde)
        $form_data = $this->model->get_form(0);

        // Arrays para guardar campos
        $numeric_fields = array();
        $category_fields = array();

        /**
         * Verifica que $form_data realmente contenga 'fields' como un array. 
         * Si la estructura de $form_data es diferente, ajusta la lógica.
         */
        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            global $wpdb;
            foreach ($form_data['fields'] as $field) {
                if (!isset($field['type'])) continue;

                if (in_array($field['type'], ['select','radio','checkbox','text','textarea','number','conditional-select'])) {
                    $category_fields[] = $field;
                }
                if ($field['type'] === 'number') {
                    $numeric_fields[] = $field;
                }

                if ($field['type'] === 'conditional-select' && !empty($field['select_id'])) {
                    $table = $wpdb->prefix . 'nm_conditional_fields';
                    $rows = $wpdb->get_results(
                        $wpdb->prepare(
                            "SELECT option_id, fields_json FROM {$table} WHERE select_id = %s",
                            $field['select_id']
                        ),
                        ARRAY_A
                    );
                    if ($rows) {
                        foreach ($rows as $row) {
                            $subfields = json_decode($row['fields_json'], true);
                            if (!is_array($subfields)) continue;
                            foreach ($subfields as $sub) {
                                if (!is_array($sub) || !isset($sub['type']) || !isset($sub['name'])) continue;
                                // Evitar duplicados por nombre
                                $alreadyCategory = false;
                                foreach ($category_fields as $cf) { if (isset($cf['name']) && $cf['name'] === $sub['name']) { $alreadyCategory = true; break; } }
                                if (in_array($sub['type'], ['select','radio','checkbox','text','textarea','number']) && !$alreadyCategory) {
                                    $sub_copy = $sub;
                                    $sub_copy['is_conditional'] = true;
                                    $sub_copy['parent_field'] = $field['name'];
                                    $category_fields[] = $sub_copy;
                                }
                                if ($sub['type'] === 'number') {
                                    $alreadyNumeric = false;
                                    foreach ($numeric_fields as $nf) { if (isset($nf['name']) && $nf['name'] === $sub['name']) { $alreadyNumeric = true; break; } }
                                    if (!$alreadyNumeric) {
                                        $sub_num = $sub;
                                        $sub_num['is_conditional'] = true;
                                        $sub_num['parent_field'] = $field['name'];
                                        $numeric_fields[] = $sub_num;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        

      
        if (empty($category_fields)) {
            echo '<div class="notice notice-warning"><p>No se encontraron campos de categorías en el formulario.</p></div>';
            return;
        }

        // Recuperamos los gráficos guardados (nm_chart_settings)
        $saved_charts = get_option('nm_chart_settings', array());
        // Incluimos la vista (archivo PHP) que contendrá el HTML
        // Ajusta la ruta según tu estructura
        include_once 'views/chart-manager.php';
    }

    /**
     * Maneja la llamada AJAX para guardar los ajustes de los gráficos
     */
    public function save_chart_settings()
    {
        // Verificamos el nonce. Ajusta 'nm_admin_nonce' según cómo lo generes en tu JS/PHP
        check_ajax_referer('nm_admin_nonce', 'nonce');

        // Verificamos permisos
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permiso denegado');
        }

        // Obtenemos la data del request
        $settings = isset($_POST['settings']) ? $_POST['settings'] : '';
        
        // Parsear todos los settings
        $parsed_settings = array();
        $charts_visibility = 'public'; // valor por defecto
        
        if (!empty($settings)) {
            parse_str($settings, $parsed_settings);
            
            if (isset($parsed_settings['charts_visibility'])) {
                $charts_visibility = sanitize_text_field($parsed_settings['charts_visibility']);
            }
        }
        
        // Si no hay gráficos configurados
        if (empty($parsed_settings['charts'])) {
            // Guardar array vacío pero mantener la configuración de visibilidad
            update_option('nm_chart_settings', array());
            update_option('nm_charts_visibility', $charts_visibility);
            wp_send_json_success(array('message' => 'Configuración de visibilidad actualizada'));
            return;
        }

        // Usar los settings ya parseados
        $chart_settings = $parsed_settings;

        $charts = array();
        if (isset($chart_settings['charts']) && is_array($chart_settings['charts'])) {
            foreach ($chart_settings['charts'] as $chart) {
                // Aseguramos extraer cada valor (con fallback si no existe)
                $title          = isset($chart['title'])          ? sanitize_text_field($chart['title'])          : '';
                $numeric_field1 = isset($chart['numeric_field1']) ? sanitize_text_field($chart['numeric_field1']) : '';
                $numeric_field2 = isset($chart['numeric_field2']) ? sanitize_text_field($chart['numeric_field2']) : '';
                $category_field = isset($chart['category_field']) ? sanitize_text_field($chart['category_field']) : '';
                $category_field_2 = isset($chart['category_field_2']) ? sanitize_text_field($chart['category_field_2']) : '';
                $chart_type     = isset($chart['chart_type'])     ? sanitize_text_field($chart['chart_type'])     : '';
                $stacked        = isset($chart['stacked']) ? sanitize_text_field($chart['stacked']) : 'auto';
                $value_labels_mode = isset($chart['value_labels_mode']) ? sanitize_text_field($chart['value_labels_mode']) : 'auto';
                $bar_orientation   = isset($chart['bar_orientation']) ? sanitize_text_field($chart['bar_orientation']) : 'auto';

                if (!empty($title) && !empty($category_field) && !empty($chart_type)) {
                    $charts[] = array(
                        'title'          => $title,
                        'count_only'     => empty($numeric_field1), // True si no hay campo numérico
                        'numeric_field1' => $numeric_field1,
                        'numeric_field2' => $numeric_field2,
                        'category_field' => $category_field,
                        'category_field_2' => $category_field_2,
                        'chart_type'     => $chart_type,
                        'stacked'        => $stacked,
                        'value_labels_mode' => $value_labels_mode,
                        'bar_orientation'   => $bar_orientation
                    );
                }
            }
        }

        // Guardamos en la base de datos (puede ser array vacío)
        $updated_charts = update_option('nm_chart_settings', $charts);
        $updated_visibility = update_option('nm_charts_visibility', $charts_visibility);

        // Envía una respuesta JSON
        if ($updated_charts || $updated_visibility) {
            if (empty($charts)) {
                wp_send_json_success(array('message' => 'Todos los gráficos han sido eliminados y configuración actualizada'));
            } else {
                wp_send_json_success(array('message' => 'Configuración guardada exitosamente'));
            }
        } else {
            // Ojo: update_option devuelve false si la información es igual a la que ya estaba guardada.
            // Podrías manejar el caso donde no se actualice por no haber cambios.
            if (empty($charts)) {
                wp_send_json_success(array('message' => 'Ya no había gráficos configurados'));
            } else {
                wp_send_json_success(array('message' => 'Sin cambios o ya estaba guardado'));
            }
        }
    }

    /**
     * Renderiza la página de visualización de gráficos (modo privado)
     */
    public function render_charts_viewer_page()
    {
        // Verificar si la opción A/B está activa
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);
        if ($ab_option_enabled) {
            echo '<div class="notice notice-warning"><p>Esta funcionalidad no está disponible cuando el modo A/B está activado.</p></div>';
            return;
        }

        // Obtener configuración de gráficos
        $saved_charts = get_option('nm_chart_settings', array());
        $charts_visibility = get_option('nm_charts_visibility', 'public');

        if (empty($saved_charts)) {
            echo '<div class="wrap">';
            echo '<h1>Ver Gráficos</h1>';
            echo '<div class="notice notice-info"><p>No hay gráficos configurados. <a href="' . admin_url('admin.php?page=nm-chart-manager') . '">Configurar gráficos</a></p></div>';
            echo '</div>';
            return;
        }

        if ($charts_visibility === 'public') {
            echo '<div class="wrap">';
            echo '<h1>Ver Gráficos</h1>';
            echo '<div class="notice notice-info"><p>Los gráficos están configurados como públicos y se muestran en el frontend del mapa. <a href="' . admin_url('admin.php?page=nm-chart-manager') . '">Cambiar configuración</a></p></div>';
            echo '</div>';
            return;
        }

        // Obtener los datos del formulario
        $form_data = $this->model->get_form(0);
        
        // Incluir la vista del visor de gráficos
        include_once 'views/charts-viewer.php';
    }

    /**
     * Handler AJAX para obtener datos de gráficos en el administrador
     */
    public function get_chart_data_admin()
    {
        // Verificar nonce
        check_ajax_referer('nm_admin_nonce', 'nonce');

        // Verificar permisos
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permiso denegado');
        }

        try {
            // Obtener todas las entradas aprobadas del formulario - igual que en frontend
            $entries_raw = $this->model->get_entries('approved');
            $features = array();

            // Procesar exactamente igual que en get_map_points del frontend
            foreach ($entries_raw as $entry) {
                $entry_data = maybe_unserialize($entry->entry_data);
                
                if (isset($entry_data['map_data'])) {
                    $raw_json = wp_unslash($entry_data['map_data']);

                    try {
                        // Decodificar JSON igual que en frontend
                        $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);
                    } catch (\JsonException $e) {
                        error_log(sprintf(
                            'JSON ERROR (entry_id %d): %s',
                            $entry->id,
                            $e->getMessage()
                        ));
                        continue;
                    }

                    if (json_last_error() === JSON_ERROR_NONE && is_array($map_data)) {
                        foreach ($map_data as $feature) {
                            if (isset($feature['geometry']['type']) && $feature['geometry']['type'] === 'Point') {
                                
                                // Agregar todas las propiedades del entry_data al properties (igual que frontend)
                                foreach ($entry_data as $key => $value) {
                                    if ($key !== 'map_data') {
                                        $feature['properties'][$key] = $value;
                                    }
                                }

                                // Agregar el entry_id
                                $feature['properties']['entry_id'] = $entry->id;

                                $features[] = $feature;
                            }
                        }
                    }
                }
            }
            
            // Convertir features al formato que espera el JavaScript del admin
            $entries = array();
            foreach ($features as $feature) {
                $entries[] = array(
                    'id' => $feature['properties']['entry_id'],
                    'custom_fields' => $feature['properties'], // Todas las propiedades del feature
                );
            }
            
            // Obtener configuración de gráficos
            $chart_settings = get_option('nm_chart_settings', array());

            // Debug log
            error_log('NM Chart Manager - Features procesados: ' . count($features));
            error_log('NM Chart Manager - Entradas para gráficos: ' . count($entries));
            error_log('NM Chart Manager - Gráficos configurados: ' . count($chart_settings));
            if (!empty($entries)) {
                error_log('NM Chart Manager - Ejemplo de custom_fields: ' . print_r(array_keys($entries[0]['custom_fields']), true));
            }

            wp_send_json_success(array(
                'entries' => $entries,
                'charts' => $chart_settings
            ));
        } catch (Exception $e) {
            error_log('NM Chart Manager - Error: ' . $e->getMessage());
            wp_send_json_error('Error al obtener los datos: ' . $e->getMessage());
        }
    }
}
