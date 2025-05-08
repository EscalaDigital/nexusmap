<?php

class NM_Ajax_Handlers
{
    private $loader;
    private $model;

    public function __construct($loader, $model)
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
    }
    // Compare this snippet from admin/NM_Ajax_Handlers.php:
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
    }

    public function save_form() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
    
        $form_data = isset($_POST['form_data']) ? $_POST['form_data'] : '';
        $form_type = isset($_POST['form_type']) ? intval($_POST['form_type']) : 0;
    
        if ($form_data) {
            $this->model->save_form($form_data, $form_type);
            wp_send_json_success(__('Form saved successfully', 'nexusmap'));
        } else {
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
}
