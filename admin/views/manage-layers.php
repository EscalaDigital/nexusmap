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
<form method="post" action="<?php echo esc_url( admin_url('admin-post.php') ); ?>" enctype="multipart/form-data">
    <input type="hidden" name="action" value="nm_add_overlay_layer_action">
    <?php wp_nonce_field('nm_add_overlay_layer', 'nm_nonce'); ?>
    <table class="form-table">        <tr>
            <th scope="row"><label for="overlay_name"><?php esc_html_e('Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="overlay_name" type="text" id="overlay_name" class="regular-text" required></td>
        </tr>
        <tr>
            <th scope="row"><label for="overlay_type"><?php esc_html_e('Layer Type', 'nexusmap'); ?></label></th>
            <td>
                <select name="overlay_type" id="overlay_type" required>
                    <option value="wms" selected><?php esc_html_e('WMS', 'nexusmap'); ?></option>
                    <option value="geojson"><?php esc_html_e('GeoJSON', 'nexusmap'); ?></option>
                    <!-- Agrega más opciones si lo deseas -->
                </select>
            </td>
        </tr>
        <tr id="geojson_file_row" style="display: none;">
            <th scope="row"><label for="geojson_file"><?php esc_html_e('Upload GeoJSON File', 'nexusmap'); ?></label></th>
            <td>
                <input name="geojson_file" type="file" id="geojson_file" accept=".geojson,.json">
                <p class="description"><?php esc_html_e('Sube un archivo GeoJSON (.geojson or .json)', 'nexusmap'); ?></p>                <div class="nm-file-upload-info">
                    <strong><?php esc_html_e('Requerimientos del archivo:', 'nexusmap'); ?></strong>
                    <ul>
                        <li><?php 
                            $max_upload = wp_max_upload_size();
                            $max_post = ini_get('post_max_size');
                            $max_file = ini_get('upload_max_filesize');
                            
                            // Convertir a bytes para comparar
                            $max_post_bytes = wp_convert_hr_to_bytes($max_post);
                            $max_file_bytes = wp_convert_hr_to_bytes($max_file);
                            
                            // Obtener el menor de todos los límites
                            $real_max = min($max_upload, $max_post_bytes, $max_file_bytes);
                            
                            printf(
                                esc_html__('Límite de tamaño: %s (Límite del sistema)', 'nexusmap'),
                                size_format($real_max)
                            );
                        ?></li>
                        <li><?php esc_html_e('Formatos: .geojson, .json', 'nexusmap'); ?></li>
                        <li><?php esc_html_e('Debe ser un formato GeoJSON válido', 'nexusmap'); ?></li>
                        <li><?php esc_html_e('Soporta: puntos, líneas, polígonos o FeatureCollections', 'nexusmap'); ?></li>
                    </ul>
                </div>
            </td>
        </tr>
        <tr id="overlay_url_row">
            <th scope="row"><label for="overlay_url"><?php esc_html_e('Layer URL', 'nexusmap'); ?></label></th>
            <td><input name="overlay_url" type="text" id="overlay_url" class="regular-text" required></td>
        </tr>
        <tr id="wms_layer_name_row">
            <th scope="row"><label for="wms_layer_name"><?php esc_html_e('WMS Layer Name', 'nexusmap'); ?></label></th>
            <td><input name="wms_layer_name" type="text" id="wms_layer_name" class="regular-text" required></td>
        </tr>
        <!-- Puedes agregar más campos para opciones adicionales -->
    </table>
    <p class="submit">
        <input type="submit" name="nm_add_overlay_layer" id="submit" class="button button-primary" value="<?php esc_attr_e('Add Overlay Layer', 'nexusmap'); ?>">
    </p>
</form>

<script type="text/javascript">    // Mostrar u ocultar campos según el tipo seleccionado
    function toggleOverlayFields() {
        var overlayType = document.getElementById('overlay_type').value;
        var wmsRow = document.getElementById('wms_layer_name_row');
        var overlayUrlRow = document.getElementById('overlay_url_row');
        var geojsonFileRow = document.getElementById('geojson_file_row');
        var overlayUrlInput = document.getElementById('overlay_url');
        var geojsonFileInput = document.getElementById('geojson_file');
        var wmsLayerNameInput = document.getElementById('wms_layer_name');
        
        if (overlayType === 'wms') {
            // Para WMS: mostrar URL y nombre de capa WMS
            wmsRow.style.display = '';
            overlayUrlRow.style.display = '';
            geojsonFileRow.style.display = 'none';
            
            // Hacer campos requeridos para WMS
            overlayUrlInput.required = true;
            wmsLayerNameInput.required = true;
            geojsonFileInput.required = false;
            
        } else if (overlayType === 'geojson') {
            // Para GeoJSON: mostrar solo campo de archivo
            wmsRow.style.display = 'none';
            overlayUrlRow.style.display = 'none';
            geojsonFileRow.style.display = '';
            
            // Hacer campo de archivo requerido para GeoJSON
            overlayUrlInput.required = false;
            wmsLayerNameInput.required = false;
            geojsonFileInput.required = true;
        }
    }      // Validar contenido GeoJSON
    function validateGeojsonContent(file) {
        return new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var content = e.target.result;
                    var geojson = JSON.parse(content);
                    
                    // Validaciones básicas
                    if (!geojson.type) {
                        alert('<?php echo esc_js(__('Invalid GeoJSON: Missing type property.', 'nexusmap')); ?>');
                        resolve(false);
                        return;
                    }
                    
                    var validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
                    if (!validTypes.includes(geojson.type)) {
                        alert('<?php echo esc_js(__('Invalid GeoJSON: Invalid type.', 'nexusmap')); ?>');
                        resolve(false);
                        return;
                    }
                    
                    if (geojson.type === 'FeatureCollection') {
                        if (!geojson.features || !Array.isArray(geojson.features)) {
                            alert('<?php echo esc_js(__('Invalid GeoJSON: FeatureCollection must have features array.', 'nexusmap')); ?>');
                            resolve(false);
                            return;
                        }
                    } else if (geojson.type === 'Feature') {
                        if (!geojson.geometry || !geojson.properties) {
                            alert('<?php echo esc_js(__('Invalid GeoJSON: Feature must have geometry and properties.', 'nexusmap')); ?>');
                            resolve(false);
                            return;
                        }
                    }
                    
                    resolve(true);
                } catch (error) {
                    alert('<?php echo esc_js(__('Invalid JSON format.', 'nexusmap')); ?>');
                    resolve(false);
                }
            };
            reader.onerror = function() {
                alert('<?php echo esc_js(__('Error reading file.', 'nexusmap')); ?>');
                resolve(false);
            };
            reader.readAsText(file);
        });
    }// Event listeners
    document.getElementById('overlay_type').addEventListener('change', toggleOverlayFields);

    // Validar formulario antes del envío
    document.querySelector('form[action*="nm_add_overlay_layer_action"]').addEventListener('submit', function(e) {
        var overlayType = document.getElementById('overlay_type').value;
        
        if (overlayType === 'geojson') {
            e.preventDefault();
            var fileInput = document.getElementById('geojson_file');
            
            if (fileInput.files.length === 0) {
                alert('<?php echo esc_js(__('Please select a GeoJSON file to upload.', 'nexusmap')); ?>');
                return;
            }
            
            var file = fileInput.files[0];
            var allowedExtensions = ['geojson', 'json'];
            var fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (!allowedExtensions.includes(fileExtension)) {
                alert('<?php echo esc_js(__('Only .geojson and .json files are allowed.', 'nexusmap')); ?>');
                return;
            }
              // Verificar tamaño del archivo (límite del sistema)
            var maxFileSize = <?php echo wp_max_upload_size(); ?>;
            if (file.size > maxFileSize) {
                alert('<?php echo esc_js(__('File size exceeds the maximum allowed size of', 'nexusmap')); ?> ' + Math.round(maxFileSize / (1024 * 1024)) + 'MB');
                return;
            }
            
            // Validar contenido GeoJSON
            validateGeojsonContent(file).then(function(isValid) {
                if (isValid) {
                    e.target.submit();
                }
            });
        }
    });

    // Ejecutar al cargar la página para establecer el estado inicial
    document.addEventListener('DOMContentLoaded', function () {
        toggleOverlayFields();
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
                <th><?php esc_html_e('Actions', 'nexusmap'); ?></th>
            </tr>
        </thead>
        <tbody>            <?php foreach ($overlay_layers as $index => $layer) : ?>
                <tr>
                    <td><?php echo esc_html($layer['name']); ?></td>
                    <td><?php echo esc_html(strtoupper($layer['type'])); ?></td>
                    <td>
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
                        <?php if ($layer['type'] === 'geojson' && strpos($layer['url'], '/nexusmap/geojson/') !== false): ?>
                            <a href="<?php echo esc_url($layer['url']); ?>" target="_blank"><?php esc_html_e('View File', 'nexusmap'); ?></a> | 
                        <?php endif; ?>
                        <!-- Enlace para eliminar -->
                        <a href="<?php echo esc_url( wp_nonce_url(admin_url('admin-post.php?action=nm_delete_overlay_layer_action&index=' . $index), 'nm_delete_overlay_layer_' . $index) ); ?>"><?php esc_html_e('Delete', 'nexusmap'); ?></a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

