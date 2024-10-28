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

        ob_start();
        include NM_PLUGIN_DIR . 'public/views/main-map.php';
        return ob_get_clean();
    }

    /**
     * Display the custom form shortcode
     */
    public function display_custom_form()
    {
        if (! is_user_logged_in()) {
            return 'You must be logged in to view this form.';
        }

        $form_data = $this->model->get_form();

        ob_start();
        include NM_PLUGIN_DIR . 'public/views/form-display.php';
        return ob_get_clean();
    }

    /**
     * Enqueue public assets
     */
    public function enqueue_public_assets()
    {
        wp_enqueue_style('nm-public-css', NM_PLUGIN_URL . 'public/css/public.css', array(), NM_VERSION);
        wp_enqueue_style('nm-form-css', NM_PLUGIN_URL . 'public/css/form.css', array(), NM_VERSION);

        // Enqueue Leaflet CSS
        wp_enqueue_style('nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1');

        // Incluir Font Awesome
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

        // Enqueue Leaflet JS
        wp_enqueue_script('nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true);

        // Enqueue Leaflet Draw CSS
        wp_enqueue_style('nm-leaflet-draw-css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css', array('nm-leaflet-css'), '1.0.4');

        // Enqueue Leaflet Draw JS
        wp_enqueue_script('nm-leaflet-draw-js', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js', array('nm-leaflet-js'), '1.0.4', true);

        // Incluir Leaflet Control Geocoder
        wp_enqueue_style('leaflet-geocoder-css', 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css', array(), '1.13.0');
        wp_enqueue_script('leaflet-geocoder-js', 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js', array('nm-leaflet-js'), '1.13.0', true);

        // Enqueue the plugin's public JS
        wp_enqueue_script('nm-public-js', NM_PLUGIN_URL . 'public/js/public.js', array('jquery', 'nm-leaflet-js', 'nm-leaflet-draw-js', 'leaflet-geocoder-js'), NM_VERSION, true);

        // Localize script
        wp_localize_script('nm-public-js', 'nmPublic', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('nm_public_nonce')
        ));
    }


    /**
     * Get map points via AJAX
     */
    public function get_map_points()
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
                        // Agregar todas las propiedades del entry_data al properties
                        foreach ($entry_data as $key => $value) {
                            if ($key !== 'map_data') { // Excluir 'map_data' si está
                                $feature['properties'][$key] = esc_html($value);
                            }
                        }
                        // Agregar el entry_id
                        $feature['properties']['entry_id'] = $entry->id;

                        $features[] = $feature;
                    }
                } else {
                    error_log('Error decoding map_data for entry ID ' . $entry->id . ': ' . json_last_error_msg());
                }
            }
        }

        wp_send_json($features);
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
        // Verify nonce for security
        check_ajax_referer('nm_public_nonce', 'nonce');

        // Collect form fields (excluding 'action', 'nonce', 'map_data')
        $form_fields = array();
        foreach ($_POST as $key => $value) {
            if (in_array($key, array('action', 'nonce', 'map_data'))) {
                continue;
            }
            if (is_array($value)) {
                $sanitized_value = array_map('sanitize_text_field', $value);
                $form_fields['nm_' . $key] = $sanitized_value;
            } else {
                $form_fields['nm_' . $key] = sanitize_text_field($value);
            }
        }

        // Handle file uploads
        if (!empty($_FILES)) {
            foreach ($_FILES as $file_key => $file_array) {
                // Verify if the file was uploaded without errors
                if ($file_array['error'] === UPLOAD_ERR_OK) {
                    // Specify allowed file types
                    $allowed_types = array(
                        'jpg|jpeg|jpe' => 'image/jpeg',
                        'png'          => 'image/png',
                        'gif'          => 'image/gif',
                        'pdf'          => 'application/pdf',
                        // Add other file types if necessary
                    );

                    // Handle file upload
                    $uploaded_file = wp_handle_upload($file_array, array(
                        'test_form' => false,
                        'mimes'     => $allowed_types,
                    ));

                    if ($uploaded_file && !isset($uploaded_file['error'])) {
                        // Upload was successful, get the file URL
                        $file_url = $uploaded_file['url'];
                        // Add the file URL to $form_fields
                        $form_fields['nm_' . $file_key] = esc_url_raw($file_url);
                    } else {
                        // Handle upload error
                        wp_send_json_error('Error al subir el archivo: ' . $uploaded_file['error']);
                        wp_die();
                    }
                } elseif ($file_array['error'] !== UPLOAD_ERR_NO_FILE) {
                    // Handle other upload errors
                    wp_send_json_error('Código de error al subir el archivo: ' . $file_array['error']);
                    wp_die();
                }
                // If UPLOAD_ERR_NO_FILE, no file was uploaded for this field; you can skip it
            }
        }

        // Get 'map_data' from $_POST
        if (isset($_POST['map_data'])) {
            $map_data_json = stripslashes($_POST['map_data']);
            $map_data = json_decode($map_data_json, true);
            if ($map_data === null && json_last_error() !== JSON_ERROR_NONE) {
                wp_send_json_error('Datos JSON inválidos para map_data.');
                wp_die();
            }
        } else {
            wp_send_json_error('No se proporcionó map_data.');
            wp_die();
        }

        // Assign the form_fields to the 'properties' of the Feature
        $map_data['properties'] = $form_fields;

        // Ensure 'geometry' comes before 'properties' in the JSON
        $ordered_map_data = array(
            'type' => $map_data['type'],
            'geometry' => $map_data['geometry'],
            'properties' => $map_data['properties']
        );

        // Re-encode the JSON without escaping unicode and slashes
        $final_map_data_json = json_encode([$ordered_map_data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Escape the JSON string
        $final_map_data_json_escaped = addslashes($final_map_data_json);

        // Prepare the data to be saved
        $entry_data = array();
        $entry_data['map_data'] = $final_map_data_json_escaped;


        // Save the data using your model's save_entry method
        $user_id = get_current_user_id();
        $this->model->save_entry($entry_data, $user_id);

        // Send notification to the administrator
        wp_mail(get_option('admin_email'), 'Nueva presentación de formulario', 'Se ha enviado un nuevo formulario y está pendiente de aprobación.');

        // Send success response
        wp_send_json_success('Formulario enviado exitosamente.');
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
