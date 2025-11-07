<?php

require_once 'NM_Menu_Main.php';
require_once 'NM_Entries.php';
require_once 'NM_Map_Settings.php';
require_once 'NM_Manage_Layers.php';
require_once 'NM_Ajax_Handlers.php';
require_once 'NM_Form_To_Map.php';
require_once 'NM_Form_Filters.php';
require_once 'NM_Chart_Manager.php';
require_once 'NM_Style_Manager.php';
require_once 'NM_Gallery.php';

class NM_Admin
{
    private $loader;
    private $model;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();        // Cargar funcionalidades divididas
        new NM_Menu_Main($this->loader, $this->model);
        new NM_Entries($this->loader, $this->model);
        new NM_Map_Settings($this->loader);
        new NM_Manage_Layers($this->loader);
        new NM_Ajax_Handlers($this->loader, $this->model);
        new NM_Form_To_Map($this->loader); 
        new NM_Form_Filters($this->loader);        new NM_Chart_Manager($this->loader);        new NM_Style_Manager($this->loader);
        new NM_Gallery($this->loader);

        // Cargar estilos y scripts en las páginas específicas del plugin
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_admin_assets');
    }

    public function enqueue_admin_assets($hook_suffix)
    {        // Verificar que solo se carguen en las páginas de NexusMap
        $plugin_pages = ['toplevel_page_nm', 'nexusmap_page_nm-entries', 'nexusmap_page_nm_map_settings', 'nexusmap_page_nm_manage_layers', 'nexusmap_page_nm-form-to-map', 'nexusmap_page_nm-form-filters', 'nexusmap_page_nm-chart-manager', 'nexusmap_page_nm_style_manager', 'nexusmap_page_nm-gallery'];

        if (in_array($hook_suffix, $plugin_pages)) {            // Cargar CSS
            wp_enqueue_style('nm-admin-css', NM_PLUGIN_URL . 'admin/css/admin.css', array(), NM_VERSION);
            wp_enqueue_style('nm-entries-css', NM_PLUGIN_URL . 'admin/css/entries.css', array(), NM_VERSION);
            wp_enqueue_style('nm-geographic-selector-css', NM_PLUGIN_URL . 'public/css/geographic-selector.css', array(), NM_VERSION);

            // Cargar CSS y JS de Leaflet (si es necesario para la página de capas o mapa)
            wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), null);
            wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), null, true);            // Cargar scripts específicos
            wp_enqueue_script('nm-admin-js', NM_PLUGIN_URL . 'admin/js/admin.js', array('jquery', 'jquery-ui-sortable', 'jquery-ui-draggable', 'jquery-ui-droppable'), NM_VERSION, true);
            wp_enqueue_script('nm-entries-js', NM_PLUGIN_URL . 'admin/js/entries.js', array('jquery', 'leaflet-js'), NM_VERSION, true);
            wp_enqueue_script('nm-geographic-selector-config-js', NM_PLUGIN_URL . 'admin/js/geographic-selector-config.js', array('jquery'), NM_VERSION, true);            // Agregar variables globales para AJAX
            wp_localize_script('nm-admin-js', 'nmAdmin', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_admin_nonce'),
                'geonames_user' => nm_get_geonames_user()
            ));
        }
    }
}
