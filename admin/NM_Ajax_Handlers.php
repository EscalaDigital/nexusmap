<?php

class NM_Ajax_Handlers
{
    private $loader;
    private $model;    public function __construct($loader, $model)
    {
        $this->loader = $loader;
        $this->model = $model;
        
        // Registro de acciones AJAX
        $this->loader->add_action('wp_ajax_nm_save_form', $this, 'save_form');
        $this->loader->add_action('wp_ajax_nm_get_field_template', $this, 'get_field_template');
        $this->loader->add_action('wp_ajax_nm_get_entries', $this, 'get_entries');
        $this->loader->add_action('wp_ajax_nm_update_entry_status', $this, 'update_entry_status');
        $this->loader->add_action('wp_ajax_nm_save_ab_option', $this, 'save_ab_option');
        $this->loader->add_action('wp_ajax_nm_save_option_texts', $this, 'save_option_texts');
        $this->loader->add_action('wp_ajax_nm_get_form', $this, 'get_form_html');
        $this->loader->add_action('wp_ajax_nm_save_conditional_fields', $this, 'save_conditional_fields');
        $this->loader->add_action('wp_ajax_nm_get_entry_for_edit', $this, 'get_entry_for_edit');
        $this->loader->add_action('wp_ajax_nm_update_entry_data', $this, 'update_entry_data');
        $this->loader->add_action('wp_ajax_nm_delete_entry', $this, 'delete_entry');        $this->loader->add_action('wp_ajax_nm_save_geonames_user', $this, 'save_geonames_user');
        $this->loader->add_action('wp_ajax_nm_geonames_proxy', $this, 'geonames_proxy');
        $this->loader->add_action('wp_ajax_nopriv_nm_geonames_proxy', $this, 'geonames_proxy');
        
        // Secure endpoints for frontend (no username exposure)
        $this->loader->add_action('wp_ajax_nm_check_geonames_config', $this, 'check_geonames_config');
        $this->loader->add_action('wp_ajax_nopriv_nm_check_geonames_config', $this, 'check_geonames_config');
        $this->loader->add_action('wp_ajax_nm_get_geo_data', $this, 'get_geo_data');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_geo_data', $this, 'get_geo_data');}

    public function save_ab_option()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $ab_option = isset($_POST['ab_option']) && $_POST['ab_option'] == 1 ? 1 : 0;
        update_option('nm_ab_option_enabled', $ab_option);
    
        wp_send_json_success();
    }
    // with this snippet from admin/NM_Ajax_Handlers.php:
    public function save_option_texts()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $option_a_text = isset($_POST['option_a_text']) ? sanitize_text_field($_POST['option_a_text']) : '';
        $option_b_text = isset($_POST['option_b_text']) ? sanitize_text_field($_POST['option_b_text']) : '';

        if ($option_a_text && $option_b_text) {
            update_option('nm_option_a_text', $option_a_text);
            update_option('nm_option_b_text', $option_b_text);
            wp_send_json_success();
        } else {
            wp_send_json_error(__('Option texts are missing', 'nexusmap'));
        }
    }    public function save_form() {
        // Log de debug inicial
        error_log('save_form method called');
        error_log('POST data: ' . print_r($_POST, true));
        
        // Verificar nonce
        if (!check_ajax_referer('nm_admin_nonce', 'nonce', false)) {
            error_log('Nonce verification failed');
            wp_send_json_error(__('Security verification failed', 'nexusmap'));
            return;
        }
        
        error_log('Nonce verification passed');
    
        $form_data = isset($_POST['form_data']) ? $_POST['form_data'] : '';
        $form_type = isset($_POST['form_type']) ? intval($_POST['form_type']) : 0;
        
        error_log('Form type: ' . $form_type);
        error_log('Form data received: ' . print_r($form_data, true));
    
        if ($form_data) {
            // Validar que form_data es un array
            if (!is_array($form_data)) {
                error_log('Form data is not an array: ' . gettype($form_data));
                wp_send_json_error(__('Invalid form data format', 'nexusmap'));
                return;
            }
            
            // Verificar que hay campos para guardar
            if (!isset($form_data['fields']) || !is_array($form_data['fields']) || empty($form_data['fields'])) {
                error_log('No fields to save in form data');
                wp_send_json_error(__('No fields to save', 'nexusmap'));
                return;
            }
            
            error_log('Number of fields to save: ' . count($form_data['fields']));
            
            try {
                $result = $this->model->save_form($form_data, $form_type);
                error_log('Save result: ' . ($result !== false ? 'success' : 'failed'));
                
                if ($result !== false) {
                    wp_send_json_success(__('Form saved successfully', 'nexusmap'));
                } else {
                    wp_send_json_error(__('Error saving form to database', 'nexusmap'));
                }
            } catch (Exception $e) {
                error_log('Error saving form: ' . $e->getMessage());
                wp_send_json_error(__('Database error: ', 'nexusmap') . $e->getMessage());
            }
        } else {
            error_log('Form data is missing or empty');
            wp_send_json_error(__('Form data is missing', 'nexusmap'));
        }
    }
    // Función para obtener la plantilla de un campo específico
    public function get_field_template()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $field_type = sanitize_text_field($_POST['field_type']);
        ob_start();

        if ($field_type) {
            include 'views/field-templates/' . $field_type . '.php';
            $field_html = ob_get_clean();
            wp_send_json_success($field_html);
        } else {
            wp_send_json_error(__('Field type is missing', 'nexusmap'));
        }
    }

    // Función para obtener entradas
    public function get_entries()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $entries = $this->model->get_entries();
        if ($entries) {
            wp_send_json_success($entries);
        } else {
            wp_send_json_error(__('No entries found', 'nexusmap'));
        }
    }

    // Función para actualizar el estado de una entrada
    public function update_entry_status()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $entry_id = intval($_POST['entry_id']);
        $status = sanitize_text_field($_POST['status']);

        if ($entry_id && $status) {
            $this->model->update_entry_status($entry_id, $status);
            wp_send_json_success(__('Entry status updated', 'nexusmap'));
        } else {
            wp_send_json_error(__('Entry ID or status is missing', 'nexusmap'));
        }
    }

    // Agregar nuevo método
    
    public function save_conditional_fields() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied');
        }
    
        global $wpdb;
        $conditional_data = isset($_POST['conditional_data']) ? $_POST['conditional_data'] : [];
    
        // Depurar los datos recibidos
        error_log('Conditional Data: ' . print_r($conditional_data, true));
    
        if (empty($conditional_data)) {
            wp_send_json_error('No conditional fields to save');
            return;
        }
    
        $table_name = $wpdb->prefix . 'nm_conditional_fields';
        $success = true;
    
        foreach ($conditional_data as $data) {
            // Verificar si fields_json existe y no es null
            if (!isset($data['fields_json']) || empty($data['fields_json'])) {
                error_log('fields_json is empty or null for select_id: ' . $data['select_id']);
                continue;
            }
    
            $result = $wpdb->insert(
                $table_name,
                array(
                    'select_id' => sanitize_text_field($data['select_id']),
                    'option_id' => sanitize_text_field($data['option_id']),
                    'fields_json' => wp_json_encode($data['fields_json'])
                ),
                array('%s', '%s', '%s')
            );
    
            if ($result === false) {
                error_log('wpdb error: ' . $wpdb->last_error);
                $success = false;
                break;
            }
        }
    
        if ($success) {
            wp_send_json_success('Conditional fields saved successfully');
        } else {
            wp_send_json_error('Error saving conditional fields');
        }
    }

    /**
     * Obtener una entrada para editar
     */
    public function get_entry_for_edit()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $entry_id = intval($_POST['entry_id']);

        if ($entry_id) {
            $entry = $this->model->get_entry_by_id($entry_id);
            if ($entry) {
                $entry_data = maybe_unserialize($entry->entry_data);
                wp_send_json_success($entry_data);
            } else {
                wp_send_json_error(__('Entry not found', 'nexusmap'));
            }
        } else {
            wp_send_json_error(__('Entry ID is missing', 'nexusmap'));
        }
    }

    /**
     * Actualizar los datos de una entrada
     */
    public function update_entry_data()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $entry_id = intval($_POST['entry_id']);
        $entry_data = isset($_POST['entry_data']) ? $_POST['entry_data'] : array();

        if ($entry_id && !empty($entry_data)) {
            $result = $this->model->update_entry_data($entry_id, $entry_data);
            if ($result !== false) {
                wp_send_json_success(__('Entry updated successfully', 'nexusmap'));
            } else {
                wp_send_json_error(__('Error updating entry', 'nexusmap'));
            }
        } else {
            wp_send_json_error(__('Entry ID or data is missing', 'nexusmap'));
        }
    }

    /**
     * Eliminar una entrada
     */
    public function delete_entry()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $entry_id = intval($_POST['entry_id']);

        if ($entry_id) {
            $result = $this->model->delete_entry($entry_id);
            if ($result !== false) {
                wp_send_json_success(__('Entry deleted successfully', 'nexusmap'));
            } else {
                wp_send_json_error(__('Error deleting entry', 'nexusmap'));
            }
        } else {            wp_send_json_error(__('Entry ID is missing', 'nexusmap'));
        }
    }    public function save_geonames_user()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        
        $username = isset($_POST['username']) ? sanitize_text_field($_POST['username']) : '';
        
        if (empty($username)) {
            wp_send_json_error(__('Username is required', 'nexusmap'));
            return;
        }
        
        update_option('nm_geonames_user', $username);
        wp_send_json_success(__('GeoNames user saved successfully', 'nexusmap'));
    }    /**
     * Proxy para GeoNames API - Soluciona problema de Mixed Content
     * Hace peticiones HTTP internas y las sirve por HTTPS
     */
    public function geonames_proxy()
    {
        // Verificar nonce - aceptar tanto admin como público
        $nonce = isset($_GET['nonce']) ? $_GET['nonce'] : '';
        
        if (!wp_verify_nonce($nonce, 'nm_admin_nonce') && !wp_verify_nonce($nonce, 'nm_public_nonce')) {
            wp_send_json_error(__('Security check failed', 'nexusmap'));
            return;
        }
        
        // Obtener parámetros
        $endpoint = isset($_GET['endpoint']) ? sanitize_text_field($_GET['endpoint']) : '';
        $username = isset($_GET['username']) ? sanitize_text_field($_GET['username']) : '';
        $geonameId = isset($_GET['geonameId']) ? sanitize_text_field($_GET['geonameId']) : '';
        $featureClass = isset($_GET['featureClass']) ? sanitize_text_field($_GET['featureClass']) : '';
        $lang = isset($_GET['lang']) ? sanitize_text_field($_GET['lang']) : 'es';
        
        // Validar parámetros requeridos
        if (empty($endpoint) || empty($username)) {
            wp_send_json_error(__('Missing required parameters', 'nexusmap'));
            return;
        }
        
        // Lista de endpoints permitidos (seguridad)
        $allowed_endpoints = [
            'countryInfoJSON',
            'childrenJSON'
        ];
        
        if (!in_array($endpoint, $allowed_endpoints)) {
            wp_send_json_error(__('Endpoint not allowed', 'nexusmap'));
            return;
        }
        
        // Construir URL de GeoNames
        $base_url = "http://api.geonames.org/{$endpoint}";
        $params = [
            'username' => $username,
            'lang' => $lang
        ];
        
        // Añadir parámetros adicionales según el endpoint
        if ($endpoint === 'childrenJSON') {
            if (empty($geonameId)) {
                wp_send_json_error(__('GeonameId required for childrenJSON', 'nexusmap'));
                return;
            }
            $params['geonameId'] = $geonameId;
            if (!empty($featureClass)) {
                $params['featureClass'] = $featureClass;
            }
        }
        
        $url = $base_url . '?' . http_build_query($params);
        
        // Hacer petición HTTP interna
        $response = wp_remote_get($url, [
            'timeout' => 15,
            'headers' => [
                'User-Agent' => 'NexusMap-WordPress-Plugin/1.0'
            ]
        ]);
        
        // Verificar errores de petición
        if (is_wp_error($response)) {
            wp_send_json_error([
                'message' => __('Error connecting to GeoNames', 'nexusmap'),
                'details' => $response->get_error_message()
            ]);
            return;
        }
        
        // Obtener código de respuesta
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code !== 200) {
            wp_send_json_error([
                'message' => __('GeoNames API error', 'nexusmap'),
                'status_code' => $status_code
            ]);
            return;
        }
        
        // Obtener y decodificar respuesta
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        // Verificar si la respuesta es JSON válido
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error([
                'message' => __('Invalid JSON response from GeoNames', 'nexusmap'),
                'json_error' => json_last_error_msg()
            ]);
            return;
        }
        
        // Verificar errores específicos de GeoNames
        if (isset($data['status'])) {
            wp_send_json_error([
                'message' => __('GeoNames API returned error', 'nexusmap'),
                'geonames_error' => $data['status']['message'] ?? 'Unknown error'
            ]);
            return;
        }
        
        // Devolver datos exitosamente
        wp_send_json_success($data);
    }

    /**
     * Check if GeoNames is configured (secure - doesn't expose username)
     */
    public function check_geonames_config()
    {
        // Verificar nonce - aceptar tanto admin como público
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        
        if (!wp_verify_nonce($nonce, 'nm_admin_nonce') && !wp_verify_nonce($nonce, 'nm_public_nonce')) {
            wp_send_json_error(__('Security check failed', 'nexusmap'));
            return;
        }

        $geonames_user = nm_get_geonames_user();
        
        wp_send_json_success(array(
            'configured' => !empty($geonames_user)
        ));
    }

    /**
     * Get geographic data via secure proxy (doesn't expose username to frontend)
     */
    public function get_geo_data()
    {
        // Verificar nonce - aceptar tanto admin como público
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        
        if (!wp_verify_nonce($nonce, 'nm_admin_nonce') && !wp_verify_nonce($nonce, 'nm_public_nonce')) {
            wp_send_json_error(__('Security check failed', 'nexusmap'));
            return;
        }

        $geonames_user = nm_get_geonames_user();
        
        if (empty($geonames_user)) {
            wp_send_json_error(array('message' => __('GeoNames user not configured', 'nexusmap')));
            return;
        }

        // Obtener parámetros
        $country = isset($_POST['country']) ? sanitize_text_field($_POST['country']) : '';
        $parent_code = isset($_POST['parent_code']) ? sanitize_text_field($_POST['parent_code']) : '';
        $level = isset($_POST['level']) ? sanitize_text_field($_POST['level']) : '';
        $language = isset($_POST['language']) ? sanitize_text_field($_POST['language']) : 'es';

        if (empty($country) || empty($level)) {
            wp_send_json_error(array('message' => __('Missing required parameters', 'nexusmap')));
            return;
        }

        // Determinar el endpoint y parámetros según el nivel
        if (empty($parent_code)) {
            // Primer nivel - obtener admin1 del país
            $endpoint = 'childrenJSON';
            $params = array(
                'geonameId' => $this->get_country_geoname_id($country, $geonames_user, $language),
                'username' => $geonames_user,
                'lang' => $language
            );
        } else {
            // Niveles subsecuentes - obtener children del parent
            $endpoint = 'childrenJSON';
            $params = array(
                'geonameId' => $parent_code,
                'username' => $geonames_user,
                'lang' => $language
            );
        }

        if (!$params['geonameId']) {
            wp_send_json_error(array('message' => __('Country not found', 'nexusmap')));
            return;
        }

        // Hacer la petición a GeoNames
        $url = 'http://api.geonames.org/' . $endpoint . '?' . http_build_query($params);
        
        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'headers' => array(
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . '; ' . home_url()
            )
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => __('Connection error', 'nexusmap')));
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data || isset($data['status'])) {
            $error_message = __('Error from GeoNames service', 'nexusmap');
            if (isset($data['status']['message'])) {
                $error_message = $data['status']['message'];
            }
            wp_send_json_error(array('message' => $error_message));
            return;
        }

        // Formatear datos para el frontend
        $formatted_data = array();
        if (isset($data['geonames']) && is_array($data['geonames'])) {
            foreach ($data['geonames'] as $item) {
                $formatted_data[] = array(
                    'geonameId' => $item['geonameId'],
                    'name' => $item['name'],
                    'adminName1' => isset($item['adminName1']) ? $item['adminName1'] : '',
                    'adminName2' => isset($item['adminName2']) ? $item['adminName2'] : ''
                );
            }
        }

        wp_send_json_success($formatted_data);
    }

    /**
     * Get country GeoName ID from country code
     */
    private function get_country_geoname_id($country_code, $username, $language = 'es')
    {
        // Cache de IDs de países más comunes
        $country_ids = array(
            'ES' => '2510769', // España
            'US' => '6252001', // Estados Unidos
            'FR' => '3017382', // Francia
            'DE' => '2921044', // Alemania
            'IT' => '3175395', // Italia
            'GB' => '2635167', // Reino Unido
            'PT' => '2264397', // Portugal
            'MX' => '3996063', // México
            'AR' => '3865483', // Argentina
            'CO' => '3686110', // Colombia
            'BR' => '3469034', // Brasil
            'PE' => '3932488', // Perú
            'CL' => '3895114', // Chile
            'VE' => '3625428'  // Venezuela
        );

        if (isset($country_ids[$country_code])) {
            return $country_ids[$country_code];
        }

        // Si no está en cache, buscar via API
        $url = 'http://api.geonames.org/countryInfoJSON?' . http_build_query(array(
            'country' => $country_code,
            'username' => $username,
            'lang' => $language
        ));

        $response = wp_remote_get($url, array('timeout' => 10));
        
        if (!is_wp_error($response)) {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (isset($data['geonames'][0]['geonameId'])) {
                return $data['geonames'][0]['geonameId'];
            }
        }

        return false;
    }
}
