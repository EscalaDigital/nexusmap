<?php

class NM_Public {

    private $loader;
    private $model;

    public function __construct( $loader ) {
        $this->loader = $loader;
        $this->model = new NM_Model();

        // Register the shortcodes during the 'init' action
        $this->loader->add_action( 'init', $this, 'register_shortcodes' );

      

        // Enqueue public assets
        $this->loader->add_action( 'wp_enqueue_scripts', $this, 'enqueue_public_assets' );

        // AJAX actions
        $this->loader->add_action( 'wp_ajax_nm_get_map_points', $this, 'get_map_points' );
        $this->loader->add_action( 'wp_ajax_nopriv_nm_get_map_points', $this, 'get_map_points' );
        $this->loader->add_action( 'wp_ajax_nm_submit_form', $this, 'submit_form' );
    }

    /**
     * Register shortcodes
     */
    public function register_shortcodes() {
        add_shortcode( 'nm_map', array( $this, 'display_main_map' ) );
        add_shortcode( 'nm_form', array( $this, 'display_custom_form' ) );
    }

    /**
     * Display the main map shortcode
     */
    public function display_main_map( $atts ) {
        // Extract attributes and set defaults
        $atts = shortcode_atts( array(
            'width'  => '100%',
            'height' => '500px',
            'lat'    => '0',
            'lng'    => '0',
            'zoom'   => '2',
        ), $atts, 'nm_map' );

        ob_start();
        include NM_PLUGIN_DIR . 'public/views/main-map.php';
        return ob_get_clean();
    }

    /**
     * Display the custom form shortcode
     */
    public function display_custom_form() {
        if ( ! is_user_logged_in() ) {
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
    public function enqueue_public_assets() {
        wp_enqueue_style( 'nm-public-css', NM_PLUGIN_URL . 'public/css/public.css', array(), NM_VERSION );
        wp_enqueue_style( 'nm-form-css', NM_PLUGIN_URL . 'public/css/form.css', array(), NM_VERSION );

        // Enqueue Leaflet CSS
        wp_enqueue_style( 'nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1' );

        // Enqueue Leaflet JS
        wp_enqueue_script( 'nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true );

        // Enqueue Leaflet Draw CSS
        wp_enqueue_style( 'nm-leaflet-draw-css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css', array( 'nm-leaflet-css' ), '1.0.4' );

        // Enqueue Leaflet Draw JS
        wp_enqueue_script( 'nm-leaflet-draw-js', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js', array( 'nm-leaflet-js' ), '1.0.4', true );

        // Enqueue the plugin's public JS
        wp_enqueue_script( 'nm-public-js', NM_PLUGIN_URL . 'public/js/public.js', array( 'jquery', 'nm-leaflet-js', 'nm-leaflet-draw-js' ), NM_VERSION, true );

        // Localize script
        wp_localize_script( 'nm-public-js', 'nmPublic', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'nm_public_nonce' )
        ) );
    }

    /**
     * Get map points via AJAX
     */
    public function get_map_points() {
        check_ajax_referer( 'nm_public_nonce', 'nonce' );
        $entries = $this->model->get_entries( 'approved' );
        error_log('Number of approved entries: ' . count($entries));
        $features = array();
    
        foreach ( $entries as $entry ) {
            $entry_data = maybe_unserialize( $entry->entry_data );
            error_log('Processing entry ID ' . $entry->id);
            if ( isset( $entry_data['map_data'] ) ) {
                // Aplicar stripslashes a map_data
                $clean_map_data = stripslashes( $entry_data['map_data'] );
                error_log('map_data after stripslashes: ' . $clean_map_data);
    
                $map_data = json_decode( $clean_map_data, true );
                if ( json_last_error() === JSON_ERROR_NONE && is_array( $map_data ) ) {
                    foreach ( $map_data as $feature ) {
                        // Agregar información adicional si es necesario
                        $feature['properties']['title'] = isset( $entry_data['title'] ) ? esc_html( $entry_data['title'] ) : 'Sin título';
                        $features[] = $feature;
                        error_log('Added feature: ' . json_encode($feature));
                    }
                } else {
                    error_log( 'Error decoding map_data for entry ID ' . $entry->id . ': ' . json_last_error_msg() );
                }
            } else {
                error_log('No map_data found for entry ID ' . $entry->id);
            }
        }
    
        // Registro de depuración antes de enviar la respuesta
        error_log('Features to send: ' . json_encode($features));
    
        wp_send_json( $features );
    }
    
    
    
    
    public function submit_form() {
        check_ajax_referer( 'nm_public_nonce', 'nonce' );
    
        // Recoger y sanitizar los datos del formulario
        $entry_data = array();
        if ( isset( $_POST['form_data'] ) && is_array( $_POST['form_data'] ) ) {
            foreach ( $_POST['form_data'] as $key => $value ) {
                // Manejar arrays (e.g., checkboxes)
                if ( is_array( $value ) ) {
                    $sanitized_value = array_map( 'sanitize_text_field', $value );
                    $entry_data[ sanitize_text_field( $key ) ] = $sanitized_value;
                } else {
                    $entry_data[ sanitize_text_field( $key ) ] = sanitize_text_field( $value );
                }
            }
        }
    
        // Manejar archivos si es necesario
        if ( ! empty( $_FILES ) ) {
            foreach ( $_FILES as $file_key => $file_array ) {
                // Verificar si el archivo se ha cargado sin errores
                if ( $file_array['error'] === UPLOAD_ERR_OK ) {
                    // Opcional: especificar tipos de archivo permitidos
                    $allowed_types = array(
                        'jpg|jpeg|jpe' => 'image/jpeg',
                        'png'          => 'image/png',
                        'gif'          => 'image/gif',
                        'pdf'          => 'application/pdf',
                        // Añade otros tipos de archivo si es necesario
                    );
    
                    // Manejar la carga del archivo
                    $uploaded_file = wp_handle_upload( $file_array, array(
                        'test_form' => false,
                        'mimes'     => $allowed_types,
                    ) );
    
                    if ( $uploaded_file && ! isset( $uploaded_file['error'] ) ) {
                        // La carga fue exitosa, obtener la URL del archivo
                        $file_url = $uploaded_file['url'];
                        // Agregar la URL del archivo a $entry_data
                        $entry_data[ sanitize_text_field( $file_key ) ] = esc_url_raw( $file_url );
                    } else {
                        // Manejar el error en la carga
                        wp_send_json_error( 'Error al cargar el archivo: ' . $uploaded_file['error'] );
                        wp_die();
                    }
                } elseif ( $file_array['error'] !== UPLOAD_ERR_NO_FILE ) {
                    // Manejar otros errores de carga
                    wp_send_json_error( 'Código de error al cargar el archivo: ' . $file_array['error'] );
                    wp_die();
                }
                // Si UPLOAD_ERR_NO_FILE, no se subió ningún archivo para este campo; puedes omitirlo
            }
        }
    
        $user_id = get_current_user_id();
        $this->model->save_entry( $entry_data, $user_id );
    
        // Enviar notificación al administrador
        wp_mail( get_option( 'admin_email' ), 'Nueva presentación de formulario', 'Se ha enviado un nuevo formulario y está pendiente de aprobación.' );
    
        wp_send_json_success( 'Formulario enviado exitosamente.' );
    }
    
    
}
