jQuery(document).ready(function ($) {
    // Drag and Drop Fields
    $('#nm-form-elements li').draggable({
        helper: 'clone',
        revert: 'invalid'
    });

    $('#nm-custom-form').droppable({
        accept: '#nm-form-elements li',
        drop: function (event, ui) {
            var fieldType = ui.draggable.data('type');
            // AJAX call to get field template
            $.post(nmAdmin.ajax_url, {
                action: 'nm_get_field_template',
                field_type: fieldType,
                nonce: nmAdmin.nonce
            }, function (response) {
                if (response.success) {
                    $('#nm-custom-form').append(response.data);
                } else {
                    alert('Error loading field template.');
                }
            });
        }
    });

    // Make form fields sortable
    $('#nm-custom-form').sortable();

    // Remove Field
    $(document).on('click', '.nm-remove-field', function () {
        $(this).closest('.nm-form-field').remove();
    });

    // Añadir nueva opción de radio
    $(document).on('click', '.add-radio-option', function () {
        var $field = $(this).closest('.nm-form-field');
        var $optionsContainer = $field.find('.radio-options');
        var newOption = '<div class="radio-option">' +
            '<input type="text" class="option-value field-option" placeholder="Option Value">' +
            '<span class="remove-option">Remove</span>' +
            '</div>';
        $optionsContainer.append(newOption);
    });

    // Añadir nueva opción de checkbox
    $(document).on('click', '.add-checkbox-option', function () {
        var $field = $(this).closest('.nm-form-field');
        var $optionsContainer = $field.find('.checkbox-options');
        var newOption = '<div class="checkbox-option">' +
            '<input type="text" class="option-value field-option" placeholder="Option Value">' +
            '<span class="remove-option">Remove</span>' +
            '</div>';
        $optionsContainer.append(newOption);
    });

    // Añadir nueva opción de select
    $(document).on('click', '.add-select-option', function () {
        var $field = $(this).closest('.nm-form-field');
        var $optionsContainer = $field.find('.select-options');
        var newOption = '<div class="select-option">' +
            '<input type="text" class="option-value field-option" placeholder="Option Value">' +
            '<span class="remove-option">Remove</span>' +
            '</div>';
        $optionsContainer.append(newOption);
    });

    // Eliminar opción de radio
    $(document).on('click', '.remove-option', function () {
        $(this).closest('.radio-option').remove();
    });

    // Eliminar opción de checkbox
    $(document).on('click', '.remove-option', function () {
        $(this).closest('.checkbox-option').remove();
    });

    // Eliminar opción de select
    $(document).on('click', '.remove-option', function () {
        $(this).closest('.select-option').remove();
    });

    // Modificar la función de guardar formulario para incluir checkboxes
    $('#nm-save-form').click(function () {
        var formFields = [];
        $('#nm-custom-form .nm-form-field').each(function () {
            var fieldType = $(this).data('type');
            var fieldLabel = $(this).find('.field-label').val() || '';
            var fieldName = $(this).find('.field-name').val() || '';
            var fieldOptions = [];

            // Collect options if the field has them
            if (fieldType === 'select' || fieldType === 'checkbox' || fieldType === 'radio') {
                $(this).find('.field-option').each(function () {
                    var optionValue = $(this).val();
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
            form_data: { fields: formFields },
            nonce: nmAdmin.nonce
        }, function (response) {
            if (response.success) {
                alert('Form saved successfully.');
            } else {
                alert('Error saving form.');
            }
        });
    });
    // Entries Page Actions
    $('.approve-entry').click(function () {
        var entryId = $(this).data('id');
        updateEntryStatus(entryId, 'approved');
    });

    $('.reject-entry').click(function () {
        var entryId = $(this).data('id');
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
});
