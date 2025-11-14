<?php

/**
 * Vista para mostrar gráficos en modo privado (solo administrador)
 */

// $saved_charts y $form_data provienen del controller
?>

<style>
.nm-charts-viewer-wrapper {
    max-width: 1400px;
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nm-charts-viewer-header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nm-charts-viewer-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.nm-charts-viewer-header p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 16px;
}

.nm-charts-viewer-header .nm-header-actions {
    display: flex;
    gap: 15px;
}

.nm-charts-viewer-header .nm-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 10px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
}

.nm-charts-viewer-header .nm-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
    text-decoration: none;
}

.nm-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.nm-chart-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.nm-chart-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.nm-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f3f4;
}

.nm-chart-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.nm-chart-download {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.nm-chart-download:hover {
    background: #059669;
    transform: translateY(-1px);
}

.nm-chart-canvas-container {
    height: 400px;
    position: relative;
}

.nm-filter-info {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    text-align: center;
}

.nm-loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 16px;
    color: #6b7280;
}

.nm-no-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    color: #6b7280;
    text-align: center;
}

.nm-no-data h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
}

.nm-no-data p {
    margin: 0;
    font-size: 14px;
}

@media (max-width: 768px) {
    .nm-charts-grid {
        grid-template-columns: 1fr;
    }
    
    .nm-charts-viewer-header {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }
    
    .nm-header-actions {
        flex-direction: column;
    }
}
</style>

<div class="wrap nm-charts-viewer-wrapper">
    <div class="nm-charts-viewer-header">
        <div>
            <h1>📊 Ver Gráficos (Modo Privado)</h1>
            <p>Visualización de gráficos basados en los datos del formulario</p>
        </div>
        <div class="nm-header-actions">
            <a href="<?php echo admin_url('admin.php?page=nm-chart-manager'); ?>" class="nm-btn">
                ⚙️ Configurar Gráficos
            </a>
            <button id="nm-refresh-charts" class="nm-btn" onclick="loadChartsData()">
                🔄 Actualizar Datos
            </button>
        </div>
    </div>

    <div class="nm-filter-info">
        <p><strong>📈 Datos en tiempo real:</strong> Los gráficos muestran todos los datos actuales del formulario sin filtros aplicados.</p>
    </div>

    <div id="nm-charts-container" class="nm-charts-grid">
        <div class="nm-loading-spinner">
            <div>⏳ Cargando gráficos...</div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    loadChartsData();
});

function loadChartsData() {
    const container = document.getElementById('nm-charts-container');
    container.innerHTML = '<div class="nm-loading-spinner"><div>⏳ Cargando gráficos...</div></div>';

    // Hacer petición AJAX para obtener los datos
    jQuery.ajax({
        url: '<?php echo admin_url('admin-ajax.php'); ?>',
        type: 'POST',
        data: {
            action: 'nm_get_chart_data_admin',
            nonce: '<?php echo wp_create_nonce('nm_admin_nonce'); ?>'
        },
        success: function(response) {
            if (response.success && response.data) {
                if (response.data.entries && response.data.entries.length > 0) {
                    renderCharts(response.data.entries, response.data.charts);
                } else {
                    showNoDataMessage();
                }
            } else {
                console.error('Error en la respuesta:', response.data || response);
                showErrorMessage('Error: ' + (response.data || 'Respuesta inválida'));
            }
        },
        error: function(xhr, status, error) {
            console.error('Error AJAX:', error, status, xhr);
            showErrorMessage('Error de conexión: ' + error);
        }
    });
}

function renderCharts(entries, chartConfigs) {
    const container = document.getElementById('nm-charts-container');
    container.innerHTML = '';

    if (!chartConfigs || chartConfigs.length === 0) {
        container.innerHTML = `
            <div class="nm-no-data" style="grid-column: 1 / -1;">
                <h3>📊 No hay gráficos configurados</h3>
                <p>Ve a <a href="<?php echo admin_url('admin.php?page=nm-chart-manager'); ?>">Configurar Gráficos</a> para crear tu primer gráfico</p>
            </div>
        `;
        return;
    }

    chartConfigs.forEach((chartConfig, index) => {
        const chartCard = document.createElement('div');
        chartCard.className = 'nm-chart-card';
        chartCard.innerHTML = `
            <div class="nm-chart-header">
                <h3 class="nm-chart-title">${chartConfig.title}</h3>
                <button class="nm-chart-download" onclick="exportChartToPDF(document.getElementById('chart-${index}'), '${chartConfig.title}')">
                    📥 Descargar PDF
                </button>
            </div>
            <div class="nm-chart-canvas-container">
                <canvas id="chart-${index}"></canvas>
            </div>
        `;
        container.appendChild(chartCard);

        // Procesar datos y crear gráfico
        const chartData = processChartData(chartConfig, entries);
        createChart(document.getElementById(`chart-${index}`), chartConfig, chartData);
    });
}

function processChartData(chartConfig, entries) {
    const data = {
        labels: [],
        datasets: []
    };

    // Convertir entries a features para usar la misma lógica que el frontend
    const features = entries.map(entry => ({
        properties: entry.custom_fields || {}
    }));

    // Agrupar datos por categoría
    const groupedData = {};
    const isCountMode = !chartConfig.numeric_field1;
    const categoryFieldName = `nm_${chartConfig.category_field}`;

    features.forEach(feature => {
        // Los datos vienen con prefijo nm_ del frontend
        let categoryValue = feature.properties[categoryFieldName];
        
        const valuesArray = Array.isArray(categoryValue) ? categoryValue : [categoryValue];
        valuesArray.forEach(singleVal => {
            const categoryKey = (singleVal !== undefined && singleVal !== null) ? String(singleVal) : 'Sin valor';
            if (!groupedData[categoryKey]) {
                groupedData[categoryKey] = { count: 0, numeric1: [], numeric2: [] };
            }
            groupedData[categoryKey].count++;
            if (!isCountMode) {
                const numericFieldName1 = `nm_${chartConfig.numeric_field1}`;
                const numeric1Value = parseFloat(feature.properties[numericFieldName1]);
                
                if (!isNaN(numeric1Value)) groupedData[categoryKey].numeric1.push(numeric1Value);
                
                if (chartConfig.numeric_field2) {
                    const numericFieldName2 = `nm_${chartConfig.numeric_field2}`;
                    const numeric2Value = parseFloat(feature.properties[numericFieldName2]);
                    
                    if (!isNaN(numeric2Value)) groupedData[categoryKey].numeric2.push(numeric2Value);
                }
            }
        });
    });

    const finalOrderedKeys = Object.keys(groupedData).sort((a, b) => {
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }
        return a.localeCompare(b);
    });

    data.labels = finalOrderedKeys;

    if (isCountMode) {
        // Generar colores
        const colors = generateColors(finalOrderedKeys.length);
        
        data.datasets.push({
            label: 'Cantidad',
            data: finalOrderedKeys.map(key => groupedData[key].count),
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.8', '1')),
            borderWidth: 2
        });
    } else {
        // Sumar valores numéricos
        data.datasets.push({
            label: chartConfig.numeric_field1,
            data: finalOrderedKeys.map(key => {
                const values = groupedData[key].numeric1;
                return values.length > 0 ? values.reduce((a, b) => a + b, 0) : 0;
            }),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2
        });

        if (chartConfig.numeric_field2) {
            data.datasets.push({
                label: chartConfig.numeric_field2,
                data: finalOrderedKeys.map(key => {
                    const values = groupedData[key].numeric2;
                    return values.length > 0 ? values.reduce((a, b) => a + b, 0) : 0;
                }),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            });
        }
    }

    return data;
}

function createChart(canvas, config, data) {
    new Chart(canvas, {
        type: config.chart_type === 'mixed' ? 'bar' : config.chart_type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: false
                }
            },
            scales: config.chart_type === 'pie' || config.chart_type === 'doughnut' ? {} : {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateColors(count) {
    const colors = [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)', 
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(251, 113, 133, 0.8)'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

function showNoDataMessage() {
    document.getElementById('nm-charts-container').innerHTML = `
        <div class="nm-no-data" style="grid-column: 1 / -1;">
            <h3>📊 No hay datos disponibles</h3>
            <p>No se encontraron entradas del formulario para mostrar en los gráficos</p>
        </div>
    `;
}

function showErrorMessage(message = 'Hubo un problema al obtener los datos') {
    document.getElementById('nm-charts-container').innerHTML = `
        <div class="nm-no-data" style="grid-column: 1 / -1;">
            <h3>❌ Error al cargar datos</h3>
            <p>${message}. <button onclick="loadChartsData()" style="background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer;">Intentar de nuevo</button></p>
        </div>
    `;
}

// Función para exportar gráficos a PDF (simplificada)
function exportChartToPDF(canvas, title) {
    if (!canvas) return;
    
    // Crear enlace de descarga de la imagen
    const link = document.createElement('a');
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}
</script>