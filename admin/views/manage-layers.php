<?php
// Asegúrate de no tener espacios en blanco antes de la etiqueta de apertura <?php
?>

<h1><?php esc_html_e('Manage Map Layers', 'nexusmap'); ?></h1>

<!-- Formulario para añadir una nueva capa base -->
<h2><?php esc_html_e('Add New Base Layer', 'nexusmap'); ?></h2>
<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
    <input type="hidden" name="action" value="nm_add_base_layer_action">
    <?php wp_nonce_field('nm_add_base_layer', 'nm_nonce'); ?>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="layer_name"><?php esc_html_e('Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="layer_name" type="text" id="layer_name" class="regular-text" required></td>
        </tr>
        <tr>
            <th scope="row"><label for="layer_url"><?php esc_html_e('Tile Layer URL', 'nexusmap'); ?></label></th>
            <td><input name="layer_url" type="text" id="layer_url" class="regular-text" required></td>
        </tr>
        <tr>
            <th scope="row"><label for="layer_attribution"><?php esc_html_e('Attribution', 'nexusmap'); ?></label></th>
            <td><textarea name="layer_attribution" id="layer_attribution" class="regular-text" rows="3"></textarea></td>
        </tr>
        <!-- Puedes agregar más campos para opciones adicionales -->
    </table>
    <p class="submit">
        <input type="submit" name="nm_add_base_layer" id="submit" class="button button-primary" value="<?php esc_attr_e('Add Base Layer', 'nexusmap'); ?>">
    </p>
</form>

<?php
$base_layers = get_option('nm_base_layers', array());
if (! empty($base_layers)) : ?>
    <h2><?php esc_html_e('Existing Base Layers', 'nexusmap'); ?></h2>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php esc_html_e('Layer Name', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Tile Layer URL', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Attribution', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Actions', 'nexusmap'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($base_layers as $index => $layer) : ?>
                <tr>
                    <td><?php echo esc_html($layer['name']); ?></td>
                    <td><?php echo esc_html($layer['url']); ?></td>
                    <td><?php echo esc_html($layer['attribution']); ?></td>
                    <td>
                        <!-- Enlace para eliminar -->
                        <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin-post.php?action=nm_delete_base_layer_action&index=' . $index), 'nm_delete_base_layer_' . $index)); ?>"><?php esc_html_e('Delete', 'nexusmap'); ?></a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<!-- Formulario para añadir una nueva capa overlay -->
<h2><?php esc_html_e('Add New Overlay Layer', 'nexusmap'); ?></h2>
<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
    <input type="hidden" name="action" value="nm_add_overlay_layer_action">
    <?php wp_nonce_field('nm_add_overlay_layer', 'nm_nonce'); ?>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="overlay_name"><?php esc_html_e('Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="overlay_name" type="text" id="overlay_name" class="regular-text" required></td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_type"><?php esc_html_e('Layer Type', 'nexusmap'); ?></label></th>
            <td>
                <select name="overlay_type" id="overlay_type" required>
                    <option value="geojson"><?php esc_html_e('GeoJSON', 'nexusmap'); ?></option>
                    <option value="wms"><?php esc_html_e('WMS', 'nexusmap'); ?></option>
                    <!-- Agrega más opciones si lo deseas -->
                </select>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_url"><?php esc_html_e('Layer URL', 'nexusmap'); ?></label></th>
            <td><input name="overlay_url" type="text" id="overlay_url" class="regular-text" required></td>
        </tr>
        <tr id="wms_layer_name_row" style="display: none;">
            <th scope="row"><label for="wms_layer_name"><?php esc_html_e('WMS Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="wms_layer_name" type="text" id="wms_layer_name" class="regular-text"></td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_color"><?php esc_html_e('Fill Color', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="color"
                    name="overlay_color"
                    id="overlay_color"
                    value="#ff0000"
                    class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_border_color"><?php esc_html_e('Border Color', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="color"
                    name="overlay_border_color"
                    id="overlay_border_color"
                    value="#000000"
                    class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_border_width"><?php esc_html_e('Border Width', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="number"
                    name="overlay_border_width"
                    id="overlay_border_width"
                    min="0"
                    max="10"
                    step="1"
                    value="1"
                    class="small-text">
                <span class="description"><?php esc_html_e('px', 'nexusmap'); ?></span>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_bg_opacity"><?php esc_html_e('Background Opacity', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="range"
                    name="overlay_bg_opacity"
                    id="overlay_bg_opacity"
                    min="0"
                    max="1"
                    step="0.1"
                    value="0.5">
                <span class="value-display">0.5</span>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_opacity"><?php esc_html_e('Opacity', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="range"
                    name="overlay_opacity"
                    id="overlay_opacity"
                    min="0"
                    max="1"
                    step="0.1"
                    value="0.5">
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_fill"><?php esc_html_e('Show Fill', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="checkbox"
                    name="overlay_fill"
                    id="overlay_fill"
                    value="1"
                    checked>
                <p class="description"><?php esc_html_e('Mostrar el relleno del polígono. Si se desmarca, solo se mostrará el borde.', 'nexusmap'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_active"><?php esc_html_e('Active by Default', 'nexusmap'); ?></label></th>
            <td>
                <input
                    type="checkbox"
                    name="overlay_active"
                    id="overlay_active"
                    value="1">
            </td>
        </tr>
        <!-- Puedes agregar más campos para opciones adicionales -->
    </table>
    <p class="submit">
        <input type="submit" name="nm_add_overlay_layer" id="submit" class="button button-primary" value="<?php esc_attr_e('Add Overlay Layer', 'nexusmap'); ?>">
    </p>
</form>

<script type="text/javascript">
    // Mostrar u ocultar el campo de WMS Layer Name según el tipo seleccionado
    document.getElementById('overlay_type').addEventListener('change', function() {
        var wmsRow = document.getElementById('wms_layer_name_row');
        if (this.value === 'wms') {
            wmsRow.style.display = '';
        } else {
            wmsRow.style.display = 'none';
        }
    });

    // Ejecutar al cargar la página para establecer el estado inicial
    document.addEventListener('DOMContentLoaded', function() {
        var overlayType = document.getElementById('overlay_type').value;
        var wmsRow = document.getElementById('wms_layer_name_row');
        if (overlayType === 'wms') {
            wmsRow.style.display = '';
        } else {
            wmsRow.style.display = 'none';
        }
    });
    document.getElementById('overlay_bg_opacity').addEventListener('input', function() {
        this.nextElementSibling.textContent = this.value;
    });
</script>

<?php
$overlay_layers = get_option('nm_overlay_layers', array());
if (! empty($overlay_layers)) : ?>
    <h2><?php esc_html_e('Existing Overlay Layers', 'nexusmap'); ?></h2>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php esc_html_e('Layer Name', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Layer Type', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Layer URL', 'nexusmap'); ?></th>
                <th><?php esc_html_e('WMS Layer Name', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Fill Color', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Border Color', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Border Width', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Background Opacity', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Layer Opacity', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Active', 'nexusmap'); ?></th>
                <th><?php esc_html_e('Actions', 'nexusmap'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($overlay_layers as $index => $layer) : ?>
                <tr>
                    <td><?php echo esc_html($layer['name']); ?></td>
                    <td><?php echo esc_html(strtoupper($layer['type'])); ?></td>
                    <td><?php echo esc_html($layer['url']); ?></td>
                    <td><?php echo isset($layer['wms_layer_name']) ? esc_html($layer['wms_layer_name']) : ''; ?></td>
                    <td>
                        <div style="
                            width: 25px; 
                            height: 25px; 
                            background-color: <?php echo esc_attr($layer['color'] ?? '#ff0000'); ?>;
                            opacity: <?php echo esc_attr($layer['bg_opacity'] ?? '0.5'); ?>;
                            border: <?php echo esc_attr($layer['border_width'] ?? '1'); ?>px solid <?php echo esc_attr($layer['border_color'] ?? '#000000'); ?>;
                        "></div>
                    </td>
                    <td><?php echo esc_html($layer['border_width'] ?? '1'); ?>px</td>
                    <td><?php echo esc_html($layer['bg_opacity'] ?? '0.5'); ?></td>
                    <td>
                        <div style="width: 25px; height: 25px; background-color: <?php echo esc_attr($layer['border_color'] ?? '#000000'); ?>"></div>
                    </td>
                    <td><?php echo esc_html($layer['opacity'] ?? '0.5'); ?></td>
                    <td><?php echo isset($layer['active']) && $layer['active'] ? '✓' : '✗'; ?></td>

                    <td>
                        <!-- Enlace para eliminar -->
                        <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin-post.php?action=nm_delete_overlay_layer_action&index=' . $index), 'nm_delete_overlay_layer_' . $index)); ?>"><?php esc_html_e('Delete', 'nexusmap'); ?></a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>