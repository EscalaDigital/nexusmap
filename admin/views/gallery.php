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
    <h2 style="font-size: 1.1em; margin-top: 0;">Ejemplos de uso del listado de entradas:</h2>
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
    // Manejar cambios en los selectores
    $('.nm-field-selector').on('change', function() {
        updatePreview();
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
});
</script>
