<?php

class NM_Manage_Layers
{
    private $loader;

    public function __construct($loader)
    {
        $this->loader = $loader;
        
        // Registro de acciones de menú y de manejo de capas
        $this->loader->add_action('admin_menu', $this, 'add_layers_submenu');
        $this->loader->add_action('admin_post_nm_add_base_layer_action', $this, 'handle_add_base_layer');
        $this->loader->add_action('admin_post_nm_delete_base_layer_action', $this, 'handle_delete_base_layer');
        $this->loader->add_action('admin_post_nm_add_overlay_layer_action', $this, 'handle_add_overlay_layer');
        $this->loader->add_action('admin_post_nm_delete_overlay_layer_action', $this, 'handle_delete_overlay_layer');
    }

    // Añadir submenú para gestionar capas
    public function add_layers_submenu()
    {
        add_submenu_page(
            'nm',
            __('Manage Layers', 'nexusmap'),
            __('Manage Layers', 'nexusmap'),
            'manage_options',
            'nm_manage_layers',
            array($this, 'display_manage_layers_page')
        );
    }

    // Mostrar la página de gestión de capas
    public function display_manage_layers_page()
    {
        include_once 'views/manage-layers.php';
    }

    // Manejar la adición de capas base
    public function handle_add_base_layer()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_base_layer', 'nm_nonce');

        $layer_name = sanitize_text_field($_POST['layer_name']);
        $layer_url = nm_sanitize_tile_url($_POST['layer_url']);
        $layer_attribution = sanitize_textarea_field($_POST['layer_attribution']);

        $base_layers = get_option('nm_base_layers', array());

        $base_layers[] = array(
            'name' => $layer_name,
            'url'  => $layer_url,
            'attribution' => $layer_attribution,
        );

        update_option('nm_base_layers', $base_layers);
        wp_cache_flush();

        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Manejar la eliminación de capas base
    public function handle_delete_base_layer()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        $index = isset($_GET['index']) ? intval($_GET['index']) : -1;
        check_admin_referer('nm_delete_base_layer_' . $index);

        $base_layers = get_option('nm_base_layers', array());
        if (isset($base_layers[$index])) {
            unset($base_layers[$index]);
            $base_layers = array_values($base_layers);
            update_option('nm_base_layers', $base_layers);
        }

        wp_cache_flush();
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Manejar la adición de capas overlay
    public function handle_add_overlay_layer()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_overlay_layer', 'nm_nonce');

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
        );

        update_option('nm_overlay_layers', $overlay_layers);
        wp_cache_flush();

        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Manejar la eliminación de capas overlay
    public function handle_delete_overlay_layer()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        $index = isset($_GET['index']) ? intval($_GET['index']) : -1;
        check_admin_referer('nm_delete_overlay_layer_' . $index);

        $overlay_layers = get_option('nm_overlay_layers', array());
        if (isset($overlay_layers[$index])) {
            unset($overlay_layers[$index]);
            $overlay_layers = array_values($overlay_layers);
            update_option('nm_overlay_layers', $overlay_layers);
        }

        wp_cache_flush();
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }
}
