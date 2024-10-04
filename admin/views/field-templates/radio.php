<div class="nm-form-field" data-type="radio">
    <label>Radio Group</label>
    <input type="text" class="field-label" placeholder="Field Label" value="<?php echo esc_attr( $field_label ); ?>">
    <input type="text" class="field-name" placeholder="Field Name" value="<?php echo esc_attr( $field_name ); ?>">
    <div class="radio-options">
        <?php
        if ( isset( $field['options'] ) && is_array( $field['options'] ) ) {
            foreach ( $field['options'] as $option ) {
                ?>
                <div class="radio-option">
                    <input type="text" class="option-value field-option" placeholder="Option Value" value="<?php echo esc_attr( $option ); ?>">
                    <span class="remove-option">Remove</span>
                </div>
                <?php
            }
        } else {
            // Provide an empty option if none exist
            ?>
            <div class="radio-option">
                <input type="text" class="option-value field-option" placeholder="Option Value">
                <span class="remove-option">Remove</span>
            </div>
            <?php
        }
        ?>
    </div>
    <button type="button" class="add-radio-option">Add Radio Option</button>
    <span class="nm-remove-field">Remove Field</span>
</div>
