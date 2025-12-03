/**
 * JavaScript para el Personalizador de Popup
 * Gestiona drag-and-drop, vista previa y guardado de configuración
 */

(function($) {
    'use strict';

    let fieldsData = [];
    let draggedElement = null;

    $(document).ready(function() {
        initializeFieldsList();
        attachEventListeners();
        updatePreview();
    });

    /**
     * Inicializar lista de campos con datos
     */
    function initializeFieldsList() {
        const $fields = $('.nm-field-item');
        
        $fields.each(function(index) {
            const $field = $(this);
            const fieldKey = $field.data('field-key');
            
            fieldsData.push({
                key: fieldKey,
                visible: $field.find('.nm-field-visible').is(':checked'),
                customLabel: $field.find('.nm-custom-label').val(),
                showLabel: $field.find('.nm-show-label').is(':checked'),
                order: index
            });
        });
    }

    /**
     * Adjuntar event listeners
     */
    function attachEventListeners() {
        // Drag and Drop
        const fieldsList = document.getElementById('nm-fields-list');
        if (fieldsList) {
            enableDragAndDrop(fieldsList);
        }

        // Cambios en checkboxes de visibilidad
        $(document).on('change', '.nm-field-visible', function() {
            const $field = $(this).closest('.nm-field-item');
            const fieldKey = $field.data('field-key');
            
            if ($(this).is(':checked')) {
                $field.removeClass('nm-hidden');
            } else {
                $field.addClass('nm-hidden');
            }
            
            updateFieldData(fieldKey, 'visible', $(this).is(':checked'));
            updatePreview();
        });

        // Cambios en labels personalizados
        $(document).on('input', '.nm-custom-label', function() {
            const $field = $(this).closest('.nm-field-item');
            const fieldKey = $field.data('field-key');
            updateFieldData(fieldKey, 'customLabel', $(this).val());
            updatePreview();
        });

        // Cambios en mostrar/ocultar título
        $(document).on('change', '.nm-show-label', function() {
            const $field = $(this).closest('.nm-field-item');
            const fieldKey = $field.data('field-key');
            updateFieldData(fieldKey, 'showLabel', $(this).is(':checked'));
            updatePreview();
        });

        // Opciones especiales
        $('#nm-image-carousel, #nm-show-map-in-popup, #nm-audio-autoplay').on('change', function() {
            updatePreview();
        });

        // Botón guardar
        $('.nm-save-config').on('click', saveConfiguration);

        // Botones de acciones masivas
        $('.nm-show-all').on('click', function() {
            $('.nm-field-visible').prop('checked', true).trigger('change');
        });

        $('.nm-hide-all').on('click', function() {
            $('.nm-field-visible').prop('checked', false).trigger('change');
        });

        $('.nm-reset-order').on('click', function() {
            if (confirm('¿Estás seguro de restablecer el orden original de los campos?')) {
                location.reload();
            }
        });
    }

    /**
     * Habilitar funcionalidad de drag and drop
     */
    function enableDragAndDrop(container) {
        const items = container.querySelectorAll('.nm-field-item');
        
        items.forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragleave', handleDragLeave);
        });
    }

    function handleDragStart(e) {
        draggedElement = this;
        this.classList.add('nm-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragEnd(e) {
        this.classList.remove('nm-dragging');
        
        // Actualizar orden en fieldsData
        const $fields = $('.nm-field-item');
        $fields.each(function(index) {
            const fieldKey = $(this).data('field-key');
            updateFieldData(fieldKey, 'order', index);
        });
        
        updatePreview();
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        if (this !== draggedElement) {
            this.style.borderTop = '3px solid #0073aa';
        }
    }

    function handleDragLeave(e) {
        this.style.borderTop = '';
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        this.style.borderTop = '';
        
        if (draggedElement !== this) {
            const allItems = Array.from(this.parentNode.children);
            const draggedIndex = allItems.indexOf(draggedElement);
            const targetIndex = allItems.indexOf(this);
            
            if (draggedIndex < targetIndex) {
                this.parentNode.insertBefore(draggedElement, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedElement, this);
            }
        }
        
        return false;
    }

    /**
     * Actualizar datos de un campo
     */
    function updateFieldData(fieldKey, property, value) {
        const fieldIndex = fieldsData.findIndex(f => f.key === fieldKey);
        if (fieldIndex !== -1) {
            fieldsData[fieldIndex][property] = value;
        }
    }

    /**
     * Actualizar vista previa
     */
    function updatePreview() {
        const $preview = $('#nm-preview-content');
        let html = '<h2 class="nm-modal-title">Título de Ejemplo</h2>';
        
        // Filtrar campos visibles y ordenarlos
        const visibleFields = fieldsData
            .filter(f => f.visible)
            .sort((a, b) => a.order - b.order);
        
        if (visibleFields.length === 0) {
            html += '<div class="nm-modal-section"><p class="nm-preview-placeholder">No hay campos visibles. Activa al menos un campo para ver la vista previa.</p></div>';
        } else {
            html += '<div class="nm-modal-section">';
            
            visibleFields.forEach(field => {
                const $fieldElement = $(`.nm-field-item[data-field-key="${field.key}"]`);
                const originalLabel = $fieldElement.find('.nm-field-col-1 strong').text();
                const fieldType = $fieldElement.find('.nm-field-type-badge').text();
                
                const displayLabel = field.customLabel || originalLabel;
                
                if (field.showLabel) {
                    html += `<p class="nm-modal-field"><strong>${displayLabel}:</strong> <span style="color: #666;">[Valor de ejemplo - ${fieldType}]</span></p>`;
                } else {
                    html += `<p class="nm-modal-field"><span style="color: #666;">[${displayLabel} - sin título]</span></p>`;
                }
            });
            
            html += '</div>';
        }
        
        // Añadir indicadores de opciones especiales
        const specialOptions = [];
        if ($('#nm-image-carousel').is(':checked')) {
            specialOptions.push('🎠 Carrusel de imágenes activo');
        }
        if ($('#nm-show-map-in-popup').is(':checked')) {
            specialOptions.push('🗺️ Mini mapa incluido');
        }
        if ($('#nm-audio-autoplay').is(':checked')) {
            specialOptions.push('▶️ Audio autoplay activo');
        }
        
        if (specialOptions.length > 0) {
            html += '<div class="nm-modal-section" style="background: #e7f3ff; padding: 10px; border-radius: 4px; margin-top: 10px;">';
            html += '<p style="margin: 0; font-size: 12px;"><strong>Opciones especiales:</strong></p>';
            specialOptions.forEach(opt => {
                html += `<p style="margin: 5px 0; font-size: 12px;">• ${opt}</p>`;
            });
            html += '</div>';
        }
        
        $preview.html(html);
    }

    /**
     * Guardar configuración
     */
    function saveConfiguration() {
        const $button = $('.nm-save-config');
        const originalText = $button.html();
        
        // Deshabilitar botón y mostrar loading
        $button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Guardando...');
        
        // Preparar configuración de campos
        const fieldsConfig = {};
        fieldsData.forEach(field => {
            fieldsConfig[field.key] = {
                visible: field.visible,
                custom_label: field.customLabel,
                show_label: field.showLabel,
                order: field.order
            };
        });
        
        // Preparar opciones especiales (convertir explícitamente a booleanos)
        const specialOptions = {
            image_carousel: $('#nm-image-carousel').is(':checked') ? true : false,
            show_map_in_popup: $('#nm-show-map-in-popup').is(':checked') ? true : false,
            audio_autoplay: $('#nm-audio-autoplay').is(':checked') ? true : false
        };
        
        // Enviar vía AJAX
        $.ajax({
            url: nmAdmin.ajax_url,
            type: 'POST',
            data: {
                action: 'nm_save_popup_config',
                nonce: nmAdmin.nonce,
                fields_config: JSON.stringify(fieldsConfig),
                special_options: JSON.stringify(specialOptions)
            },
            success: function(response) {
                if (response.success) {
                    showNotification('✓ Configuración guardada correctamente', 'success');
                } else {
                    showNotification('✗ Error: ' + response.data, 'error');
                }
            },
            error: function(xhr, status, error) {
                showNotification('✗ Error al guardar: ' + error, 'error');
            },
            complete: function() {
                // Restaurar botón
                $button.prop('disabled', false).html(originalText);
            }
        });
    }

    /**
     * Mostrar notificación
     */
    function showNotification(message, type = 'success') {
        const $notification = $('#nm-notification');
        
        $notification
            .removeClass('error warning')
            .addClass(type)
            .find('.nm-notification-message')
            .text(message);
        
        $notification.fadeIn(300);
        
        setTimeout(function() {
            $notification.fadeOut(300);
        }, 3000);
    }

    /**
     * CSS para spinner
     */
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spin {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);

})(jQuery);
