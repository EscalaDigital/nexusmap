<div id="nm-main-map" style="width: <?php echo esc_attr( $atts['width'] ); ?>; height: <?php echo esc_attr( $atts['height'] ); ?>;"></div>
<script type="text/javascript">
    var nmMapData = {
        lat: <?php echo esc_js( $atts['lat'] ); ?>,
        lng: <?php echo esc_js( $atts['lng'] ); ?>,
        zoom: <?php echo esc_js( $atts['zoom'] ); ?>,
        ajax_url: '<?php echo admin_url( 'admin-ajax.php' ); ?>',
        nonce: '<?php echo wp_create_nonce( 'nm_public_nonce' ); ?>'
    };

</script>
