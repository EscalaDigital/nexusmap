<?php
/**
 * Plugin Name: NexusMap
 * Description: Plugin para mapeo colaborativo usando Leaflet.
 * Version: 2.0.0
 * Author: Escaladigital.es
 * License:     GPLv2 or later
 * Author URI: https://escaladigital.es
 * Text Domain: nexusmap
 *
 * Este plugin permite crear mapas interactivos colaborativos en WordPress utilizando la librería Leaflet.
 * Proporciona herramientas para la gestión de capas, formularios personalizados y visualización de datos geográficos.
 */

// Medida de seguridad: Evita el acceso directo al archivo
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Configuración del modo de depuración de WordPress
// Estas constantes permiten el registro de errores durante el desarrollo
if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}
if (!defined('WP_DEBUG_LOG')) {
    define('WP_DEBUG_LOG', true);
}
if (!defined('WP_DEBUG_DISPLAY')) {
    define('WP_DEBUG_DISPLAY', true);
}

// Definición de constantes fundamentales del plugin
define( 'NM_VERSION', '1.0.0' );  // Versión actual del plugin
define( 'NM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );  // Ruta absoluta al directorio del plugin
define( 'NM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );   // URL al directorio del plugin

// Inclusión de las clases principales del plugin
require_once NM_PLUGIN_DIR . 'includes/class-nm.php';           // Clase principal del plugin
require_once NM_PLUGIN_DIR . 'includes/models/class-nm-model.php';  // Modelo para gestión de datos
require_once NM_PLUGIN_DIR . 'includes/class-nm-activator.php';    // Gestiona la activación del plugin
require_once NM_PLUGIN_DIR . 'includes/class-nm-deactivator.php';  // Gestiona la desactivación del plugin

// Incluir funciones auxiliares y utilidades generales
include_once plugin_dir_path(__FILE__) . 'nm-utils.php';

// Registro de los hooks de activación y desactivación del plugin
register_activation_hook( __FILE__, array( 'NM_Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'NM_Deactivator', 'deactivate' ) );

/**
 * Inicializa el plugin NexusMap
 * 
 * Esta función crea una instancia de la clase principal del plugin
 * y ejecuta todos los hooks y filtros necesarios para su funcionamiento
 */
function run_nm() {
    $plugin = new NM();
    $plugin->run();
}
run_nm();
