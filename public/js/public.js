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
            console.log('Response received:', response); // Debug

            if (response && response.features) {
                var layerGroups = {};
                var firstLayer = true;

                // Crear markersLayer como contenedor principal
                markersLayer = L.featureGroup().addTo(map);
                

                // Si hay configuración de capas
                if (Array.isArray(response.layer_settings) && response.layer_settings.length > 0) {
                    console.log('Layer settings found:', response.layer_settings); // Debug

                    // Crear un grupo de capa para cada campo configurado
                    response.layer_settings.forEach(function (layerConfig) {
                        layerGroups[layerConfig.field] = L.layerGroup();
                    });

                    // Procesar cada feature
                    response.features.forEach(function (feature) {
                        console.log('Processing feature:', feature); // Debug
                     

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
                                if (layerGroups[layerDef.layer_field]) {
                                    layerGroups[layerDef.layer_field].addLayer(marker);
                                }
                        
                                // Además, lo agregas al featureGroup principal (si así lo deseas)
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
                        overlays[layerConfig.label] = layerGroups[layerConfig.field];
                    });

                } else {
                    // Si no hay configuración de capas, mostrar puntos normales
                    response.features.forEach(function (feature) {
                        var marker = L.marker([
                            feature.geometry.coordinates[1],
                            feature.geometry.coordinates[0]
                        ]);

                        // Añadir los datos originales al marker para los filtros
                        marker.feature = feature;

                        marker.on('click', function () {
                            var propertiesToShow = Object.assign({}, feature.properties);
                            delete propertiesToShow.entry_id;
                            showModal(propertiesToShow);
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

    }

});








