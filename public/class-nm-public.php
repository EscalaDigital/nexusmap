<?php

class NM_Public
{

    private $loader;
    private $model;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();

        // Register the shortcodes during the 'init' action
        $this->loader->add_action('init', $this, 'register_shortcodes');



        // Enqueue public assets
        $this->loader->add_action('wp_enqueue_scripts', $this, 'enqueue_public_assets');        // AJAX actions
        $this->loader->add_action('wp_ajax_nm_get_map_points', $this, 'get_map_points');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_map_points', $this, 'get_map_points');
        $this->loader->add_action('wp_ajax_nm_submit_form', $this, 'submit_form');

        // Registrar la acción AJAX para descargar el GeoJSON
        $this->loader->add_action('wp_ajax_nm_download_geojson', $this, 'download_geojson');
        $this->loader->add_action('wp_ajax_nopriv_nm_download_geojson', $this, 'download_geojson');

        // Register the AJAX action to get entry details para MOdal
        $this->loader->add_action('wp_ajax_nm_get_entry_details', $this, 'get_entry_details');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_entry_details', $this, 'get_entry_details');

        $this->loader->add_action('wp_ajax_nm_get_conditional_fields',  $this, 'get_conditional_fields');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_conditional_fields', $this, 'get_conditional_fields');
    }

    /**
     * Register shortcodes
     */
    public function register_shortcodes()
    {
        add_shortcode('nm_map', array($this, 'display_main_map'));
        add_shortcode('nm_form', array($this, 'display_custom_form'));
    }


    /**
     * Enqueue public assets
     */
    public function enqueue_public_assets()
    {
        global $post;

        // Enqueue styles that are needed in both cases
        wp_enqueue_style('nm-public-css', NM_PLUGIN_URL . 'public/css/public.css', array(), NM_VERSION);
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

        // Obtener el tema seleccionado de las opciones y cargarlo
        $selected_theme = get_option('nm_selected_theme', 'default');
        // Cargar el CSS del tema seleccionado después del CSS base
        if ($selected_theme === 'default') {
            wp_enqueue_style('nm-theme-css', NM_PLUGIN_URL . 'public/css/themes/theme1.css', array('nm-public-css'), NM_VERSION);
        } else {
            wp_enqueue_style('nm-theme-css', NM_PLUGIN_URL . 'public/css/themes/theme' . $selected_theme . '.css', array('nm-public-css'), NM_VERSION);
        }


        // Check if the [nm_map] shortcode is used in the content
        if (has_shortcode($post->post_content, 'nm_map')) {
            // Enqueue Leaflet CSS and JS
            // wp_enqueue_style('nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1');
            //   wp_enqueue_script('nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true);

            wp_enqueue_style(
                'nm-leaflet-css',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css',
                array(),
                '1.7.1'
            );
            wp_enqueue_script(
                'nm-leaflet-js',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js',
                array(),
                '1.7.1',
                true
            );

            // Enqueue Leaflet Control Geocoder
            wp_enqueue_style('leaflet-geocoder-css', 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css', array(), '1.13.0');
            wp_enqueue_script('leaflet-geocoder-js', 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js', array('nm-leaflet-js'), '1.13.0', true);
            /*
            wp_enqueue_style(
                'leaflet-geocoder-css',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet-control-geocoder/2.4.0/Control.Geocoder.css',
                array(),
                '2.4.0'
            );
            wp_enqueue_script(
                'leaflet-geocoder-js',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet-control-geocoder/2.4.0/Control.Geocoder.min.js',
                array('nm-leaflet-js'),
                '2.4.0',
                true
            );
            */
            // Enqueue functions related to the map
            wp_enqueue_script('nm-funcionesmaps-js', NM_PLUGIN_URL . 'public/js/funcionesmaps.js', array('jquery', 'nm-leaflet-js', 'leaflet-geocoder-js'), NM_VERSION, true);
            wp_enqueue_script('nm-public-js', NM_PLUGIN_URL . 'public/js/public.js', array('jquery', 'nm-leaflet-js', 'leaflet-geocoder-js', 'nm-funcionesmaps-js'), NM_VERSION, true);            // AGREGAR ESTA LOCALIZACIÓN PARA EL MAPA
            wp_localize_script('nm-public-js', 'nmPublic', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_public_nonce')
            ));
            
            // Para gráficos Chart.js
            wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js', array(), '4.4.0', true);
        }        // Check if the [nm_form] shortcode is used in the content
        if (has_shortcode($post->post_content, 'nm_form')) {
            // Enqueue Leaflet CSS and JS
            wp_enqueue_style('nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1');
            wp_enqueue_script('nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true);            // Enqueue Leaflet Draw CSS and JS
            wp_enqueue_style('nm-leaflet-draw-css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css', array('nm-leaflet-css'), '1.0.4');
            wp_enqueue_script('nm-leaflet-draw-js', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js', array('nm-leaflet-js'), '1.0.4', true);

            // Obtener el tema seleccionado de las opciones
            $selected_theme_form = get_option('nm_selected_theme_form', 'default');

            // Cargar el CSS del tema seleccionado
            if ($selected_theme_form === 'default') {
                wp_enqueue_style('nm-form-css', NM_PLUGIN_URL . 'public/css/themes/form1.css', array(), NM_VERSION);
            } else {
                wp_enqueue_style('nm-form-css', NM_PLUGIN_URL . 'public/css/themes/form' . $selected_theme_form  . '.css', array(), NM_VERSION);
            }            wp_enqueue_script('nm-form-js', NM_PLUGIN_URL . 'public/js/form.js', array('jquery', 'nm-leaflet-js', 'nm-leaflet-draw-js'), NM_VERSION, true);            // Enqueue geographic selector scripts
            wp_enqueue_style('nm-geographic-selector-css', NM_PLUGIN_URL . 'public/css/geographic-selector.css', array(), NM_VERSION);
            wp_enqueue_script('nm-geographic-selector-js', NM_PLUGIN_URL . 'public/js/geographic-selector.js', array('jquery'), NM_VERSION, true);            // Localize geographic selector script
            wp_localize_script('nm-geographic-selector-js', 'nmGeoSelector', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_public_nonce')
            ));// Localize script for AJAX handling
            wp_localize_script('nm-form-js', 'nmPublic', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_public_nonce')
            ));
        }
    }

    /**
     * Display the main map shortcode
     */
    public function display_main_map($atts)
    {
        // Extract attributes and set defaults
        $atts = shortcode_atts(array(
            'width'  => '100%',
            'height' => '500px',
            'lat'    => '0',
            'lng'    => '0',
            'zoom'   => '2',
        ), $atts, 'nm_map');

        // Obtener la configuración de capas
        $layer_settings = get_option('nm_layer_settings', array());

        // Obtener configuración de gráficos
        $chart_settings = get_option('nm_chart_settings', array());

        // Obtener la estructura del formulario
        $form_data = $this->model->get_form(0); // Obtiene el formulario principal
        $form_structure = array();

        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                if (!empty($field['name'])) {
                    $form_structure[] = array(
                        'name' => $field['name'],
                        'label' => $field['label'],
                        'type' => $field['type']
                    );
                }
            }
        }

        // Convertir la estructura del formulario a JSON para pasarla al frontend
        wp_localize_script('nm-public-js', 'nmFormStructure', array(
            'fields' => $form_structure
        ));

        ob_start();
        include NM_PLUGIN_DIR . 'public/views/main-map.php';
        return ob_get_clean();
    }

    public function display_custom_form()
    {
        if (!is_user_logged_in()) {
            return 'You must be logged in to view this form.';
        }



        // Check if the A/B option is enabled
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);

        if ($ab_option_enabled) {
            // If A/B option is enabled, retrieve forms A and B
            $form_data_a = $this->model->get_form(1); // form_type = 1
            $form_data_b = $this->model->get_form(2); // form_type = 2

            // Include the view that allows the user to choose between two options
            ob_start();
            include NM_PLUGIN_DIR . 'public/views/form-display-ab.php';
            return ob_get_clean();
        } else {
            // If A/B option is not enabled, retrieve the single form
            $form_data = $this->model->get_form(0); // form_type = 0

            // Include the single form view
            ob_start();
            include NM_PLUGIN_DIR . 'public/views/form-display.php';
            return ob_get_clean();
        }
    }


    /**
     * Get map geometries via AJAX
     */



    /**
     * Get map points via AJAX
     */
    public function get_map_points()
    {
        // Agregar logs para debug
        error_log('NexusMap: get_map_points called');
        error_log('NexusMap: POST data: ' . print_r($_POST, true));

        // Verificar si el nonce existe antes de validarlo
        if (!isset($_POST['nonce'])) {
            error_log('NexusMap: No nonce provided');
            wp_send_json_error('No nonce provided');
            return;
        }

        // Intentar verificar el nonce con manejo de errores
        if (!wp_verify_nonce($_POST['nonce'], 'nm_public_nonce')) {
            error_log('NexusMap: Nonce verification failed');
            wp_send_json_error('Invalid nonce');
            return;
        }

        error_log('NexusMap: Nonce verified successfully');

        $entries = $this->model->get_entries('approved');
        $features = array();

        // Obtener configuración de capas
        $layer_settings = get_option('nm_layer_settings', array());
        $has_layers = !empty($layer_settings);

        foreach ($entries as $entry) {
            $entry_data = maybe_unserialize($entry->entry_data);
            if (isset($entry_data['map_data'])) {


                $raw_json = wp_unslash($entry_data['map_data']);


                try {
                    // ② Intenta decodificar: si falla lanzará JsonException
                    $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);
                } catch (\JsonException $e) {

                    // ③ Apunta en el log la razón exacta y salta al siguiente registro
                    error_log(sprintf(
                        'JSON ERROR (entry_id %d): %s',
                        $entry->id,
                        $e->getMessage()          // ej.: "Syntax error"
                    ));

                    continue;                     // no añadas esta feature a $features
                }



                if (json_last_error() === JSON_ERROR_NONE && is_array($map_data)) {
                    foreach ($map_data as $feature) {
                        if (isset($feature['geometry']['type']) && $feature['geometry']['type'] === 'Point') {
                            // Inicializar array de capas
                            if (!isset($feature['properties']['layers'])) {
                                $feature['properties']['layers'] = array();
                            }

                            // Agregar todas las propiedades del entry_data al properties
                            foreach ($entry_data as $key => $value) {
                                if ($key !== 'map_data') {
                                    $feature['properties'][$key] = $value;
                                }
                            }

                            // Agregar el entry_id
                            $feature['properties']['entry_id'] = $entry->id;
                            $feature['properties']['has_layer'] = false;

                            // Si hay configuración de capas, buscar coincidencias
                            if ($has_layers) {
                                foreach ($layer_settings as $field_name => $layer_config) {
                                    $field_key = 'nm_' . $field_name;

                                    // Comprobar si existe la propiedad en feature properties
                                    if (isset($feature['properties'][$field_key])) {
                                        // Si es un campo de tipo texto
                                        if ($layer_config['type'] === 'text') {
                                            $value = $feature['properties'][$field_key];
                                            if (!empty($value)) {
                                                if (!isset($feature['properties']['text_layers'])) {
                                                    $feature['properties']['text_layers'] = array();
                                                }
                                                $feature['properties']['text_layers'][] = array(
                                                    'field_name' => $field_name,
                                                    'value' => $value,
                                                    'color' => $layer_config['color'],
                                                    'label' => $layer_config['label']
                                                );
                                                $feature['properties']['has_layer'] = true;
                                            }
                                        }
                                        // Si es un campo select/radio/checkbox
                                        else {
                                            $value = is_array($feature['properties'][$field_key])
                                                ? $feature['properties'][$field_key][0]
                                                : $feature['properties'][$field_key];

                                            // Convertir índices numéricos a strings para la comparación
                                            $colors = array_combine(
                                                array_map('strval', array_keys($layer_config['colors'])),
                                                $layer_config['colors']
                                            );

                                            if (isset($colors[$value])) {
                                                $feature['properties']['layers'][] = array(
                                                    'layer_field' => $field_name,
                                                    'layer_value' => $value,
                                                    'layer_color' => $colors[$value],
                                                    'layer_type' => 'select'
                                                );
                                                $feature['properties']['has_layer'] = true;
                                            }
                                        }
                                    }
                                }
                            }

                            $features[] = $feature;
                        }
                    }
                }
            }
        }

        // Preparar respuesta con configuración de capas
        $formatted_layer_settings = array();
        foreach ($layer_settings as $field_name => $config) {
            $formatted_layer_settings[] = array(
                'field' => $field_name,
                'label' => isset($config['label']) ? $config['label'] : $field_name,
                'type' => $config['type'],
                'colors' => isset($config['colors']) ? array_combine(
                    array_map('strval', array_keys($config['colors'])),
                    $config['colors']
                ) : ($config['type'] === 'text' ? array($config['color']) : array())
            );
        }

        $response = array(
            'features' => $features,
            'layer_settings' => $formatted_layer_settings
        );

        wp_send_json($response);
    }
    // Método para obtener detalles de la entrada
    public function get_entry_details()
    {
        check_ajax_referer('nm_public_nonce', 'nonce');
        $entry_id = isset($_POST['entry_id']) ? intval($_POST['entry_id']) : 0;

        if ($entry_id > 0) {
            $entry = $this->model->get_entry_by_id($entry_id);

            if ($entry) {
                $entry_data = maybe_unserialize($entry->entry_data);
                // Puedes seleccionar qué campos enviar al cliente
                $response_data = array(
                    'title'       => isset($entry_data['title']) ? esc_html($entry_data['title']) : 'Sin título',
                    'description' => isset($entry_data['description']) ? esc_html($entry_data['description']) : '',
                    // Agrega más campos según tus necesidades
                    // 'date' => $entry->date_created,
                    // 'other_field' => isset( $entry_data['other_field'] ) ? esc_html( $entry_data['other_field'] ) : '',
                );
                wp_send_json_success($response_data);
            } else {
                wp_send_json_error('Entrada no encontrada.');
            }
        } else {
            wp_send_json_error('ID de entrada no válido.');
        }
    }

    public function submit_form()
    {
        /* ───────── Seguridad ───────── */
        check_ajax_referer('nm_public_nonce', 'nonce');

        //Sanitizar y limpiar datos
        $sanitize_form_data = function ($data) use (&$sanitize_form_data) {
            if (is_array($data)) {
                return array_map($sanitize_form_data, $data);
            } elseif (is_string($data)) {
                // Limpiar escapes múltiples y normalizar comillas
                $data = stripslashes($data);
                $data = str_replace(array("\\'", '\\"'), array("'", '"'), $data);
                return sanitize_text_field($data);
            }
            return $data;
        };

        $form_type = isset($_POST['nm_form_type']) ? intval($_POST['nm_form_type']) : 0;
        $form_fields          = array();   // propiedades finales, en orden
        $already_processed    = array();   // names tratados para no duplicar

        /* ────── 1. Cargar la definición del formulario (orden “oficial”) ────── */
        $form_data  = $this->model->get_form($form_type);
        $field_defs = isset($form_data['fields']) && is_array($form_data['fields'])
            ? $form_data['fields']
            : array();

        /* Función de normalización: coincide con cómo generas el atributo name="" */
        $normalize = static function ($raw) {
            // 1) quita tildes, 2) reemplaza espacios por '_' , 3) quita caracteres raros
            $no_accents = remove_accents($raw);
            return preg_replace('/[^A-Za-z0-9_\-]/', '_', str_replace(' ', '_', $no_accents));
        };

        /* ────── 2. Recorrer los campos tal cual están en la definición ────── */
        foreach ($field_defs as $field) {
            if (empty($field['name'])) {
                continue;                             // headers, etc.
            }

            $orig_name   = $field['name'];            // ej: "Imagen principal"
            $html_name   = $normalize($orig_name);  // ej: "Imagen_principal"
            $store_key   = 'nm_' . $orig_name;        // mantenemos nombre original en BD

            $already_processed[] = $html_name;        // marcarlo            /* ---- FILE ---- */
            if (
                $field['type'] === 'file' && isset($_FILES[$html_name])
                && $_FILES[$html_name]['error'] === UPLOAD_ERR_OK
            ) {

                $allowed = array(
                    'jpg|jpeg|jpe' => 'image/jpeg',
                    'png'          => 'image/png',
                    'gif'          => 'image/gif',
                    'pdf'          => 'application/pdf',
                );

                $up = wp_handle_upload($_FILES[$html_name], array(
                    'test_form' => false,
                    'mimes'     => $allowed,
                ));

                if ($up && ! isset($up['error'])) {
                    $form_fields[$store_key] = esc_url_raw(
                        str_replace('http://', 'https://', $up['url'])
                    );
                } else {
                    wp_send_json_error('Error al subir "' . esc_html($orig_name) . '": ' . $up['error']);
                    wp_die();
                }
            }

            /* ---- AUDIO ---- */
            elseif ($field['type'] === 'audio') {
                $audio_data = isset($_POST[$html_name . '_data']) ? $_POST[$html_name . '_data'] : '';
                
                if (!empty($audio_data)) {
                    if (strpos($audio_data, 'upload:') === 0) {
                        // Manejar archivo subido
                        if (isset($_FILES[$html_name]) && $_FILES[$html_name]['error'] === UPLOAD_ERR_OK) {
                            $audio_allowed = array(
                                'mp3'  => 'audio/mpeg',
                                'wav'  => 'audio/wav',
                                'ogg'  => 'audio/ogg',
                                'flac' => 'audio/flac',
                                'm4a'  => 'audio/mp4',
                                'aac'  => 'audio/aac'
                            );

                            $audio_up = wp_handle_upload($_FILES[$html_name], array(
                                'test_form' => false,
                                'mimes'     => $audio_allowed,
                            ));

                            if ($audio_up && ! isset($audio_up['error'])) {
                                $form_fields[$store_key] = esc_url_raw(
                                    str_replace('http://', 'https://', $audio_up['url'])
                                );
                            } else {
                                wp_send_json_error('Error al subir audio "' . esc_html($orig_name) . '": ' . $audio_up['error']);
                                wp_die();
                            }
                        }
                    } elseif (strpos($audio_data, 'recording:') === 0) {
                        // Manejar grabación de audio
                        $base64_data = substr($audio_data, 10); // Remover "recording:" prefix
                        $audio_result = $this->save_audio_recording($base64_data, $html_name);
                        
                        if ($audio_result['success']) {
                            $form_fields[$store_key] = $audio_result['url'];
                        } else {
                            wp_send_json_error('Error al guardar grabación de audio "' . esc_html($orig_name) . '": ' . $audio_result['error']);
                            wp_die();
                        }
                    }
                }
            }

            /* ---- INPUT NORMAL ---- */ elseif (isset($_POST[$html_name])) {
                $val = $_POST[$html_name];
                $cleaned_val = $sanitize_form_data($val);
                $form_fields[$store_key] = $cleaned_val;
            }
            // si es file sin subir nada → simplemente se omite
        }

        /* ────── 3. Pasada de “rescate” ──────
               Por si el frontend añadió campos que no están en la definición      */
        $incoming_keys = array_keys(array_merge($_POST, $_FILES));

        foreach ($incoming_keys as $inkey) {

            if (
                in_array($inkey, $already_processed, true) ||
                in_array($inkey, array(
                    'action',
                    'nonce',
                    'map_data',
                    'nm_form_nonce',
                    '_wp_http_referer',
                    'nm_submit_form',
                    'nm_form_type'
                ), true)
            ) {
                continue;
            }

            $store_key = 'nm_' . $inkey;            /* file suelto */
            if (isset($_FILES[$inkey]) && $_FILES[$inkey]['error'] === UPLOAD_ERR_OK) {

                // Detectar si es un archivo de audio basado en el nombre del campo o tipo MIME
                $is_audio_file = false;
                $file_mime = $_FILES[$inkey]['type'];
                $audio_mimes = array('audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac');
                
                // Verificar si es audio por MIME type
                if (in_array($file_mime, $audio_mimes)) {
                    $is_audio_file = true;
                }
                
                // También verificar si hay datos de audio asociados
                if (isset($_POST[$inkey . '_data']) && !empty($_POST[$inkey . '_data'])) {
                    $is_audio_file = true;
                }

                if ($is_audio_file) {
                    // Procesar como archivo de audio
                    $audio_allowed = array(
                        'mp3'  => 'audio/mpeg',
                        'wav'  => 'audio/wav',
                        'ogg'  => 'audio/ogg',
                        'flac' => 'audio/flac',
                        'm4a'  => 'audio/mp4',
                        'aac'  => 'audio/aac'
                    );

                    $audio_up = wp_handle_upload($_FILES[$inkey], array(
                        'test_form' => false,
                        'mimes'     => $audio_allowed,
                    ));

                    if ($audio_up && ! isset($audio_up['error'])) {
                        $form_fields[$store_key] = esc_url_raw(
                            str_replace('http://', 'https://', $audio_up['url'])
                        );
                    } else {
                        wp_send_json_error('Error al subir audio "' . esc_html($inkey) . '": ' . $audio_up['error']);
                        wp_die();
                    }
                } else {
                    // Procesar como archivo normal (imagen/documento)
                    $up = wp_handle_upload($_FILES[$inkey], array(
                        'test_form' => false,
                        'mimes'     => array(
                            'jpg|jpeg|jpe' => 'image/jpeg',
                            'png'          => 'image/png',
                            'gif'          => 'image/gif',
                            'pdf'          => 'application/pdf',
                        ),
                    ));

                    if ($up && ! isset($up['error'])) {
                        $form_fields[$store_key] = esc_url_raw(
                            str_replace('http://', 'https://', $up['url'])
                        );
                    } else {
                        wp_send_json_error('Error al subir "' . esc_html($inkey) . '": ' . $up['error']);
                        wp_die();
                    }
                }
            } elseif (isset($_POST[$inkey])) {
                $v = $_POST[$inkey];

                $form_fields[$store_key] = $sanitize_form_data($v);
            }
        }

        /* ────── 4. Procesar map_data ────── */
        if (empty($_POST['map_data'])) {
            wp_send_json_error('No se proporcionó map_data.');
            wp_die();
        }

        $map_raw = stripslashes($_POST['map_data']);
        $map_arr = json_decode($map_raw, true);

        if ($map_arr === null && json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Datos JSON inválidos para map_data.');
            wp_die();
        }

        // Lista de campos a excluir
        $excluded_fields = array(
            'nm_map_data',
            'nm_nm_form_type',
            'nm_nm_form_nonce',
            'nm__wp_http_referer'
        );

        // Limpiar propiedades existentes
        $existing_props = isset($map_arr['properties']) ? $map_arr['properties'] : array();
        foreach ($excluded_fields as $field) {
            if (isset($existing_props[$field])) {
                unset($existing_props[$field]);
            }
        }

        // Limpiar form_fields antes de fusionar
        foreach ($excluded_fields as $field) {
            if (isset($form_fields[$field])) {
                unset($form_fields[$field]);
            }
        }

        // Fusionar propiedades limpias
        $map_arr['properties'] = array_merge($existing_props, $form_fields);

        $feature = array(
            'type'       => $map_arr['type'],
            'geometry'   => $map_arr['geometry'],
            'properties' => $map_arr['properties'],
        );

        /* ────── 5. Guardar la entrada ────── */
        $entry_data = array(
            'map_data' => wp_slash(wp_json_encode(array($feature), JSON_UNESCAPED_UNICODE)),
            'form_type' => $form_type,
        );

        $this->model->save_entry($entry_data, get_current_user_id());

        wp_mail(
            get_option('admin_email'),
            'Nueva presentación de formulario',
            'Se ha enviado un nuevo formulario y está pendiente de aprobación.'
        );

        wp_send_json_success('Formulario enviado exitosamente.');
    }



    public function get_filter_settings()
    {
        $filter_settings = get_option('nm_filter_settings', array());
        $formatted_filters = array();

        if (!empty($filter_settings)) {
            $form_data = $this->model->get_form(0);

            foreach ($filter_settings as $field_key => $settings) {
                if ($settings['active']) {
                    // Buscar el campo en el formulario para obtener sus opciones
                    foreach ($form_data['fields'] as $field) {
                        if ($field['name'] === $field_key && isset($field['options'])) {
                            $formatted_filters[] = array(
                                'field' => $field_key,
                                'button_text' => $settings['button_text'],
                                'options' => $field['options'],
                                'style' => $settings['style']
                            );
                            break;
                        }
                    }
                }
            }
        }

        return $formatted_filters;
    }



    public function download_geojson()
    {
        check_ajax_referer('nm_public_nonce', 'nonce');

        $entries = $this->model->get_entries('approved');
        $features = array();

        foreach ($entries as $entry) {
            $entry_data = maybe_unserialize($entry->entry_data);
            if (isset($entry_data['map_data'])) {
                $map_data = json_decode(stripslashes($entry_data['map_data']), true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($map_data)) {
                    foreach ($map_data as $feature) {
                        // Agregar información adicional si es necesario
                        $feature['properties']['title'] = isset($entry_data['title']) ? esc_html($entry_data['title']) : 'Sin título';
                        $features[] = $feature;
                    }
                } else {
                    error_log('Error decoding map_data for entry ID ' . $entry->id . ': ' . json_last_error_msg());
                }
            }
        }

        $geojson = array(
            'type'     => 'FeatureCollection',
            'features' => $features
        );

        wp_send_json_success($geojson);
    }


    public function get_conditional_fields()
    {

        check_ajax_referer('nm_public_nonce', 'nonce');

        global $wpdb;
        $table     = $wpdb->prefix . 'nm_conditional_fields';
        $select_id = sanitize_text_field($_POST['select_id'] ?? '');
        $option_id = sanitize_text_field($_POST['option_id'] ?? '');

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT fields_json FROM $table WHERE select_id=%s AND option_id=%s",
                $select_id,
                $option_id
            ),
            ARRAY_A
        );

        if (! $row) {
            wp_send_json_success('');
        }

        $fields = json_decode($row['fields_json'], true);
        if (! $fields) {
            wp_send_json_success('');
        }

        ob_start();
        foreach ($fields as $subfield) {
            nm_render_conditional_field($subfield);   // misma función del paso 1
        }        wp_send_json_success(ob_get_clean());
    }

    /**
     * Guarda una grabación de audio desde datos base64
     * 
     * @param string $base64_data Los datos de audio en base64
     * @param string $field_name El nombre del campo para generar el nombre de archivo
     * @return array Array con 'success', 'url' o 'error'
     */
    private function save_audio_recording($base64_data, $field_name) {
        try {
            // Verificar que tenemos datos válidos
            if (empty($base64_data) || !preg_match('/^data:audio\/([a-zA-Z0-9]+);base64,(.+)$/', $base64_data, $matches)) {
                return array('success' => false, 'error' => 'Datos de audio inválidos');
            }
            
            $audio_type = $matches[1]; // wav, mp3, etc.
            $encoded_data = $matches[2];
            
            // Decodificar base64
            $audio_data = base64_decode($encoded_data);
            if ($audio_data === false) {
                return array('success' => false, 'error' => 'Error al decodificar datos de audio');
            }
            
            // Generar nombre de archivo único
            $upload_dir = wp_upload_dir();
            $filename = 'audio_' . $field_name . '_' . time() . '.' . $audio_type;
            $file_path = $upload_dir['path'] . '/' . $filename;
            $file_url = $upload_dir['url'] . '/' . $filename;
            
            // Escribir archivo
            $bytes_written = file_put_contents($file_path, $audio_data);
            if ($bytes_written === false) {
                return array('success' => false, 'error' => 'No se pudo escribir el archivo de audio');
            }
            
            // Verificar que el archivo se creó correctamente
            if (!file_exists($file_path) || filesize($file_path) === 0) {
                return array('success' => false, 'error' => 'El archivo de audio no se guardó correctamente');
            }
            
            // Convertir a HTTPS si es necesario
            $secure_url = str_replace('http://', 'https://', $file_url);
            
            return array('success' => true, 'url' => esc_url_raw($secure_url));
            
        } catch (Exception $e) {
            error_log('Error saving audio recording: ' . $e->getMessage());
            return array('success' => false, 'error' => 'Error interno al guardar grabación');
        }
    }
}
