<div class="nm-form-field" data-type="checkbox">
    <label>Checkbox Group</label>
    <input type="text" class="field-label" placeholder="Field Label" value="<?php echo esc_attr( $field_label ); ?>">
    <input type="text" class="field-name" placeholder="Field Name" value="<?php echo esc_attr( $field_name ); ?>">
    <div class="checkbox-options">
        <?php
        if ( isset( $field['options'] ) && is_array( $field['options'] ) ) {
            foreach ( $field['options'] as $option ) {
                ?>
                <div class="checkbox-option">
                    <input type="text" class="option-value field-option" placeholder="Option Value" value="<?php echo esc_attr( $option ); ?>">
                    <span class="remove-option">Remove</span>
                </div>
                <?php
            }
        } else {
            // Provide an empty option if none exist
            ?>
            <div class="checkbox-option">
                <input type="text" class="option-value field-option" placeholder="Option Value">
                <span class="remove-option">Remove</span>
            </div>
            <?php
        }
        ?>
    </div>
    <button type="button" class="add-checkbox-option">Add Checkbox Option</button>
    <span class="nm-remove-field">Remove Field</span>
</div>
