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
    }

    public function add_plugin_admin_menu()
    {
        add_menu_page('NexusMap', 'NexusMap', 'manage_options', 'nm', array($this, 'display_plugin_setup_page'), 'dashicons-location-alt', 25);
    }

    public function display_plugin_setup_page()
    {
        $form_data = $this->model->get_form();
        include_once 'views/form-builder.php';
    }
}
