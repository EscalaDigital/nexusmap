<div class="wrap">
    <h1>Gestor de Capas del Mapa</h1>

    <?php if (!empty($fields_for_view) || !empty($text_fields_for_view)): ?>
        <form id="nm-layer-settings" method="post">
            <?php $saved_settings = get_option('nm_layer_settings', array()); ?>

            <!-- Campos Select/Radio/Checkbox -->
            <?php if (!empty($fields_for_view)): ?>
                <h2>Campos con Valores Predefinidos</h2>
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
                        <?php foreach ($fields_for_view as $field):
                            $field_key = $field['name'];
                            $is_active = isset($saved_settings[$field_key]['active']) && $saved_settings[$field_key]['active'] === 'on';
                        ?>
                            <tr>
                                <td>
                                    <?php echo esc_html($field['label']); ?>
                                    <?php if (!empty($field['is_conditional'])): ?>
                                        <span style="display:inline-block;margin-left:8px;padding:2px 6px;border-radius:4px;background:#eef6ff;color:#1d4ed8;font-size:11px;">Subcampo condicional</span>
                                        <div style="color:#6b7280;font-size:11px;">Padre: <?php echo esc_html($field['parent_field'] ?? ''); ?> · Opción: <?php echo esc_html($field['parent_option'] ?? ''); ?></div>
                                    <?php endif; ?>
                                </td>
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
                                            $label = is_array($option) ? ($option['label'] ?? $option['value'] ?? $option) : $option;
                                            $value = is_array($option) ? ($option['value'] ?? $label) : (is_string($option) ? $option : $index);
                                            // Mantener compatibilidad: si ya existía por label, úsala; si no, por value
                                            $saved_color = isset($saved_settings[$field_key]['colors'][$label]) 
                                                ? $saved_settings[$field_key]['colors'][$label] 
                                                : (isset($saved_settings[$field_key]['colors'][$value]) ? $saved_settings[$field_key]['colors'][$value] : '#' . substr(md5($value), 0, 6));
                                            ?>
                                            <div class="color-row">
                                                <input type="hidden" 
                                                       name="layers[<?php echo esc_attr($field_key); ?>][labels][]" 
                                                       value="<?php echo esc_attr($value); ?>">
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
            <?php endif; ?>

            <!-- Campos de Texto -->
            <?php if (!empty($text_fields_for_view)): ?>
    <h2>Campos de Texto y Área de Texto</h2>
    <p class="description">Los puntos se mostrarán del color seleccionado cuando contengan texto en estos campos (texto simple o área de texto).</p>
                
                <!-- Campo para el nombre de capa de texto -->
                <div class="form-field" style="margin-bottom: 20px;">
                    <label for="nm_text_layer_name" style="display: block; margin-bottom: 5px;"><strong>Nombre de la Capa de Texto:</strong></label>
                    <input type="text" 
                           id="nm_text_layer_name" 
                           name="nm_text_layer_name" 
                           value="<?php echo esc_attr(get_option('nm_text_layer_name', 'Capas de Texto')); ?>" 
                           class="regular-text">
                    <p class="description">Este nombre se mostrará en el control de capas del mapa para las capas de tipo texto.</p>
                </div>

                <table class="widefat">
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Activar</th>
                            <th>Color</th>
                            <th>Título en el Mapa</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($text_fields_for_view as $field):
                            $field_key = $field['name'];
                            $is_active = isset($saved_settings[$field_key]['active']) && $saved_settings[$field_key]['active'] === 'on';
                            $saved_color = isset($saved_settings[$field_key]['color']) ? $saved_settings[$field_key]['color'] : '#000000';
                            $saved_label = isset($saved_settings[$field_key]['label']) ? $saved_settings[$field_key]['label'] : $field['label'];
                        ?>
                            <tr>
                                <td><?php echo esc_html($field['label']); ?></td>
                                <td>
                                    <input type="hidden" name="text_layers[<?php echo esc_attr($field_key); ?>][active]" value="off">
                                    <input type="checkbox"
                                           name="text_layers[<?php echo esc_attr($field_key); ?>][active]"
                                           <?php checked($is_active); ?>
                                           value="on">
                                </td>
                                <td>
                                    <input type="color"
                                           name="text_layers[<?php echo esc_attr($field_key); ?>][color]"
                                           value="<?php echo esc_attr($saved_color); ?>">
                                </td>
                                <td>
                                    <input type="text"
                                           name="text_layers[<?php echo esc_attr($field_key); ?>][label]"
                                           value="<?php echo esc_attr($saved_label); ?>"
                                           class="regular-text">
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>

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