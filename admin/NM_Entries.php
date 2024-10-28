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
        add_submenu_page('nm', 'Form Entries', 'Entries', 'manage_options', 'nm-entries', array($this, 'display_entries_page'));
    }

    public function display_entries_page()
    {
        $entries = $this->model->get_entries();
        include_once 'views/entries-list.php';
    }
}
