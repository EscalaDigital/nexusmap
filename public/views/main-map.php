<?php
$enable_geojson_download = get_option( 'nm_enable_geojson_download', false );
$enable_search = get_option( 'nm_enable_search', false );
$enable_user_wms = get_option('nm_enable_user_wms', false);
$enable_map_tour = get_option('nm_enable_map_tour', false);
$enable_clustering = get_option('nm_enable_clustering', false);
$base_layers = get_option( 'nm_base_layers', array() );
$overlay_layers = get_option( 'nm_overlay_layers', array() );
$active_layers = get_option( 'nm_active_layers', array() );
$text_layer_name = get_option( 'nm_text_layer_name', 'Text Layer' );
$filter_settings = $this->get_filter_settings();
$chart_settings = get_option('nm_chart_settings', array());
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

<!-- Modal para gráficos -->
<div id="nm-charts-modal" class="nm-modal">
    <div class="nm-modal-content">
        <span class="nm-modal-close">&times;</span>
        <div id="nm-charts-container"></div>
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
        plugin_url: <?php echo json_encode(NM_PLUGIN_URL); ?>,
        layer_settings: <?php echo json_encode($active_layers); ?>,
        filter_settings: <?php echo json_encode($filter_settings); ?>,
        charts_enabled: <?php echo !empty($chart_settings) ? 'true' : 'false'; ?>,
        chart_settings: <?php echo json_encode($chart_settings); ?>,
        text_layer_name: <?php echo json_encode($text_layer_name); ?>
    ,enable_map_tour: <?php echo $enable_map_tour ? 'true':'false'; ?>
    ,enable_clustering: <?php echo $enable_clustering ? 'true':'false'; ?>
    
    };
</script>