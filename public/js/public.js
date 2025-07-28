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
                console.log('Add WMS button clicked'); // Debug log
                if (typeof window.showAddWmsForm === 'function') {
                    console.log('Calling showAddWmsForm function'); // Debug log
                    window.showAddWmsForm();
                    
                    // Respaldo: si después de 500ms no hay modal visible, usar función simple
                    setTimeout(function() {
                        if (jQuery('#nm-wms-form:visible').length === 0 && jQuery('#nm-wms-form-simple:visible').length === 0) {
                            console.log('No modal visible, trying simple form'); // Debug log
                            if (typeof window.showSimpleWmsForm === 'function') {
                                window.showSimpleWmsForm();
                            } else {
                                alert('Error: No se pudo abrir el formulario WMS. Por favor, recarga la página e inténtalo de nuevo.');
                            }
                        }
                    }, 500);
                } else {
                    console.error('showAddWmsForm function not found'); // Debug log
                    alert('Error: La función para mostrar el formulario WMS no está disponible.');
                }
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
                    }                }

                updateVisiblePoints(activeFilters);
            });

            // Agregar el contenedor de filtros al contenedor de controles
            $topControls.append($filterContainer);
        }


        function updateVisiblePoints(activeFilters) {
            let visibleCount = 0;

            // Limpiar el contenido de todos los LayerGroup definidos en la variable global 'overlays'
            for (const overlayName in overlays) {
                if (overlays.hasOwnProperty(overlayName)) {                    const layerGroup = overlays[overlayName];
                    if (layerGroup && typeof layerGroup.clearLayers === 'function') {
                        layerGroup.clearLayers();
                    }
                }
            }

            // Recorrer todos los marcadores guardados
            allMarkers.forEach(function (marker) {
                let isVisibleByFilter = true;

                for (const field in activeFilters) {
                    if (activeFilters[field].size > 0) {
                        const fieldName = 'nm_' + field;
                        const fieldValue = marker.feature.properties[fieldName];                        if (!fieldValue || !activeFilters[field].has(String(fieldValue))) {
                            isVisibleByFilter = false;
                            break;
                        }
                    }
                }

                if (isVisibleByFilter && marker.originalLayerGroup) {
                    marker.originalLayerGroup.addLayer(marker);

                    if (map.hasLayer(marker.originalLayerGroup)) {
                        visibleCount++;
                    }
                }
            }); const pointsCountElement = document.getElementById('nm-points-count');
            if (pointsCountElement) {
                pointsCountElement.textContent = visibleCount;
            }

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
        createFilterPanel();        // Load points via AJAX
        $.post(nmMapData.ajax_url, {
            action: 'nm_get_map_points',
            nonce: nmMapData.nonce
        }, function (response) {
            const textLayerName = nmMapData.text_layer_name || 'Capas de Texto';

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
                    });                    // Procesar cada feature
                    response.features.forEach(function (feature) {

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
    } function processCharts(features) {
        const chartsContainer = document.getElementById('nm-charts-container');
        chartsContainer.innerHTML = '';

        // Verificar si hay filtros activos revisando los botones de filtro
        const activeFilterButtons = document.querySelectorAll('.nm-filter-button.active');
        const hasActiveFilters = activeFilterButtons.length > 0;
        
        // Solo mostrar el indicador si hay filtros activos
        if (hasActiveFilters) {
            // Buscar si ya existe un indicador y eliminarlo
            const existingIndicator = document.querySelector('.nm-filter-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            const totalMarkers = allMarkers.length;
            const visibleMarkers = getVisibleMarkers().length;

            const filterIndicator = document.createElement('div');
            filterIndicator.className = 'nm-filter-indicator';
            filterIndicator.style.cssText = 'background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px; padding: 10px; margin-bottom: 20px; text-align: center; color: #1976d2; font-weight: bold; width: 100%; box-sizing: border-box;';
            filterIndicator.innerHTML = `📊 Mostrando gráficos filtrados: ${visibleMarkers} de ${totalMarkers} puntos`;

            // Insertar ANTES del contenedor de gráficos
            chartsContainer.parentNode.insertBefore(filterIndicator, chartsContainer);
        } else {
            // Si no hay filtros activos, eliminar el indicador si existe
            const existingIndicator = document.querySelector('.nm-filter-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
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
            // Generar colores pastel diferentes para cada categoría (aplica a todos los tipos de gráfico)
            const pastelColors = generatePastelColors(finalOrderedKeys.length, chartConfig.title + chartConfig.category_field);
            
            if (chartConfig.chart_type === 'pie') {
                // Para gráficos de pie, usar array de colores
                data.datasets.push({
                    label: chartConfig.title || 'Número de casos',
                    data: finalOrderedKeys.map(key => groupedData[key] ? groupedData[key].count : 0),
                    backgroundColor: pastelColors.map(color => color.background),
                    borderColor: pastelColors.map(color => color.border),
                    borderWidth: 1
                });
            } else {
                // Para barras, líneas y otros, usar array de colores también
                data.datasets.push({
                    label: chartConfig.title || 'Número de casos',
                    data: finalOrderedKeys.map(key => groupedData[key] ? groupedData[key].count : 0),
                    backgroundColor: pastelColors.map(color => color.background),
                    borderColor: pastelColors.map(color => color.border),
                    borderWidth: 1
                });
            }
        } else {
            // Para gráficos con datos numéricos, también generar colores dinámicos
            const pastelColors = generatePastelColors(finalOrderedKeys.length, chartConfig.title + chartConfig.category_field + chartConfig.numeric_field1);
            
            if (chartConfig.chart_type === 'pie') {
                // Para pie, usar array de colores
                data.datasets.push({
                    label: chartConfig.numeric_field1_label || chartConfig.numeric_field1,
                    data: finalOrderedKeys.map(key => {
                        const item = groupedData[key];
                        if (!item) return 0;
                        const values = item.numeric1;
                        return values.length ? values.reduce((sum, val) => sum + val, 0) : 0;
                    }),
                    backgroundColor: pastelColors.map(color => color.background),
                    borderColor: pastelColors.map(color => color.border),
                    borderWidth: 1
                });
            } else {
                // Para barras, líneas y otros, usar array de colores también
                data.datasets.push({
                    label: chartConfig.numeric_field1_label || chartConfig.numeric_field1,
                    data: finalOrderedKeys.map(key => {
                        const item = groupedData[key];
                        if (!item) return 0;
                        const values = item.numeric1;
                        return values.length ? values.reduce((sum, val) => sum + val, 0) : 0;
                    }),
                    backgroundColor: pastelColors.map(color => color.background),
                    borderColor: pastelColors.map(color => color.border),
                    borderWidth: 1
                });
            }

            if (chartConfig.numeric_field2) {
                // Para gráficos de pie, el segundo campo numérico no aplica (solo se usa el primero)
                // Para otros tipos de gráfico, agregar el segundo dataset con colores dinámicos
                if (chartConfig.chart_type !== 'pie') {
                    // Generar colores diferentes para el segundo dataset usando una semilla diferente
                    const pastelColors2 = generatePastelColors(finalOrderedKeys.length, chartConfig.title + chartConfig.category_field + chartConfig.numeric_field2 + '_second');
                    
                    data.datasets.push({
                        label: chartConfig.numeric_field2_label || chartConfig.numeric_field2,
                        data: finalOrderedKeys.map(key => {
                            const item = groupedData[key];
                            if (!item) return 0;
                            const values = item.numeric2;
                            return values.length ? values.reduce((sum, val) => sum + val, 0) : 0;
                        }),
                        backgroundColor: pastelColors2.map(color => color.background),
                        borderColor: pastelColors2.map(color => color.border),
                        borderWidth: 1
                    });
                }
            }
        }

        return data;
    }
    /**
     * Genera colores pastel aleatorios pero consistentes basados en una semilla
     * @param {number} count - Número de colores a generar
     * @param {string} seed - Semilla para generar colores consistentes
     * @returns {Array} Array de colores en formato rgba
     */
    function generatePastelColors(count, seed = '') {
        const colors = [];
        
        // Función hash simple para generar números pseudo-aleatorios consistentes
        function hashCode(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convertir a entero de 32 bits
            }
            return Math.abs(hash);
        }
        
        // Distribución más uniforme de matices para mayor variedad
        const baseHueStep = 360 / Math.max(count, 1);
        
        // Generar colores pastel con mejor distribución
        for (let i = 0; i < count; i++) {
            // Usar la semilla + índice para generar valores consistentes
            const seedValue = hashCode(seed + i.toString());
            
            // Distribuir matices uniformemente con pequeñas variaciones aleatorias
            const baseHue = (i * baseHueStep) % 360;
            const hueVariation = (seedValue % 30) - 15; // Variación de ±15 grados
            const hue = (baseHue + hueVariation + 360) % 360;
            
            // Saturación y luminosidad con variaciones para mayor riqueza visual
            const saturation = 50 + (seedValue % 25); // 50-75%
            const lightness = 70 + (seedValue % 20); // 70-90%
            
            // Convertir HSL a RGB
            const h = hue / 360;
            const s = saturation / 100;
            const l = lightness / 100;
            
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // Escala de grises
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            // Convertir a valores 0-255
            const red = Math.round(r * 255);
            const green = Math.round(g * 255);
            const blue = Math.round(b * 255);
            
            colors.push({
                background: `rgba(${red}, ${green}, ${blue}, 0.7)`,
                border: `rgba(${red}, ${green}, ${blue}, 1)`
            });
        }
        
        return colors;
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



        // Ajustar colores según el tipo de gráfico
        if (chartConfig.chart_type === 'line') {
            // Para gráficos de líneas, usar un color sólido por dataset
            data.datasets.forEach((dataset, index) => {
                if (Array.isArray(dataset.backgroundColor)) {
                    // Usar el primer color del array para toda la línea
                    dataset.backgroundColor = dataset.backgroundColor[0];
                    dataset.borderColor = dataset.borderColor[0];
                    dataset.pointBackgroundColor = dataset.backgroundColor;
                    dataset.pointBorderColor = dataset.borderColor;
                }
            });
        } else if (chartConfig.chart_type === 'mixed') {
            // Para gráficos mixtos, ajustar colores por tipo
            data.datasets.forEach((dataset, index) => {
                if (dataset.type === 'line' && Array.isArray(dataset.backgroundColor)) {
                    // Para la línea, usar color sólido
                    dataset.backgroundColor = dataset.backgroundColor[0];
                    dataset.borderColor = dataset.borderColor[0];
                    dataset.pointBackgroundColor = dataset.backgroundColor;
                    dataset.pointBorderColor = dataset.borderColor;
                }
                // Las barras mantienen sus arrays de colores
            });
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
            if (marker.originalLayerGroup && marker.originalLayerGroup.hasLayer(marker)) {
                // Verificar si el LayerGroup está en el mapa o si está dentro de markersLayer que está en el mapa
                if (map.hasLayer(marker.originalLayerGroup) || 
                    (markersLayer && markersLayer.hasLayer(marker.originalLayerGroup) && map.hasLayer(markersLayer))) {
                    visibleMarkers.push(marker);
                }
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

    // ================================
    // FUNCIONALIDAD CAMPO DE AUDIO
    // ================================
    // MANEJO SIMPLIFICADO DE CAMPOS DE AUDIO
    // Solo permite subida de archivos
    // ================================

    // Inicializar campos de audio
    function initAudioFields() {
        $('.nm-audio-field').each(function () {
            const $field = $(this);

            // Manejar carga de archivos
            $field.find('.nm-audio-upload-input').on('change', function (e) {
                handleAudioUpload(e, $field);
            });

            // Manejar eliminación de archivos
            $field.find('.nm-remove-audio').on('click', function () {
                removeUploadedAudio($field);
            });
        });
    }

    // Manejar carga de archivos de audio
    function handleAudioUpload(event, $field) {
        const file = event.target.files[0];
        if (!file) {
            // Limpiar si no hay archivo
            $field.find('.nm-audio-data').val('');
            return;
        }

        // Validar formato
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];

        if (!allowedFormats.includes(fileExtension)) {
            showAudioError($field, `Formato no permitido. Use: ${allowedFormats.join(', ')}`);
            event.target.value = '';
            $field.find('.nm-audio-data').val('');
            return;
        }

        // Crear URL del archivo para preview
        const audioURL = URL.createObjectURL(file);
        const $preview = $field.find('.nm-audio-preview');
        const $audio = $preview.find('audio');

        $audio[0].src = audioURL;
        $preview.show();

        // Marcar que hay un archivo cargado en el campo hidden
        $field.find('.nm-audio-data').val('upload:' + file.name);

        showAudioSuccess($field, 'Archivo cargado correctamente');
    }

    // Eliminar archivo cargado
    function removeUploadedAudio($field) {
        $field.find('.nm-audio-upload-input').val('');
        $field.find('.nm-audio-preview').hide();
        $field.find('.nm-audio-data').val('');

        clearAudioMessages($field);
    }

    // Mostrar mensaje de error
    function showAudioError($field, message) {
        clearAudioMessages($field);
        $field.append(`<div class="nm-audio-error" style="color: red; margin-top: 5px;">${message}</div>`);
        setTimeout(() => clearAudioMessages($field), 5000);
    }

    // Mostrar mensaje de éxito
    function showAudioSuccess($field, message) {
        clearAudioMessages($field);
        $field.append(`<div class="nm-audio-success" style="color: green; margin-top: 5px;">${message}</div>`);
        setTimeout(() => clearAudioMessages($field), 3000);
    }

    // Limpiar mensajes
    function clearAudioMessages($field) {
        $field.find('.nm-audio-error, .nm-audio-success').remove();
    }

    // Inicializar cuando el documento esté listo

        initAudioFields();


});
