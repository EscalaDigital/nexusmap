<div class="nm-form-field" data-type="range">
    <label>Range Slider</label>
    <input type="range" name="range_field[]" min="0" max="100">
    <input type="text" class="field-label" placeholder="Field Label">
    <input type="hidden" class="field-name">
    <span class="nm-remove-field">Remove</span>
    <div class="nm-field-restricted"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-restricted-toggle" <?php echo !empty($field['restricted']) ? 'checked' : ''; ?>> Solo usuarios privilegiados</label></div>
</div>