<?php

class NM_Entries
{
    private $loader;
    private $model;

    public function __construct($loader, $model)
    {
        $this->loader = $loader;
        $this->model = $model;
        $this->loader->add_action('admin_menu', $this, 'add_entries_submenu');
    }

    public function add_entries_submenu()
    {
        add_submenu_page('nm', 'Entradas del Formulario', 'Entradas', 'manage_options', 'nm-entries', array($this, 'display_entries_page'));
    }    public function display_entries_page()
    {
        // Obtener entradas pendientes y aceptadas
        $pending_entries = $this->model->get_entries('pending');
        $approved_entries = $this->model->get_entries('approved');
        include_once 'views/entries-list.php';
    }
}
