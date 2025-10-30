<?php
/**
 * Template para el campo select condicional
 * Este campo permitirá vincular cada opción con diferentes campos del formulario
 */
?>
<div class="nm-form-field" data-type="select_conditional">
    <label>Dropdown Condicional</label>
    <input type="text" class="field-label" placeholder="Field Label" value="<?php echo esc_attr( $field_label ); ?>">
    <input type="text" class="field-name" placeholder="Field Name" value="<?php echo esc_attr( $field_name ); ?>">
    <div class="select-conditional-options">
        <?php
        if ( isset( $field['options'] ) && is_array( $field['options'] ) ) {
            foreach ( $field['options'] as $option ) {
                ?>
                <div class="select-conditional-option">
                    <input type="text" class="option-value field-option" placeholder="Valor de la opción" value="<?php echo esc_attr( $option['value'] ?? '' ); ?>">
                    <input type="text" class="option-conditional" placeholder="IDs de campos a mostrar (separados por coma)" value="<?php echo esc_attr( $option['show_fields'] ?? '' ); ?>">
                    <span class="remove-option">Eliminar</span>
                </div>
                <?php
            }
        } else {
            ?>
            <div class="select-conditional-option">
                <input type="text" class="option-value field-option" placeholder="Valor de la opción">
                <input type="text" class="option-conditional" placeholder="IDs de campos a mostrar (separados por coma)">
                <span class="remove-option">Eliminar</span>
            </div>
            <?php
        }
        ?>
    </div>
    <button type="button" class="add-select-conditional-option">Añadir Opción</button>
    <span class="nm-remove-field">Eliminar Campo</span>
</div>