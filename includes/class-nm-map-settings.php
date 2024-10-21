<?php

class NM_Map_Settings {

    private $loader;

    public function __construct($loader) {
        $this->loader = $loader;

        $this->define_settings_hooks();
    }

    private function define_settings_hooks() {
        $this->loader->add_action('admin_init', $this, 'register_map_settings');
    }

    public function register_map_settings() {
        register_setting('nm_map_settings_group', 'nm_enable_geojson_download'); // opción para habilitar la descarga de GeoJSON
        register_setting('nm_map_settings_group', 'nm_enable_search'); // opción para habilitar la búsqueda

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
    }

    public function display_map_settings_page() {
        include_once 'views/map-settings.php';
    }

    // Función para renderizar el campo de descarga de GeoJSON
    public function render_geojson_download_field() {
        $option = get_option('nm_enable_geojson_download', false);
        ?>
        <input type="checkbox" name="nm_enable_geojson_download" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_geojson_download"><?php esc_html_e('Enable the option to download map data as GeoJSON.', 'nexusmap'); ?></label>
        <?php
    }

    // Función para renderizar el campo de búsqueda en el mapa
    public function render_map_search_field() {
        $option = get_option('nm_enable_search', false);
        ?>
        <input type="checkbox" name="nm_enable_search" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_search"><?php esc_html_e('Enable the search functionality on the map.', 'nexusmap'); ?></label>
        <?php
    }

}
