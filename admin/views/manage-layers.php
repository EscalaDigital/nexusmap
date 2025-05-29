<?php
// Asegúrate de no tener espacios en blanco antes de la etiqueta de apertura <?php
?>

<h1><?php esc_html_e('Manage Map Layers', 'nexusmap'); ?></h1>

<!-- Formulario para añadir una nueva capa base -->
<h2><?php esc_html_e('Add New Base Layer', 'nexusmap'); ?></h2>
<form method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>">
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
                        <a href="<?php echo esc_url( wp_nonce_url(admin_url('admin-post.php?action=nm_delete_base_layer_action&index=' . $index), 'nm_delete_base_layer_' . $index) ); ?>"><?php esc_html_e('Delete', 'nexusmap'); ?></a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<!-- Formulario para añadir una nueva capa overlay -->
<h2><?php esc_html_e('Add New Overlay Layer', 'nexusmap'); ?></h2>
<form method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>">
    <input type="hidden" name="action" value="nm_add_overlay_layer_action">
    <?php wp_nonce_field('nm_add_overlay_layer', 'nm_nonce'); ?>
    <table class="form-table">        <tr>
            <th scope="row"><label for="overlay_name"><?php esc_html_e('Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="overlay_name" type="text" id="overlay_name" class="regular-text" required></td>
        </tr>        <tr>
            <th scope="row"><label for="overlay_type"><?php esc_html_e('Layer Type', 'nexusmap'); ?></label></th>            <td>
                <input type="hidden" name="overlay_type" value="wms">
                <strong><?php esc_html_e('WMS', 'nexusmap'); ?></strong>
                <p class="description"><?php esc_html_e('Solo se admiten capas WMS (Web Map Service)', 'nexusmap'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_url"><?php esc_html_e('WMS Service URL', 'nexusmap'); ?></label></th>
            <td><input name="overlay_url" type="text" id="overlay_url" class="regular-text" required></td>
        </tr>
        <tr>
            <th scope="row"><label for="wms_layer_name"><?php esc_html_e('WMS Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="wms_layer_name" type="text" id="wms_layer_name" class="regular-text" required></td>
        </tr>
        <!-- Puedes agregar más campos para opciones adicionales -->
    </table>
    <p class="submit">
        <input type="submit" name="nm_add_overlay_layer" id="submit" class="button button-primary" value="<?php esc_attr_e('Add Overlay Layer', 'nexusmap'); ?>">
    </p>
</form>



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
                <th><?php esc_html_e('Actions', 'nexusmap'); ?></th>
            </tr>
        </thead>
        <tbody>            <?php foreach ($overlay_layers as $index => $layer) : ?>
                <tr>
                    <td><?php echo esc_html($layer['name']); ?></td>
                    <td><?php echo esc_html(strtoupper($layer['type'])); ?></td>                    <td>
                        <?php 
                        $url = esc_html($layer['url']);
                        if (strlen($url) > 50) {
                            echo substr($url, 0, 50) . '...';
                        } else {
                            echo $url;
                        }
                        ?>
                    </td>
                    <td><?php echo isset($layer['wms_layer_name']) ? esc_html($layer['wms_layer_name']) : ''; ?></td>
                    <td>
                        <!-- Enlace para eliminar -->
                        <a href="<?php echo esc_url( wp_nonce_url(admin_url('admin-post.php?action=nm_delete_overlay_layer_action&index=' . $index), 'nm_delete_overlay_layer_' . $index) ); ?>"><?php esc_html_e('Delete', 'nexusmap'); ?></a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

