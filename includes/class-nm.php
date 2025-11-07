<?php

/**
 * Clase principal del plugin NexusMap
 * 
 * Esta clase es el núcleo del plugin y se encarga de:
 * - Cargar todas las dependencias necesarias
 * - Definir los hooks para la administración
 * - Definir los hooks para la parte pública
 * - Inicializar el cargador de hooks
 */
class NM {

    /**
     * El cargador que gestiona los hooks (filtros y acciones) del plugin
     * @var NM_Loader
     */
    protected $loader;

    /**
     * Constructor de la clase
     * 
     * Inicializa el plugin cargando las dependencias y definiendo los hooks
     * necesarios tanto para el área de administración como para la parte pública
     */
    public function __construct() {
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    /**
     * Carga las dependencias necesarias para el funcionamiento del plugin
     * 
     * Incluye los archivos necesarios y crea una instancia del cargador
     * que será usado para registrar los hooks del plugin
     */
    private function load_dependencies() {
        require_once NM_PLUGIN_DIR . 'includes/class-nm-loader.php';      // Cargador de hooks
        require_once NM_PLUGIN_DIR . 'admin/class-nm-admin.php';          // Funcionalidad del área de administración
        require_once NM_PLUGIN_DIR . 'public/class-nm-public.php';        // Funcionalidad de la parte pública
        require_once NM_PLUGIN_DIR . 'admin/NM_Chart_Manager.php';        // Gestión de gráficos y visualizaciones

        $this->loader = new NM_Loader();
    }

    /**
     * Define los hooks relacionados con la funcionalidad de administración
     * 
     * Crea una instancia de la clase de administración y registra
     * todos los hooks necesarios para el panel de control
     */
    private function define_admin_hooks() {
        $plugin_admin = new NM_Admin( $this->get_loader() );
    }

    /**
     * Define los hooks relacionados con la funcionalidad pública
     * 
     * Crea una instancia de la clase pública y registra todos los hooks
     * necesarios para la visualización en el frontend
     */
    private function define_public_hooks() {
        $plugin_public = new NM_Public( $this->get_loader() );
    }

    /**
     * Ejecuta el cargador para inicializar todos los hooks registrados
     * 
     * Este método debe ser llamado para activar toda la funcionalidad
     * definida dentro del plugin
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * Obtiene la referencia al cargador de hooks
     * 
     * @return NM_Loader El cargador que gestiona los hooks del plugin
     */
    public function get_loader() {
        return $this->loader;
    }
}
