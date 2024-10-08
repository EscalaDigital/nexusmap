<?php

class NM_Admin {

    private $loader;
    private $model;

    public function __construct( $loader ) {
        $this->loader = $loader;
        $this->model = new NM_Model();

        $this->loader->add_action( 'admin_menu', $this, 'add_plugin_admin_menu' );
        $this->loader->add_action( 'admin_enqueue_scripts', $this, 'enqueue_admin_assets' );
        $this->loader->add_action( 'wp_ajax_nm_save_form', $this, 'save_form' );
        $this->loader->add_action( 'wp_ajax_nm_get_field_template', $this, 'get_field_template' );
        $this->loader->add_action( 'wp_ajax_nm_get_entries', $this, 'get_entries' );
        $this->loader->add_action( 'wp_ajax_nm_update_entry_status', $this, 'update_entry_status' );
    }

    public function add_plugin_admin_menu() {
        add_menu_page(
            'NexusMap',
            'NexusMap',
            'manage_options',
            'nm',
            array( $this, 'display_plugin_setup_page' ),
            'dashicons-location-alt',
            25
        );

        add_submenu_page(
            'nm',
            'Form Entries',
            'Entries',
            'manage_options',
            'nm-entries',
            array( $this, 'display_entries_page' )
        );
    }

    public function display_plugin_setup_page() {
        $form_data = $this->model->get_form();
        include_once 'views/form-builder.php';
    }

    public function display_entries_page() {
        $entries = $this->model->get_entries();
        include_once 'views/entries-list.php';
    }

    public function enqueue_admin_assets() {
        wp_enqueue_style( 'nm-admin-css', NM_PLUGIN_URL . 'admin/css/admin.css', array(), NM_VERSION );
        wp_enqueue_script( 'nm-admin-js', NM_PLUGIN_URL . 'admin/js/admin.js', array( 'jquery', 'jquery-ui-sortable', 'jquery-ui-draggable', 'jquery-ui-droppable' ), NM_VERSION, true );
        wp_localize_script( 'nm-admin-js', 'nmAdmin', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'nm_admin_nonce' )
        ) );
    }

    public function save_form() {
        check_ajax_referer( 'nm_admin_nonce', 'nonce' );
        $form_data = $_POST['form_data'];
        $this->model->save_form( $form_data );
        wp_send_json_success( 'Form saved successfully' );
    }

    public function get_field_template() {
        check_ajax_referer( 'nm_admin_nonce', 'nonce' );
        $field_type = sanitize_text_field( $_POST['field_type'] );

        ob_start();
        include 'views/field-templates/' . $field_type . '.php';
        $field_html = ob_get_clean();

        wp_send_json_success( $field_html );
    }

    public function get_entries() {
        check_ajax_referer( 'nm_admin_nonce', 'nonce' );
        $entries = $this->model->get_entries();
        wp_send_json_success( $entries );
    }

    public function update_entry_status() {
        check_ajax_referer( 'nm_admin_nonce', 'nonce' );
        $entry_id = intval( $_POST['entry_id'] );
        $status = sanitize_text_field( $_POST['status'] );
        $this->model->update_entry_status( $entry_id, $status );
        wp_send_json_success( 'Entry status updated' );
    }
}
