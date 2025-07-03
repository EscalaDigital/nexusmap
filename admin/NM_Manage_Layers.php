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
        // Acciones para capas base predefinidas
        $this->loader->add_action('admin_post_nm_add_predefined_base_layer_action', $this, 'handle_add_predefined_base_layer');
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
        'name' => sanitize_text_field($_POST['overlay_name']),
        'type' => sanitize_text_field($_POST['overlay_type']),
        'url'  => nm_sanitize_tile_url($_POST['overlay_url']),
        'wms_layer_name' => isset($_POST['wms_layer_name']) ? sanitize_text_field($_POST['wms_layer_name']) : '',
        'color' => sanitize_hex_color($_POST['overlay_color']),
        'border_color' => sanitize_hex_color($_POST['overlay_border_color']),
        'fill' => isset($_POST['overlay_fill']) ? true : false,
        'border_width' => (int) $_POST['overlay_border_width'],
        'bg_opacity' => (float) $_POST['overlay_bg_opacity'],
        'opacity' => (float) $_POST['overlay_opacity'],
        'active' => isset($_POST['overlay_active']) ? true : false
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

    // Manejar la adición de capas base predefinidas
    public function handle_add_predefined_base_layer()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_predefined_base_layer', 'nm_nonce');

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
            wp_cache_flush();
        }

        wp_redirect(admin_url('admin.php?page=nm_manage_layers&message=predefined_added'));
        exit;
    }
}
