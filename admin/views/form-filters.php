<style>
.nm-admin-wrapper {
    max-width: 1200px;
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nm-admin-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.nm-admin-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.nm-admin-header p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 16px;
}

.nm-filters-content {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.nm-filters-content:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.nm-filters-table {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    width: 100%;
}

.nm-filters-table th {
    background: #f8fafc;
    color: #374151;
    font-weight: 600;
    padding: 15px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
}

.nm-filters-table td {
    padding: 15px;
    border-bottom: 1px solid #f1f3f4;
}

.nm-filters-table tr:hover {
    background: #f8fafc;
}

.filter-config input[type="text"],
.filter-config input[type="color"] {
    padding: 8px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background: white;
    width: 100%;
    max-width: 200px;
}

.filter-config input[type="text"]:focus,
.filter-config input[type="color"]:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-config label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
    display: block;
}

.filter-config p {
    margin-bottom: 15px;
}

.nm-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 30px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.nm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    color: white;
}

.filter-status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.filter-status-active {
    background: #d1fae5;
    color: #065f46;
}

.filter-status-inactive {
    background: #fee2e2;
    color: #991b1b;
}

.conditional-field-row {
    background: #fafbfc;
    border-left: 3px solid #667eea;
}

.conditional-field-info {
    padding-left: 10px;
}

.conditional-field-parent {
    margin-top: 4px;
    padding: 6px 10px;
    background: #f0f4f8;
    border-radius: 4px;
    border-left: 2px solid #667eea;
}

.conditional-field-parent small {
    line-height: 1.4;
}

@media (max-width: 768px) {
    .nm-admin-header {
        padding: 20px;
    }
    
    .nm-filters-content {
        padding: 20px;
    }
    
    .nm-filters-table {
        font-size: 14px;
    }
    
    .nm-filters-table th,
    .nm-filters-table td {
        padding: 10px;
    }
}
</style>

<div class="wrap nm-admin-wrapper">
    <div class="nm-admin-header">
        <h1>Gestor de Filtros del Mapa</h1>
        <p>Configura los filtros interactivos que aparecerán en tu mapa para mejorar la experiencia del usuario</p>
    </div>

    <?php if (!empty($this->valid_fields)): ?>
        <div class="nm-filters-content">
            <form id="nm-filter-settings" method="post">
                <?php
                $saved_settings = get_option('nm_filter_settings', array());
                ?>
                <table class="nm-filters-table">
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Configuración</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        foreach ($this->valid_fields as $field):
                            // Usar unique_name para campos condicionales, o name para campos normales
                            $field_key = isset($field['unique_name']) ? $field['unique_name'] : $field['name'];
                            $is_active = isset($saved_settings[$field_key]['active']) && $saved_settings[$field_key]['active'];
                            $is_conditional = isset($field['is_conditional']) && $field['is_conditional'];
                        ?>
                            <tr class="<?php echo $is_conditional ? 'conditional-field-row' : ''; ?>">
                                <td>
                                    <?php if ($is_conditional): ?>
                                        <div class="conditional-field-info">
                                            <strong><?php echo esc_html($field['label']); ?></strong>
                                            <div class="conditional-field-parent">
                                                <small style="color: #666; display: block; margin-top: 2px;">
                                                    📋 Campo condicional de: <strong><?php echo esc_html($field['parent_label']); ?></strong>
                                                    <br>🎯 Opción: <strong><?php echo esc_html($field['parent_option_label']); ?></strong>
                                                </small>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <strong><?php echo esc_html($field['label']); ?></strong>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <span class="filter-status-badge" style="background: #f1f5f9; color: #374151;">
                                        <?php echo esc_html($field['type']); ?>
                                        <?php if ($is_conditional): ?>
                                            <span style="margin-left: 4px; font-size: 10px;">🔗</span>
                                        <?php endif; ?>
                                    </span>
                                </td>
                                <td>
                                    <input type="hidden" name="filters[<?php echo esc_attr($field_key); ?>][active]" value="off">
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="checkbox"
                                               name="filters[<?php echo esc_attr($field_key); ?>][active]"
                                               <?php checked($is_active); ?>
                                               value="on"
                                               style="transform: scale(1.2);">
                                        <span class="filter-status-badge <?php echo $is_active ? 'filter-status-active' : 'filter-status-inactive'; ?>">
                                            <?php echo $is_active ? '✓ Activo' : '✗ Inactivo'; ?>
                                        </span>
                                    </label>
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
                                        <?php if ($is_conditional): ?>
                                            <p>
                                                <small style="color: #666; font-style: italic;">
                                                    ⚠️ Este filtro solo estará disponible cuando se seleccione la opción correspondiente en el campo padre.
                                                </small>
                                            </p>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <p class="submit" style="margin-top: 30px;">
                    <button type="submit" class="nm-btn-primary" id="save-filter-settings">
                        💾 Guardar Configuración
                    </button>
                </p>
            </form>
        </div>

        <script>
        jQuery(document).ready(function($) {
            // Mostrar/ocultar configuración y actualizar badge
            $('input[name*="[active]"]').change(function() {
                var $row = $(this).closest('tr');
                var $badge = $row.find('.filter-status-badge').last();
                var $config = $row.find('.filter-config');
                
                if (this.checked) {
                    $config.slideDown();
                    $badge.removeClass('filter-status-inactive').addClass('filter-status-active');
                    $badge.text('✓ Activo');
                } else {
                    $config.slideUp();
                    $badge.removeClass('filter-status-active').addClass('filter-status-inactive');
                    $badge.text('✗ Inactivo');
                }
            });

            // Manejar el guardado
            $('#nm-filter-settings').on('submit', function(e) {
                e.preventDefault();
                
                var $button = $('#save-filter-settings');
                var originalText = $button.text();
                $button.text('🔄 Guardando...').prop('disabled', true);
                
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
                            $button.text('✅ Guardado');
                            setTimeout(function() {
                                $button.text(originalText).prop('disabled', false);
                            }, 2000);
                        } else {
                            alert('Error al guardar la configuración: ' + response.data);
                            $button.text(originalText).prop('disabled', false);
                        }
                    },
                    error: function() {
                        alert('Error al procesar la solicitud');
                        $button.text(originalText).prop('disabled', false);
                    }
                });
            });
        });
        </script>
    <?php endif; ?>
</div>