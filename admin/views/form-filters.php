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

.drag-handle {
    cursor: move;
    padding: 8px;
    color: #999;
    font-size: 18px;
    transition: color 0.2s;
}

.drag-handle:hover {
    color: #667eea;
}

.filters-table-body {
    position: relative;
}

.filters-table-body tr {
    transition: background-color 0.2s;
}

.filters-table-body tr.dragging {
    opacity: 0.5;
    background: #f0f4f8;
}

.filters-table-body tr.drag-over {
    border-top: 3px solid #667eea;
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
    
    <?php 
    // Contar campos geográficos
    $geo_count = 0;
    if (!empty($this->valid_fields)) {
        foreach ($this->valid_fields as $field) {
            if (isset($field['is_geographic']) && $field['is_geographic']) {
                $geo_count++;
            }
        }
    }
    ?>

    <?php if (!empty($this->valid_fields)): ?>
        <div class="nm-filters-content">
            <div style="background: #f0f4f8; border-left: 4px solid #667eea; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #374151;">
                    <strong>💡 Consejo:</strong> Puedes <strong>arrastrar y soltar</strong> las filas usando el ícono <span style="color: #667eea; font-weight: bold;">⣿</span> para cambiar el orden en que aparecen los filtros en el mapa.
                </p>
            </div>
            
            <?php if ($geo_count > 0): ?>
                <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
                    <p style="margin: 0; color: #0c4a6e;">
                        <strong>🌍 <?php echo $geo_count; ?> filtro(s) geográfico(s) detectado(s)</strong>
                        <br>
                        <small>Los valores se actualizan automáticamente basándose en las entradas aprobadas de los usuarios.</small>
                    </p>
                </div>
            <?php endif; ?>
            
            <form id="nm-filter-settings" method="post">
                <?php
                $saved_settings = get_option('nm_filter_settings', array());
                ?>
                <table class="nm-filters-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">Orden</th>
                            <th>Campo</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Configuración</th>
                        </tr>
                    </thead>
                    <tbody class="filters-table-body">
                        <?php
                        // Ordenar los campos según el orden guardado
                        $ordered_fields = $this->valid_fields;
                        usort($ordered_fields, function($a, $b) use ($saved_settings) {
                            $key_a = isset($a['unique_name']) ? $a['unique_name'] : $a['name'];
                            $key_b = isset($b['unique_name']) ? $b['unique_name'] : $b['name'];
                            $order_a = isset($saved_settings[$key_a]['order']) ? intval($saved_settings[$key_a]['order']) : 999;
                            $order_b = isset($saved_settings[$key_b]['order']) ? intval($saved_settings[$key_b]['order']) : 999;
                            return $order_a - $order_b;
                        });
                        
                        $order_index = 0;
                        foreach ($ordered_fields as $field):
                            $order_index;
                            // Usar unique_name para campos condicionales, o name para campos normales
                            $field_key = isset($field['unique_name']) ? $field['unique_name'] : $field['name'];
                            $is_active = isset($saved_settings[$field_key]['active']) && $saved_settings[$field_key]['active'];
                            $is_conditional = isset($field['is_conditional']) && $field['is_conditional'];
                            $is_geographic = isset($field['is_geographic']) && $field['is_geographic'];
                            $current_order = isset($saved_settings[$field_key]['order']) ? intval($saved_settings[$field_key]['order']) : $order_index;
                        ?>
                            <tr class="<?php echo $is_conditional ? 'conditional-field-row' : ''; ?> <?php echo $is_geographic ? 'geographic-field-row' : ''; ?>" draggable="true" data-field-key="<?php echo esc_attr($field_key); ?>">
                                <td style="text-align: center;">
                                    <span class="drag-handle" title="Arrastra para reordenar">⣿</span>
                                    <input type="hidden" name="filters[<?php echo esc_attr($field_key); ?>][order]" value="<?php echo esc_attr($current_order); ?>" class="filter-order-input">
                                </td>
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
                                    <?php elseif ($is_geographic): ?>
                                        <div class="geographic-field-info">
                                            <strong><?php echo esc_html($field['label']); ?></strong>
                                            <div class="geographic-field-meta">
                                                <small style="color: #666; display: block; margin-top: 2px;">
                                                    🌍 Campo geográfico
                                                    <br>📊 Valores encontrados: <strong style="<?php echo empty($field['options']) ? 'color: #dc2626;' : ''; ?>"><?php echo count($field['options']); ?></strong>
                                                    <?php if (empty($field['options'])): ?>
                                                        <br><span style="color: #dc2626;">⚠️ No hay entradas aprobadas con este campo aún</span>
                                                    <?php endif; ?>
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
                                        <?php if ($is_geographic): ?>
                                            <span style="margin-left: 4px; font-size: 10px;">🌍</span>
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
                                        <?php if ($is_geographic): ?>
                                            <input type="hidden" name="filters[<?php echo esc_attr($field_key); ?>][is_geographic]" value="true">
                                            <input type="hidden" name="filters[<?php echo esc_attr($field_key); ?>][geo_level_index]" value="<?php echo esc_attr($field['geo_level_index']); ?>">
                                            <?php if (isset($field['geo_custom_field_name'])): ?>
                                                <input type="hidden" name="filters[<?php echo esc_attr($field_key); ?>][geo_custom_field_name]" value="<?php echo esc_attr($field['geo_custom_field_name']); ?>">
                                            <?php endif; ?>
                                            <p>
                                                <small style="color: #0066cc; font-style: italic;">
                                                    🌍 Filtro geográfico dinámico: Los valores se actualizan automáticamente según las entradas de los usuarios.
                                                    <?php if (!empty($field['options'])): ?>
                                                        <br><strong>Valores actuales:</strong> <?php echo esc_html(implode(', ', array_slice($field['options'], 0, 5))); ?><?php echo count($field['options']) > 5 ? '...' : ''; ?>
                                                    <?php else: ?>
                                                        <br><span style="color: #dc2626;">⚠️ Aún no hay entradas aprobadas. Los valores aparecerán cuando los usuarios completen el formulario.</span>
                                                    <?php endif; ?>
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
            // Variables para drag and drop
            let draggedRow = null;
            let draggedIndex = null;

            // Configurar drag and drop
            const tbody = document.querySelector('.filters-table-body');
            const rows = tbody.querySelectorAll('tr[draggable="true"]');
            
            rows.forEach((row, index) => {
                row.addEventListener('dragstart', function(e) {
                    draggedRow = this;
                    draggedIndex = index;
                    this.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', this.innerHTML);
                });

                row.addEventListener('dragend', function(e) {
                    this.classList.remove('dragging');
                    
                    // Remover todas las clases drag-over
                    rows.forEach(r => r.classList.remove('drag-over'));
                    
                    // Actualizar los valores de orden
                    updateOrderValues();
                });

                row.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (draggedRow !== this) {
                        this.classList.add('drag-over');
                    }
                });

                row.addEventListener('dragleave', function(e) {
                    this.classList.remove('drag-over');
                });

                row.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.classList.remove('drag-over');
                    
                    if (draggedRow !== this) {
                        // Insertar el elemento arrastrado antes del elemento actual
                        tbody.insertBefore(draggedRow, this);
                    }
                });
            });

            // Función para actualizar los valores de orden después del drag
            function updateOrderValues() {
                const allRows = tbody.querySelectorAll('tr[draggable="true"]');
                allRows.forEach((row, index) => {
                    const orderInput = row.querySelector('.filter-order-input');
                    if (orderInput) {
                        orderInput.value = index + 1;
                    }
                });
            }

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