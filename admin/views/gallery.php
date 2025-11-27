<?php
// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
<h1>Configuración de Galería</h1>
<p>Selecciona qué campos del formulario se mostrarán en las tarjetas de entradas.</p>

<div class="nm-shortcode-examples" style="margin-bottom: 24px; background: #f8fafd; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px;">
    <h2 style="font-size: 1.1em; margin-top: 0;">Ejemplos de uso de los shortcodes:</h2>
    
    <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1em; margin-bottom: 8px; color: #2563eb;">📋 Listado de Entradas</h3>
        <ul style="margin-left: 20px;">
            <li>
                <strong>Lista básica:</strong><br>
                <code>[nm_entries_list]</code>
            </li>
            <li>
                <strong>Mostrar 20 entradas por página:</strong><br>
                <code>[nm_entries_list per_page="20"]</code>
            </li>
            <li>
                <strong>Sin paginación:</strong><br>
                <code>[nm_entries_list show_pagination="false"]</code>
            </li>
        </ul>
    </div>
    
    <div>
        <h3 style="font-size: 1em; margin-bottom: 8px; color: #059669;">🗂️ Galería Agrupada</h3>
        <ul style="margin-left: 20px;">
            <li>
                <strong>Galería agrupada básica:</strong><br>
                <code>[nm_entries_group]</code>
            </li>
            <li>
                <strong>Con paginación personalizada:</strong><br>
                <code>[nm_entries_group per_page="12"]</code>
            </li>
        </ul>
        <p style="margin-top: 8px; color: #666; font-size: 13px;">
            <em>Nota:</em> Configura la agrupación en la sección inferior para que este shortcode funcione.
        </p>
    </div>
    
    <p style="margin-top: 12px; color: #666;">
        Puedes combinar estos atributos según tus necesidades.
    </p>
</div>

    
    <div class="nm-gallery-container">
        <div class="nm-gallery-left">
            <div class="card">
                <div class="inside">
                    <h3>Selecciona los campos a mostrar</h3>
                    <form id="nm-gallery-form">
                        <?php wp_nonce_field('nm_admin_nonce', 'nonce'); ?>
                        
                        <!-- Campo de Texto/Título -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">📝</span>
                                <strong>Texto/Título</strong>
                                <small>(Solo se permite seleccionar uno)</small>
                            </label>
                            <select name="text_field" class="nm-field-selector" data-type="text">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (isset($available_fields['text'])): ?>
                                    <?php foreach ($available_fields['text'] as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                <?php selected($saved_settings['selected_fields']['text'], $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?> (<?php echo esc_html($field['type']); ?>)
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Campo de Imagen -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">📷</span>
                                <strong>Imagen</strong>
                                <small>(Solo se permite seleccionar una)</small>
                            </label>
                            <select name="image_field" class="nm-field-selector" data-type="image">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (isset($available_fields['image'])): ?>
                                    <?php foreach ($available_fields['image'] as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                <?php selected($saved_settings['selected_fields']['image'], $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Campo de Audio -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">🎵</span>
                                <strong>Audio</strong>
                                <small>(Solo se permite seleccionar uno)</small>
                            </label>
                            <select name="audio_field" class="nm-field-selector" data-type="audio">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (isset($available_fields['audio'])): ?>
                                    <?php foreach ($available_fields['audio'] as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                <?php selected($saved_settings['selected_fields']['audio'], $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Campo de Archivo -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">📄</span>
                                <strong>Archivo</strong>
                                <small>(Solo se permite seleccionar uno)</small>
                            </label>
                            <select name="file_field" class="nm-field-selector" data-type="file">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (isset($available_fields['file'])): ?>
                                    <?php foreach ($available_fields['file'] as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                <?php selected($saved_settings['selected_fields']['file'], $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Campo de Fecha -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">📅</span>
                                <strong>Fecha</strong>
                                <small>(Solo se permite seleccionar una)</small>
                            </label>
                            <select name="date_field" class="nm-field-selector" data-type="date">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (isset($available_fields['date'])): ?>
                                    <?php foreach ($available_fields['date'] as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                <?php selected($saved_settings['selected_fields']['date'], $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Campo de Texto Largo -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">📋</span>
                                <strong>Texto Largo</strong>
                                <small>(Solo se permite seleccionar uno)</small>
                            </label>
                            <select name="textarea_field" class="nm-field-selector" data-type="textarea">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (isset($available_fields['textarea'])): ?>
                                    <?php foreach ($available_fields['textarea'] as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                <?php selected($saved_settings['selected_fields']['textarea'], $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Separador -->
                        <hr style="margin: 30px 0; border: none; border-top: 2px solid #e5e5e5;">

                        <!-- Sección de Agrupación -->
                        <h3 style="margin-top: 30px;">Agrupación por Campo Select</h3>
                        <p style="color: #666;">Agrupa las entradas por un campo select del formulario. Usa el shortcode <code>[nm_entries_group]</code> para mostrar la galería agrupada.</p>

                        <!-- Activar Agrupación -->
                        <div class="nm-field-group">
                            <label class="nm-field-header">
                                <input type="checkbox" id="enable_grouping" name="enable_grouping" value="true" 
                                    <?php checked($saved_settings['enable_grouping'] ?? false, true); ?>>
                                <strong>Activar Agrupación</strong>
                            </label>
                        </div>

                        <!-- Campo Select para Agrupar -->
                        <div class="nm-field-group" id="grouping-options" style="<?php echo !($saved_settings['enable_grouping'] ?? false) ? 'display: none;' : ''; ?>">
                            <label class="nm-field-header">
                                <span class="nm-field-icon">🗂️</span>
                                <strong>Agrupar por Campo Select</strong>
                                <small>(Selecciona un campo select del formulario)</small>
                            </label>
                            <select name="group_by_field" id="group_by_field" class="nm-field-selector">
                                <option value="">-- Sin seleccionar --</option>
                                <?php if (!empty($select_fields)): ?>
                                    <?php foreach ($select_fields as $field): ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" 
                                                data-options="<?php echo esc_attr(json_encode($field['options'])); ?>"
                                                <?php selected($saved_settings['group_by_field'] ?? '', $field['name']); ?>>
                                            <?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <option value="" disabled>No hay campos select disponibles</option>
                                <?php endif; ?>
                            </select>
                        </div>

                        <!-- Imágenes por Opción -->
                        <div id="group-images-container" style="<?php echo empty($saved_settings['group_by_field']) ? 'display: none;' : ''; ?>">
                            <h4>Imágenes por Categoría</h4>
                            <p style="color: #666; font-size: 13px;">Asigna una imagen a cada opción del campo select.</p>
                            <div id="group-images-list">
                                <!-- Se llenará dinámicamente con JavaScript -->
                            </div>
                        </div>

                        <p class="submit">
                            <button type="submit" class="button-primary">Guardar Configuración</button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="nm-gallery-right">
            <div class="card">
                <div class="inside">
                    <h3>Vista Previa</h3>
                    <div id="nm-gallery-preview">
                        <div class="nm-preview-card">
                            <!-- Imagen -->
                            <div class="nm-preview-image" id="preview-image" style="display: none;">
                                <div class="nm-preview-image-placeholder">
                                    <span class="nm-field-icon">📷</span>
                                    <span>Imagen destacada</span>
                                </div>
                            </div>
                            
                            <!-- Contenido -->
                            <div class="nm-preview-content">
                                <!-- Título -->
                                <div class="nm-preview-title" id="preview-text" style="display: none;">
                                    <span class="nm-field-icon">📝</span>
                                    <strong>Título del conflicto ejemplo</strong>
                                </div>
                                
                                <!-- Texto largo -->
                                <div class="nm-preview-textarea" id="preview-textarea" style="display: none;">
                                    <span class="nm-field-icon">📋</span>
                                    <span>Este es un ejemplo de texto largo que se truncará si es demasiado extenso para mostrar en la tarjeta...</span>
                                </div>
                                
                                <!-- Audio -->
                                <div class="nm-preview-audio" id="preview-audio" style="display: none;">
                                    <span class="nm-field-icon">🎵</span>
                                    <div class="nm-audio-player">
                                        <span>▶️ Reproductor de audio</span>
                                    </div>
                                </div>
                                
                                <!-- Archivo -->
                                <div class="nm-preview-file" id="preview-file" style="display: none;">
                                    <span class="nm-field-icon">📄</span>
                                    <button type="button" class="nm-download-btn">📥 Descargar archivo</button>
                                </div>
                                
                                <!-- Fecha -->
                                <div class="nm-preview-date" id="preview-date" style="display: none;">
                                    <span class="nm-field-icon">📅</span>
                                    <small>Fecha: 15/06/2024</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="nm-preview-help">
                            <p><strong>ℹ️ Ayuda:</strong></p>
                            <p>Selecciona campos en la izquierda para ver cómo se verán en las tarjetas de la galería.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.nm-gallery-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.nm-gallery-left {
    flex: 1;
    max-width: 500px;
}

.nm-gallery-right {
    flex: 1;
    max-width: 400px;
}

.nm-field-group {
    margin-bottom: 20px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 5px;
    border-left: 4px solid #0073aa;
}

.nm-field-header {
    display: block;
    margin-bottom: 10px;
}

.nm-field-icon {
    font-size: 18px;
    margin-right: 8px;
}

.nm-field-selector {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.nm-preview-card {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    max-width: 300px;
    margin-bottom: 20px;
}

.nm-preview-image {
    height: 150px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-direction: column;
}

.nm-preview-image-placeholder {
    text-align: center;
}

.nm-preview-content {
    padding: 15px;
}

.nm-preview-title {
    margin-bottom: 10px;
    font-size: 16px;
}

.nm-preview-textarea {
    margin-bottom: 10px;
    color: #666;
    font-size: 14px;
}

.nm-preview-audio {
    margin-bottom: 10px;
}

.nm-audio-player {
    background: #f0f0f0;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.nm-preview-file {
    margin-bottom: 10px;
}

.nm-download-btn {
    background: #0073aa;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.nm-preview-date {
    color: #666;
    font-size: 13px;
}

.nm-preview-help {
    padding: 15px;
    background: #f0f8ff;
    border-radius: 5px;
    border: 1px solid #b3d9ff;
}

.nm-preview-help p {
    margin: 0 0 8px 0;
}

.nm-preview-help p:last-child {
    margin-bottom: 0;
}
</style>

<script>
jQuery(document).ready(function($) {
    var groupImagesData = <?php echo json_encode($saved_settings['group_images'] ?? array()); ?>;
    
    // Manejar cambios en los selectores
    $('.nm-field-selector').on('change', function() {
        updatePreview();
    });
    
    // Manejar checkbox de activar agrupación
    $('#enable_grouping').on('change', function() {
        if ($(this).is(':checked')) {
            $('#grouping-options').slideDown();
        } else {
            $('#grouping-options').slideUp();
            $('#group-images-container').slideUp();
        }
    });
    
    // Manejar cambio de campo select para agrupar
    $('#group_by_field').on('change', function() {
        var selectedOption = $(this).find('option:selected');
        var options = selectedOption.data('options');
        
        if (options && options.length > 0) {
            renderGroupImages(options);
            $('#group-images-container').slideDown();
        } else {
            $('#group-images-container').slideUp();
        }
    });
    
    // Renderizar campos de imagen por cada opción
    function renderGroupImages(options) {
        var html = '';
        
        options.forEach(function(option) {
            var imageId = groupImagesData[option] || '';
            var imageUrl = '';
            
            html += '<div class="nm-group-image-item" style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">';
            html += '<div style="display: flex; align-items: center; justify-content: space-between;">';
            html += '<strong style="flex: 1;">' + option + '</strong>';
            html += '<div style="display: flex; gap: 10px; align-items: center;">';
            html += '<div class="group-image-preview-' + option.replace(/\s+/g, '-') + '" style="width: 60px; height: 60px; background: #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">';
            
            if (imageId) {
                html += '<img src="" data-image-id="' + imageId + '" style="width: 100%; height: 100%; object-fit: cover;" />';
            } else {
                html += '<span style="color: #999; font-size: 12px;">Sin imagen</span>';
            }
            
            html += '</div>';
            html += '<button type="button" class="button nm-upload-group-image" data-option="' + option + '">Seleccionar Imagen</button>';
            html += '<button type="button" class="button nm-remove-group-image" data-option="' + option + '" style="' + (imageId ? '' : 'display: none;') + '">Eliminar</button>';
            html += '<input type="hidden" name="group_images[' + option + ']" class="group-image-input-' + option.replace(/\s+/g, '-') + '" value="' + imageId + '" />';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
        
        $('#group-images-list').html(html);
        
        // Cargar imágenes existentes
        loadExistingImages();
    }
    
    // Cargar imágenes existentes
    function loadExistingImages() {
        $('.group-image-preview-' + '[class*="group-image-preview-"]').find('img[data-image-id]').each(function() {
            var $img = $(this);
            var imageId = $img.data('image-id');
            
            if (imageId) {
                $.post(ajaxurl, {
                    action: 'nm_get_image_url',
                    nonce: $('#nonce').val(),
                    image_id: imageId
                }, function(response) {
                    if (response.success && response.data) {
                        $img.attr('src', response.data);
                    }
                });
            }
        });
    }
    
    // Manejar upload de imagen
    $(document).on('click', '.nm-upload-group-image', function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var option = $button.data('option');
        var optionClass = option.replace(/\s+/g, '-');
        
        // Crear una nueva instancia del media uploader para cada clic
        var currentMediaUploader = wp.media({
            title: 'Seleccionar Imagen para ' + option,
            button: {
                text: 'Usar esta imagen'
            },
            multiple: false
        });
        
        // Remover event listeners previos y agregar uno nuevo
        currentMediaUploader.off('select');
        currentMediaUploader.on('select', function() {
            var attachment = currentMediaUploader.state().get('selection').first().toJSON();
            
            // Actualizar preview
            $('.group-image-preview-' + optionClass).html(
                '<img src="' + attachment.url + '" style="width: 100%; height: 100%; object-fit: cover;" />'
            );
            
            // Actualizar input hidden
            $('.group-image-input-' + optionClass).val(attachment.id);
            
            // Actualizar datos
            groupImagesData[option] = attachment.id;
            
            // Mostrar botón de eliminar
            $button.siblings('.nm-remove-group-image').show();
        });
        
        currentMediaUploader.open();
    });
    
    // Manejar eliminación de imagen
    $(document).on('click', '.nm-remove-group-image', function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var option = $button.data('option');
        var optionClass = option.replace(/\s+/g, '-');
        
        // Limpiar preview
        $('.group-image-preview-' + optionClass).html(
            '<span style="color: #999; font-size: 12px;">Sin imagen</span>'
        );
        
        // Limpiar input hidden
        $('.group-image-input-' + optionClass).val('');
        
        // Limpiar datos
        delete groupImagesData[option];
        
        // Ocultar botón de eliminar
        $button.hide();
    });
    
    // Manejar envío del formulario
    $('#nm-gallery-form').on('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    function updatePreview() {
        // Ocultar todos los elementos de vista previa
        $('#preview-image, #preview-text, #preview-textarea, #preview-audio, #preview-file, #preview-date').hide();
        
        // Mostrar elementos según las selecciones
        $('.nm-field-selector').each(function() {
            var value = $(this).val();
            var type = $(this).data('type');
            
            if (value && value !== '') {
                $('#preview-' + type).show();
            }
        });
    }
    
    function saveSettings() {
        var formData = $('#nm-gallery-form').serialize();
        formData += '&action=nm_save_gallery_settings';
        
        $.post(ajaxurl, formData, function(response) {
            if (response.success) {
                alert('✅ Configuración guardada correctamente');
            } else {
                alert('❌ Error al guardar: ' + (response.data || 'Error desconocido'));
            }
        }).fail(function() {
            alert('❌ Error de conexión al guardar la configuración');
        });
    }
    
    // Inicializar vista previa
    updatePreview();
    
    // Inicializar opciones de agrupación si ya está seleccionado un campo
    if ($('#group_by_field').val()) {
        var selectedOption = $('#group_by_field').find('option:selected');
        var options = selectedOption.data('options');
        if (options) {
            renderGroupImages(options);
        }
    }
});
</script>
