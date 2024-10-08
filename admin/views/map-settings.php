<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Obtener el valor actual de la opción
$enable_geojson_download = get_option( 'nm_enable_geojson_download', false );
?>

<div class="wrap">
    <h1><?php esc_html_e( 'Map Settings', 'nexusmap' ); ?></h1>

    <form method="post" action="options.php">
        <?php
        settings_fields( 'nm_map_settings_group' );
        do_settings_sections( 'nm_map_settings' );
        submit_button();
        ?>
    </form>
</div>
