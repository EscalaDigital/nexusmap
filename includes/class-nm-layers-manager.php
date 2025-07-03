<?php

class NM_Layers_Manager {

    private $loader;

    public function __construct($loader) {
        $this->loader = $loader;

        $this->define_layers_hooks();
    }    private function define_layers_hooks() {
        // NOTA: Estos hooks están desactivados porque NM_Manage_Layers ya los maneja
        // para evitar conflictos de doble registro
        
        // Acciones para capas base
        // $this->loader->add_action('admin_post_nm_add_base_layer_action', $this, 'handle_add_base_layer');
        // $this->loader->add_action('admin_post_nm_delete_base_layer_action', $this, 'handle_delete_base_layer');

        // Acciones para capas overlay
        // $this->loader->add_action('admin_post_nm_add_overlay_layer_action', $this, 'handle_add_overlay_layer');
        // $this->loader->add_action('admin_post_nm_delete_overlay_layer_action', $this, 'handle_delete_overlay_layer');
        
        // Acciones para capas base predefinidas
        // $this->loader->add_action('admin_post_nm_add_predefined_base_layer_action', $this, 'handle_add_predefined_base_layer');
    }

    public function display_manage_layers_page() {
        include_once 'views/manage-layers.php';
    }

    // Función para manejar la adición de capas base
    public function handle_add_base_layer() {
        // Verificar permisos y nonce
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_base_layer', 'nm_nonce');

        // Procesar los datos del formulario
        $layer_name = sanitize_text_field($_POST['layer_name']);
        $layer_url = nm_sanitize_tile_url($_POST['layer_url']);
        $layer_attribution = sanitize_textarea_field($_POST['layer_attribution']);
        $is_predefined = isset($_POST['layer_predefined']) && $_POST['layer_predefined'] == '1';

        $base_layers = get_option('nm_base_layers', array());

        $new_layer = array(
            'name' => $layer_name,
            'url'  => $layer_url,
            'attribution' => $layer_attribution,
        );

        // Solo añadir el campo predefined si está marcado como true
        if ($is_predefined) {
            $new_layer['predefined'] = true;
            $new_layer['predefined_key'] = 'custom_' . time(); // Clave única para capas personalizadas marcadas como predefinidas
        }

        $base_layers[] = $new_layer;

        update_option('nm_base_layers', $base_layers);

        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la eliminación de capas base
    public function handle_delete_base_layer() {
        // Verificar permisos y nonce
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        $index = isset($_GET['index']) ? intval($_GET['index']) : -1;
        check_admin_referer('nm_delete_base_layer_' . $index);

        $base_layers = get_option('nm_base_layers', array());
        if (isset($base_layers[$index])) {
            unset($base_layers[$index]);
            $base_layers = array_values($base_layers); // Reindexar el array
            update_option('nm_base_layers', $base_layers);
        }

        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la adición de capas overlay
    public function handle_add_overlay_layer() {
        // Verificar permisos y nonce
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_overlay_layer', 'nm_nonce');

        // Procesar los datos del formulario
        $overlay_name = sanitize_text_field($_POST['overlay_name']);
        $overlay_type = sanitize_text_field($_POST['overlay_type']);
        $overlay_url = nm_sanitize_tile_url($_POST['overlay_url']);
        $wms_layer_name = isset($_POST['wms_layer_name']) ? sanitize_text_field($_POST['wms_layer_name']) : '';

        $overlay_layers = get_option('nm_overlay_layers', array());

        $overlay_layers[] = array(
            'name' => $overlay_name,
            'type' => $overlay_type,
            'url'  => $overlay_url,
            'wms_layer_name' => $wms_layer_name,
            // Puedes agregar más opciones aquí
        );

        update_option('nm_overlay_layers', $overlay_layers);

        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la eliminación de capas overlay
    public function handle_delete_overlay_layer() {
        // Verificar permisos y nonce
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        $index = isset($_GET['index']) ? intval($_GET['index']) : -1;
        check_admin_referer('nm_delete_overlay_layer_' . $index);

        $overlay_layers = get_option('nm_overlay_layers', array());
        if (isset($overlay_layers[$index])) {
            unset($overlay_layers[$index]);
            $overlay_layers = array_values($overlay_layers); // Reindexar el array
            update_option('nm_overlay_layers', $overlay_layers);
        }

        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la adición de capas base predefinidas
    public function handle_add_predefined_base_layer() {
        // Verificar permisos y nonce
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_predefined_base_layer', 'nm_nonce');

        // Procesar los datos del formulario
        $layer_key = sanitize_text_field($_POST['layer_key']);
        $layer_name = sanitize_text_field($_POST['layer_name']);
        $layer_url = nm_sanitize_tile_url($_POST['layer_url']);
        $layer_attribution = sanitize_textarea_field($_POST['layer_attribution']);

        $base_layers = get_option('nm_base_layers', array());
        
        // Verificar si la capa ya existe
        $layer_exists = false;
        foreach ($base_layers as $existing_layer) {
            if ($existing_layer['name'] === $layer_name || $existing_layer['url'] === $layer_url) {
                $layer_exists = true;
                break;
            }
        }

        if (!$layer_exists) {
            $base_layers[] = array(
                'name' => $layer_name,
                'url'  => $layer_url,
                'attribution' => $layer_attribution,
                'predefined' => true,
                'predefined_key' => $layer_key
            );

            update_option('nm_base_layers', $base_layers);
        }

        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers&message=predefined_added'));
        exit;
    }

}
