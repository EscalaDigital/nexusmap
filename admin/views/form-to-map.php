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
                    <?php
                    foreach ($this->valid_fields as $field):
                        $field_key = $field['name'];

                        // Nueva forma de comprobar si está activo
                        $is_active = false;
                        if (isset($saved_settings[$field_key])) {
                            if (isset($saved_settings[$field_key]['active'])) {
                                $is_active = true;
                            } else if (isset($saved_settings[$field_key]['colors']) && !empty($saved_settings[$field_key]['colors'])) {
                                $is_active = true;
                            }
                        }


                    ?>
                        <tr>
                            <td><?php echo esc_html($field['label']); ?></td>
                            <td><?php echo esc_html($field['type']); ?></td>
                            <td>
                                <input type="hidden" name="layers[<?php echo esc_attr($field_key); ?>][active]" value="off">
                                <input type="checkbox"
                                    name="layers[<?php echo esc_attr($field_key); ?>][active]"
                                    <?php echo $is_active ? 'checked="checked"' : ''; ?>
                                    value="on">
                            </td>
                            <td class="color-settings">
                                <?php
                                if (isset($field['options']) && is_array($field['options'])):
                                    foreach ($field['options'] as $value => $label):
                                        // Asegurar que estamos obteniendo el color guardado correctamente
                                        $current_color = '';
                                        if (isset($saved_settings[$field_key]['colors'][$value])) {
                                            $current_color = $saved_settings[$field_key]['colors'][$value];
                                        } elseif (isset($saved_settings[$field_key]['colors'][(int)$value])) {
                                            $current_color = $saved_settings[$field_key]['colors'][(int)$value];
                                        } else {
                                            $current_color = '#' . substr(md5($value), 0, 6);
                                        }
                                ?>
                                        <div class="color-row">
                                            <label>
                                                <?php echo esc_html($label); ?>:
                                                <input type="color"
                                                    name="layers[<?php echo esc_attr($field_key); ?>][colors][<?php echo esc_attr($value); ?>]"
                                                    value="<?php echo esc_attr($current_color); ?>">
                                            </label>
                                        </div>
                                <?php
                                    endforeach;
                                endif;
                                ?>
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