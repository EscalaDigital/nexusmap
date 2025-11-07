<?php
/**
 * NM_Style_Manager class
 *
 * Handles the management of styles for the plugin.
 */
class NM_Style_Manager {
    private $loader;
    
    public function __construct($loader) {
        $this->loader = $loader;
        $this->loader->add_action('admin_menu', $this, 'add_styles_submenu');
        $this->loader->add_action('admin_init', $this, 'register_style_settings');
    }

    public function add_styles_submenu() {
        add_submenu_page(
            'nm',
            'Estilos',
            'Estilos', 
            'manage_options',
            'nm-styles',
            array($this, 'render_styles_page')
        );
    }

  
    public function register_style_settings() {
        register_setting('nm_style_settings', 'nm_selected_theme');
        register_setting('nm_style_settings', 'nm_selected_theme_form'); 
    }
    
    public function render_styles_page() {
        $current_theme = get_option('nm_selected_theme', 'default');
        $current_theme_form = get_option('nm_selected_theme_form', 'default'); 
        require_once plugin_dir_path(__FILE__) . 'views/style-manager.php';
    }

}