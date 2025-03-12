<?php
/**
 * Plugin Name: NexusMap
 * Description: A plugin for collaborative mapping using Leaflet.
 * Version: 1.0.0
 * Author: Escaladigital.es
 * Author URI: https://escaladigital.es
 * Text Domain: nexusmap
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

define( 'NM_VERSION', '1.0.0' );
define( 'NM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Incluir las clases necesarias
require_once NM_PLUGIN_DIR . 'includes/class-nm.php';
require_once NM_PLUGIN_DIR . 'includes/models/class-nm-model.php';
require_once NM_PLUGIN_DIR . 'includes/class-nm-activator.php';
require_once NM_PLUGIN_DIR . 'includes/class-nm-deactivator.php';

// Incluir el archivo de funciones utilitarias
include_once plugin_dir_path(__FILE__) . 'nm-utils.php';

// Registrar los hooks de activación y desactivación
register_activation_hook( __FILE__, array( 'NM_Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'NM_Deactivator', 'deactivate' ) );



function console_log($message) {
    echo '<script type="text/javascript">';
    echo 'console.log(' . json_encode($message) . ');';
    echo '</script>';
}

function run_nm() {
    $plugin = new NM();
    $plugin->run();
}
run_nm();
