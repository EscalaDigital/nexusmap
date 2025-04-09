var map;
var overlay;
// Crear objetos para las capas base y overlays
var baseLayers = {};
var overlays = {};
var controlLayers;

// contenedor de marcadores
var markersLayer;
var allMarkers = [];

jQuery(document).ready(function ($) {
    if (jQuery('#nm-main-map').length) {

        map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);



        // Crear el contenedor de controles si aún no existe
        if (jQuery('#nm-top-controls').length === 0) {
            jQuery('#nm-main-map').append('<div id="nm-top-controls" class="nm-top-controls"></div>');
        }

        // Referencia al contenedor de controles
        var $topControls = jQuery('#nm-top-controls');

        // Botón de descarga de GeoJSON
        if (nmMapData.enable_geojson_download) {
            var $downloadButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Descargar GeoJSON',
                html: '<i class="fa fa-download"></i>'
            });
            $downloadButton.on('click', function (e) {
                e.stopPropagation(); // Evita que el evento se propague al mapa
                downloadGeoJson();
            });
            $topControls.append($downloadButton);
        }
        // Botón de búsqueda y campo de entrada
        if (nmMapData.enable_search) {
            var $searchContainer = jQuery('<div>', { class: 'nm-search-container' });
            var $searchButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Buscar',
                html: '<i class="fa fa-search"></i>'
            });
            $searchButton.on('click', function (e) {
                e.stopPropagation();
                toggleSearchInput();
            });
            $searchContainer.append($searchButton);

            var $searchInput = jQuery('<input>', {
                type: 'text',
                class: 'nm-search-input',
                placeholder: 'Buscar ubicación...'
            }).hide();

            $searchInput.on('keypress', function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    performSearch($searchInput.val());
                }
            });

            $searchContainer.append($searchInput);

            $topControls.append($searchContainer);
        }

        // Botón para añadir capas WMS
        if (nmMapData.enable_user_wms) {
            var $addWmsButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Añadir capa WMS',
                html: '<i class="fa fa-plus"></i>'
            });
            $addWmsButton.on('click', function (e) {
                e.stopPropagation(); // Evita que el evento se propague al mapa
                showAddWmsForm();
            });
            $topControls.append($addWmsButton);
        }

        // Asegurarse de que el contenedor del mapa tiene posición relativa
        jQuery('#nm-main-map').css('position', 'relative');

        // Agregar las capas base
        if (Array.isArray(nmMapData.base_layers) && nmMapData.base_layers.length > 0) {

            nmMapData.base_layers.forEach(function (layer) {
                var tileLayer = L.tileLayer(layer.url, {
                    attribution: layer.attribution || ''
                    // Puedes agregar más opciones aquí
                });
                baseLayers[layer.name] = tileLayer;

            });

            // Agregar la primera capa base al mapa por defecto
            var firstBaseLayer = baseLayers[Object.keys(baseLayers)[0]];

            L.tileLayer(firstBaseLayer._url, {
                attribution: firstBaseLayer.options.attribution
            }).addTo(map);

        } else {
            // Si no hay capas base definidas, usar una por defecto
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
        }

        // Agregar las capas overlay
        if (Array.isArray(nmMapData.overlay_layers) && nmMapData.overlay_layers.length > 0) {
            nmMapData.overlay_layers.forEach(function (layer) {

                if (layer.type === 'geojson') {
                    // Cargar la capa GeoJSON
                    overlay = L.geoJSON(null); // Inicialmente vacía
                    // Cargar los datos GeoJSON desde la URL
                    $.getJSON(layer.url, function (data) {
                        overlay.addData(data);
                    });
                } else if (layer.type === 'wms') {
                    // Agregar capa WMS
                    overlay = L.tileLayer.wms(layer.url, {
                        layers: layer.wms_layer_name, // Nombre de la capa WMS especificada
                        format: 'image/png',
                        transparent: true,
                        attribution: layer.attribution || ''
                        // Puedes agregar más opciones aquí
                    });
                }
                overlays[layer.name] = overlay;

            });
        }

        // Agregar controles de capas
        controlLayers = L.control.layers(baseLayers, overlays).addTo(map);

        // Funciones de Filtros
        function createFilterPanel() {
            // Verificar si hay configuración de filtros
            if (!nmMapData.filter_settings || nmMapData.filter_settings.length === 0) {
                return;
            }

            // Crear el control personalizado de Leaflet
            const FilterControl = L.Control.extend({
                options: {

                    position: 'topleft' // Cambiamos la posición del botón a topright
                },

                onAdd: function (map) {
                    const container = L.DomUtil.create('div', 'nm-filters-container');

                    // Crear el botón de toggle
                    const toggleButton = L.DomUtil.create('div', 'nm-filters-toggle', container);
                    toggleButton.innerHTML = 'Filtros';

                    // Crear el panel de filtros con posición absoluta
                    const filterPanel = L.DomUtil.create('div', 'nm-filters-panel collapsed', container);



                    // Crear el encabezado
                    const header = `
                        <div class="nm-filters-header">
                            <h3 class="nm-filters-title">Filtros disponibles</h3>
                            <button class="nm-close-filters">×</button>
                        </div>
                    `;

                    // Crear el contenido de filtros
                    let filterContent = '';
                    nmMapData.filter_settings.forEach(filter => {
                        filterContent += `
                            <div class="nm-filter-group" data-field="${filter.field}">
                                <span class="nm-filter-label">${filter.button_text}</span>
                                <div class="nm-filter-options">
                                    ${filter.options.map(option => `
                                        <button class="nm-filter-button" 
                                                data-field="${filter.field}" 
                                                data-value="${option}"
                                                style="background-color: ${filter.style?.background || '#fff'}; 
                                                       color: ${filter.style?.color || '#000'}">${option}</button>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    });

                    // Agregar contador
                    filterContent += `
                        <div class="nm-filter-count">
                            Puntos mostrados: <span id="nm-points-count">0</span>
                        </div>
                    `;

                    filterPanel.innerHTML = header + filterContent;

                    // Prevenir que los clicks en el control se propaguen al mapa
                    L.DomEvent.disableClickPropagation(container);
                    L.DomEvent.disableScrollPropagation(container);

                    // Eventos
                    toggleButton.addEventListener('click', () => {
                        filterPanel.classList.toggle('collapsed');
                    });

                    container.querySelector('.nm-close-filters').addEventListener('click', () => {
                        filterPanel.classList.add('collapsed');
                    });

                    // Manejar clicks en los filtros
                    const activeFilters = {};
                    container.addEventListener('click', (e) => {
                        if (e.target.classList.contains('nm-filter-button')) {
                            const button = e.target;
                            const field = button.dataset.field;
                            const value = button.dataset.value;

                            button.classList.toggle('active');

                            if (!activeFilters[field]) {
                                activeFilters[field] = new Set();
                            }

                            if (button.classList.contains('active')) {
                                activeFilters[field].add(value);
                            } else {
                                activeFilters[field].delete(value);
                                if (activeFilters[field].size === 0) {
                                    delete activeFilters[field];
                                }
                            }

                            updateVisiblePoints(activeFilters);
                        }
                    });

                    return container;
                }
            });

            // Añadir el control al mapa
            map.addControl(new FilterControl());
        }


        function updateVisiblePoints(activeFilters) {
            let visibleCount = 0;

            // Primero, limpiar todas las capas
            markersLayer.clearLayers();

            // Recorrer todos los marcadores guardados
            allMarkers.forEach(function (marker) {
                let visible = true;

                // Debug para ver las propiedades del marcador
                console.log('Marker properties:', marker.feature.properties);

                for (const field in activeFilters) {
                    if (activeFilters[field].size > 0) {
                        // Añadir prefijo 'nm_' al campo
                        const fieldName = 'nm_' + field;
                        const fieldValue = marker.feature.properties[fieldName];

                        console.log('Checking field:', fieldName, 'Value:', fieldValue, 'Active values:', Array.from(activeFilters[field]));

                        if (!fieldValue || !activeFilters[field].has(fieldValue.toString())) {
                            visible = false;
                            break;
                        }
                    }
                }

                if (visible) {
                    markersLayer.addLayer(marker);
                    visibleCount++;
                }
            });

            console.log('Visible points:', visibleCount);
            document.getElementById('nm-points-count').textContent = visibleCount;
        }

        // Llamar a la función después de inicializar el mapa
        createFilterPanel();


        // Load points via AJAX
        $.post(nmMapData.ajax_url, {
            action: 'nm_get_map_points',
            nonce: nmMapData.nonce
        }, function (response) {
            console.log('Response received:', response);

            if (response && response.features) {
                var layerGroups = {};
                var firstLayer = true;

                // Crear markersLayer como contenedor principal
                markersLayer = L.featureGroup().addTo(map);

                // Si hay configuración de capas
                if (Array.isArray(response.layer_settings) && response.layer_settings.length > 0) {
                    console.log('Layer settings found:', response.layer_settings);

                    // Crear un grupo de capa para cada campo configurado
                    response.layer_settings.forEach(function (layerConfig) {
                        layerGroups[layerConfig.field] = L.layerGroup();
                    });

                    // Procesar cada feature
                    response.features.forEach(function (feature) {
                        console.log('Processing feature:', feature);

                        if (feature.properties && Array.isArray(feature.properties.layers) && feature.properties.layers.length > 0) {
                            // El feature puede estar en una o varias capas
                            feature.properties.layers.forEach(function (layerDef) {
                                var marker = L.circleMarker([
                                    feature.geometry.coordinates[1],
                                    feature.geometry.coordinates[0]
                                ], {
                                    radius: 8,
                                    fillColor: layerDef.layer_color || '#ff0000',
                                    color: "#000",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });

                                // Añadir datos originales
                                marker.feature = feature;

                                // Popup / click
                                marker.on('click', function () {
                                    showModal(feature.properties);
                                });

                                // Añadir a la capa correspondiente
                                var layerLabel = layerDef.layer_type === 'text' 
                                    ? layerDef.layer_label 
                                    : layerDef.layer_field;
                                    
                                if (layerGroups[layerDef.layer_field]) {
                                    layerGroups[layerDef.layer_field].addLayer(marker);
                                }

                                // Además, lo agregas al featureGroup principal
                                markersLayer.addLayer(marker);
                                allMarkers.push(marker);
                            });
                        }
                    });

                    // Añadir grupos de capas al control y al mapa
                    response.layer_settings.forEach(function (layerConfig) {
                        if (firstLayer) {
                            layerGroups[layerConfig.field].addTo(map);
                            firstLayer = false;
                        }
                        
                        var layerLabel = layerConfig.type === 'text'
                            ? layerConfig.label
                            : layerConfig.label || layerConfig.field;
                            
                        overlays[layerLabel] = layerGroups[layerConfig.field];
                    });

                } else {
                    // Si no hay configuración de capas, mostrar puntos normales
                    response.features.forEach(function (feature) {
                        var marker = L.marker([
                            feature.geometry.coordinates[1],
                            feature.geometry.coordinates[0]
                        ]);

                        marker.feature = feature;
                        marker.on('click', function () {
                            showModal(feature.properties);
                        });

                        markersLayer.addLayer(marker);
                        allMarkers.push(marker);
                    });
                }

                // Actualizar el control de capas
                if (controlLayers) {
                    controlLayers.remove();
                }
                controlLayers = L.control.layers(baseLayers, overlays).addTo(map);

                // Inicializar el contador de puntos
                document.getElementById('nm-points-count').textContent = response.features.length;
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        });


        // Botón para ver gráficos






    }

    function showChartsModal(features) {
        if (jQuery('#nm-charts-modal').length === 0) {
            var modalHtml = `
                <div id="nm-charts-modal" class="nm-charts-modal">
                    <div class="nm-modal-content">
                        <span class="nm-modal-close">&times;</span>
                        <div id="nm-charts-container"></div>
                    </div>
                </div>
            `;
            jQuery('#nm-main-map').append(modalHtml);
        }
    
        var $modal = jQuery('#nm-charts-modal');
        $modal.show();
        
        // Forzar un reflow antes de añadir la clase active
        void $modal[0].offsetWidth;
        $modal.addClass('active');
        
        processCharts(features);
    
        jQuery('#nm-charts-modal .nm-modal-close').off('click').on('click', function() {
            $modal.removeClass('active');
            setTimeout(function() {
                $modal.hide();
            }, 300);
        });
    }

    function processCharts(features) {
        const chartsContainer = document.getElementById('nm-charts-container');
        chartsContainer.innerHTML = '';
    
        nmMapData.chart_settings.forEach((chartConfig, index) => {
            const canvasWrapper = document.createElement('div');
            canvasWrapper.style.height = '100%';
            
            // Añadir título del gráfico al wrapper
            const titleDiv = document.createElement('div');
            titleDiv.style.textAlign = 'center';
            titleDiv.style.marginBottom = '10px';
            titleDiv.style.fontWeight = 'bold';
            titleDiv.textContent = chartConfig.title;
            canvasWrapper.appendChild(titleDiv);
    
            const canvas = document.createElement('canvas');
            canvas.id = `chart-${index}`;
            canvasWrapper.appendChild(canvas);
            chartsContainer.appendChild(canvasWrapper);
    
            const data = processChartData(chartConfig, features);
            createChart(canvas, chartConfig, data);
        });
    }

    function processChartData(chartConfig, features) {
        const data = {
            labels: [],
            datasets: []
        };
    
        // Agrupar datos por categoría
        const groupedData = {};
    
        features.forEach(feature => {
            const categoryFieldName = `nm_${chartConfig.category_field}`;
            const categoryFieldName2 = chartConfig.category_field_2 ? `nm_${chartConfig.category_field_2}` : null;
    
            const rawCategoryValue = feature.properties[categoryFieldName];
            const rawCategoryValue2 = categoryFieldName2 ? feature.properties[categoryFieldName2] : null;
    
            if (!rawCategoryValue) return;
    
            const categoryValue = Array.isArray(rawCategoryValue) ? rawCategoryValue[0] : rawCategoryValue;
            
            // Usar categoryValue como clave en lugar de la combinación
            if (!groupedData[categoryValue]) {
                groupedData[categoryValue] = {
                    numeric1: [],
                    numeric2: [],
                    category2: rawCategoryValue2 // Guardamos el segundo valor de categoría
                };
            }
    
            const numericFieldName = `nm_${chartConfig.numeric_field1.replace(/\s+/g, '_')}`;
            const numeric1Value = parseFloat(feature.properties[numericFieldName]);
    
            if (!isNaN(numeric1Value)) {
                groupedData[categoryValue].numeric1.push(numeric1Value);
            }
    
            if (chartConfig.numeric_field2) {
                const numeric2FieldName = `nm_${chartConfig.numeric_field2.replace(/\s+/g, '_')}`;
                const numeric2Value = parseFloat(feature.properties[numeric2FieldName]);
                if (!isNaN(numeric2Value)) {
                    groupedData[categoryValue].numeric2.push(numeric2Value);
                }
            }
        });
    
        // Generar labels
        data.labels = Object.keys(groupedData).map(key => {
            if (chartConfig.category_field_2 && groupedData[key].category2) {
                return `${key} (${groupedData[key].category2})`;
            }
            return key;
        });
    
        // Dataset para numeric_field1
        data.datasets.push({
            label: chartConfig.numeric_field1,
            data: Object.keys(groupedData).map(key => {
                const values = groupedData[key].numeric1;
                return values.length ? values.reduce((a, b) => a + b) : 0;
            }),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        });
    
        if (chartConfig.numeric_field2) {
            data.datasets.push({
                label: chartConfig.numeric_field2,
                data: Object.keys(groupedData).map(key => {
                    const values = groupedData[key].numeric2;
                    return values.length ? values.reduce((a, b) => a + b) : 0;
                }),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            });
        }
    
        console.log('Datos procesados para el gráfico:', data);
        return data;
    }

       function createChart(canvas, chartConfig, data) {
        const ctx = canvas.getContext('2d');
        
        // Configuración base para las opciones
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartConfig.title
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: chartConfig.numeric_field1
                    }
                }
            }
        };
    
        // Si es tipo mixto, configurar datasets específicamente
        if (chartConfig.chart_type === 'mixed') {
            // Configurar el primer dataset como barras
            if (data.datasets[0]) {
                data.datasets[0].type = 'bar';
                data.datasets[0].yAxisID = 'y';
                data.datasets[0].order = 2; // Las barras detrás
            }
            
            // Configurar el segundo dataset como línea
            if (data.datasets[1]) {
                data.datasets[1].type = 'line';
                data.datasets[1].fill = false;
                data.datasets[1].yAxisID = 'y1';
                data.datasets[1].order = 1; // La línea delante
                
                // Añadir segundo eje Y
                options.scales.y1 = {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: chartConfig.numeric_field2
                    },
                    grid: {
                        drawOnChartArea: false // Solo mostrar la cuadrícula para el eje principal
                    }
                };
            }
            
            // Usar 'bar' como tipo base
            chartConfig.chart_type = 'bar';
        }
    
        // Si hay segundo campo de categoría, rotar etiquetas
        if (chartConfig.category_field_2) {
            options.scales.x = {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            };
        }
    
        // Crear el gráfico
        new Chart(ctx, {
            type: chartConfig.chart_type,
            data: data,
            options: options
        });
    }
});








