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
    }

    // Función para guardar el formulario
    public function save_form ()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        
        $form_data = isset($_POST['form_data']) ? $_POST['form_data'] : '';

        if ($form_data) {
            $this->model->save_form($form_data);
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
}
