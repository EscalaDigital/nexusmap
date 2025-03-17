<div class="wrap">
    <h1>Gestor de Capas del Mapa</h1>
    
    <?php if (!empty($this->valid_fields)): ?>
        <form id="nm-layer-settings" method="post">
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
                $saved_settings = get_option('nm_layer_settings', array());
                foreach ($this->valid_fields as $field): 
                    $field_key = $field['name'];
                    $is_active = isset($saved_settings[$field_key]['active']) ? $saved_settings[$field_key]['active'] : false;
                ?>
                    <tr>
                        <td><?php echo esc_html($field['label']); ?></td>
                        <td><?php echo esc_html($field['type']); ?></td>
                        <td>
                            <input type="checkbox" 
                                   name="layers[<?php echo esc_attr($field_key); ?>][active]" 
                                   <?php checked($is_active); ?>>
                        </td>
                        <td class="color-settings">
                            <?php 
                            if (isset($field['options']) && is_array($field['options'])):
                                foreach ($field['options'] as $value => $label):
                                    $current_color = isset($saved_settings[$field_key]['colors'][$value]) 
                                        ? $saved_settings[$field_key]['colors'][$value] 
                                        : '#' . substr(md5($value), 0, 6);
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