jQuery(document).ready(function ($) {

    const fieldTpl = {};

    ['header', 'text', 'textarea', 'checkbox', 'radio',
        'select', 'file', 'number', 'date', 'url'].forEach(function (type) {
            $.post(nmAdmin.ajax_url, {
                action: 'nm_get_field_template',
                field_type: type,
                nonce: nmAdmin.nonce
            }).done(function (res) {
                if (res.success) {
                    fieldTpl[type] = res.data;   // guardamos la plantilla
                }
            });
        });

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

    // Manejador para select normal
    jQuery(document).on('click', '.add-select-option', function () {
        var $field = jQuery(this).closest('.nm-form-field');
        // Solo proceder si es un select normal
        if ($field.data('type') === 'select') {
            var $optionsContainer = $field.find('.select-options');
            var newOption = '<div class="select-option">' +
                '<input type="text" class="option-value field-option" placeholder="Option Value">' +
                '<span class="remove-option">Remove</span>' +
                '</div>';
            $optionsContainer.append(newOption);
        }
    });

    // Función para inicializar droppable en contenedores condicionales
    function initializeConditionalDroppable($scope) {
        $scope.find('.conditional-fields').sortable({
            placeholder: 'field-placeholder',

            stop: function (event, ui) {
                ui.item.css({             // 👈  limpiamos lo que sortable añadió
                    width: '',
                    height: ''
                });
            }
        });
    }

    initializeConditionalDroppable($('.conditional-container'));

    // Manejador separado para select condicional
    jQuery(document).on('click', '.add-conditional-option', function () {
        var $field = jQuery(this).closest('.nm-form-field');
        if ($field.data('type') !== 'conditional-select') return;

        var optionId = 'opt_' + Date.now();

        // Agregar opción
        var $optionsContainer = $field.find('.select-options');
        var newOption = `
        <div class="select-option" data-option-id="${optionId}">
            <input type="text" class="option-value field-option" placeholder="Option Value">
            <span class="remove-option">Remove</span>
        </div>`;
        $optionsContainer.append(newOption);

        // Agregar contenedor condicional
        var $conditionalsContainer = $field.find('.conditional-containers');
        var newContainer = `
        <div class="conditional-container" data-option-id="${optionId}">
            <h4>Fields for option: <span class="option-label"></span></h4>
            <div class="conditional-fields"></div>
            <button type="button" class="show-fields-menu">Add Field</button>
        </div>`;
        var $newContainer = jQuery(newContainer);
        $conditionalsContainer.append($newContainer);

        // Inicializar droppable en el nuevo contenedor
        initializeConditionalDroppable($newContainer);

        // Actualizar el texto de la opción cuando cambie
        $field.find(`.select-option[data-option-id="${optionId}"] input`).on('input', function () {
            $field.find(`.conditional-container[data-option-id="${optionId}"] .option-label`)
                .text(jQuery(this).val());
        });
    });

    // Modificar el manejador del menú de campos condicionales
    jQuery(document).on('click', '.show-fields-menu', function (e) {
        e.stopPropagation();
        jQuery('.conditional-fields-menu-active').remove();

        var $container = jQuery(this).closest('.conditional-container');
        var $menu = $container.closest('.nm-form-field').find('.conditional-fields-menu')
            .clone()
            .addClass('conditional-fields-menu-active');

        $menu.css({
            position: 'absolute',
            top: jQuery(this).offset().top + jQuery(this).outerHeight() + 'px',
            left: jQuery(this).offset().left + 'px',
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'block'
        });

        // Hacer los elementos del menú draggables
        $menu.find('li').draggable({
            appendTo: 'body',
            connectToSortable: '.conditional-fields',
            revert: 'invalid',

            helper: function () {
                const type = $(this).data('type');
                // Si ya está en caché devolvemos la plantilla,
                // si no, usamos el <li> de siempre (nunca se quedará vacío)
                return $(fieldTpl[type] || `<li>${$(this).text()}</li>`);
            },

            start: () => $menu.hide(),
            stop: () => $menu.remove()
        });

        jQuery('body').append($menu);
    });


    // Manejador para eliminar opciones
    $(document).on('click', '.remove-option', function () {
        const $option = $(this).closest('.select-option, .radio-option, .checkbox-option');
        const $field = $(this).closest('.nm-form-field');

        // Si es select condicional hay que borrar también su contenedor
        if ($field.data('type') === 'conditional-select') {
            const optionId = $option.data('option-id');
            $field.find(`.conditional-container[data-option-id="${optionId}"]`).remove();
        }
        $option.remove();
    });



    // Cerrar el menú al hacer clic fuera
    jQuery(document).on('click', function (e) {
        if (!jQuery(e.target).closest('.show-fields-menu, .conditional-fields-menu-active').length) {
            jQuery('.conditional-fields-menu-active').remove();
        }
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

        const formFields = [];
        const conditionalFields = [];

        jQuery(`${formSelector} .nm-form-field`).each(function () {

            const $field = jQuery(this);
            if ($field.closest('.conditional-container').length) return;
            const fieldType = $field.data('type');                      // text, select, checkbox, …
            const fieldLabel = $field.find('.field-label').val() || '';
            const rawName = $field.find('.field-name').val() || fieldLabel;
            const fieldName = normalizeFieldName(rawName);
            const fieldOptions = [];

            /* ------------------------------------------------------------------
             * 1. CAMPOS CONDICIONALES  -----------------------------------------
             * ----------------------------------------------------------------*/
            if (fieldType === 'conditional-select') {

                const selectId = 'select_' + Date.now();
                const optionsWithIds = [];

                $field.find('.select-option').each(function () {

                    const $option = jQuery(this);
                    const optionId = $option.data('option-id');
                    const optionValue = $option.find('.field-option').val();

                    if (!optionValue) return;          // siguiente opción

                    // 1a) Lo que irá a nm_form
                    optionsWithIds.push({ id: optionId, value: optionValue });

                    // 1b) Lo que irá a nm_conditional_fields
                    const conditionalFormFields = [];
                    const $container = $field.find(`.conditional-container[data-option-id="${optionId}"]`);

                    /* Recorremos cada sub-campo vinculado a ESTA opción ---------- */
                    $container.find('.conditional-fields > *').each(function () {

                        const $condField = jQuery(this);

                        /* ——— tipo del sub-campo ——— */
                        const condFieldType =
                            $condField.data('type')           // <li data-type="select">
                            || $condField.find('.field-type').val(); // <input class="field-type">

                        /* ——— label & name ——— */
                        const condFieldLabel = $condField.find('.field-label').val()
                            || $condField.text()
                            || '';
                        const condFieldName = normalizeFieldName(condFieldLabel);

                        const condFieldData = {
                            type: condFieldType,
                            label: condFieldLabel,
                            name: condFieldName
                        };

                        /* ——— opciones de campos complejos ——— */
                        if (['select', 'radio', 'checkbox'].includes(condFieldType)) {

                            const condOptions = [];
                            $condField.find('.field-option').each(function () {
                                const optVal = jQuery(this).val();
                                if (optVal) condOptions.push(optVal);
                            });

                            if (condOptions.length) {
                                condFieldData.options = condOptions;
                            }
                        }

                        conditionalFormFields.push(condFieldData);
                    });

                    /* Una fila por cada combinación select-option ---------------- */
                    conditionalFields.push({
                        select_id: selectId,
                        option_id: optionId,
                        fields_json: conditionalFormFields      // ← ya viene listo para json_encode
                    });
                });

                /* Guardamos sólo el SELECT principal en nm_form ------------------ */
                formFields.push({
                    type: fieldType,
                    label: fieldLabel,
                    name: fieldName,
                    select_id: selectId,
                    options: optionsWithIds
                });

                /* ------------------------------------------------------------------
                 * 2. CAMPOS NORMALES  ----------------------------------------------
                 * ----------------------------------------------------------------*/
            } else {

                if (['select', 'checkbox', 'radio'].includes(fieldType)) {
                    $field.find('.field-option').each(function () {
                        const optVal = jQuery(this).val();
                        if (optVal) fieldOptions.push(optVal);
                    });
                }

                const fieldData = { type: fieldType, label: fieldLabel, name: fieldName };
                if (fieldOptions.length) fieldData.options = fieldOptions;
                formFields.push(fieldData);
            }
        });

        /* ----------------------------------------------------------------------
         * 3. PETICIONES AJAX (sin cambios) --------------------------------------
         * -------------------------------------------------------------------- */
        jQuery.post(nmAdmin.ajax_url, {
            action: 'nm_save_form',
            form_type: formType,
            form_data: { fields: formFields },
            nonce: nmAdmin.nonce
        }, function (response) {

            if (!response.success) { alert('Error al guardar el formulario'); return; }

            if (!conditionalFields.length) { alert('Formulario guardado correctamente'); return; }

            jQuery.post(nmAdmin.ajax_url, {
                action: 'nm_save_conditional_fields',
                conditional_data: conditionalFields,
                nonce: nmAdmin.nonce
            }, function (condResp) {
                alert(condResp.success
                    ? 'Formulario guardado correctamente'
                    : 'Error al guardar los campos condicionales');
            });
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
        $form.find('input[name^="layers["]').each(function () {
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
        $form.find('input[name^="text_layers["]').each(function () {
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
            success: function (response) {
                if (response.success) {
                    alert(response.data.message);
                } else {
                    alert(response.data);
                }
            },
            error: function () {
                alert('Error en la comunicación con el servidor');
            },
            complete: function () {
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



