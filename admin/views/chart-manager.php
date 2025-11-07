<?php

/**
 * HTML con el formulario que permitirá gestionar los gráficos.
 */

// $saved_charts proviene de get_option('nm_chart_settings')
// $numeric_fields y $category_fields provienen del modelo en tu render_charts_page()
?>

<style>
.nm-charts-wrapper {
    max-width: 1200px;
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nm-charts-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.nm-charts-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.nm-charts-header p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 16px;
}

.nm-chart-box {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
}

.nm-chart-box:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.nm-chart-box h3 {
    color: #2c3e50;
    font-size: 20px;
    margin: 0 0 20px 0;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f3f4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.nm-chart-box h3:before {
    content: "📊";
    font-size: 24px;
}

.nm-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.nm-form-group {
    display: flex;
    flex-direction: column;
}

.nm-form-group.full-width {
    grid-column: 1 / -1;
}

.nm-form-group label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
    font-size: 14px;
}

.nm-form-group input,
.nm-form-group select {
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background: white;
}

.nm-form-group input:focus,
.nm-form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.nm-chart-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #f1f3f4;
}

/* Controles avanzados del gráfico */
.nm-advanced-controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 10px; }
.nm-advanced-controls .nm-form-group { margin: 0; }
@media (max-width: 768px){ .nm-advanced-controls { grid-template-columns: 1fr; } }

.nm-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.nm-btn-danger {
    background: #ef4444;
    color: white;
}

.nm-btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
}

.nm-main-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #f1f3f4;
}

.nm-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 30px;
    font-size: 16px;
}

.nm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.nm-btn-secondary {
    background: #f8fafc;
    color: #374151;
    border: 2px solid #e5e7eb;
    padding: 13px 28px;
    font-size: 16px;
}

.nm-btn-secondary:hover {
    background: #f1f5f9;
    border-color: #d1d5db;
}

.nm-empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px dashed #d1d5db;
}

.nm-empty-state h3 {
    color: #6b7280;
    font-size: 18px;
    margin-bottom: 10px;
}

.nm-empty-state p {
    color: #9ca3af;
    margin-bottom: 20px;
}

/* Estilos para campos desactivados */
.nm-form-group select:disabled,
.nm-form-group input:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    border-color: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
}

.nm-form-group label {
    transition: color 0.3s ease;
}

.nm-form-group.disabled label {
    color: #9ca3af;
}

.secondary-field:disabled + label::after {
    content: " (solo para gráficos mixtos)";
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
}

@media (max-width: 768px) {
    .nm-form-grid {
        grid-template-columns: 1fr;
    }
    
    .nm-main-actions {
        flex-direction: column;
    }
    
    .nm-charts-header {
        padding: 20px;
    }
}
</style>

<div class="wrap nm-charts-wrapper">
    <div class="nm-charts-header">
        <h1>Gestor de Gráficos</h1>
        <p>Crea y configura gráficos personalizados para visualizar los datos de tus formularios</p>
    </div>

    <form id="nm-chart-settings" method="post">
        <div id="chart-container">
            <?php if (!empty($saved_charts)): ?>
                <?php foreach ($saved_charts as $index => $chart): ?>
                    <div class="nm-chart-box">
                        <h3>Gráfico <?php echo intval($index + 1); ?></h3>

                        <div class="nm-form-grid">
                            <!-- Título del gráfico -->
                            <div class="nm-form-group full-width">
                                <label for="chart_title_<?php echo $index; ?>">Título del gráfico</label>
                                <input
                                    type="text"
                                    id="chart_title_<?php echo $index; ?>"
                                    name="charts[<?php echo $index; ?>][title]"
                                    value="<?php echo esc_attr($chart['title']); ?>"
                                    placeholder="Ej: Ventas por región"
                                    required />
                            </div>

                            <!-- Campo numérico 1 -->
                            <div class="nm-form-group">
                                <label for="numeric_field1_<?php echo $index; ?>">Campo numérico principal</label>
                                <select id="numeric_field1_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][numeric_field1]">
                                    <option value="">Ninguno (contar ocurrencias)</option>
                                    <?php foreach ($numeric_fields as $field): ?>
                                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" <?php selected($chart['numeric_field1'], $field['name']); ?>>
                                            <?php echo $is_conditional ? '🔗 Sub ' : 'Sumar '; ?><?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <!-- Campo numérico 2 (opcional) -->
                            <div class="nm-form-group">
                                <label for="numeric_field2_<?php echo $index; ?>">Campo numérico secundario (para gráficos mixtos)</label>
                                <select id="numeric_field2_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][numeric_field2]" 
                                        class="secondary-field" <?php echo ($chart['chart_type'] !== 'mixed') ? 'disabled' : ''; ?>>
                                    <option value="">Ninguno</option>
                                    <?php foreach ($numeric_fields as $field): ?>
                                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" <?php selected($chart['numeric_field2'], $field['name']); ?>>
                                            <?php echo $is_conditional ? '🔗 Sub ' : ''; ?><?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <!-- Campo de categoría principal -->
                            <div class="nm-form-group">
                                <label for="category_field_<?php echo $index; ?>">Campo de categoría (Eje X principal) *</label>
                                <select id="category_field_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][category_field]" required>
                                    <option value="">Seleccionar campo...</option>
                                    <?php foreach ($category_fields as $field): ?>
                                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" <?php selected($chart['category_field'], $field['name']); ?>>
                                            <?php echo $is_conditional ? '🔗 Sub ' : ''; ?><?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <!-- Campo de categoría 2 (opcional) -->
                            <div class="nm-form-group">
                                <label for="category_field_2_<?php echo $index; ?>">Segundo campo de categoría (para gráficos mixtos)</label>
                                <select id="category_field_2_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][category_field_2]" 
                                        class="secondary-field" <?php echo ($chart['chart_type'] !== 'mixed') ? 'disabled' : ''; ?>>
                                    <option value="">Ninguno</option>
                                    <?php foreach ($category_fields as $field): ?>
                                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                                        <option value="<?php echo esc_attr($field['name']); ?>" <?php if (isset($chart['category_field_2'])) { selected($chart['category_field_2'], $field['name']); } ?>>
                                            <?php echo $is_conditional ? '🔗 Sub ' : ''; ?><?php echo esc_html($field['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <!-- Tipo de gráfico -->
                            <div class="nm-form-group">
                                <label for="chart_type_<?php echo $index; ?>">Tipo de gráfico *</label>
                                <select id="chart_type_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][chart_type]" 
                                        class="chart-type-selector" required>
                                    <option value="bar" <?php selected($chart['chart_type'], 'bar'); ?>>📊 Barras</option>
                                    <option value="line" <?php selected($chart['chart_type'], 'line'); ?>>📈 Líneas</option>
                                    <option value="pie" <?php selected($chart['chart_type'], 'pie'); ?>>🥧 Circular</option>
                                    <option value="doughnut" <?php selected($chart['chart_type'], 'doughnut'); ?>>🍩 Donut</option>
                                    <option value="polarArea" <?php selected($chart['chart_type'], 'polarArea'); ?>>🧭 Polar Area</option>
                                    <option value="radar" <?php selected($chart['chart_type'], 'radar'); ?>>🕸️ Radar</option>
                                    <option value="mixed" <?php selected($chart['chart_type'], 'mixed'); ?>>📊📈 Mixto (Barras y Líneas)</option>
                                </select>
                            </div>
                        </div>

                        <div class="nm-chart-actions">
                            <div class="nm-advanced-controls">
                                <div class="nm-form-group">
                                    <label for="stacked_<?php echo $index; ?>">Barras apiladas</label>
                                    <select id="stacked_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][stacked]" class="advanced-opt">
                                        <option value="auto" <?php selected(isset($chart['stacked']) ? $chart['stacked'] : 'auto', 'auto'); ?>>Auto</option>
                                        <option value="yes" <?php selected(isset($chart['stacked']) ? $chart['stacked'] : 'auto', 'yes'); ?>>Sí</option>
                                        <option value="no" <?php selected(isset($chart['stacked']) ? $chart['stacked'] : 'auto', 'no'); ?>>No</option>
                                    </select>
                                </div>
                                <div class="nm-form-group">
                                    <label for="value_labels_mode_<?php echo $index; ?>">Etiquetas de valores</label>
                                    <select id="value_labels_mode_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][value_labels_mode]" class="advanced-opt">
                                        <option value="auto" <?php selected(isset($chart['value_labels_mode']) ? $chart['value_labels_mode'] : 'auto', 'auto'); ?>>Auto</option>
                                        <option value="always" <?php selected(isset($chart['value_labels_mode']) ? $chart['value_labels_mode'] : 'auto', 'always'); ?>>Siempre</option>
                                        <option value="never" <?php selected(isset($chart['value_labels_mode']) ? $chart['value_labels_mode'] : 'auto', 'never'); ?>>Nunca</option>
                                    </select>
                                </div>
                                <div class="nm-form-group">
                                    <label for="bar_orientation_<?php echo $index; ?>">Orientación</label>
                                    <select id="bar_orientation_<?php echo $index; ?>" name="charts[<?php echo $index; ?>][bar_orientation]" class="advanced-opt">
                                        <option value="auto" <?php selected(isset($chart['bar_orientation']) ? $chart['bar_orientation'] : 'auto', 'auto'); ?>>Auto</option>
                                        <option value="vertical" <?php selected(isset($chart['bar_orientation']) ? $chart['bar_orientation'] : 'auto', 'vertical'); ?>>Vertical</option>
                                        <option value="horizontal" <?php selected(isset($chart['bar_orientation']) ? $chart['bar_orientation'] : 'auto', 'horizontal'); ?>>Horizontal</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" class="nm-btn nm-btn-danger remove-chart">
                                🗑️ Eliminar Gráfico
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="nm-empty-state">
                    <h3>📊 No hay gráficos configurados</h3>
                    <p>Comienza creando tu primer gráfico para visualizar los datos de tus formularios</p>
                    <button type="button" id="add-chart-empty" class="nm-btn nm-btn-primary">
                        ➕ Crear mi primer gráfico
                    </button>
                </div>
            <?php endif; ?>
        </div>

        <div class="nm-main-actions">
            <button type="button" id="add-chart" class="nm-btn nm-btn-secondary">
                ➕ Añadir Nuevo Gráfico
            </button>
            <button type="submit" class="nm-btn nm-btn-primary">
                💾 Guardar Configuración
            </button>
        </div>
    </form>
</div>

<!-- Plantilla para nuevos gráficos (se clona al pulsar "Añadir Gráfico") -->
<script type="text/template" id="chart-template">
    <div class="nm-chart-box">
        <h3>Nuevo Gráfico</h3>
        
        <div class="nm-form-grid">
            <!-- Título del gráfico -->
            <div class="nm-form-group full-width">
                <label>Título del gráfico</label>
                <input type="text" name="charts[{index}][title]" placeholder="Ej: Ventas por región" required />
            </div>

            <!-- Campo numérico 1 -->
            <div class="nm-form-group">
                <label>Campo numérico principal</label>
                <select name="charts[{index}][numeric_field1]">
                    <option value="">Ninguno (contar ocurrencias)</option>
                    <?php foreach ($numeric_fields as $field): ?>
                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                        <option value="<?php echo esc_attr($field['name']); ?>">
                            <?php echo $is_conditional ? '🔗 Sub ' : 'Sumar '; ?><?php echo esc_html($field['label']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Campo numérico 2 -->
            <div class="nm-form-group">
                <label>Campo numérico secundario (para gráficos mixtos)</label>
                <select name="charts[{index}][numeric_field2]" class="secondary-field" disabled>
                    <option value="">Ninguno</option>
                    <?php foreach ($numeric_fields as $field): ?>
                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                        <option value="<?php echo esc_attr($field['name']); ?>">
                            <?php echo $is_conditional ? '🔗 Sub ' : ''; ?><?php echo esc_html($field['label']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Campo de categoría principal -->
            <div class="nm-form-group">
                <label>Campo de categoría (Eje X principal) *</label>
                <select name="charts[{index}][category_field]" required>
                    <option value="">Seleccionar campo...</option>
                    <?php foreach ($category_fields as $field): ?>
                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                        <option value="<?php echo esc_attr($field['name']); ?>">
                            <?php echo $is_conditional ? '🔗 Sub ' : ''; ?><?php echo esc_html($field['label']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Campo de categoría 2 opcional -->
            <div class="nm-form-group">
                <label>Segundo campo de categoría (para gráficos mixtos)</label>
                <select name="charts[{index}][category_field_2]" class="secondary-field" disabled>
                    <option value="">Ninguno</option>
                    <?php foreach ($category_fields as $field): ?>
                        <?php $is_conditional = !empty($field['is_conditional']); ?>
                        <option value="<?php echo esc_attr($field['name']); ?>">
                            <?php echo $is_conditional ? '🔗 Sub ' : ''; ?><?php echo esc_html($field['label']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Tipo de gráfico -->
            <div class="nm-form-group">
                <label>Tipo de gráfico *</label>
                <select name="charts[{index}][chart_type]" class="chart-type-selector" required>
                    <option value="bar" selected>📊 Barras</option>
                    <option value="line">📈 Líneas</option>
                    <option value="pie">🥧 Circular</option>
                    <option value="doughnut">🍩 Donut</option>
                    <option value="polarArea">🧭 Polar Area</option>
                    <option value="radar">🕸️ Radar</option>
                    <option value="mixed">📊📈 Mixto (Barras y Líneas)</option>
                </select>
            </div>
        </div>

        <div class="nm-chart-actions">
            <div class="nm-advanced-controls">
                <div class="nm-form-group">
                    <label>Barras apiladas</label>
                    <select name="charts[{index}][stacked]" class="advanced-opt">
                        <option value="auto" selected>Auto</option>
                        <option value="yes">Sí</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <div class="nm-form-group">
                    <label>Etiquetas de valores</label>
                    <select name="charts[{index}][value_labels_mode]" class="advanced-opt">
                        <option value="auto" selected>Auto</option>
                        <option value="always">Siempre</option>
                        <option value="never">Nunca</option>
                    </select>
                </div>
                <div class="nm-form-group">
                    <label>Orientación</label>
                    <select name="charts[{index}][bar_orientation]" class="advanced-opt">
                        <option value="auto" selected>Auto</option>
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                    </select>
                </div>
            </div>
            <button type="button" class="nm-btn nm-btn-danger remove-chart">
                🗑️ Eliminar Gráfico
            </button>
        </div>
    </div>
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const addChartBtn = document.getElementById('add-chart');
    const chartContainer = document.getElementById('chart-container');
    const chartTemplate = document.getElementById('chart-template');
    
    // Función para manejar la activación/desactivación de campos secundarios
    function toggleSecondaryFields(chartBox) {
        const chartTypeSelect = chartBox.querySelector('.chart-type-selector');
        const secondaryFields = chartBox.querySelectorAll('.secondary-field');
        
        if (!chartTypeSelect) return;
        
        // Si no hay valor seleccionado, usar 'bar' por defecto
        const chartType = chartTypeSelect.value || 'bar';
        const isMixed = chartType === 'mixed';
        
        secondaryFields.forEach(field => {
            field.disabled = !isMixed;
            const formGroup = field.closest('.nm-form-group');
            
            if (isMixed) {
                formGroup.classList.remove('disabled');
                field.style.backgroundColor = '';
                field.style.color = '';
                field.style.borderColor = '';
                field.style.opacity = '';
            } else {
                formGroup.classList.add('disabled');
                field.value = ''; // Limpiar valor cuando se desactiva
                field.style.backgroundColor = '#f3f4f6';
                field.style.color = '#9ca3af';
                field.style.borderColor = '#d1d5db';
                field.style.opacity = '0.6';
            }
        });
    }
    
    // Función para añadir un nuevo gráfico
    function addNewChart() {
        const emptyState = document.querySelector('.nm-empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const chartCount = chartContainer.children.length;
        const template = chartTemplate.innerHTML;
        const newChart = template.replace(/{index}/g, chartCount);
        
        chartContainer.insertAdjacentHTML('beforeend', newChart);
        
        // Obtener el nuevo gráfico añadido
        const newChartBox = chartContainer.lastElementChild;
        
        // Asegurar que el tipo "bar" esté seleccionado por defecto
        const chartTypeSelect = newChartBox.querySelector('.chart-type-selector');
        if (chartTypeSelect) {
            chartTypeSelect.value = 'bar';
        }
        
        // Configurar estado inicial (campos secundarios desactivados por defecto)
        toggleSecondaryFields(newChartBox);
        
        // Añadir event listener al selector de tipo de gráfico
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', function() {
                toggleSecondaryFields(newChartBox);
            });
        }
        
        // Añadir event listener al botón de eliminar del nuevo gráfico
        const removeBtn = newChartBox.querySelector('.remove-chart');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                newChartBox.remove();
                updateChartNumbers();
                
                // Si no quedan gráficos, mostrar estado vacío
                if (chartContainer.children.length === 0) {
                    showEmptyState();
                }
            });
        }
        
        updateChartNumbers();
        
        // Scroll suave al nuevo gráfico
        newChartBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Function para mostrar estado vacío
    function showEmptyState() {
        const emptyStateHTML = `
            <div class="nm-empty-state">
                <h3>📊 No hay gráficos configurados</h3>
                <p>Comienza creando tu primer gráfico para visualizar los datos de tus formularios</p>
                <button type="button" id="add-chart-empty" class="nm-btn nm-btn-primary">
                    ➕ Crear mi primer gráfico
                </button>
            </div>
        `;
        chartContainer.innerHTML = emptyStateHTML;
        
        // Re-añadir event listener
        document.getElementById('add-chart-empty').addEventListener('click', addNewChart);
    }
    
    // Función para actualizar numeración de gráficos
    function updateChartNumbers() {
        const charts = chartContainer.querySelectorAll('.nm-chart-box');
        charts.forEach((chart, index) => {
            const title = chart.querySelector('h3');
            if (title && !title.textContent.includes('Nuevo')) {
                title.textContent = `Gráfico ${index + 1}`;
            }
        });
    }
    
    // Inicializar campos secundarios para gráficos existentes
    const existingCharts = chartContainer.querySelectorAll('.nm-chart-box');
    existingCharts.forEach(chartBox => {
        toggleSecondaryFields(chartBox);
        
        const chartTypeSelect = chartBox.querySelector('.chart-type-selector');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', function() {
                toggleSecondaryFields(chartBox);

                // Mostrar/ocultar controles avanzados según tipo
                const adv = chartBox.querySelector('.nm-advanced-controls');
                const t = chartTypeSelect.value;
                if (adv) {
                    adv.style.display = (t === 'bar' || t === 'mixed') ? 'grid' : 'none';
                }
            });
            // Estado inicial
            const advInit = chartBox.querySelector('.nm-advanced-controls');
            if (advInit) {
                advInit.style.display = (chartTypeSelect.value === 'bar' || chartTypeSelect.value === 'mixed') ? 'grid' : 'none';
            }
        }
    });
    
    // Event listeners para botones principales
    if (addChartBtn) {
        addChartBtn.addEventListener('click', addNewChart);
    }
    
    // Event listeners para botones de eliminar existentes
    document.querySelectorAll('.remove-chart').forEach(button => {
        button.addEventListener('click', function() {
            const chartBox = this.closest('.nm-chart-box');
            chartBox.remove();
            updateChartNumbers();
            
            if (chartContainer.children.length === 0) {
                showEmptyState();
            }
        });
    });
    
    // Manejar el caso cuando se carga la página con estado vacío
    const currentEmptyBtn = document.getElementById('add-chart-empty');
    if (currentEmptyBtn) {
        currentEmptyBtn.addEventListener('click', addNewChart);
    }
});
</script>