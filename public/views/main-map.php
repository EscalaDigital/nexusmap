<?php
$enable_geojson_download = get_option( 'nm_enable_geojson_download', false );
$enable_search = get_option( 'nm_enable_search', false );
$enable_user_wms = get_option('nm_enable_user_wms', false);
$base_layers = get_option( 'nm_base_layers', array() );
$overlay_layers = get_option( 'nm_overlay_layers', array() );
?>

<div id="nm-main-map" style="width: <?php echo esc_attr( $atts['width'] ); ?>; height: <?php echo esc_attr( $atts['height'] ); ?>; position: relative;"><div id="nm-top-controls" class="nm-top-controls">
        <!-- Los botones se agregarán aquí -->
    </div>
</div>
<!-- Modal -->
<div id="nm-modal" class="nm-modal">
    <div class="nm-modal-content">
        <span id="nm-modal-close" class="nm-modal-close">&times;</span>
        <div id="nm-modal-body"></div>
    </div>
</div>


    


<script type="text/javascript">
    
    var nmMapData = {
        lat: <?php echo esc_js( $atts['lat'] ); ?>,
        lng: <?php echo esc_js( $atts['lng'] ); ?>,
        zoom: <?php echo esc_js( $atts['zoom'] ); ?>,
        ajax_url: '<?php echo admin_url( 'admin-ajax.php' ); ?>',
        nonce: '<?php echo wp_create_nonce( 'nm_public_nonce' ); ?>',
        enable_geojson_download: <?php echo $enable_geojson_download ? 'true' : 'false'; ?>, // opción para habilitar la descarga de GeoJSON
        enable_search: <?php echo $enable_search ? 'true' : 'false'; ?>, // opción para habilitar la búsqueda
        enable_user_wms: <?php echo json_encode((bool) $enable_user_wms); ?>, // Opción para habilitar que el usuario pueda agregar WMS
        base_layers: <?php echo json_encode( $base_layers ); ?>,
        overlay_layers: <?php echo json_encode( $overlay_layers ); ?>,
        plugin_url: <?php echo json_encode(NM_PLUGIN_URL); ?>
    };
</script>