<div class="nm-form-field" data-type="audio">
    <label>Audio</label>
    <input type="text" class="field-label" placeholder="Field Label" value="<?php echo esc_attr( $field_label ); ?>">
    <input type="text" class="field-name" placeholder="Field Name" value="<?php echo esc_attr( $field_name ); ?>">
    
    <!-- Opciones específicas del campo audio -->
    <div class="audio-options">
        <label>
            <input type="checkbox" class="field-option allow-recording" <?php echo isset($field_options['allow_recording']) && $field_options['allow_recording'] ? 'checked' : ''; ?>>
            Allow Recording
        </label>
        <label>
            <input type="checkbox" class="field-option allow-upload" <?php echo isset($field_options['allow_upload']) && $field_options['allow_upload'] ? 'checked' : ''; ?>>
            Allow File Upload
        </label>
        <label>
            Max Duration (seconds):
            <input type="number" class="field-option max-duration" placeholder="300" value="<?php echo esc_attr($field_options['max_duration'] ?? '300'); ?>">
        </label>
        <label>
            Accepted Formats:
            <input type="text" class="field-option accepted-formats" placeholder="mp3,wav,ogg" value="<?php echo esc_attr($field_options['accepted_formats'] ?? 'mp3,wav,ogg'); ?>">
        </label>
    </div>
    
    <span class="nm-remove-field">Remove Field</span>
</div>
