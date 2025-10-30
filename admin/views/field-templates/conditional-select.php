<div class="nm-form-field conditional-select" data-type="conditional-select">
    <label>Conditional Select</label>
    <input type="text" class="field-label" placeholder="Field Label"
        value="<?php echo esc_attr($field['label'] ?? ''); ?>">
    <input type="hidden" class="field-name"
        value="<?php echo esc_attr($field['name'] ?? ''); ?>">

    <div class="select-options">
        <?php if (!empty($field['options'])): ?>
            <?php foreach ($field['options'] as $option): ?>
                <div class="select-option" data-option-id="<?php echo esc_attr($option['id']); ?>">
                    <input type="text" class="option-value field-option"
                        value="<?php echo esc_attr($option['value']); ?>">
                    <span class="remove-option">Remove</span>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <button type="button" class="add-conditional-option">Add Option</button>

    <div class="conditional-containers">
        <?php if (!empty($field['options'])): ?>
            <?php foreach ($field['options'] as $option): ?>
                <div class="conditional-container" data-option-id="<?php echo esc_attr($option['id']); ?>">
                    <h4>Fields for option: <span class="option-label">
                            <?php echo esc_html($option['value']); ?>
                        </span></h4>
                    <div class="conditional-fields">
                        <?php
                        if (!empty($option['conditional_fields'])) {
                            foreach ($option['conditional_fields'] as $cfield) {
                                // Guardar el campo original
                                $original_field = $field;

                                // Preparar las variables que espera la plantilla 
                                $field = [
                                    'label' => $cfield['label'] ?? '',
                                    'name' => $cfield['name'] ?? '',
                                    'type' => $cfield['type'] ?? ''
                                ];

                                // Manejar las opciones para campos select, radio, checkbox
                                if (isset($cfield['options'])) {
                                    $opts = $cfield['options'];

                                    // ¿Es un array de arrays con la clave 'value'?
                                    if (isset($opts[0]) && is_array($opts[0]) && array_key_exists('value', $opts[0])) {
                                        // Extrae solo los valores
                                        $opts = array_column($opts, 'value');
                                    }

                                    $field['options'] = $opts;
                                }

                                $field_label = $field['label'];
                                $field_name  = $field['name'];

                                // Incluir la plantilla correspondiente al tipo de campo
                                include __DIR__ . '/../field-templates/' . $cfield['type'] . '.php';

                                // Restaurar el campo original
                                $field = $original_field;
                            }
                        }
                        ?>
                    </div>
                    <button type="button" class="show-fields-menu">Add Field</button>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div class="conditional-fields-menu" style="display:none;">
        <ul>
            <li data-type="text">Text Field</li>
            <li data-type="textarea">Textarea</li>
            <li data-type="checkbox">Checkbox</li>
            <li data-type="radio">Radio Group</li>
            <li data-type="select">Dropdown Menu</li>
            <li data-type="number">Number Field</li>
            <li data-type="date">Date Picker</li>
            <li data-type="url">URL Field</li>
        </ul>
    </div>

    <span class="nm-remove-field">Remove Field</span>
    <div class="nm-field-restricted"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-restricted-toggle" <?php echo !empty($field['restricted']) ? 'checked' : ''; ?>> Solo usuarios privilegiados</label></div>
</div>