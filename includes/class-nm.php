<?php

class NM {

    protected $loader;

    public function __construct() {
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    private function load_dependencies() {
        require_once NM_PLUGIN_DIR . 'includes/class-nm-loader.php';
        require_once NM_PLUGIN_DIR . 'admin/class-nm-admin.php';
        require_once NM_PLUGIN_DIR . 'public/class-nm-public.php';

        $this->loader = new NM_Loader();
    }

    private function define_admin_hooks() {
        $plugin_admin = new NM_Admin( $this->get_loader() );
    }

    private function define_public_hooks() {
        $plugin_public = new NM_Public( $this->get_loader() );
    }

    public function run() {
        // Ya no registramos los hooks aquí
        $this->loader->run();
    }

    public function get_loader() {
        return $this->loader;
    }
}
