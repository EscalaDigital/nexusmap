<div class="wrap">
    <h1>Gestor de Capas del Mapa</h1>

    <?php if (!empty($this->valid_fields)): ?>
        <form id="nm-layer-settings" method="post">
            <?php
            // Debug para ver los valores guardados
            $saved_settings = get_option('nm_layer_settings', array());

            ?>
            <table class="widefat">
    <thead>
        <tr>
            <th>Campo</th>
            <th>Tipo</th>
            <th>Activar</th>
            <th>Colores para valores</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($this->valid_fields as $field):
            $field_key = $field['name'];
            $is_active = isset($saved_settings[$field_key]['active']) && $saved_settings[$field_key]['active'] === 'on';
        ?>
            <tr>
                <td><?php echo esc_html($field['label']); ?></td>
                <td><?php echo esc_html($field['type']); ?></td>
                <td>
                    <input type="hidden" name="layers[<?php echo esc_attr($field_key); ?>][active]" value="off">
                    <input type="checkbox"
                           name="layers[<?php echo esc_attr($field_key); ?>][active]"
                           <?php checked($is_active); ?>
                           value="on">
                </td>
                <td class="color-settings">
                    <?php if (isset($field['options']) && is_array($field['options'])): ?>
                        <?php foreach ($field['options'] as $index => $option): ?>
                            <?php
                            $label = is_array($option) ? $option['label'] : $option;
                            $value = is_array($option) ? $option['value'] : $index;
                            
                            // Obtener el color guardado o generar uno por defecto
                            $saved_color = isset($saved_settings[$field_key]['colors'][$label]) 
                                ? $saved_settings[$field_key]['colors'][$label] 
                                : '#' . substr(md5($value), 0, 6);
                            ?>
                            <div class="color-row">
                                <input type="hidden" 
                                       name="layers[<?php echo esc_attr($field_key); ?>][labels][]" 
                                       value="<?php echo esc_attr($label); ?>">
                                <label>
                                    <?php echo esc_html($label); ?>:
                                    <input type="color"
                                           name="layers[<?php echo esc_attr($field_key); ?>][colors][]"
                                           value="<?php echo esc_attr($saved_color); ?>">
                                </label>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

            <p class="submit">
                <button type="submit" class="button button-primary" id="save-layer-settings">
                    Guardar Configuración
                </button>
            </p>
        </form>


    <?php endif; ?>
</div>

<style>
    .color-row {
        margin: 8px 0;
    }

    .color-settings {
        max-width: 300px;
    }

    .color-row label {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>