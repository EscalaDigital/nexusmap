<div class="nm-form-field" data-type="file">
    <label>Document Upload</label>
    <input type="text" class="field-label" placeholder="Field Label" value="<?php echo esc_attr( $field_label ); ?>">
    <input type="hidden" class="field-name" value="<?php echo esc_attr( $field_name ); ?>">
    <div class="file-type-info">
        <small>Allowed formats: PDF, DOC, DOCX, XLS, XLSX, TXT, RTF</small>
    </div>
    <span class="nm-remove-field">Remove Field</span>
    <div class="nm-field-restricted"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-restricted-toggle" <?php echo !empty($field['restricted']) ? 'checked' : ''; ?>> Solo usuarios privilegiados</label></div>
</div>