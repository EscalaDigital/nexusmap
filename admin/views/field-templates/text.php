<div class="nm-form-field" data-type="text">
<label>Text Field</label>
    <input type="text" class="field-label" placeholder="Field Label" value="<?php echo esc_attr($field_label); ?>">
    <input type="hidden" class="field-name" value="<?php echo esc_attr($field_name); ?>">
    <span class="nm-remove-field">Remove</span>
    <div class="nm-field-title"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-title-toggle" <?php echo !empty($field['is_title']) ? 'checked' : ''; ?>> Marcar como título</label></div>
    <div class="nm-field-restricted"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-restricted-toggle" <?php echo !empty($field['restricted']) ? 'checked' : ''; ?>> Solo usuarios privilegiados</label></div>
</div>

