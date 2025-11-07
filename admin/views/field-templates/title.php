<div class="nm-form-field" data-type="title">
    <label>Title</label>
    <input type="text" class="field-label" placeholder="Field Label">
    <input type="hidden" class="field-name">
    <span class="nm-remove-field">Remove</span>
    <div class="nm-field-restricted"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-restricted-toggle" <?php echo !empty($field['restricted']) ? 'checked' : ''; ?>> Solo usuarios privilegiados</label></div>
</div>