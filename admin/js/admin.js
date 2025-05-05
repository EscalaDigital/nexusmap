jQuery(document).ready(function ($) {
    // Toggle visibility of A/B options when checkbox is changed
    jQuery('#nm-ab-option').change(function () {
        if (jQuery(this).is(':checked')) {
            jQuery('#tabsforms').show();
            jQuery('#formunique').hide();
            // Initialize tabs if not already initialized
            if (!jQuery('#tabsforms').hasClass('ui-tabs')) {
                jQuery('#tabsforms').tabs();
            }
        } else {
            jQuery('#tabsforms').hide();
            jQuery('#formunique').show();
            // Destroy tabs if initialized
            if (jQuery('#tabsforms').hasClass('ui-tabs')) {
                jQuery('#tabsforms').tabs('destroy');
            }
        }

        // Save the A/B option setting via AJAX
        $.post(nmAdmin.ajax_url, {
            action: 'nm_save_ab_option',
            ab_option: jQuery(this).is(':checked') ? 1 : 0,
            nonce: nmAdmin.nonce
        }, function (response) {
            if (!response.success) {
                alert('Error al guardar la opción A/B.');
            }
        });
    });

    // Handle click on the save option texts button
    jQuery('#nm-save-option-texts').on('click', function (e) {
        e.preventDefault();
        var optionAText = jQuery('#nm-option-a-text').val();
        var optionBText = jQuery('#nm-option-b-text').val();

        // Send AJAX request to save the option texts
        $.post(nmAdmin.ajax_url, {
            action: 'nm_save_option_texts',
            option_a_text: optionAText,
            option_b_text: optionBText,
            nonce: nmAdmin.nonce
        }, function (response) {
            if (response.success) {
                alert('Option texts saved successfully.');
                // Update the tab labels if necessary
                jQuery('#tabsforms ul li a[href="#tab-a"]').text(optionAText);
                jQuery('#tabsforms ul li a[href="#tab-b"]').text(optionBText);
            } else {
                alert('Error saving option texts.');
            }
        });
    });

    // Drag and Drop Fields
    jQuery('#nm-form-elements li').draggable({
        helper: 'clone',
        revert: 'invalid'
    });

    jQuery('.nm-form-droppable').droppable({
        accept: '#nm-form-elements li',
        drop: function (event, ui) {
            var fieldType = ui.draggable.data('type');
            var $thisForm = jQuery(this);
            // AJAX call to get field template
            $.post(nmAdmin.ajax_url, {
                action: 'nm_get_field_template',
                field_type: fieldType,
                nonce: nmAdmin.nonce
            }, function (response) {
                if (response.success) {
                    $thisForm.append(response.data);
                } else {
                    alert('Error loading field template.');
                }
            });
        }
    });

    // Make form fields sortable
    jQuery('.nm-form-droppable').sortable();

    // Remove Field
    jQuery(document).on('click', '.nm-remove-field', function () {
        jQuery(this).closest('.nm-form-field').remove();
    });

    // Añadir nueva opción de radio
    jQuery(document).on('click', '.add-radio-option', function () {
        var $field = jQuery(this).closest('.nm-form-field');
        var $optionsContainer = $field.find('.radio-options');
        var newOption = '<div class="radio-option">' +
            '<input type="text" class="option-value field-option" placeholder="Option Value">' +
            '<span class="remove-option">Remove</span>' +
            '</div>';
        $optionsContainer.append(newOption);
    });

    // Añadir nueva opción de checkbox
    jQuery(document).on('click', '.add-checkbox-option', function () {
        var $field = jQuery(this).closest('.nm-form-field');
        var $optionsContainer = $field.find('.checkbox-options');
        var newOption = '<div class="checkbox-option">' +
            '<input type="text" class="option-value field-option" placeholder="Option Value">' +
            '<span class="remove-option">Remove</span>' +
            '</div>';
        $optionsContainer.append(newOption);
    });

    // Añadir nueva opción de select
    jQuery(document).on('click', '.add-select-option', function () {
        var $field = jQuery(this).closest('.nm-form-field');
        var $optionsContainer = $field.find('.select-options');
        var newOption = '<div class="select-option">' +
            '<input type="text" class="option-value field-option" placeholder="Option Value">' +
            '<span class="remove-option">Remove</span>' +
            '</div>';
        $optionsContainer.append(newOption);
    });

    // Eliminar opción de radio
    jQuery(document).on('click', '.remove-option', function () {
        jQuery(this).closest('.radio-option').remove();
    });

    // Eliminar opción de checkbox
    jQuery(document).on('click', '.remove-option', function () {
        jQuery(this).closest('.checkbox-option').remove();
    });

    // Eliminar opción de select
    jQuery(document).on('click', '.remove-option', function () {
        jQuery(this).closest('.select-option').remove();
    });
    

    // Función de normalización de nombres de campos
function normalizeFieldName(rawName) {
    return rawName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9]+/g, '_')     // Caracteres especiales a guiones bajos
        .replace(/_+/g, '_')             // Eliminar guiones bajos múltiples
        .replace(/^_|_$/g, '');          // Quitar guiones al inicio/final
}
    // Modificar la función de guardar formulario para incluir checkboxes
    // Modificar la función saveForm existente
function saveForm(formSelector, formType) {
    var formFields = [];
    jQuery(formSelector + ' .nm-form-field').each(function () {
        var fieldType = jQuery(this).data('type');
        var fieldLabel = jQuery(this).find('.field-label').val() || '';
        var rawName = jQuery(this).find('.field-name').val() || fieldLabel;
        var fieldName = normalizeFieldName(rawName);
        var fieldOptions = [];

        // Collect options if the field has them
        if (fieldType === 'select' || fieldType === 'checkbox' || fieldType === 'radio') {
            jQuery(this).find('.field-option').each(function () {
                var optionValue = jQuery(this).val();
                if (optionValue) {
                    fieldOptions.push(optionValue);
                }
            });
        }

        var fieldData = {
            type: fieldType,
            label: fieldLabel,
            name: fieldName
        };

        if (fieldOptions.length > 0) {
            fieldData.options = fieldOptions;
        }

        formFields.push(fieldData);
    });

    // Send formFields to the server via AJAX
    $.post(nmAdmin.ajax_url, {
        action: 'nm_save_form',
        form_type: formType,
        form_data: { fields: formFields },
        nonce: nmAdmin.nonce
    }, function (response) {
        if (response.success) {
            alert('Form saved successfully.');
        } else {
            alert('Error saving form.');
        }
    });
}

    // Function to validate if all fields are filled
    function validateForm(formId) {
        let isValid = true;
        jQuery(`${formId} .nm-form-field input, ${formId} .nm-form-field select, ${formId} .nm-form-field textarea`).each(function () {
            if (jQuery(this).val() === "") {
                isValid = false;
                jQuery(this).css('border', '1px solid red'); // Highlight empty fields
            } else {
                jQuery(this).css('border', ''); // Reset field style if filled
            }
        });

        if (!isValid) {
            alert("Por favor, completa todos los campos antes de guardar.");
        }
        return isValid;
    }

    // Function to save form after validation
    function compruebaysalva(formId, formType) {
        // Only proceed if validation is successful
        if (validateForm(formId)) {
            saveForm(formId, formType);
        }
    }

    // Event listeners to save each form
    // Save Form A
    jQuery('#nm-save-form-a').click(function () {
        compruebaysalva('#nm-custom-form-a', 1);
    });
    // Save Form B
    jQuery('#nm-save-form-b').click(function () {
        compruebaysalva('#nm-custom-form-b', 2);
    });
    //  Save Unique Form
    jQuery('#nm-save-form').click(function () {
        compruebaysalva('#nm-custom-form', 0);
    });

    // Entries Page Actions
    jQuery('.approve-entry').click(function () {
        var entryId = jQuery(this).data('id');
        updateEntryStatus(entryId, 'approved');
    });

    jQuery('.reject-entry').click(function () {
        var entryId = jQuery(this).data('id');
        updateEntryStatus(entryId, 'rejected');
    });

    function updateEntryStatus(entryId, status) {
        $.post(nmAdmin.ajax_url, {
            action: 'nm_update_entry_status',
            entry_id: entryId,
            status: status,
            nonce: nmAdmin.nonce
        }, function (response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Error updating entry status.');
            }
        });
    }

    $('#nm-layer-settings').on('submit', function (e) {
        e.preventDefault();
        
        var $form = $(this);
        var $submitButton = $form.find('button[type="submit"]');
        var originalText = $submitButton.text();
        
        // Recopilar datos del formulario
        var settings = {
            layers: {},
            text_layers: {},
            nm_text_layer_name: $('#nm_text_layer_name').val() // Añadir el nombre de la capa de texto
        };
        
        // Procesar campos de capas (layers)
        $form.find('input[name^="layers["]').each(function() {
            var $input = $(this);
            var name = $input.attr('name');
            var matches = name.match(/layers\[([^\]]+)\]\[([^\]]+)\]/);
            
            if (matches) {
                var fieldKey = matches[1];
                var propertyName = matches[2];
                var value = $input.val();
                
                if ($input.attr('type') === 'checkbox') {
                    value = $input.prop('checked') ? 'on' : 'off';
                }
                
                if (!settings.layers[fieldKey]) {
                    settings.layers[fieldKey] = {};
                }
                
                if (propertyName === 'colors' || propertyName === 'labels') {
                    if (!settings.layers[fieldKey][propertyName]) {
                        settings.layers[fieldKey][propertyName] = [];
                    }
                    settings.layers[fieldKey][propertyName].push(value);
                } else {
                    settings.layers[fieldKey][propertyName] = value;
                }
            }
        });
        
        // Procesar campos de texto (text_layers)
        $form.find('input[name^="text_layers["]').each(function() {
            var $input = $(this);
            var name = $input.attr('name');
            var matches = name.match(/text_layers\[([^\]]+)\]\[([^\]]+)\]/);
            
            if (matches) {
                var fieldKey = matches[1];
                var propertyName = matches[2];
                var value = $input.val();
                
                if ($input.attr('type') === 'checkbox') {
                    value = $input.prop('checked') ? 'on' : 'off';
                }
                
                if (!settings.text_layers[fieldKey]) {
                    settings.text_layers[fieldKey] = {};
                }
                
                settings.text_layers[fieldKey][propertyName] = value;
            }
        });
        
        // Debug: Ver datos recopilados
        console.log('Datos recopilados:', settings);
        
        // Deshabilitar formulario durante el envío
        $form.find('input, select, button').prop('disabled', true);
        $submitButton.text('Guardando...');
    
        $.ajax({
            url: nmAdmin.ajax_url,
            method: 'POST',
            data: {
                action: 'nm_save_layer_settings',
                nonce: nmAdmin.nonce,
                settings: settings
            },
            success: function(response) {
                if (response.success) {
                    alert(response.data.message);
                } else {
                    alert(response.data);
                }
            },
            error: function() {
                alert('Error en la comunicación con el servidor');
            },
            complete: function() {
                // Restaurar estado del formulario
                $form.find('input, select, button').prop('disabled', false);
                $submitButton.text(originalText);
            }
        });
    });

    /****************************************************
     * Chart Manager
     ****************************************************/
    var chartIndex = $('.chart-box').length;
    
    console.log(chartIndex);

    // Al hacer clic en "Añadir Gráfico"
    jQuery('#add-chart').on('click', function () {
        alert('Añadir Gráfico');
        var template = $('#chart-template').html();
        template = template.replace(/{index}/g, chartIndex++);
        jQuery('#chart-container').append(template);
    });

    // Al hacer clic en "Eliminar Gráfico"
    $(document).on('click', '.remove-chart', function () {
        $(this).closest('.chart-box').remove();
    });

    // Manejo del Submit
    $('#nm-chart-settings').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            url: nmAdmin.ajax_url,
            method: 'POST',
            data: {
                action: 'nm_save_chart_settings',
                nonce: nmAdmin.nonce,
                settings: $(this).serialize()
            },
            success: function (response) {
                if (response.success) {
                    alert('¡Configuración de gráficos guardada correctamente!');
                } else {
                    alert('Error al guardar la configuración de gráficos');
                }
            },
            error: function () {
                alert('Error en la comunicación con el servidor');
            }
        });
    });


});



