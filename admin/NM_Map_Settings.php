<?php

class NM_Map_Settings
{
    private $loader;

    public function __construct($loader)
    {
        $this->loader = $loader;

        // Registro de acciones para el submenú y la configuración del mapa
        $this->loader->add_action('admin_menu', $this, 'add_map_settings_submenu');
        $this->loader->add_action('admin_init', $this, 'register_map_settings');
    }

    // Función para añadir el submenú de configuración del mapa en el panel de administración
    public function add_map_settings_submenu()
    {
        add_submenu_page(
            'nm',
            __('Map Settings', 'nexusmap'),
            __('Map Settings', 'nexusmap'),
            'manage_options',
            'nm_map_settings',
            array($this, 'display_map_settings_page')
        );
    }

    // Función para mostrar la página de configuración del mapa
    public function display_map_settings_page()
    {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Map Settings', 'nexusmap'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('nm_map_settings_group');
                do_settings_sections('nm_map_settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    // Función para registrar las configuraciones del mapa
    public function register_map_settings()
    {
        register_setting('nm_map_settings_group', 'nm_enable_geojson_download'); // Opción para habilitar la descarga de GeoJSON
        register_setting('nm_map_settings_group', 'nm_enable_search'); // Opción para habilitar la búsqueda en el mapa
        register_setting('nm_map_settings_group', 'nm_enable_user_wms'); // Opción para permitir al usuario agregar capas WMS
        // Mensaje para usuarios no logueados en el shortcode [nm_form]
        register_setting('nm_map_settings_group', 'nm_form_login_message');
    register_setting('nm_map_settings_group', 'nm_enable_map_tour'); // Opción para habilitar el tour de ayuda
    register_setting('nm_map_settings_group', 'nm_enable_clustering'); // Opción para habilitar agrupación simple de puntos

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

        // Campo: Mensaje al no estar logueado (para [nm_form])
        add_settings_field(
            'nm_form_login_message',
            __('Form login-required message', 'nexusmap'),
            array($this, 'render_form_login_message_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );

        add_settings_field(
            'nm_enable_user_wms',
            __('Enable User WMS Layers', 'nexusmap'),
            array($this, 'render_user_wms_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );

        add_settings_field(
            'nm_enable_map_tour',
            __('Enable Map Help Tour', 'nexusmap'),
            array($this, 'render_map_tour_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );

        add_settings_field(
            'nm_enable_clustering',
            __('Enable Point Clustering', 'nexusmap'),
            array($this, 'render_clustering_field'),
            'nm_map_settings',
            'nm_map_settings_section'
        );
    }

    // Función para renderizar el campo de descarga de GeoJSON
    public function render_geojson_download_field()
    {
        $option = get_option('nm_enable_geojson_download', false);
        ?>
        <input type="checkbox" name="nm_enable_geojson_download" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_geojson_download"><?php esc_html_e('Enable the option to download map data as GeoJSON.', 'nexusmap'); ?></label>
        <?php
    }

    // Función para renderizar el campo de búsqueda en el mapa
    public function render_map_search_field()
    {
        $option = get_option('nm_enable_search', false);
        ?>
        <input type="checkbox" name="nm_enable_search" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_search"><?php esc_html_e('Enable the search functionality on the map.', 'nexusmap'); ?></label>
        <?php
    }

    // Función para renderizar el campo que permite al usuario agregar capas WMS
    public function render_user_wms_field()
    {
        $option = get_option('nm_enable_user_wms', false);
        ?>
        <input type="checkbox" name="nm_enable_user_wms" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_user_wms"><?php esc_html_e('Allow users to add WMS layers to the map.', 'nexusmap'); ?></label>
        <?php
    }

    // Campo: mensaje para no logueados (permite enlaces y shortcodes)
    public function render_form_login_message_field()
    {
        $default = __('You must be logged in to view this form.', 'nexusmap');
        $content = get_option('nm_form_login_message', $default);
        // Editor con soporte de shortcodes; WordPress sanitiza según capacidades del usuario al guardar
        $settings = array(
            'textarea_name' => 'nm_form_login_message',
            'textarea_rows' => 5,
            'media_buttons' => false,
            'teeny' => true,
            'quicktags' => true,
        );
        echo '<p class="description">' . esc_html__(
            'Shown instead of the form when the user is not logged in. You can include links and WordPress shortcodes.',
            'nexusmap'
        ) . '</p>';
        wp_editor($content, 'nm_form_login_message_editor', $settings);
    }

    // Campo para habilitar el tour de ayuda
    public function render_map_tour_field()
    {
        $option = get_option('nm_enable_map_tour', false);
        ?>
        <input type="checkbox" name="nm_enable_map_tour" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_map_tour"><?php esc_html_e('Show the contextual help tour (button ? and onboarding steps).', 'nexusmap'); ?></label>
        <?php
    }

    // Campo para habilitar clustering simple
    public function render_clustering_field()
    {
        $option = get_option('nm_enable_clustering', false);
        ?>
        <input type="checkbox" name="nm_enable_clustering" value="1" <?php checked(1, $option); ?> />
        <label for="nm_enable_clustering"><?php esc_html_e('Group nearby points into neutral clusters (click or zoom to view individual points).', 'nexusmap'); ?></label>
        <?php
    }
}
