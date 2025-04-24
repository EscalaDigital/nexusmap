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
        $this->loader->add_action('wp_enqueue_scripts', $this, 'enqueue_public_assets');

        // AJAX actions
        $this->loader->add_action('wp_ajax_nm_get_map_points', $this, 'get_map_points');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_map_points', $this, 'get_map_points');
        $this->loader->add_action('wp_ajax_nm_submit_form', $this, 'submit_form');

        // Registrar la acción AJAX para descargar el GeoJSON
        $this->loader->add_action('wp_ajax_nm_download_geojson', $this, 'download_geojson');
        $this->loader->add_action('wp_ajax_nopriv_nm_download_geojson', $this, 'download_geojson');

        // Register the AJAX action to get entry details para MOdal
        $this->loader->add_action('wp_ajax_nm_get_entry_details', $this, 'get_entry_details');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_entry_details', $this, 'get_entry_details');
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
            wp_enqueue_script('nm-public-js', NM_PLUGIN_URL . 'public/js/public.js', array('jquery', 'nm-leaflet-js', 'leaflet-geocoder-js', 'nm-funcionesmaps-js'), NM_VERSION, true);

            // Para gráficos Chart.js
            wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js', array(), '4.4.0', true);
        }

        // Check if the [nm_form] shortcode is used in the content
        if (has_shortcode($post->post_content, 'nm_form')) {
            // Enqueue Leaflet CSS and JS
            wp_enqueue_style('nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1');
            wp_enqueue_script('nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true);
            // Enqueue Leaflet Draw CSS and JS
            wp_enqueue_style('nm-leaflet-draw-css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css', array('nm-leaflet-css'), '1.0.4');
            wp_enqueue_script('nm-leaflet-draw-js', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js', array('nm-leaflet-js'), '1.0.4', true);

            // Enqueue styles and scripts for the form
            wp_enqueue_style('nm-form-css', NM_PLUGIN_URL . 'public/css/form.css', array(), NM_VERSION);

            wp_enqueue_script('nm-form-js', NM_PLUGIN_URL . 'public/js/form.js', array('jquery', 'nm-leaflet-js', 'nm-leaflet-draw-js'), NM_VERSION, true);

            // Localize script for AJAX handling
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
        check_ajax_referer('nm_public_nonce', 'nonce');
        $entries = $this->model->get_entries('approved');
        $features = array();

        // Obtener configuración de capas
        $layer_settings = get_option('nm_layer_settings', array());
        $has_layers = !empty($layer_settings);

        foreach ($entries as $entry) {
            $entry_data = maybe_unserialize($entry->entry_data);
            if (isset($entry_data['map_data'])) {
              

                $raw_json = wp_unslash( $entry_data['map_data'] ); 
             

               try {
                // ② Intenta decodificar: si falla lanzará JsonException
                $map_data = json_decode( $raw_json, true, 512, JSON_THROW_ON_ERROR );
            
            } catch ( \JsonException $e ) {
            
                // ③ Apunta en el log la razón exacta y salta al siguiente registro
                error_log( sprintf(
                    'JSON ERROR (entry_id %d): %s',
                    $entry->id,
                    $e->getMessage()          // ej.: "Syntax error"
                ) );
            
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
    
        $form_type = isset($_POST['nm_form_type']) ? intval($_POST['nm_form_type']) : 0;
        $form_fields          = array();   // propiedades finales, en orden
        $already_processed    = array();   // names tratados para no duplicar
    
        /* ────── 1. Cargar la definición del formulario (orden “oficial”) ────── */
        $form_data  = $this->model->get_form($form_type);
        $field_defs = isset($form_data['fields']) && is_array($form_data['fields'])
            ? $form_data['fields']
            : array();
    
        /* Función de normalización: coincide con cómo generas el atributo name="" */
        $normalize = static function ( $raw ) {
            // 1) quita tildes, 2) reemplaza espacios por '_' , 3) quita caracteres raros
            $no_accents = remove_accents( $raw );
            return preg_replace('/[^A-Za-z0-9_\-]/', '_', str_replace(' ', '_', $no_accents));
        };
    
        /* ────── 2. Recorrer los campos tal cual están en la definición ────── */
        foreach ( $field_defs as $field ) {
            if ( empty( $field['name'] ) ) {
                continue;                             // headers, etc.
            }
    
            $orig_name   = $field['name'];            // ej: "Imagen principal"
            $html_name   = $normalize( $orig_name );  // ej: "Imagen_principal"
            $store_key   = 'nm_' . $orig_name;        // mantenemos nombre original en BD
    
            $already_processed[] = $html_name;        // marcarlo
    
            /* ---- FILE ---- */
            if ( $field['type'] === 'file' && isset( $_FILES[ $html_name ] )
                 && $_FILES[ $html_name ]['error'] === UPLOAD_ERR_OK ) {
    
                $allowed = array(
                    'jpg|jpeg|jpe' => 'image/jpeg',
                    'png'          => 'image/png',
                    'gif'          => 'image/gif',
                    'pdf'          => 'application/pdf',
                );
    
                $up = wp_handle_upload( $_FILES[ $html_name ], array(
                    'test_form' => false,
                    'mimes'     => $allowed,
                ));
    
                if ( $up && ! isset( $up['error'] ) ) {
                    $form_fields[ $store_key ] = esc_url_raw(
                        str_replace( 'http://', 'https://', $up['url'] )
                    );
                } else {
                    wp_send_json_error( 'Error al subir "' . esc_html( $orig_name ) . '": ' . $up['error'] );
                    wp_die();
                }
            }
    
            /* ---- INPUT NORMAL ---- */
            elseif ( isset( $_POST[ $html_name ] ) ) {
                $val = $_POST[ $html_name ];
                $form_fields[ $store_key ] = is_array( $val )
                    ? array_map( 'sanitize_text_field', $val )
                    : sanitize_text_field( $val );
            }
            // si es file sin subir nada → simplemente se omite
        }
    
        /* ────── 3. Pasada de “rescate” ──────
           Por si el frontend añadió campos que no están en la definición      */
        $incoming_keys = array_keys( array_merge( $_POST, $_FILES ) );
    
        foreach ( $incoming_keys as $inkey ) {
    
            if ( in_array( $inkey, $already_processed, true ) ||
                 in_array( $inkey, array(
                     'action','nonce','map_data','nm_form_nonce',
                     '_wp_http_referer','nm_submit_form','nm_form_type'
                 ), true ) ) {
                continue;
            }
    
            $store_key = 'nm_' . $inkey;
    
            /* file suelto */
            if ( isset( $_FILES[ $inkey ] ) && $_FILES[ $inkey ]['error'] === UPLOAD_ERR_OK ) {
    
                $up = wp_handle_upload( $_FILES[ $inkey ], array(
                    'test_form' => false,
                    'mimes'     => array(
                        'jpg|jpeg|jpe' => 'image/jpeg',
                        'png'          => 'image/png',
                        'gif'          => 'image/gif',
                        'pdf'          => 'application/pdf',
                    ),
                ));
    
                if ( $up && ! isset( $up['error'] ) ) {
                    $form_fields[ $store_key ] = esc_url_raw(
                        str_replace( 'http://', 'https://', $up['url'] )
                    );
                } else {
                    wp_send_json_error( 'Error al subir "' . esc_html( $inkey ) . '": ' . $up['error'] );
                    wp_die();
                }
    
            } elseif ( isset( $_POST[ $inkey ] ) ) {
                $v = $_POST[ $inkey ];
                $form_fields[ $store_key ] = is_array( $v )
                    ? array_map( 'sanitize_text_field', $v )
                    : sanitize_text_field( $v );
            }
        }
    
        /* ────── 4. Procesar map_data ────── */
        if ( empty( $_POST['map_data'] ) ) {
            wp_send_json_error( 'No se proporcionó map_data.' );
            wp_die();
        }
    
        $map_raw = stripslashes( $_POST['map_data'] );
        $map_arr = json_decode( $map_raw, true );
    
        if ( $map_arr === null && json_last_error() !== JSON_ERROR_NONE ) {
            wp_send_json_error( 'Datos JSON inválidos para map_data.' );
            wp_die();
        }
    
        $map_arr['properties'] = $form_fields;
    
        $feature = array(
            'type'       => $map_arr['type'],
            'geometry'   => $map_arr['geometry'],
            'properties' => $map_arr['properties'],
        );
    
        /* ────── 5. Guardar la entrada ────── */
        $entry_data = array(
            'map_data' => wp_slash( wp_json_encode( array( $feature ), JSON_UNESCAPED_UNICODE) ),
            'form_type' => $form_type,
        );
    
        $this->model->save_entry( $entry_data, get_current_user_id() );
    
        wp_mail(
            get_option( 'admin_email' ),
            'Nueva presentación de formulario',
            'Se ha enviado un nuevo formulario y está pendiente de aprobación.'
        );
    
        wp_send_json_success( 'Formulario enviado exitosamente.' );
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
}
