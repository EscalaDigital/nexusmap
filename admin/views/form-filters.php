<div class="wrap">
    <h1>Gestor de Filtros del Mapa</h1>

    <?php if (!empty($this->valid_fields)): ?>
        <form id="nm-filter-settings" method="post">
            <?php
            $saved_settings = get_option('nm_filter_settings', array());
            ?>
            <table class="widefat">
                <thead>
                    <tr>
                        <th>Campo</th>
                        <th>Tipo</th>
                        <th>Activar</th>
                        <th>Configuración</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    foreach ($this->valid_fields as $field):
                        $field_key = $field['name'];
                        $is_active = isset($saved_settings[$field_key]['active']) && $saved_settings[$field_key]['active'];
                    ?>
                        <tr>
                            <td><?php echo esc_html($field['label']); ?></td>
                            <td><?php echo esc_html($field['type']); ?></td>
                            <td>
                                <input type="hidden" name="filters[<?php echo esc_attr($field_key); ?>][active]" value="off">
                                <input type="checkbox"
                                       name="filters[<?php echo esc_attr($field_key); ?>][active]"
                                       <?php checked($is_active); ?>
                                       value="on">
                            </td>
                            <td class="filter-settings">
                                <div class="filter-config" style="<?php echo $is_active ? '' : 'display:none;'; ?>">
                                    <p>
                                        <label>Texto del botón:
                                            <input type="text"
                                                   name="filters[<?php echo esc_attr($field_key); ?>][button_text]"
                                                   value="<?php echo isset($saved_settings[$field_key]['button_text']) ? esc_attr($saved_settings[$field_key]['button_text']) : esc_attr($field['label']); ?>">
                                        </label>
                                    </p>
                                    <p>
                                        <label>Color de fondo:
                                            <input type="color"
                                                   name="filters[<?php echo esc_attr($field_key); ?>][style][background]"
                                                   value="<?php echo isset($saved_settings[$field_key]['style']['background']) ? esc_attr($saved_settings[$field_key]['style']['background']) : '#ffffff'; ?>">
                                        </label>
                                    </p>
                                    <p>
                                        <label>Color de texto:
                                            <input type="color"
                                                   name="filters[<?php echo esc_attr($field_key); ?>][style][color]"
                                                   value="<?php echo isset($saved_settings[$field_key]['style']['color']) ? esc_attr($saved_settings[$field_key]['style']['color']) : '#000000'; ?>">
                                        </label>
                                    </p>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <p class="submit">
                <button type="submit" class="button button-primary" id="save-filter-settings">
                    Guardar Configuración
                </button>
            </p>
        </form>

        <script>
        jQuery(document).ready(function($) {
            // Mostrar/ocultar configuración
            $('input[name*="[active]"]').change(function() {
                $(this).closest('tr').find('.filter-config').slideToggle(this.checked);
            });

            // Manejar el guardado
            $('#nm-filter-settings').on('submit', function(e) {
                e.preventDefault();
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'nm_save_filter_settings',
                        nonce: '<?php echo wp_create_nonce('nm_admin_nonce'); ?>',
                        settings: $(this).serialize()
                    },
                    success: function(response) {
                        if (response.success) {
                            alert('Configuración guardada correctamente');
                        } else {
                            alert('Error al guardar la configuración: ' + response.data);
                        }
                    },
                    error: function() {
                        alert('Error al procesar la solicitud');
                    }
                });
            });
        });
        </script>

        <style>
        .filter-settings {
            max-width: 300px;
        }
        .filter-config {
            padding: 10px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            margin-top: 5px;
        }
        .filter-config label {
            display: block;
            margin-bottom: 5px;
        }
        .filter-config input[type="text"] {
            width: 100%;
        }
        </style>
    <?php endif; ?>
</div>