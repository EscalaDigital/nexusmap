<?php
// Asegúrate de no tener espacios en blanco antes de la etiqueta de apertura <?php
?>

<style>
.nm-admin-wrapper {
    max-width: 1200px;
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nm-admin-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.nm-admin-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.nm-admin-header p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 16px;
}

.nm-section-box {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.nm-section-box:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.nm-section-box h2 {
    color: #2c3e50;
    font-size: 20px;
    margin: 0 0 20px 0;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f3f4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.nm-section-box h2:before {
    content: "🗺️";
    font-size: 24px;
}

.nm-form-table {
    background: white;
    border: none;
    width: 100%;
}

.nm-form-table th {
    color: #374151;
    font-weight: 600;
    padding: 15px 10px;
    text-align: left;
}

.nm-form-table td {
    padding: 15px 10px;
}

.nm-form-table input,
.nm-form-table select,
.nm-form-table textarea {
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background: white;
    width: 100%;
    max-width: 400px;
}

.nm-form-table input:focus,
.nm-form-table select:focus,
.nm-form-table textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.nm-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 30px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.nm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    color: white;
}

.nm-btn-danger {
    background: #ef4444;
    color: white;
    padding: 8px 16px;
    font-size: 14px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
}

.nm-btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
    color: white;
}

.nm-table-modern {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nm-table-modern th {
    background: #f8fafc;
    color: #374151;
    font-weight: 600;
    padding: 15px;
    border-bottom: 1px solid #e5e7eb;
}

.nm-table-modern td {
    padding: 15px;
    border-bottom: 1px solid #f1f3f4;
}

.nm-table-modern tr:hover {
    background: #f8fafc;
}

@media (max-width: 768px) {
    .nm-admin-header {
        padding: 20px;
    }
    
    .nm-section-box {
        padding: 20px;
    }
}
</style>

<div class="wrap nm-admin-wrapper">
    <div class="nm-admin-header">
        <h1><?php esc_html_e('Gestor de Capas del Mapa', 'nexusmap'); ?></h1>
        <p>Administra las capas base y overlay de tus mapas de forma visual e intuitiva</p>
    </div>

    <!-- Formulario para añadir una nueva capa base -->
    <div class="nm-section-box">
        <h2><?php esc_html_e('Añadir Nueva Capa Base', 'nexusmap'); ?></h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="nm_add_base_layer_action">
            <?php wp_nonce_field('nm_add_base_layer', 'nm_nonce'); ?>
            <table class="nm-form-table">
                <tr>
                    <th scope="row"><label for="layer_name"><?php esc_html_e('Nombre de la Capa', 'nexusmap'); ?></label></th>
                    <td><input name="layer_name" type="text" id="layer_name" class="regular-text" required></td>
                </tr>
                <tr>
                    <th scope="row"><label for="layer_url"><?php esc_html_e('URL de la Capa', 'nexusmap'); ?></label></th>
                    <td><input name="layer_url" type="text" id="layer_url" class="regular-text" required></td>
                </tr>
                <tr>
                    <th scope="row"><label for="layer_attribution"><?php esc_html_e('Atribución', 'nexusmap'); ?></label></th>
                    <td><textarea name="layer_attribution" id="layer_attribution" class="regular-text" rows="3"></textarea></td>
                </tr>
                <!-- Puedes agregar más campos para opciones adicionales -->
            </table>
            <p class="submit">
                <input type="submit" name="nm_add_base_layer" id="submit" class="nm-btn-primary" value="➕ Añadir Capa Base">
            </p>
        </form>
    </div>

<?php
$base_layers = get_option('nm_base_layers', array());
if (! empty($base_layers)) : ?>
    <div class="nm-section-box">
        <h2><?php esc_html_e('Capas Base Existentes', 'nexusmap'); ?></h2>
        <table class="nm-table-modern widefat">
            <thead>
                <tr>
                    <th><?php esc_html_e('Nombre de la Capa', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('URL de la Capa', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('Atribución', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('Acciones', 'nexusmap'); ?></th>
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
                            <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin-post.php?action=nm_delete_base_layer_action&index=' . $index), 'nm_delete_base_layer_' . $index)); ?>" class="nm-btn-danger">🗑️ <?php esc_html_e('Eliminar', 'nexusmap'); ?></a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>

<!-- Formulario para añadir una nueva capa overlay -->
<div class="nm-section-box">
    <h2><?php esc_html_e('Añadir Nueva Capa Overlay', 'nexusmap'); ?></h2>    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="nm_add_overlay_layer_action">
        <?php wp_nonce_field('nm_add_overlay_layer', 'nm_nonce'); ?>
        <table class="nm-form-table">
            <tr>
                <th scope="row"><label for="overlay_name"><?php esc_html_e('Nombre de la Capa', 'nexusmap'); ?></label></th>
                <td><input name="overlay_name" type="text" id="overlay_name" class="regular-text" required></td>
            </tr>
            <tr>
                <th scope="row"><label for="overlay_type"><?php esc_html_e('Tipo de Capa', 'nexusmap'); ?></label></th>
                <td>
                    <select name="overlay_type" id="overlay_type" required>
                        <option value="geojson"><?php esc_html_e('GeoJSON', 'nexusmap'); ?></option>
                        <option value="wms"><?php esc_html_e('WMS', 'nexusmap'); ?></option>
                        <!-- Agrega más opciones si lo deseas -->
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="overlay_url"><?php esc_html_e('URL de la Capa', 'nexusmap'); ?></label></th>
                <td><input name="overlay_url" type="text" id="overlay_url" class="regular-text" required></td>
            </tr>
            <tr id="wms_layer_name_row" style="display: none;">
                <th scope="row"><label for="wms_layer_name"><?php esc_html_e('Nombre de Capa WMS', 'nexusmap'); ?></label></th>
                <td><input name="wms_layer_name" type="text" id="wms_layer_name" class="regular-text"></td>
            </tr>
            <tr>
                <th scope="row"><label for="overlay_color"><?php esc_html_e('Color de Relleno', 'nexusmap'); ?></label></th>
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
                <th scope="row"><label for="overlay_border_color"><?php esc_html_e('Color del Borde', 'nexusmap'); ?></label></th>
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
                <th scope="row"><label for="overlay_border_width"><?php esc_html_e('Grosor del Borde', 'nexusmap'); ?></label></th>
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
                <th scope="row"><label for="overlay_bg_opacity"><?php esc_html_e('Opacidad del Fondo', 'nexusmap'); ?></label></th>
                <td>
                    <input
                        type="range"
                        name="overlay_bg_opacity"
                        id="overlay_bg_opacity"
                        min="0"
                        max="1"
                        step="0.1"
                        value="0.5">
                    <span class="value-display">0.5</span>                </td>
            </tr>
            <tr>
                <th scope="row"><label for="overlay_opacity"><?php esc_html_e('Opacidad', 'nexusmap'); ?></label></th>
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
                <th scope="row"><label for="overlay_fill"><?php esc_html_e('Mostrar Relleno', 'nexusmap'); ?></label></th>
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
                <th scope="row"><label for="overlay_active"><?php esc_html_e('Activo por Defecto', 'nexusmap'); ?></label></th>
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
            <input type="submit" name="nm_add_overlay_layer" id="submit" class="nm-btn-primary" value="➕ Añadir Capa Overlay">
        </p>
    </form>
</div>

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
    <div class="nm-section-box">
        <h2><?php esc_html_e('Capas Overlay Existentes', 'nexusmap'); ?></h2>
        <table class="nm-table-modern widefat">
            <thead>
                <tr>
                    <th><?php esc_html_e('Nombre', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('Tipo', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('URL', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('Color', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('Activo', 'nexusmap'); ?></th>
                    <th><?php esc_html_e('Acciones', 'nexusmap'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($overlay_layers as $index => $layer) : ?>
                    <tr>
                        <td><?php echo esc_html($layer['name']); ?></td>
                        <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;"><?php echo esc_html(strtoupper($layer['type'])); ?></span></td>
                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;"><?php echo esc_html($layer['url']); ?></td>
                        <td>
                            <div style="
                                width: 30px; 
                                height: 30px; 
                                background-color: <?php echo esc_attr($layer['color'] ?? '#ff0000'); ?>;
                                opacity: <?php echo esc_attr($layer['bg_opacity'] ?? '0.5'); ?>;
                                border: <?php echo esc_attr($layer['border_width'] ?? '1'); ?>px solid <?php echo esc_attr($layer['border_color'] ?? '#000000'); ?>;
                                border-radius: 4px;
                            "></div>
                        </td>
                        <td><?php echo isset($layer['active']) && $layer['active'] ? '<span style="color: #10b981;">✓ Activo</span>' : '<span style="color: #ef4444;">✗ Inactivo</span>'; ?></td>
                        <td>
                            <!-- Enlace para eliminar -->
                            <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin-post.php?action=nm_delete_overlay_layer_action&index=' . $index), 'nm_delete_overlay_layer_' . $index)); ?>" class="nm-btn-danger">🗑️ Eliminar</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>

</div><!-- Cerrar nm-admin-wrapper -->