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

        map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);        // Crear el contenedor de controles si aún no existe
        if (jQuery('#nm-top-controls').length === 0) {
            jQuery('#nm-main-map').append('<div id="nm-top-controls" class="nm-top-controls"></div>');
        }

        // Referencia al contenedor de controles
        var $topControls = jQuery('#nm-top-controls');

        // Crear botón de leyenda
        var $legendButton = jQuery('<button>', {
            class: 'nm-control-button',
            title: 'Leyenda',
            html: '<i class="fa fa-list"></i>'
        });

        // Crear panel de leyenda
        var legendPanel = document.createElement('div');
        legendPanel.className = 'legend-panel';
        legendPanel.style.zIndex = 1000;

        // Asegurarse de que el contenedor del mapa tenga posición relativa
        jQuery('#nm-main-map').css('position', 'relative');

        // Agregar el botón al contenedor de controles y el panel al mapa
        $topControls.append($legendButton);
        document.querySelector('#nm-main-map').appendChild(legendPanel);

        // Manejar el clic en el botón de leyenda
        $legendButton.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            legendPanel.classList.toggle('visible');
            if (legendPanel.classList.contains('visible') && window.updateLegend) {
                window.updateLegend();
            }
        });

        // Cerrar la leyenda al hacer clic fuera de ella
        document.addEventListener('click', function (e) {
            if (!$legendButton[0].contains(e.target) && !legendPanel.contains(e.target)) {
                legendPanel.classList.remove('visible');
            }
        });

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
                    overlay = L.geoJSON(null, {
                        style: {
                            color: layer.border_color || '#000000',
                            fillColor: layer.color || '#ff0000',
                            weight: layer.border_width || 2,
                            opacity: layer.opacity || 1,
                            fillOpacity: layer.fill ? (layer.bg_opacity || 0.5) : 0, // Si fill es false, fillOpacity será 0
                            fill: layer.fill // Nueva propiedad
                        }
                    });

                    // Cargar los datos GeoJSON
                    $.getJSON(layer.url, function (data) {
                        overlay.addData(data);
                    });

                    if (layer.active) {
                        overlay.addTo(map);
                    }
                } else if (layer.type === 'wms') {
                    overlay = L.tileLayer.wms(layer.url, {
                        layers: layer.wms_layer_name,
                        format: 'image/png',
                        transparent: true,
                        opacity: layer.opacity || 1
                    });

                    if (layer.active) {
                        overlay.addTo(map);
                    }
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

            // Crear el contenedor de filtros
            var $filterContainer = jQuery('<div>', { class: 'nm-filters-container' });

            // Crear botón de filtros
            var $filterButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Filtros',
                html: '<i class="fa fa-filter"></i>'
            });
            $filterContainer.append($filterButton);

            // Crear el panel de filtros
            var $filterPanel = jQuery('<div>', {
                class: 'nm-filters-panel collapsed',
                css: { zIndex: 1000 }
            });

            // Crear el encabezado
            var header = `
                <div class="nm-filters-header">
                    <h3 class="nm-filters-title">Filtros disponibles</h3>
                    <button class="nm-close-filters">×</button>
                </div>
            `;

            // Crear el contenido de filtros
            var filterContent = '';
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

            $filterPanel.html(header + filterContent);

            // Agregar el panel al mapa
            jQuery('#nm-main-map').append($filterPanel);

            // Eventos
            $filterButton.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $filterPanel.toggleClass('collapsed');
            });

            $filterPanel.on('click', '.nm-close-filters', function (e) {
                $filterPanel.addClass('collapsed');
            });            // Manejar clicks en los filtros
            const activeFilters = {};
            $filterPanel.on('click', '.nm-filter-button', function (e) {
                const $button = jQuery(this);
                const field = $button.data('field');
                const value = String($button.data('value')); // Convertir siempre a string

                console.log('Filtro clickeado - Campo:', field, 'Valor:', value, 'Tipo:', typeof value);

                $button.toggleClass('active');

                if (!activeFilters[field]) {
                    activeFilters[field] = new Set();
                }

                if ($button.hasClass('active')) {
                    activeFilters[field].add(value);
                } else {
                    activeFilters[field].delete(value);
                    if (activeFilters[field].size === 0) {
                        delete activeFilters[field];
                    }
                }

                console.log('activeFilters después del click:', activeFilters);
                updateVisiblePoints(activeFilters);
            });

            // Agregar el contenedor de filtros al contenedor de controles
            $topControls.append($filterContainer);
        }


        function updateVisiblePoints(activeFilters) {
            console.log('=== DEBUG updateVisiblePoints ===');
            console.log('Active Filters:', activeFilters);

            let visibleCount = 0;

            // Limpiar el contenido de todos los LayerGroup definidos en la variable global 'overlays'
            for (const overlayName in overlays) {
                if (overlays.hasOwnProperty(overlayName)) {
                    const layerGroup = overlays[overlayName];
                    console.log(`Limpiando LayerGroup: ${overlayName}`, layerGroup);
                    if (layerGroup && typeof layerGroup.clearLayers === 'function') {
                        layerGroup.clearLayers();
                    }
                }
            }

            // Recorrer todos los marcadores guardados
            allMarkers.forEach(function (marker) {
                let isVisibleByFilter = true;
                console.log('Procesando marcador:', marker);
                console.log('Propiedades del marcador:', marker.feature.properties);

                for (const field in activeFilters) {
                    if (activeFilters[field].size > 0) {
                        const fieldName = 'nm_' + field;
                        const fieldValue = marker.feature.properties[fieldName];
                        console.log(`Campo: ${fieldName}, Valor: ${fieldValue}, Filtro Activo:`, activeFilters[field]);

                        if (!fieldValue || !activeFilters[field].has(String(fieldValue))) {
                            isVisibleByFilter = false;
                            console.log(`Marcador filtrado por campo: ${fieldName}`);
                            break;
                        }
                    }
                }

                if (isVisibleByFilter && marker.originalLayerGroup) {
                    console.log('Marcador visible, añadiendo a su grupo original:', marker);
                    marker.originalLayerGroup.addLayer(marker);

                    if (map.hasLayer(marker.originalLayerGroup)) {
                        visibleCount++;
                    }
                }
            });            const pointsCountElement = document.getElementById('nm-points-count');
            if (pointsCountElement) {
                pointsCountElement.textContent = visibleCount;
            }

            console.log('Total de puntos visibles:', visibleCount);
            
            // Si el modal de gráficos está abierto, actualizar los gráficos con los datos filtrados
            const chartsModal = jQuery('#nm-charts-modal');
            if (chartsModal.length && chartsModal.hasClass('active')) {
                const visibleMarkers = getVisibleMarkers();
                const features = getUniqueFeatures(visibleMarkers);
                if (features.length > 0) {
                    processCharts(features);
                }
            }
        }

        // Llamar a la función después de inicializar el mapa
        createFilterPanel();


        // Load points via AJAX
        $.post(nmMapData.ajax_url, {
            action: 'nm_get_map_points',
            nonce: nmMapData.nonce
        }, function (response) {
            console.log('Response received:', response);
            const textLayerName = nmMapData.text_layer_name || 'Capas de Texto';

            // Agregar logs para depurar los datos iniciales que recibe el mapa
            console.log('=== DEBUG Datos iniciales del mapa ===');
            console.log('Response completo:', response);
            console.log('Features:', response.features);
            console.log('Layer Settings:', response.layer_settings);

            if (response && response.features) {
                var layerGroups = {};
                var firstLayer = true;
                var textLayerGroup = L.layerGroup();
                var legendData = response.layer_settings; // Guardar los datos para la leyenda

                // Crear markersLayer como contenedor principal
                markersLayer = L.featureGroup().addTo(map);

                // Si hay configuración de capas
                if (Array.isArray(response.layer_settings) && response.layer_settings.length > 0) {


                    // Crear un grupo de capa para cada campo configurado (excepto texto)
                    response.layer_settings.forEach(function (layerConfig) {
                        if (layerConfig.type !== 'text') {
                            layerGroups[layerConfig.field] = L.layerGroup();
                        }
                    });

                    // Procesar cada feature
                    response.features.forEach(function (feature) {
                        console.log('Procesando feature:', feature);
                        console.log('Propiedades del feature:', feature.properties);
                        console.log('Geometría del feature:', feature.geometry);

                        // Si el feature tiene capas de texto o textarea
                        if (feature.properties && feature.properties.text_layers) {
                            feature.properties.text_layers.forEach(function (textLayer) {
                                var marker = L.circleMarker([
                                    feature.geometry.coordinates[1],
                                    feature.geometry.coordinates[0]
                                ], {
                                    radius: 8,
                                    fillColor: textLayer.color,
                                    color: "#000",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });

                                marker.feature = feature;
                                marker.on('click', function () {
                                    showModal(feature.properties);
                                });

                                textLayerGroup.addLayer(marker);
                                marker.originalLayerGroup = textLayerGroup;
                                allMarkers.push(marker);
                            });
                        }

                        // Procesar otras capas (select/radio/checkbox)
                        if (feature.properties && Array.isArray(feature.properties.layers)) {
                            feature.properties.layers.forEach(function (layerDef) {
                                if (layerDef.layer_type === 'select') {
                                    var marker = L.circleMarker([
                                        feature.geometry.coordinates[1],
                                        feature.geometry.coordinates[0]
                                    ], {
                                        radius: 5,
                                        fillColor: layerDef.layer_color,
                                        color: "#000",
                                        weight: 1,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    });

                                    marker.feature = feature;
                                    marker.on('click', function () {
                                        showModal(feature.properties);
                                    });

                                    if (layerGroups[layerDef.layer_field]) {
                                        layerGroups[layerDef.layer_field].addLayer(marker);
                                        marker.originalLayerGroup = layerGroups[layerDef.layer_field];
                                    }
                                    allMarkers.push(marker);
                                }
                            });
                        }
                    });

                    // Añadir grupos de capas al control y al mapa
                    var isFirstLayer = true;
                    response.layer_settings.forEach(function (layerConfig) {
                        if (layerConfig.type === 'text') {
                            // Solo añadir la capa de texto una vez

                            if (!overlays[textLayerName]) {
                                overlays[textLayerName] = textLayerGroup;
                                if (isFirstLayer) {
                                    textLayerGroup.addTo(map);
                                    markersLayer.addLayer(textLayerGroup);
                                    isFirstLayer = false;
                                }
                            }
                        } else if (layerConfig.type === 'select' && layerConfig.colors) {
                            // Para cada campo con colores, crear una etiqueta con el color correspondiente
                            var labelHtml = '<div class="layer-color-indicator" style="background-color: ' +
                                Object.values(layerConfig.colors)[0] + '"></div>' + getFieldLabel(layerConfig.field);
                            overlays[labelHtml] = layerGroups[layerConfig.field];
                            if (isFirstLayer) {
                                layerGroups[layerConfig.field].addTo(map);
                                markersLayer.addLayer(layerGroups[layerConfig.field]);
                                isFirstLayer = false;
                            }
                        }
                    });

                    // Actualizar el control de capas con los nuevos overlays y configurar los eventos
                    if (controlLayers) {
                        controlLayers.remove();
                    }
                    controlLayers = L.control.layers(baseLayers, overlays, {
                        collapsed: true,
                        sortLayers: true
                    }).addTo(map);

                    // Manejar eventos de cambio de capas
                    map.on('overlayadd', function (e) {
                        var layer = e.layer;
                        if (layer === textLayerGroup || Object.values(layerGroups).includes(layer)) {
                            markersLayer.addLayer(layer);
                        }
                    });

                    map.on('overlayremove', function (e) {
                        var layer = e.layer;
                        if (layer === textLayerGroup || Object.values(layerGroups).includes(layer)) {
                            markersLayer.removeLayer(layer);
                        }
                    });

                    // Aplicar estilos personalizados a los elementos del control después de añadirlo
                    var controlContainer = controlLayers.getContainer();
                    var labels = controlContainer.getElementsByTagName('label');

                    for (var i = 0; i < labels.length; i++) {
                        // Asegurarse de que el span que contiene el HTML se muestre correctamente
                        var span = labels[i].getElementsByTagName('span')[0];
                        if (span) {
                            span.style.display = 'flex';
                            span.style.alignItems = 'center';
                        }
                    }
                } else {
                    // Si no hay capas configuradas, añadir todos los marcadores a un solo grupo
                    response.features.forEach(function (feature) {
                        var marker = L.circleMarker([
                            feature.geometry.coordinates[1],
                            feature.geometry.coordinates[0]
                        ], {
                            radius: 5,
                            fillColor: '#ff0000',
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });

                        marker.feature = feature;
                        marker.on('click', function () {
                            showModal(feature.properties);
                        });

                        markersLayer.addLayer(marker);
                        allMarkers.push(marker);
                    });
                }

                // Inicializar el contador de puntos
                const pointsCountElement = document.getElementById('nm-points-count');
                if (pointsCountElement) {
                    pointsCountElement.textContent = response.features.length;
                }

                // Función para actualizar el contenido de la leyenda
                window.updateLegend = function () {
                    var content = '<h4 style="margin: 0 0 10px 0">Leyenda</h4>';

                    if (response.layer_settings && response.layer_settings.length > 0) {
                        // Primero verificamos si hay capas de texto
                        const hasTextLayers = response.layer_settings.some(layer => layer.type === 'text');

                        // Procesar capas de tipo 'select'
                        response.layer_settings.forEach(function (layerConfig) {
                            if (layerConfig.type === 'select' && layerConfig.colors) {
                                content += '<div class="legend-group">';
                                content += '<strong>' + getFieldLabel(layerConfig.field) + '</strong>';
                                Object.entries(layerConfig.colors).forEach(function ([value, color]) {
                                    content += '<div class="legend-item">';
                                    content += '<div class="legend-color" style="background-color: ' + color + '"></div>';
                                    content += '<span class="legend-label">' + value + '</span>';
                                    content += '</div>';
                                });
                                content += '</div>';
                            }
                        });

                        // Si hay capas de texto, mostrar su sección
                        if (hasTextLayers) {
                            content += '<div class="legend-group">';
                            content += '<strong>' + (nmMapData.text_layer_name || 'Capas de Texto') + '</strong>';

                            // Mostrar cada capa de texto
                            response.layer_settings.forEach(function (layerConfig) {
                                if (layerConfig.type === 'text') {
                                    content += '<div class="legend-item">';
                                    content += '<div class="legend-color" style="background-color: ' + layerConfig.colors[0] + '"></div>';
                                    content += '<span class="legend-label">' + getFieldLabel(layerConfig.field) + '</span>';
                                    content += '</div>';
                                }
                            });

                            content += '</div>';
                        }
                    } else {
                        content += '<p>No hay capas configuradas</p>';
                    }

                    legendPanel.innerHTML = content;
                };
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
            console.error('Response:', jqXHR.responseText);
            console.error('Status:', jqXHR.status);

            // Log adicional para debug
            if (jqXHR.status === 403) {
                
                  console.error('Error 403: Verificar permisos y nonce');
                console.error('Nonce being sent:', nmMapData.nonce);
            }
        });        // Botón para ver gráficos
        if (nmMapData.charts_enabled) {
            var $chartsButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Ver gráficos (responde a filtros activos)',
                html: '<i class="fa fa-chart-bar"></i>'
            });

            $chartsButton.on('click', function (e) {
                e.stopPropagation();

                // Obtener solo los marcadores visibles (filtrados)
                const visibleMarkers = getVisibleMarkers();
                const features = getUniqueFeatures(visibleMarkers);

                if (features.length) {
                    showChartsModal(features);
                } else {
                    alert('No hay datos para mostrar en los gráficos con los filtros actuales');
                }
            });

            $topControls.append($chartsButton);
        }
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

        jQuery('#nm-charts-modal .nm-modal-close').off('click').on('click', function () {
            $modal.removeClass('active');
            setTimeout(function () {
                $modal.hide();
            }, 300);
        });
    }    function processCharts(features) {
        const chartsContainer = document.getElementById('nm-charts-container');
        chartsContainer.innerHTML = '';

        // Agregar indicador de filtros activos
        const totalMarkers = allMarkers.length;
        const visibleMarkers = getVisibleMarkers().length;
        const isFiltered = visibleMarkers < totalMarkers;
        
        if (isFiltered) {
            const filterIndicator = document.createElement('div');
            filterIndicator.style.cssText = 'background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px; padding: 10px; margin-bottom: 15px; text-align: center; color: #1976d2; font-weight: bold;';
            filterIndicator.innerHTML = `📊 Mostrando gráficos filtrados: ${visibleMarkers} de ${totalMarkers} puntos`;
            chartsContainer.appendChild(filterIndicator);
        }

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
        const isCountMode = !chartConfig.numeric_field1;
        const categoryFieldName = `nm_${chartConfig.category_field}`;

        features.forEach(feature => {
            const categoryValue = feature.properties[categoryFieldName];
            // Usar el valor como string para la clave, para asegurar consistencia con las opciones del filtro
            const categoryKey = categoryValue !== undefined && categoryValue !== null ? categoryValue.toString() : '';

            if (!groupedData[categoryKey]) {
                groupedData[categoryKey] = {
                    count: 0,
                    numeric1: [],
                    numeric2: []
                };
            }

            groupedData[categoryKey].count++;

            if (!isCountMode) {
                const numericFieldName1 = `nm_${chartConfig.numeric_field1}`;
                const numeric1Value = parseFloat(feature.properties[numericFieldName1]);
                if (!isNaN(numeric1Value)) {
                    groupedData[categoryKey].numeric1.push(numeric1Value);
                }

                if (chartConfig.numeric_field2) {
                    const numericFieldName2 = `nm_${chartConfig.numeric_field2}`;
                    const numeric2Value = parseFloat(feature.properties[numericFieldName2]);
                    if (!isNaN(numeric2Value)) {
                        groupedData[categoryKey].numeric2.push(numeric2Value);
                    }
                }
            }
        });

        let finalOrderedKeys = [];

        // Intentar obtener el orden de las etiquetas desde la configuración de filtros
        const categoryFilterSetting = nmMapData.filter_settings.find(
            setting => setting.field === chartConfig.category_field
        );

        if (categoryFilterSetting && Array.isArray(categoryFilterSetting.options)) {
            // Usar el orden de las opciones del filtro, incluyendo solo las categorías que tienen datos
            finalOrderedKeys = categoryFilterSetting.options.filter(
                option => groupedData.hasOwnProperty(option.toString())
            );
        }

        // Si no se pudo determinar un orden desde filter_settings o si resultó en una lista vacía
        // (y hay datos en groupedData), recurrir al ordenamiento anterior (alfabético/numérico).
        if (finalOrderedKeys.length === 0 && Object.keys(groupedData).length > 0) {
            finalOrderedKeys = Object.keys(groupedData).sort((a, b) => {
                const aNum = parseFloat(a);
                const bNum = parseFloat(b);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                return a.localeCompare(b);
            });
        }

        data.labels = finalOrderedKeys;

        if (isCountMode) {
            data.datasets.push({
                label: chartConfig.title || 'Número de casos',
                data: finalOrderedKeys.map(key => groupedData[key] ? groupedData[key].count : 0),
                backgroundColor: chartConfig.chart_color1 || 'rgba(54, 162, 235, 0.5)',
                borderColor: (chartConfig.chart_color1 ? chartConfig.chart_color1.replace('0.5', '1') : 'rgba(54, 162, 235, 1)'),
                borderWidth: 1
            });
        } else {
            data.datasets.push({
                label: chartConfig.numeric_field1_label || chartConfig.numeric_field1,
                data: finalOrderedKeys.map(key => {
                    const item = groupedData[key];
                    if (!item) return 0;
                    const values = item.numeric1;
                    return values.length ? values.reduce((sum, val) => sum + val, 0) : 0;
                }),
                backgroundColor: chartConfig.chart_color1 || 'rgba(54, 162, 235, 0.5)',
                borderColor: (chartConfig.chart_color1 ? chartConfig.chart_color1.replace('0.5', '1') : 'rgba(54, 162, 235, 1)'),
                borderWidth: 1
            });

            if (chartConfig.numeric_field2) {
                data.datasets.push({
                    label: chartConfig.numeric_field2_label || chartConfig.numeric_field2,
                    data: finalOrderedKeys.map(key => {
                        const item = groupedData[key];
                        if (!item) return 0;
                        const values = item.numeric2;
                        return values.length ? values.reduce((sum, val) => sum + val, 0) : 0;
                    }),
                    backgroundColor: chartConfig.chart_color2 || 'rgba(255, 99, 132, 0.5)',
                    borderColor: (chartConfig.chart_color2 ? chartConfig.chart_color2.replace('0.5', '1') : 'rgba(255, 99, 132, 1)'),
                    borderWidth: 1
                });
            }
        }

        return data;
    }
    function createChart(canvas, chartConfig, data) {
        const ctx = canvas.getContext('2d');

        // Destruir cualquier gráfico anterior dibujado sobre este canvas
        const old = Chart.getChart(canvas);
        if (old) old.destroy();

        // Configuración base para las opciones
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartConfig.title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: chartConfig.chart_type === 'pie' ? 'right' : 'bottom',
                    labels: {
                        padding: 20,
                        boxWidth: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: chartConfig.numeric_field1 || 'Cantidad',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: chartConfig.chart_type === 'pie' ? 50 : 10,
                    top: 10,
                    bottom: 10
                }
            }
        };

        // Ajustes específicos según el tipo de gráfico
        if (chartConfig.chart_type === 'pie') {
            options.aspectRatio = 1.5;
        } else if (chartConfig.chart_type === 'bar') {
            options.aspectRatio = 2;
            if (data.labels.length > 10) {
                options.indexAxis = 'y'; // Barras horizontales si hay muchos datos
            }
        } else if (chartConfig.chart_type === 'line') {
            options.aspectRatio = 2.5;
        } else if (chartConfig.chart_type === 'mixed') {
            options.aspectRatio = 2;
        }

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
    }    /**
     * Devuelve un array de marcadores que están actualmente visibles en el mapa
     * (es decir, que están añadidos a sus LayerGroups y esos LayerGroups están en el mapa)
     */
    function getVisibleMarkers() {
        const visibleMarkers = [];
        
        allMarkers.forEach(marker => {
            // Verificar si el marcador está en su grupo original y ese grupo está en el mapa
            if (marker.originalLayerGroup && 
                marker.originalLayerGroup.hasLayer(marker) && 
                map.hasLayer(marker.originalLayerGroup)) {
                visibleMarkers.push(marker);
            }
        });
        
        return visibleMarkers;
    }

    /**
     * Devuelve un array de features sin duplicados usando las
     * coordenadas [lon, lat] como clave única.
    
     */
    function getUniqueFeatures(markers) {
        const vistos = new Set();
        const unicos = [];

        markers.forEach(m => {
            const coords = m.feature.geometry?.coordinates;
            if (!Array.isArray(coords)) return;


            const key = coords.join(',');

            if (!vistos.has(key)) {
                vistos.add(key);
                unicos.push(m.feature);
            }
        });

        return unicos;
    }

});








