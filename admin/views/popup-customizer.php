<div class="wrap nm-popup-customizer">
    <h1>🎨 Personalizar Popup del Mapa</h1>
    <p class="description">
        Configura cómo se mostrarán los campos en el popup cuando los usuarios hagan clic en los marcadores del mapa.
        Puedes ocultar campos, cambiar su orden arrastrándolos, personalizar títulos y activar funciones especiales.
    </p>

    <div class="nm-popup-customizer-container">
        
        <!-- Panel de Opciones Especiales -->
        <div class="nm-special-options-panel">
            <h2>⚙️ Opciones Especiales</h2>
            
            <div class="nm-option-item">
                <label>
                    <input type="checkbox" id="nm-image-carousel" 
                           <?php echo isset($special_options['image_carousel']) && $special_options['image_carousel'] ? 'checked' : ''; ?>>
                    <span class="nm-option-title">Activar Carrusel de Imágenes</span>
                </label>
                <p class="description">
                    Si hay múltiples campos de imagen, se mostrarán en un carrusel interactivo en lugar de una lista vertical.
                </p>
            </div>

            <div class="nm-option-item">
                <label>
                    <input type="checkbox" id="nm-show-map-in-popup" 
                           <?php echo isset($special_options['show_map_in_popup']) && $special_options['show_map_in_popup'] ? 'checked' : ''; ?>>
                    <span class="nm-option-title">Mostrar Mapa en Popup</span>
                </label>
                <p class="description">
                    Incluye un mini mapa dentro del popup mostrando la ubicación exacta del punto.
                </p>
            </div>

            <div class="nm-option-item">
                <label>
                    <input type="checkbox" id="nm-audio-autoplay" 
                           <?php echo isset($special_options['audio_autoplay']) && $special_options['audio_autoplay'] ? 'checked' : ''; ?>>
                    <span class="nm-option-title">Reproducción Automática de Audio</span>
                </label>
                <p class="description">
                    Los archivos de audio se reproducirán automáticamente al abrir el popup (solo en tema de audioguía).
                </p>
            </div>

            <button type="button" class="button button-primary button-large nm-save-config">
                <span class="dashicons dashicons-saved"></span> Guardar Configuración
            </button>
        </div>

        <!-- Panel de Campos -->
        <div class="nm-fields-panel">
            <h2>📋 Configuración de Campos</h2>
            
            <div class="nm-fields-header">
                <div class="nm-header-col-1">Campo</div>
                <div class="nm-header-col-2">Visible</div>
                <div class="nm-header-col-3">Título Personalizado</div>
                <div class="nm-header-col-4">Mostrar Título</div>
                <div class="nm-header-col-5">Tipo</div>
            </div>

            <div id="nm-fields-list" class="nm-fields-list">
                <?php if (empty($fields_for_view)): ?>
                    <div class="nm-no-fields">
                        <p>⚠️ No se encontraron campos en el formulario. Primero crea campos en el Constructor de Formularios.</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($fields_for_view as $field): ?>
                        <div class="nm-field-item" data-field-key="<?php echo esc_attr($field['key']); ?>">
                            <div class="nm-field-drag-handle" title="Arrastra para reordenar">
                                <span class="dashicons dashicons-move"></span>
                            </div>
                            
                            <div class="nm-field-col-1">
                                <strong><?php echo esc_html($field['original_label']); ?></strong>
                                <span class="nm-field-key">(<?php echo esc_html($field['key']); ?>)</span>
                            </div>
                            
                            <div class="nm-field-col-2">
                                <label class="nm-toggle">
                                    <input type="checkbox" 
                                           class="nm-field-visible" 
                                           <?php echo $field['visible'] ? 'checked' : ''; ?>>
                                    <span class="nm-toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="nm-field-col-3">
                                <input type="text" 
                                       class="nm-custom-label" 
                                       placeholder="<?php echo esc_attr($field['original_label']); ?>"
                                       value="<?php echo esc_attr($field['custom_label']); ?>">
                            </div>
                            
                            <div class="nm-field-col-4">
                                <label class="nm-toggle">
                                    <input type="checkbox" 
                                           class="nm-show-label" 
                                           <?php echo $field['show_label'] ? 'checked' : ''; ?>>
                                    <span class="nm-toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="nm-field-col-5">
                                <span class="nm-field-type-badge nm-type-<?php echo esc_attr($field['type']); ?>">
                                    <?php 
                                    $type_labels = array(
                                        'text' => '📝 Texto',
                                        'textarea' => '📄 Área Texto',
                                        'image' => '🖼️ Imagen',
                                        'audio' => '🎵 Audio',
                                        'file' => '📎 Archivo',
                                        'select' => '📋 Lista',
                                        'radio' => '🔘 Radio',
                                        'checkbox' => '☑️ Checkbox',
                                        'date' => '📅 Fecha',
                                        'number' => '🔢 Número',
                                        'url' => '🔗 URL',
                                        'geographic-selector' => '🌍 Selector Geo'
                                    );
                                    echo isset($type_labels[$field['type']]) ? $type_labels[$field['type']] : $field['type'];
                                    ?>
                                </span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <?php if (!empty($fields_for_view)): ?>
                <div class="nm-fields-actions">
                    <button type="button" class="button nm-show-all">Mostrar Todos</button>
                    <button type="button" class="button nm-hide-all">Ocultar Todos</button>
                    <button type="button" class="button nm-reset-order">Restablecer Orden Original</button>
                </div>
            <?php endif; ?>
        </div>

    </div>

    <!-- Preview Panel -->
    <div class="nm-preview-panel">
        <h2>👁️ Vista Previa</h2>
        <p class="description">Esta es una simulación de cómo se verá el popup con tu configuración actual.</p>
        
        <div class="nm-popup-preview">
            <div class="nm-modal-preview">
                <span class="nm-modal-close-preview">&times;</span>
                <div id="nm-preview-content" class="nm-modal-content-preview">
                    <h2 class="nm-modal-title">Título de Ejemplo</h2>
                    <div class="nm-modal-section">
                        <p class="nm-preview-placeholder">
                            La vista previa se actualizará automáticamente cuando cambies la configuración.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Notification Area -->
    <div id="nm-notification" class="nm-notification" style="display: none;">
        <span class="nm-notification-message"></span>
    </div>
</div>

<style>
/* Inline critical styles - resto en popup-customizer.css */
.nm-popup-customizer-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    margin-top: 20px;
}

.nm-fields-list {
    max-height: 600px;
    overflow-y: auto;
}

.nm-field-item {
    display: grid;
    grid-template-columns: 40px 2fr 80px 2fr 80px 150px;
    gap: 15px;
    align-items: center;
    padding: 15px;
    background: #fff;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    border-radius: 4px;
    cursor: move;
    transition: all 0.2s;
}

.nm-field-item:hover {
    border-color: #0073aa;
    box-shadow: 0 2px 8px rgba(0,115,170,0.1);
}

.nm-field-item.nm-dragging {
    opacity: 0.5;
}

.nm-notification {
    position: fixed;
    top: 50px;
    right: 20px;
    padding: 15px 20px;
    background: #00a32a;
    color: white;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    animation: slideIn 0.3s;
}

@keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
</style>
