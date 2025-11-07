jQuery(document).ready(function ($) {

    const fieldTpl = {};    ['header', 'text', 'textarea', 'checkbox', 'radio',
        'select', 'image', 'file', 'number', 'date', 'url', 'audio', 'geographic-selector'].forEach(function (type) {
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
                alert('Textos de opciones guardados correctamente.');
                // Update the tab labels if necessary
                jQuery('#tabsforms ul li a[href="#tab-a"]').text(optionAText);
                jQuery('#tabsforms ul li a[href="#tab-b"]').text(optionBText);
            } else {
                alert('Error al guardar los textos de opciones.');
            }
        });
    });

    // Drag and Drop Fields
    jQuery('#nm-form-elements li').draggable({
        helper: 'clone',
        revert: 'invalid'
    });    jQuery('.nm-form-droppable').droppable({
        accept: '#nm-form-elements li',
        drop: function (event, ui) {
            var fieldType = ui.draggable.data('type');
            var $thisForm = jQuery(this);
            // AJAX call to get field template
            $.post(nmAdmin.ajax_url, {
                action: 'nm_get_field_template',
                field_type: fieldType,
                nonce: nmAdmin.nonce
            }, function (response) {                if (response.success) {
                    var $newField = jQuery(response.data);
                    $thisForm.append($newField);
                    
                    // Solo agregar el campo al formulario, sin generar name automáticamente
                } else {
                    alert('Error al cargar la plantilla del campo.');
                }
            });
        }
    });

    // Make form fields sortable
    jQuery('.nm-form-droppable').sortable();
    
        // Enforce only one title per form: when checking one, uncheck others
        jQuery(document).on('change', '.field-title-toggle', function(){
            const $this = jQuery(this);
            if ($this.is(':checked')) {
                const $form = $this.closest('.nm-form-droppable');
                // Uncheck all other title toggles in the same form
                $form.find('.field-title-toggle').not($this).prop('checked', false);
            }
        });

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
    });    // Función para inicializar droppable en contenedores condicionales
    function initializeConditionalDroppable($scope) {
        $scope.find('.conditional-fields').sortable({
            placeholder: 'field-placeholder',            stop: function (event, ui) {
                ui.item.css({             // 👈  limpiamos lo que sortable añadió
                    width: '',
                    height: ''
                });
                
                // No hacemos nada más - los nombres se generarán al guardar
            },
            receive: function (event, ui) {
                // No hacemos nada aquí - los nombres se generarán al guardar
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

    // Función auxiliar para detectar nombres temporales (ya no se usa)
    function isTemporaryFieldName(fieldName) {
        return fieldName.startsWith('temp_') || fieldName.match(/^[a-z]+_\d+$/);
    }
    // Función para generar un nombre único para un campo basado en su label
    function generateUniqueFieldName(label) {
        // Normalizar el label para crear un nombre válido para base de datos
        let name = label.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        
        // Si queda vacío, usar un nombre por defecto
        if (!name) {
            name = 'campo';
        }
        
        // Agregar timestamp y número aleatorio para garantizar unicidad
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        
        return name + '_' + timestamp + '_' + random;
    }

    // Función para procesar nombres de campos antes de guardar
    function processFieldNamesBeforeSave(formSelector) {
        // Procesar campos principales del formulario
        jQuery(formSelector + ' .nm-form-field').each(function() {
            const $field = jQuery(this);
            const $fieldName = $field.find('.field-name');
            const $fieldLabel = $field.find('.field-label');
            const fieldType = $field.data('type');
            
            // Solo generar nombre si no existe uno
            if ($fieldName.length && (!$fieldName.val() || $fieldName.val().trim() === '')) {
                let uniqueName;
                
                // Para el campo map, usar un nombre fijo
                if (fieldType === 'map') {
                    uniqueName = 'nm_map_location';
                } else {
                    const label = $fieldLabel.val() ? $fieldLabel.val().trim() : 'campo';
                    uniqueName = generateUniqueFieldName(label);
                }
                
                $fieldName.val(uniqueName);
                console.log('Generated field name:', uniqueName, 'for field type:', fieldType);
            }
        });
        
        // También procesar campos condicionales
        jQuery(formSelector + ' .conditional-fields .nm-form-field').each(function() {
            const $field = jQuery(this);
            const $fieldName = $field.find('.field-name');
            const $fieldLabel = $field.find('.field-label');
            const fieldType = $field.data('type');
            
            // Solo generar nombre si no existe uno
            if ($fieldName.length && (!$fieldName.val() || $fieldName.val().trim() === '')) {
                let uniqueName;
                
                // Para el campo map en contextos condicionales, usar un nombre fijo también
                if (fieldType === 'map') {
                    uniqueName = 'nm_map_location_conditional';
                } else {
                    const label = $fieldLabel.val() ? $fieldLabel.val().trim() : 'campo_condicional';
                    uniqueName = generateUniqueFieldName(label);
                }
                
                $fieldName.val(uniqueName);
                console.log('Generated conditional field name:', uniqueName, 'for field type:', fieldType);
            }
        });
    }

    // Modificar la función saveForm existente
    /**
 * Guarda un formulario (A, B o único)
 * ----------------------------------
 * @param {string} formSelector  – '#nm-custom-form-a' | '#nm-custom-form-b' | '#nm-custom-form'
 * @param {number} formType      – 0 (único) | 1 (A) | 2 (B)
 */
function saveForm(formSelector, formType) {
    
    // Procesar nombres de campos antes de guardar
    console.log('Processing field names before save for:', formSelector);
    processFieldNamesBeforeSave(formSelector);

    const formFields       = [];
    const conditionalFields = [];

    /* =========================================================
     *  Recorremos TODOS los campos del formulario
     * =======================================================*/
    jQuery(`${formSelector} .nm-form-field`).each(function () {

        const $field = jQuery(this);

        /* Saltamos los sub-campos (los que viven dentro de un
          .conditional-container) porque ya los capturaremos más
          abajo cuando procesemos su padre. */
        if ($field.closest('.conditional-container').length) return;

        const fieldType  = $field.data('type');                // text, select, checkbox, …
        const fieldLabel = $field.find('.field-label').val() || '';
        let rawName    = $field.find('.field-name').val();
        
        // Si no hay nombre de campo, generar uno
        if (!rawName || rawName.trim() === '') {
            // Para el campo map, usar un nombre fijo
            if (fieldType === 'map') {
                rawName = 'nm_map_location';
            } else {
                rawName = generateUniqueFieldName(fieldLabel || 'campo');
            }
            $field.find('.field-name').val(rawName);
            console.log('Generated field name on save:', rawName, 'for field type:', fieldType);
        }
        
        const fieldName  = rawName; // Usar el nombre que ya existe o el recién generado
        const fieldOptions = [];

        /*────────────────────────────────────────────────────────
         * 1. SELECT CONDICIONAL
         *──────────────────────────────────────────────────────*/
        if (fieldType === 'conditional-select') {

            const selectId       = 'select_' + Date.now();
            const optionsWithIds = [];

            /* ① Solo queremos las opciones de PRIMER NIVEL
               (las que pertenecen al select principal):
               .children() → .children() */
            $field
              .children('.select-options')
              .children('.select-option')
              .each(function () {

                  const $option    = jQuery(this);
                  const optionId   = $option.data('option-id');

                  // Si no hay id algo va mal → no lo guardamos
                  if (!optionId) return;

                  const optionValue = $option.find('.field-option').val();
                  if (!optionValue) return;                   // siguiente opción

                  /* 1a) Fila para la tabla nm_form  */
                  optionsWithIds.push({ id: optionId, value: optionValue });

                  /* 1b) Fila para la tabla nm_conditional_fields
                     — Buscamos su contenedor hermano EXACTO   */
                  const $container = $field
                        .children('.conditional-containers')
                        .children(`.conditional-container[data-option-id="${optionId}"]`);

                  const conditionalFormFields = [];

                  /* Recorremos cada sub-campo vinculado a ESTA opción */
                  $container.find('.conditional-fields > *').each(function () {

                      const $condField   = jQuery(this);
                      const condFieldType =
                          $condField.data('type') ||
                          $condField.find('.field-type').val();

                      const condFieldLabel = $condField.find('.field-label').val()
                                           || $condField.text()
                                           || '';

                      // Obtener el nombre del campo condicional (debe haber sido generado ya)
                      let condFieldName = $condField.find('.field-name').val();
                      
                      // Si aún no tiene nombre, generar uno
                      if (!condFieldName || condFieldName.trim() === '') {
                          // Para campos map en contextos condicionales, usar nombre fijo
                          if (condFieldType === 'map') {
                              condFieldName = 'nm_map_location_conditional';
                          } else {
                              condFieldName = generateUniqueFieldName(condFieldLabel || 'campo_condicional');
                          }
                          $condField.find('.field-name').val(condFieldName);
                      }

                      const condFieldData  = {
                          type : condFieldType,
                          label: condFieldLabel,
                          name : condFieldName,
                          restricted: $condField.find('.field-restricted-toggle').is(':checked') ? 1 : 0
                      };

                      /* Opciones para select/radio/checkbox -------------------*/
                      if (['select', 'radio', 'checkbox'].includes(condFieldType)) {
                          const condOptions = [];
                          $condField.find('.field-option').each(function () {
                              const optVal = jQuery(this).val();
                              if (optVal) condOptions.push(optVal);
                                is_title: ($field.data('type') === 'text' && $field.find('.field-title-toggle').is(':checked')) ? 1 : 0
                          });
                          if (condOptions.length) condFieldData.options = condOptions;
                      }

                      conditionalFormFields.push(condFieldData);
                  });

                  /* Una fila por cada combinación select-option ---------------*/
                  conditionalFields.push({
                      select_id : selectId,
                      option_id : optionId,
                      fields_json: conditionalFormFields     // ← se pasa tal cual a PHP
                  });
              });

            /* Registramos solo el SELECT principal en nm_form ----------------*/
            formFields.push({
                type : fieldType,
                label: fieldLabel,
                name : fieldName,
                select_id: selectId,
                options  : optionsWithIds,
                restricted: $field.find('.field-restricted-toggle').is(':checked') ? 1 : 0
            });        /*────────────────────────────────────────────────────────
         * 2. CAMPOS NORMALES
         *──────────────────────────────────────────────────────*/
        } else {

            if (['select', 'checkbox', 'radio'].includes(fieldType)) {
                $field.find('.field-option').each(function () {
                    const optVal = jQuery(this).val();
                    if (optVal) fieldOptions.push(optVal);
                });
            }            const fieldData = { 
                type: fieldType, 
                label: fieldLabel || 'Campo sin título', 
                name: fieldName || generateUniqueFieldName('campo_generico'),
                restricted: $field.find('.field-restricted-toggle').is(':checked') ? 1 : 0,
                is_title: ($field.data('type') === 'text' && $field.find('.field-title-toggle').is(':checked')) ? 1 : 0
            };
            
            if (fieldOptions.length) fieldData.options = fieldOptions;            // Procesamiento especial para geographic-selector
            if (fieldType === 'geographic-selector') {
                // Extraer la configuración del campo oculto
                const configField = $field.find('.nm-field-config');
                console.log('Geographic field found:', fieldType);
                console.log('Config field element:', configField.length);
                
                if (configField.length) {
                    try {
                        const configValue = configField.val();
                        console.log('Raw config value:', configValue);
                        
                        const configData = JSON.parse(configValue);
                        console.log('Parsed config data:', configData);
                        
                        if (configData && configData.config) {
                            fieldData.config = configData.config;
                            console.log('Final field config:', fieldData.config);
                            // Asegurar que el JSON se serialice en una sola línea
                            fieldData.config = JSON.parse(JSON.stringify(configData.config));
                        }
                    } catch (e) {
                        console.error('Error parsing geographic-selector config:', e);
                    }
                } else {
                    console.warn('No config field found for geographic-selector');
                }
            }            // No hay procesamiento especial necesario para audio
            // Solo mantenemos la funcionalidad básica de subida

            formFields.push(fieldData);
        }
    });    /* =========================================================
     * 3. PETICIONES AJAX
     * =======================================================*/
    
    // Validate before form save
    console.log('Final form fields to save:');
    formFields.forEach((field, index) => {
        console.log(`Field ${index + 1}:`, field);
        if (field.type === 'geographic-selector') {
            console.log('  Geographic field config:', field.config);
        }
    });

    // Validar datos antes de enviar
    if (formFields.length === 0) {
        alert('No hay campos para guardar en el formulario.');
        return;
    }
        // Asegurar unicidad de título: mantener solo el primero marcado
        let titleFound = false;
        for (let i = 0; i < formFields.length; i++) {
            const f = formFields[i];
            if (f && f.type === 'text' && f.is_title) {
                if (!titleFound) {
                    titleFound = true;
                } else {
                    f.is_title = 0;
                }
            }
        }
    
    // Validar que todos los campos tengan propiedades básicas
    for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        if (!field.type) {
            alert('Error: Campo sin tipo encontrado en posición ' + (i + 1));
            console.error('Invalid field:', field);
            return;
        }
        if (!field.name) {
            field.name = generateUniqueFieldName('campo_sin_nombre');
            console.log('Generated fallback field name:', field.name);
        }
        if (!field.label) {
            field.label = 'Campo sin título';
        }
    }
      console.log('Campos a guardar:', formFields.length);
    console.log('Sending form data:', { fields: formFields });
    console.log('AJAX URL:', nmAdmin.ajax_url);
    console.log('Nonce:', nmAdmin.nonce);
    
    // Verificar que tenemos los datos necesarios
    if (!nmAdmin.ajax_url) {
        alert('Error: No se ha definido la URL de AJAX');
        return;
    }
    
    if (!nmAdmin.nonce) {
        alert('Error: No se ha definido el nonce de seguridad');
        return;
    }
    
    jQuery.post(nmAdmin.ajax_url, {
        action: 'nm_save_form',
        form_type: formType,
        form_data: { fields: formFields },
        nonce: nmAdmin.nonce
    }, function (response) {
        console.log('AJAX Response:', response);

        if (!response.success) { 
            console.error('Error response:', response);
            alert('Error al guardar el formulario: ' + (response.data || 'Error desconocido')); 
            return; 
        }

        /*  Si no hay campos condicionales ya hemos terminado  */
        if (!conditionalFields.length) {
            alert('Formulario guardado correctamente');
            return;
        }

        /*  Guardamos los condicionales en su tabla  */
        jQuery.post(nmAdmin.ajax_url, {
            action          : 'nm_save_conditional_fields',
            conditional_data: conditionalFields,
            nonce           : nmAdmin.nonce        }, function (condResp) {
            alert(condResp.success
                ? 'Formulario guardado correctamente'
                : 'Error al guardar los campos condicionales');
        });
    }).fail(function(jqXHR, textStatus, errorThrown) {
        // Error en la petición AJAX principal
        console.error('AJAX Error:', {
            status: jqXHR.status,
            statusText: jqXHR.statusText,
            textStatus: textStatus,
            errorThrown: errorThrown,
            responseText: jqXHR.responseText
        });
        
        let errorMessage = 'Error de conexión: ';
        if (jqXHR.status === 400) {
            errorMessage += 'Datos inválidos enviados al servidor';
        } else if (jqXHR.status === 403) {
            errorMessage += 'Sin permisos para realizar esta acción';
        } else if (jqXHR.status === 500) {
            errorMessage += 'Error interno del servidor';
        } else {
            errorMessage += textStatus + ' (Código: ' + jqXHR.status + ')';
        }
        
        alert(errorMessage);
    });
}


    // Function to validate if all fields are filled
    function validateForm(formId) {
        let isValid = true;
        // Solo validar campos obligatorios (field-label principalmente)
        jQuery(`${formId} .nm-form-field .field-label`).each(function () {
            if (jQuery(this).val() === "") {
                isValid = false;
                jQuery(this).css('border', '1px solid red'); // Highlight empty fields
                console.log('Empty field label found:', jQuery(this).closest('.nm-form-field').data('type'));
            } else {
                jQuery(this).css('border', ''); // Reset field style if filled
            }
        });

        if (!isValid) {
            alert("Por favor, completa el título/label de todos los campos antes de guardar.");
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
    });    // Entries Page Actions - Usar delegación de eventos
    $(document).on('click', '.approve-entry', function () {
        var entryId = $(this).data('id');
        updateEntryStatus(entryId, 'approved');
    });

    $(document).on('click', '.reject-entry', function () {
        var entryId = $(this).data('id');
        updateEntryStatus(entryId, 'rejected');
    });

    // Nuevos manejadores para entradas aprobadas
    $(document).on('click', '.edit-entry', function () {
        var entryId = $(this).data('id');
        openEditEntryModal(entryId);
    });

    $(document).on('click', '.delete-entry', function () {
        var entryId = $(this).data('id');
        if (confirm('¿Estás seguro de que quieres eliminar esta entrada? Esta acción no se puede deshacer.')) {
            deleteEntry(entryId);
        }
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

    function openEditEntryModal(entryId) {
        // Crear modal de edición si no existe
        if ($('#editEntryModal').length === 0) {
            var modalHtml = `
                <div id="editEntryModal" class="modal" style="display:none;">
                    <div class="modal-content" style="width: 90%; max-width: 800px;">
                        <span class="close edit-modal-close">&times;</span>
                        <h2>Editar Entrada</h2>
                        <div id="editEntryForm">
                            <div id="editFormFields"></div>
                            <div style="margin-top: 20px;">
                                <button id="saveEntryChanges" class="button button-primary">Guardar Cambios</button>
                                <button id="cancelEntryEdit" class="button">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('body').append(modalHtml);
        }

        // Obtener datos de la entrada
        $.post(nmAdmin.ajax_url, {
            action: 'nm_get_entry_for_edit',
            entry_id: entryId,
            nonce: nmAdmin.nonce
        }, function (response) {
            if (response.success) {
                buildEditForm(entryId, response.data);
                $('#editEntryModal').show();
            } else {
                alert('Error al cargar los datos de la entrada: ' + response.data);
            }
        });
    }

    function buildEditForm(entryId, entryData) {
        var formHtml = '';
        
        // Parsear map_data si existe
        var mapData = null;
        if (entryData.map_data) {
            try {
                var decodedMapData = decodeEscapedJsonString(entryData.map_data);
                mapData = JSON.parse(decodedMapData)[0];
            } catch (e) {
                console.error('Error parsing map data:', e);
            }
        }

        // Crear campos editables para las propiedades principales
        if (mapData && mapData.properties) {
            $.each(mapData.properties, function(key, value) {
                if (key.startsWith('nm_') && !['nm_conditional_groups', 'nm_layers', 'nm_has_layer', 'nm_text_layers', 'nm_entry_id'].includes(key)) {
                    var cleanKey = key.replace('nm_', '');
                    var fieldType = getFieldType(value);
                    
                    formHtml += '<div class="edit-field-group">';
                    formHtml += '<label for="edit_' + key + '"><strong>' + cleanKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ':</strong></label>';
                    
                    if (fieldType === 'textarea') {
                        formHtml += '<textarea id="edit_' + key + '" name="' + key + '" rows="3" style="width: 100%;">' + escapeHtml(value) + '</textarea>';
                    } else {
                        formHtml += '<input type="text" id="edit_' + key + '" name="' + key + '" value="' + escapeHtml(value) + '" style="width: 100%;">';
                    }
                    
                    formHtml += '</div>';
                }
            });
        }

        $('#editFormFields').html(formHtml);

        // Guardar el ID de entrada para uso posterior
        $('#editEntryModal').data('entry-id', entryId);
        $('#editEntryModal').data('original-data', entryData);
    }

    function getFieldType(value) {
        if (typeof value === 'string' && value.length > 100) {
            return 'textarea';
        }
        return 'text';
    }

    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function saveEntryChanges() {
        var entryId = $('#editEntryModal').data('entry-id');
        var originalData = $('#editEntryModal').data('original-data');
        
        // Recopilar los valores editados
        var updatedData = $.extend(true, {}, originalData);
        
        if (updatedData.map_data) {
            try {
                var decodedMapData = decodeEscapedJsonString(updatedData.map_data);
                var mapDataArray = JSON.parse(decodedMapData);
                var mapData = mapDataArray[0];
                
                // Actualizar las propiedades con los valores del formulario
                $('#editFormFields input, #editFormFields textarea').each(function() {
                    var fieldName = $(this).attr('name');
                    var fieldValue = $(this).val();
                    if (mapData.properties.hasOwnProperty(fieldName)) {
                        mapData.properties[fieldName] = fieldValue;
                    }
                });
                
                // Volver a serializar los datos
                mapDataArray[0] = mapData;
                updatedData.map_data = JSON.stringify(mapDataArray);
                
            } catch (e) {
                console.error('Error updating map data:', e);
                alert('Error al procesar los datos del mapa');
                return;
            }
        }

        // Enviar datos actualizados
        $.post(nmAdmin.ajax_url, {
            action: 'nm_update_entry_data',
            entry_id: entryId,
            entry_data: updatedData,
            nonce: nmAdmin.nonce
        }, function (response) {
            if (response.success) {
                alert('Entrada actualizada exitosamente');
                $('#editEntryModal').hide();
                location.reload();
            } else {
                alert('Error al actualizar la entrada: ' + response.data);
            }
        });
    }

    function deleteEntry(entryId) {
        $.post(nmAdmin.ajax_url, {
            action: 'nm_delete_entry',
            entry_id: entryId,
            nonce: nmAdmin.nonce
        }, function (response) {
            if (response.success) {
                alert('Entrada eliminada exitosamente');
                location.reload();
            } else {
                alert('Error al eliminar la entrada: ' + response.data);
            }
        });
    }

    // Manejadores para el modal de edición
    $(document).on('click', '.edit-modal-close, #cancelEntryEdit', function() {
        $('#editEntryModal').hide();
    });

    $(document).on('click', '#saveEntryChanges', function() {
        saveEntryChanges();
    });

    // Cerrar modal al hacer clic fuera
    $(document).on('click', '#editEntryModal', function(e) {
        if (e.target === this) {
            $('#editEntryModal').hide();
        }
    });

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
    function getNextChartIndex() {
        var maxIndex = -1;
        jQuery('#chart-container').find('[name^="charts["]').each(function(){
            var m = this.name.match(/^charts\[(\d+)\]/);
            if (m) {
                var idx = parseInt(m[1], 10);
                if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
            }
        });
        return maxIndex + 1;
    }

    var chartIndex = getNextChartIndex();
    console.log('NM Chart Manager: next index', chartIndex);

    // Al hacer clic en "Añadir Gráfico"
    jQuery('#add-chart').on('click', function () {
        var template = $('#chart-template').html();
        var idx = getNextChartIndex();
        template = template.replace(/{index}/g, idx);
        jQuery('#chart-container').append(template);
        chartIndex = idx + 1;
    });

    // Al hacer clic en "Eliminar Gráfico"
    $(document).on('click', '.remove-chart', function () {
        $(this).closest('.nm-chart-box').remove();
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

// Función para decodificar strings JSON escapados
function decodeEscapedJsonString(escapedString) {
    // Reemplaza todas las secuencias de escape que están duplicadas para que sea un JSON válido
    return escapedString
        .replace(/\\"/g, '"')  // Reemplaza las comillas escapadas
        .replace(/\\n/g, '')   // Remueve los saltos de línea escapados
        .replace(/\\r/g, '')   // Remueve los retornos de carro escapados
        .replace(/\\\\/g, '\\');  // Reemplaza las barras invertidas dobles con una sola barra invertida
}