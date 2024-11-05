<?php

class NM_Menu_Main
{
    private $loader;
    private $model;

    public function __construct($loader, $model)
    {
        $this->loader = $loader;
        $this->model = $model;
        $this->loader->add_action('admin_menu', $this, 'add_plugin_admin_menu');
        $this->loader->add_action('admin_footer', $this, 'remove_wp_version_footer_conditionally');
    }

    public function add_plugin_admin_menu()
    {
        add_menu_page('NexusMap', 'NexusMap', 'manage_options', 'nm', array($this, 'display_plugin_setup_page'), 'dashicons-location-alt', 25);
    }

    public function display_plugin_setup_page()
    {
          // Retrieve the A/B option from wp_options
        // If A/B option is enabled, retrieve forms A and B from your custom table
        $form_data_a = $this->model->get_form(1); // form_type = 1
        $form_data_b = $this->model->get_form(2); // form_type = 2
          // If A/B option is not enabled, retrieve the single form
        $form_data = $this->model->get_form(0); // form_type = 0

        include_once 'views/form-builder.php';
    }

    public function remove_wp_version_footer_conditionally()
    {
        $screen = get_current_screen();
        if ($screen->id === 'toplevel_page_nm') { // Reemplaza 'toplevel_page_nm' con el slug de tu página
            echo '<style>
                #wpfooter {
                    display: none !important;
                }
            </style>';
        }
    }
}
