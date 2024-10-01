jQuery(document).ready(function($) {
    // Drag and Drop Fields
    $('#nm-form-elements li').draggable({
        helper: 'clone',
        revert: 'invalid'
    });

    $('#nm-custom-form').droppable({
        accept: '#nm-form-elements li',
        drop: function(event, ui) {
            var fieldType = ui.draggable.data('type');
            // AJAX call to get field template
            $.post(nmAdmin.ajax_url, {
                action: 'nm_get_field_template',
                field_type: fieldType,
                nonce: nmAdmin.nonce
            }, function(response) {
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
    $(document).on('click', '.nm-remove-field', function() {
        $(this).closest('.nm-form-field').remove();
    });

 // Save Form
$('#nm-save-form').click(function() {
    var formFields = [];
    $('#nm-custom-form .nm-form-field').each(function() {
        var fieldType = $(this).data('type');
        var fieldLabel = $(this).find('.field-label').val();
        var fieldName = $(this).find('.field-name').val();
        var fieldOptions = [];

        // Si el campo tiene opciones (por ejemplo, select, checkbox, radio)
        if (fieldType === 'select' || fieldType === 'checkbox' || fieldType === 'radio') {
            $(this).find('.field-option').each(function() {
                fieldOptions.push($(this).val());
            });
        }

        formFields.push({
            type: fieldType,
            label: fieldLabel,
            name: fieldName,
            options: fieldOptions
        });
    });

    $.post(nmAdmin.ajax_url, {
        action: 'nm_save_form',
        form_data: { fields: formFields },
        nonce: nmAdmin.nonce
    }, function(response) {
        if (response.success) {
            alert('Form saved successfully.');
        } else {
            alert('Error saving form.');
        }
    });
});


    // Entries Page Actions
    $('.approve-entry').click(function() {
        var entryId = $(this).data('id');
        updateEntryStatus(entryId, 'approved');
    });

    $('.reject-entry').click(function() {
        var entryId = $(this).data('id');
        updateEntryStatus(entryId, 'rejected');
    });

    function updateEntryStatus(entryId, status) {
        $.post(nmAdmin.ajax_url, {
            action: 'nm_update_entry_status',
            entry_id: entryId,
            status: status,
            nonce: nmAdmin.nonce
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Error updating entry status.');
            }
        });
    }
});
