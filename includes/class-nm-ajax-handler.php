<?php

class NM_Ajax_Handler {

    private $loader;
    private $model;

    public function __construct($loader, $model) {
        $this->loader = $loader;
        $this->model = $model;

        $this->define_ajax_hooks();
    }

    private function define_ajax_hooks() {
        $this->loader->add_action('wp_ajax_nm_save_form', $this, 'save_form');
        $this->loader->add_action('wp_ajax_nm_get_field_template', $this, 'get_field_template');
        $this->loader->add_action('wp_ajax_nm_get_entries', $this, 'get_entries');
        $this->loader->add_action('wp_ajax_nm_update_entry_status', $this, 'update_entry_status');
    }

    public function save_form() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $form_data = $_POST['form_data'];
        $this->model->save_form($form_data);
        wp_send_json_success('Form saved successfully');
    }    public function get_field_template() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $field_type = sanitize_text_field($_POST['field_type']);

        if ($field_type) {
            $template_path = dirname(__DIR__) . '/admin/views/field-templates/' . $field_type . '.php';
            
            if (file_exists($template_path)) {
                // Initialize variables that templates expect
                $field_label = '';
                $field_name = '';
                
                ob_start();
                include $template_path;
                $field_html = ob_get_clean();
                wp_send_json_success($field_html);
            } else {
                wp_send_json_error('Field template not found: ' . $field_type);
            }
        } else {
            wp_send_json_error('Field type is missing');
        }
    }

    public function get_entries() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $entries = $this->model->get_entries();
        wp_send_json_success($entries);
    }

    public function update_entry_status() {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $entry_id = intval($_POST['entry_id']);
        $status = sanitize_text_field($_POST['status']);
        $this->model->update_entry_status($entry_id, $status);
        wp_send_json_success('Entry status updated');
    }

}
