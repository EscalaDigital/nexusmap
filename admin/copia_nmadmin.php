<?php

class NM_Admin
{

    private $loader;
    private $model;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();

        $this->loader->add_action('admin_menu', $this, 'add_plugin_admin_menu');
        $this->loader->add_action('admin_init', $this, 'register_map_settings'); // Agregar el hook para registrar las opciones del mapa
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_admin_assets');
        $this->loader->add_action('wp_ajax_nm_save_form', $this, 'save_form');
        $this->loader->add_action('wp_ajax_nm_get_field_template', $this, 'get_field_template');
        $this->loader->add_action('wp_ajax_nm_get_entries', $this, 'get_entries');
        $this->loader->add_action('wp_ajax_nm_update_entry_status', $this, 'update_entry_status');

        // Acciones para capas base
        $this->loader->add_action('admin_post_nm_add_base_layer_action', $this, 'handle_add_base_layer');
        $this->loader->add_action('admin_post_nm_delete_base_layer_action', $this, 'handle_delete_base_layer');

        // Acciones para capas overlay
        $this->loader->add_action('admin_post_nm_add_overlay_layer_action', $this, 'handle_add_overlay_layer');
        $this->loader->add_action('admin_post_nm_delete_overlay_layer_action', $this, 'handle_delete_overlay_layer');
    }

    public function add_plugin_admin_menu()
    {
        add_menu_page(
            'NexusMap',
            'NexusMap',
            'manage_options',
            'nm',
            array($this, 'display_plugin_setup_page'),
            'dashicons-location-alt',
            25
        );

        add_submenu_page(
            'nm',
            'Form Entries',
            'Entries',
            'manage_options',
            'nm-entries',
            array($this, 'display_entries_page')
        );

        // Agregar el nuevo submenú para las configuraciones del mapa
        add_submenu_page(
            'nm',
            'Map Settings',
            'Map Settings',
            'manage_options',
            'nm_map_settings',
            array($this, 'display_map_settings_page')
        );

        // Nuevo submenú para "Manage Layers"
        add_submenu_page(
            'nm',
            'Manage Layers',
            'Manage Layers',
            'manage_options',
            'nm_manage_layers',
            array($this, 'display_manage_layers_page')
        );
    }

    public function display_plugin_setup_page()
    {
        $form_data = $this->model->get_form();
        include_once 'views/form-builder.php';
    }

    public function display_entries_page()
    {
        $entries = $this->model->get_entries();
        include_once 'views/entries-list.php';
    }

    public function display_map_settings_page()
    {
        include_once 'views/map-settings.php';
    }

    public function display_manage_layers_page()
    {
        include_once 'views/manage-layers.php';
    }

    // Función para manejar la adición de capas base
    public function handle_add_base_layer()
    {
        // Verificar permisos y nonce
        if (!current_user_can('manage_options')) {
            wp_die(__('You are not allowed to access this page.', 'nexusmap'));
        }

        check_admin_referer('nm_add_base_layer', 'nm_nonce');

        // Procesar los datos del formulario
        $layer_name = sanitize_text_field($_POST['layer_name']);
        $layer_url = nm_sanitize_tile_url($_POST['layer_url']);
        $layer_attribution = sanitize_textarea_field($_POST['layer_attribution']);

        $base_layers = get_option('nm_base_layers', array());

        $base_layers[] = array(
            'name' => $layer_name,
            'url'  => $layer_url,
            'attribution' => $layer_attribution,
            // Puedes agregar más opciones aquí
        );

        update_option('nm_base_layers', $base_layers);

        // Clear the WordPress cache
        wp_cache_flush();
        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la eliminación de capas base
    public function handle_delete_base_layer()
    {
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

        // Clear the WordPress cache
        wp_cache_flush();
        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la adición de capas overlay
    public function handle_add_overlay_layer()
    {
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

        // Clear the WordPress cache
        wp_cache_flush();

        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    // Función para manejar la eliminación de capas overlay
    public function handle_delete_overlay_layer()
    {
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
        // Clear the WordPress cache
        wp_cache_flush();
        // Redirigir de vuelta a la página de gestión de capas
        wp_redirect(admin_url('admin.php?page=nm_manage_layers'));
        exit;
    }

    public function enqueue_admin_assets()
    {
        wp_enqueue_style('nm-admin-css', NM_PLUGIN_URL . 'admin/css/admin.css', array(), NM_VERSION);
        wp_enqueue_style('nm-entries-css', NM_PLUGIN_URL . 'admin/css/entries.css', array(), NM_VERSION);

        // Encolar CSS y JS de Leaflet
        wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), null);
        wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), null, true);



        wp_enqueue_script('nm-admin-js', NM_PLUGIN_URL . 'admin/js/admin.js', array('jquery', 'jquery-ui-sortable', 'jquery-ui-draggable', 'jquery-ui-droppable'), NM_VERSION, true);
        wp_enqueue_script('nm-entries-js', NM_PLUGIN_URL . 'admin/js/entries.js', array('jquery', 'leaflet-js'), NM_VERSION, true);
        wp_localize_script('nm-admin-js', 'nmAdmin', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('nm_admin_nonce')
        ));
    }

    public function save_form()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $form_data = $_POST['form_data'];
        $this->model->save_form($form_data);
        wp_send_json_success('Form saved successfully');
    }

    public function get_field_template()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $field_type = sanitize_text_field($_POST['field_type']);

        ob_start();
        include 'views/field-templates/' . $field_type . '.php';
        $field_html = ob_get_clean();

        wp_send_json_success($field_html);
    }

    public function get_entries()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $entries = $this->model->get_entries();
        wp_send_json_success($entries);
    }

    public function update_entry_status()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        $entry_id = intval($_POST['entry_id']);
        $status = sanitize_text_field($_POST['status']);
        $this->model->update_entry_status($entry_id, $status);
        wp_send_json_success('Entry status updated');
    }


    public function register_map_settings()
    {
        register_setting('nm_map_settings_group', 'nm_enable_geojson_download'); // opción para habilitar la descarga de GeoJSON
        register_setting('nm_map_settings_group', 'nm_enable_search'); // opción para habilitar la búsqueda
        register_setting('nm_map_settings_group', 'nm_enable_user_wms'); // Opción para habilitar que el usuario pueda agregar WMS

        add_settings_section(
            'nm_map_settings_section',
            __('Map Options', 'nexusmap'),
            null,
            'nm_map_settings'
        );

        add_settings_field(
            'nm_enable_geojson_download',
            __('Enable GeoJSON Download', 'nexusmap'),
            array($this, 'render_geojson_download_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );

        add_settings_field(
            'nm_enable_search',
            __('Enable Map Search', 'nexusmap'),
            array($this, 'render_map_search_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );
        // Agregar el campo add user wms
        add_settings_field(
            'nm_enable_user_wms',
            __('Enable User WMS Layers', 'nexusmap'),
            array($this, 'render_user_wms_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );
    }

    //funcion para renderizar el campo de descarga de GeoJSON
    public function render_geojson_download_field()
    {
        $option = get_option('nm_enable_geojson_download', false);
?>
        <input type="checkbox" name="nm_enable_geojson_download" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_geojson_download"><?php esc_html_e('Enable the option to download map data as GeoJSON.', 'nexusmap'); ?></label>
    <?php
    }

    //funcion para renderizar el campo de búsqueda en el mapa
    public function render_map_search_field()
    {
        $option = get_option('nm_enable_search', false);
    ?>
        <input type="checkbox" name="nm_enable_search" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_search"><?php esc_html_e('Enable the search functionality on the map.', 'nexusmap'); ?></label>
    <?php
    }

    public function render_user_wms_field()
    {
        $option = get_option('nm_enable_user_wms', false);
    ?>
        <input type="checkbox" name="nm_enable_user_wms" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_user_wms"><?php esc_html_e('Allow users to add WMS layers to the map.', 'nexusmap'); ?></label>
<?php
    }
}