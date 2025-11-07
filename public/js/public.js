var map;
var overlay;
// Crear objetos para las capas base y overlays
var baseLayers = {};
var overlays = {};
var controlLayers;

// contenedor de marcadores
var markersLayer;
var allMarkers = [];
var clusterGroup = null;
var clusteringActive = true; // estado interno si clustering habilitado

jQuery(document).ready(function ($) {
    if (jQuery('#nm-main-map').length) {

        map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);        // Crear el contenedor de controles si aún no existe
        if (jQuery('#nm-top-controls').length === 0) {
            jQuery('#nm-main-map').append('<div id="nm-top-controls" class="nm-top-controls"></div>');
        }

        // ==============================
        // Helper: añade título "Capas" al control de capas Leaflet
        // ==============================
        function addLayersTitle(ctrl){
            try {
                if(!ctrl) return;
                var container = ctrl.getContainer();
                if(!container) return;
                var list = container.querySelector('.leaflet-control-layers-list');
                if(!list) return;
                // Evitar duplicados
                if(list.querySelector('.nm-layers-title')) return;
                var title = document.createElement('div');
                title.className = 'nm-layers-title';
                title.textContent = 'Capas';
                list.insertBefore(title, list.firstChild);
            } catch(e){
                console.warn('No se pudo insertar el título de capas:', e);
            }
        }

        // Referencia al contenedor de controles
        var $topControls = jQuery('#nm-top-controls');

        // Crear botón de leyenda
        var $legendButton = jQuery('<button>', {
            class: 'nm-control-button',
            title: 'Leyenda',
            html: '<i class="fa fa-list"></i>'
        });

        // =====================================
        // BOTÓN DE AYUDA / TOUR ONBOARDING
        // =====================================
        var $helpButton = null;
        if(nmMapData.enable_map_tour){
            $helpButton = jQuery('<button>', {
                id: 'nm-help-tour-btn',
                class: 'nm-control-button nm-help-button',
                title: 'Ayuda / Tour',
                html: '<span class="nm-help-icon">?</span>'
            });
            $helpButton.on('click', function(e){
                e.stopPropagation();
                startNmMapTour();
            });
        }

        // Crear panel de leyenda
        var legendPanel = document.createElement('div');
        legendPanel.className = 'legend-panel';
        legendPanel.style.zIndex = 1000;

        // Asegurarse de que el contenedor del mapa tenga posición relativa
        jQuery('#nm-main-map').css('position', 'relative');

        // Agregar el panel al mapa (el botón se añadirá después de los filtros)
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
                if (typeof window.showAddWmsForm === 'function') {
                    window.showAddWmsForm();
                    
                    // Respaldo: si después de 500ms no hay modal visible, usar función simple
                    setTimeout(function() {
                        if (jQuery('#nm-wms-form:visible').length === 0 && jQuery('#nm-wms-form-simple:visible').length === 0) {
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
    addLayersTitle(controlLayers);

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
                    <div class="nm-filters-controls">
                        <button class="nm-clear-filters" title="Limpiar todos los filtros">🗑️</button>
                        <button class="nm-close-filters">×</button>
                    </div>
                </div>
            `;

            // Crear estadísticas generales
                        var statsContent = `
                                <div class="nm-filters-stats">
                                        <div class="nm-stats-item">
                                                <span class="nm-stats-label">Mostrando:</span>
                                                <span class="nm-stats-value" id="nm-points-count">0</span>
                                                <span class="nm-stats-total">de <span id="nm-total-points">0</span></span>
                                        </div>
                                        <div class="nm-active-filters" id="nm-active-filters" style="display: none;">
                                                <span class="nm-active-label">Filtros activos:</span>
                                                <div class="nm-active-list"></div>
                                        </div>
                                </div>`;

                        var filterContent = '';
                        nmMapData.filter_settings.forEach(filter => {
                                const isConditional = filter.is_conditional === true;
                                const conditionalClass = isConditional ? 'nm-conditional-filter' : '';
                                const initiallyCollapsed = isConditional;
                                const initialToggleIcon = initiallyCollapsed ? '▶' : '▼';
                                const optionsDisplay = initiallyCollapsed ? 'style="display:none;"' : '';

                                filterContent += `
<div class="nm-filter-group ${conditionalClass} ${initiallyCollapsed ? 'collapsed' : ''}" data-field="${filter.field}" ${isConditional ? 'data-parent-field="'+filter.parent_field+'" data-parent-option="'+filter.parent_option+'"' : ''}>
    <div class="nm-filter-header">
        <span class="nm-filter-label">${isConditional ? '🔗 ' : ''}${filter.button_text} ${isConditional ? '<small class="nm-conditional-info">(Subtipo)</small>' : ''}</span>
        <span class="nm-filter-toggle" data-field="${filter.field}">${initialToggleIcon}</span>
        <span class="nm-filter-badge" data-field="${filter.field}">0</span>
    </div>
    <div class="nm-filter-options" data-field="${filter.field}" ${optionsDisplay}>
        ${filter.options.map(option => {
                const optionValue = typeof option === 'object' ? (option.value || option.label || option) : option;
                const optionLabel = typeof option === 'object' ? (option.label || option.value || option) : option;
                return `
            <button class="nm-filter-button" data-field="${filter.field}" data-value="${optionValue}" style="background-color: ${(filter.style && filter.style.background) ? filter.style.background : '#fff'}; color: ${(filter.style && filter.style.color) ? filter.style.color : '#000'}">
                <span class="nm-button-text">${optionLabel}</span>
                <span class="nm-button-count" data-field="${filter.field}" data-value="${optionValue}">0</span>
            </button>`;
        }).join('')}
    </div>
</div>`;
                        });

            // Agregar contador
            filterContent += `
                <div class="nm-filter-count">
                    <button class="nm-expand-all">Expandir todo</button>
                    <button class="nm-collapse-all">Colapsar todo</button>
                </div>
            `;

            $filterPanel.html(header + statsContent + filterContent);

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
            });

            // Funcionalidad de toggle para grupos de filtros
            $filterPanel.on('click', '.nm-filter-toggle', function (e) {
                e.stopPropagation();
                const field = jQuery(this).data('field');
                const $options = $filterPanel.find(`.nm-filter-options[data-field="${field}"]`);
                const $toggle = jQuery(this);
                
                $options.slideToggle(200);
                $toggle.text($toggle.text() === '▼' ? '▶' : '▼');
                
                // Marcar grupo como expandido/colapsado
                $toggle.closest('.nm-filter-group').toggleClass('collapsed');
            });

            // Limpiar todos los filtros
            $filterPanel.on('click', '.nm-clear-filters', function (e) {
                e.stopPropagation();
                $filterPanel.find('.nm-filter-button.active').removeClass('active');
                Object.keys(activeFilters).forEach(key => delete activeFilters[key]);
                
                updateVisiblePoints(activeFilters);
                updateActiveFiltersDisplay(activeFilters);
                updateFilterBadges();
            });

            // Expandir/colapsar todo
            $filterPanel.on('click', '.nm-expand-all', function (e) {
                e.stopPropagation();
                $filterPanel.find('.nm-filter-options').slideDown(200);
                $filterPanel.find('.nm-filter-toggle').text('▼');
                $filterPanel.find('.nm-filter-group').removeClass('collapsed');
            });

            $filterPanel.on('click', '.nm-collapse-all', function (e) {
                e.stopPropagation();
                $filterPanel.find('.nm-filter-options').slideUp(200);
                $filterPanel.find('.nm-filter-toggle').text('▶');
                $filterPanel.find('.nm-filter-group').addClass('collapsed');
            });            // Manejar clicks en los filtros
            const activeFilters = {};
            $filterPanel.on('click', '.nm-filter-button', function (e) {
                e.preventDefault();
                e.stopPropagation();
                
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
                    }
                    
                }
                
                
                updateVisiblePoints(activeFilters);
                updateActiveFiltersDisplay(activeFilters);
                updateFilterBadges();
            });

            // Manejar clicks en las etiquetas de filtros activos para eliminar filtros específicos
            $filterPanel.on('click', '.nm-remove-tag', function(e) {
                e.stopPropagation();
                const $tag = jQuery(this).parent();
                const field = $tag.data('field');
                const value = String($tag.data('value'));
                
                // Remover del filtro activo
                if (activeFilters[field]) {
                    activeFilters[field].delete(value);
                    if (activeFilters[field].size === 0) {
                        delete activeFilters[field];
                    }
                }
                
                // Desactivar el botón correspondiente
                $filterPanel.find(`.nm-filter-button[data-field="${field}"][data-value="${value}"]`).removeClass('active');
                
                updateVisiblePoints(activeFilters);
                updateActiveFiltersDisplay(activeFilters);
                updateFilterBadges();
            });

            // Función para actualizar la visualización de filtros activos
            function updateActiveFiltersDisplay(filters) {
                const $activeFilters = jQuery('#nm-active-filters');
                const $activeList = $activeFilters.find('.nm-active-list');
                
                if (Object.keys(filters).length === 0) {
                    $activeFilters.hide();
                    return;
                }
                
                $activeList.empty();
                Object.keys(filters).forEach(field => {
                    filters[field].forEach(value => {
                        const $tag = jQuery(`
                            <span class="nm-active-tag" data-field="${field}" data-value="${value}">
                                ${value} <span class="nm-remove-tag">×</span>
                            </span>
                        `);
                        $activeList.append($tag);
                    });
                });
                
                $activeFilters.show();
            }

            // Función para actualizar badges de conteo
            function updateFilterBadges() {
                nmMapData.filter_settings.forEach(filter => {
                    let activeCount = 0;
                    if (activeFilters[filter.field]) {
                        activeCount = activeFilters[filter.field].size;
                    }
                    
                    const $badge = $filterPanel.find(`.nm-filter-badge[data-field="${filter.field}"]`);
                    $badge.text(activeCount);
                    $badge.toggleClass('active', activeCount > 0);
                });
            }

            // Event listener para remover filtros desde los tags
            $filterPanel.on('click', '.nm-remove-tag', function (e) {
                e.stopPropagation();
                const $tag = jQuery(this).parent();
                const field = $tag.data('field');
                const value = String($tag.data('value'));
                
                // Desactivar el botón correspondiente
                $filterPanel.find(`.nm-filter-button[data-field="${field}"][data-value="${value}"]`).removeClass('active');
                
                // Actualizar filtros activos
                if (activeFilters[field]) {
                    activeFilters[field].delete(value);
                    if (activeFilters[field].size === 0) {
                        delete activeFilters[field];
                    }
                }
                
                updateVisiblePoints(activeFilters);
                updateActiveFiltersDisplay(activeFilters);
                updateFilterBadges();
            });

            // Agregar el contenedor de filtros al contenedor de controles
            $topControls.append($filterContainer);
            
            
            // Llamar a updateFilterCounts después de cargar los puntos
            setTimeout(() => {
                if (typeof updateFilterCounts === 'function') {
                    updateFilterCounts();
                }
            }, 1000);
        }


        function updateVisiblePoints(activeFilters) {
            const clusteringEnabled = nmMapData.enable_clustering === true || nmMapData.enable_clustering === 'true';

            // IMPORTANTE: Limpiar todas las capas antes de aplicar filtros
            if (clusteringEnabled) {
                // Si clustering está habilitado, limpiar el cluster group o markersLayer
                if (clusteringActive && clusterGroup) {
                    clusterGroup.clearLayers();
                } else if (!clusteringActive && markersLayer) {
                    markersLayer.clearLayers();
                }
            } else {
                // Modo original (sin clustering habilitado en ajustes)
                const overlayKeys = Object.keys(overlays || {});
                if (overlayKeys.length) {
                    // Solo limpiar si realmente hay overlays (capas configuradas)
                    for (const overlayName of overlayKeys) {
                        const layerGroup = overlays[overlayName];
                        if (layerGroup && typeof layerGroup.clearLayers === 'function') {
                            layerGroup.clearLayers();
                        }
                    }
                } else if (markersLayer && typeof markersLayer.eachLayer === 'function') {
                    // Caso SIN capas configuradas: limpiar markersLayer para reconstruir según filtros
                    const toRemove = [];
                    markersLayer.eachLayer(l => { toRemove.push(l); });
                    toRemove.forEach(l => markersLayer.removeLayer(l));
                }
            }

            let debugVisibleCount = 0;
            let debugTotalCount = 0;
            let actualVisibleMarkers = []; // Array para almacenar marcadores que pasan el filtro
            
            // Construir grupos: OR dentro del grupo (padre + subfiltros), AND entre grupos distintos
            const groupStructures = {}; // groupName => { mainValues:Set|null, subFilters:[{prop, values:Set}] }
            if (Object.keys(activeFilters).length > 0) {
                nmMapData.filter_settings.forEach(cfg => {
                    if (!activeFilters[cfg.field] || activeFilters[cfg.field].size === 0) return;
                    if (cfg.is_conditional) {
                        const g = cfg.parent_field;
                        if (!groupStructures[g]) groupStructures[g] = { mainValues: null, subFilters: [] };
                        groupStructures[g].subFilters.push({ prop: 'nm_' + cfg.field_name, values: activeFilters[cfg.field] });
                    } else {
                        const g = cfg.field; // nombre del campo padre normal
                        if (!groupStructures[g]) groupStructures[g] = { mainValues: null, subFilters: [] };
                        groupStructures[g].mainValues = activeFilters[cfg.field];
                    }
                });
            }

            allMarkers.forEach(function(marker){
                debugTotalCount++;
                let visible = true;

                if (Object.keys(groupStructures).length > 0) {
                    for (const gName in groupStructures) {
                        const group = groupStructures[gName];
                        let groupMatched = false;

                        // Evaluar campo principal
                        if (group.mainValues && group.mainValues.size > 0) {
                            const fieldProp = 'nm_' + gName;
                            let val = marker.feature.properties[fieldProp];
                            if (Array.isArray(val)) {
                                for (const v of val) { if (group.mainValues.has(String(v))) { groupMatched = true; break; } }
                            } else if (val !== undefined && val !== null) {
                                if (group.mainValues.has(String(val))) groupMatched = true;
                            }
                        }

                        // Evaluar subfiltros si aún no hubo match
                        if (!groupMatched && group.subFilters.length) {
                            for (const sf of group.subFilters) {
                                let sval = marker.feature.properties[sf.prop];
                                if (Array.isArray(sval)) {
                                    for (const v of sval) { if (sf.values.has(String(v))) { groupMatched = true; break; } }
                                } else if (sval !== undefined && sval !== null) {
                                    if (sf.values.has(String(sval))) groupMatched = true;
                                }
                                if (groupMatched) break;
                            }
                        }

                        if (!groupMatched) { visible = false; break; }
                    }
                }

                if (visible) { debugVisibleCount++; actualVisibleMarkers.push(marker); }

                if (clusteringEnabled) {
                    if (clusteringActive) {
                        if (visible && clusterGroup) {
                            clusterGroup.addLayer(marker);
                        } // si no es visible simplemente no se añade
                    } else {
                        // clustering desactivado vía toggle: trabajamos directamente sobre markersLayer FeatureGroup plano
                        if (visible) {
                            if (!markersLayer.hasLayer(marker)) markersLayer.addLayer(marker);
                        } else {
                            if (markersLayer.hasLayer(marker)) markersLayer.removeLayer(marker);
                        }
                    }
                } else {
                    // Modo original sin clustering
                    if (marker.originalLayerGroup) {
                        // Caso con capas (layer groups existentes)
                        if (visible) {
                            marker.originalLayerGroup.addLayer(marker);
                        }
                        // Remover no necesario tras limpieza previa
                    } else if (markersLayer) {
                        // Fallback SIN capas: añadir / quitar directamente del markersLayer
                        if (visible) {
                            if (!markersLayer.hasLayer(marker)) markersLayer.addLayer(marker);
                        } else {
                            if (markersLayer.hasLayer(marker)) markersLayer.removeLayer(marker);
                        }
                    }
                }
            });

            
            
            // Contar puntos únicos basados SOLO en filtros (no por capas/overlays)
            function featureMatchesGroups(feature, groups){
                if (!feature || !feature.properties) return false;
                if (Object.keys(groups).length === 0) return true; // sin filtros = todo
                for (const gName in groups) {
                    const group = groups[gName];
                    let groupMatched = false;
                    // Campo principal
                    if (group.mainValues && group.mainValues.size > 0) {
                        const fieldProp = 'nm_' + gName;
                        let val = feature.properties[fieldProp];
                        if (Array.isArray(val)) {
                            for (const v of val) { if (group.mainValues.has(String(v))) { groupMatched = true; break; } }
                        } else if (val !== undefined && val !== null) {
                            if (group.mainValues.has(String(val))) groupMatched = true;
                        }
                    }
                    // Subfiltros
                    if (!groupMatched && group.subFilters.length) {
                        for (const sf of group.subFilters) {
                            let sval = feature.properties[sf.prop];
                            if (Array.isArray(sval)) {
                                for (const v of sval) { if (sf.values.has(String(v))) { groupMatched = true; break; } }
                            } else if (sval !== undefined && sval !== null) {
                                if (sf.values.has(String(sval))) groupMatched = true;
                            }
                            if (groupMatched) break;
                        }
                    }
                    if (!groupMatched) return false;
                }
                return true;
            }

            const uniqueAll = getUniqueFeatures(allMarkers);
            const filteredUnique = uniqueAll.filter(f => featureMatchesGroups(f, groupStructures));
            const visibleCount = filteredUnique.length;
            
            

            const pointsCountElement = document.getElementById('nm-points-count');
            if (pointsCountElement) {
                pointsCountElement.textContent = visibleCount;
            }

            // Actualizar contador total (features únicas en toda la sesión)
            const totalPointsElement = document.getElementById('nm-total-points');
            if (totalPointsElement) {
                const totalUnique = getUniqueFeatures(allMarkers);
                totalPointsElement.textContent = totalUnique.length;
            }

            // Si el modal de gráficos está abierto, actualizar los gráficos con los datos filtrados
            const chartsModal = jQuery('#nm-charts-modal');
            if (chartsModal.length && chartsModal.hasClass('active')) {
                // Extraer las features de los marcadores visibles (mismo criterio que contador)
                const features = visibleMarkers.map(m => m.feature).filter(f => f);
                if (features.length > 0) {
                    processCharts(features);
                }
            }
        }

        // Función para contar elementos en cada opción de filtro
        function updateFilterCounts() {
            if (!nmMapData.filter_settings || !allMarkers) return;

            nmMapData.filter_settings.forEach(filter => {
                filter.options.forEach(option => {
                    let count = 0;

                    // Normalizar valor de opción (puede ser objeto)
                    const optionValue = (typeof option === 'object' && option !== null)
                        ? (option.value || option.label || Object.values(option)[0] || '')
                        : option;

                    const fieldName = filter.is_conditional
                        ? 'nm_' + filter.field_name
                        : 'nm_' + filter.field;

                    const features = getUniqueFeatures(allMarkers);
                    features.forEach(feature => {
                        let fieldValue = feature.properties[fieldName];
                        if (Array.isArray(fieldValue)) {
                            if (fieldValue.some(v => String(v) === String(optionValue))) count++;
                        } else if (fieldValue !== undefined && fieldValue !== null) {
                            if (String(fieldValue) === String(optionValue)) count++;
                        }
                    });

                    const $countElement = jQuery(`.nm-button-count[data-field="${filter.field}"][data-value="${optionValue}"]`);
                    if ($countElement.length) {
                        $countElement.text(count > 0 ? `(${count})` : '(0)');
                    }
                });
            });
        }

        // Llamar a la función después de inicializar el mapa
        createFilterPanel();
        
        // Agregar el botón de leyenda después de los filtros (o como único botón si no hay filtros)
        $topControls.append($legendButton);
        
        // Load points via AJAX
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

                // Crear markersLayer como contenedor principal o clusterGroup si clustering habilitado
                if (nmMapData.enable_clustering) {
                    clusterGroup = L.markerClusterGroup({
                        // Radio de agrupación adaptativo simple
                        maxClusterRadius: function(zoom){
                            return zoom < 6 ? 80 : zoom < 10 ? 60 : 40;
                        },
                        spiderfyOnEveryZoom: false,
                        showCoverageOnHover: false,
                        removeOutsideVisibleBounds: true
                    });
                    markersLayer = clusterGroup;
                    map.addLayer(clusterGroup);
                } else {
                    markersLayer = L.featureGroup().addTo(map);
                }

                // Si hay configuración de capas
                if (Array.isArray(response.layer_settings) && response.layer_settings.length > 0) {

                    // Crear un grupo de capa para cada campo configurado (excepto texto)
                    response.layer_settings.forEach(function (layerConfig) {
                        if (layerConfig.type !== 'text') {
                            layerGroups[layerConfig.field] = L.layerGroup();
                        }
                    });

                    if (nmMapData.enable_clustering) {
                        // ═══════════════════════════════════════════════════════════════
                        // MODO CLUSTERING: Crear marcadores únicos por coordenada
                        // ═══════════════════════════════════════════════════════════════
                        // Solución al problema de puntos duplicados en clustering:
                        // En lugar de crear un marcador por cada capa/campo, agrupamos
                        // todos los features con las mismas coordenadas en un solo marcador.
                        // Esto evita que Leaflet.markercluster trate las mismas coordenadas
                        // como puntos diferentes solo porque tienen diferentes colores/capas.
                        // ═══════════════════════════════════════════════════════════════
                        
                        var uniqueFeatures = {}; // Clave: "lat,lng" -> Valor: feature combinado
                        
                        // Primero, agrupar features por coordenadas
                        response.features.forEach(function (feature) {
                            var coords = feature.geometry.coordinates;
                            var key = coords[1] + ',' + coords[0]; // lat,lng como clave
                            
                            if (!uniqueFeatures[key]) {
                                // Primera vez que vemos esta coordenada
                                uniqueFeatures[key] = {
                                    geometry: feature.geometry,
                                    properties: JSON.parse(JSON.stringify(feature.properties)), // copia profunda
                                    allLayers: [], // todas las capas de este punto
                                    textLayers: [], // capas de texto específicamente
                                    coords: coords
                                };
                            }
                            
                            // Combinar capas de texto
                            if (feature.properties && feature.properties.text_layers) {
                                uniqueFeatures[key].textLayers = uniqueFeatures[key].textLayers.concat(feature.properties.text_layers);
                            }
                            
                            // Combinar otras capas
                            if (feature.properties && Array.isArray(feature.properties.layers)) {
                                uniqueFeatures[key].allLayers = uniqueFeatures[key].allLayers.concat(feature.properties.layers);
                            }
                        });
                        
                        // Crear un marcador único por coordenada
                        Object.keys(uniqueFeatures).forEach(function(coordKey) {
                            var uniqueFeature = uniqueFeatures[coordKey];
                            
                            // Determinar el color del marcador (priorizar capas normales, luego texto)
                            var markerColor = '#080cf1ff'; // color por defecto
                            var hasNormalLayers = uniqueFeature.allLayers.length > 0;
                            var hasTextLayers = uniqueFeature.textLayers.length > 0;
                            
                            if (hasNormalLayers) {
                                // Usar color de la primera capa normal
                                markerColor = uniqueFeature.allLayers[0].layer_color;
                            } else if (hasTextLayers) {
                                // Si solo hay capas de texto, usar color de la primera
                                markerColor = uniqueFeature.textLayers[0].color;
                            }
                            
                            var marker = L.circleMarker([
                                uniqueFeature.coords[1],
                                uniqueFeature.coords[0]
                            ], {
                                radius: 6,
                                fillColor: markerColor,
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            });

                            // Asignar el feature combinado al marcador
                            marker.feature = {
                                type: 'Feature',
                                geometry: uniqueFeature.geometry,
                                properties: uniqueFeature.properties
                            };
                            
                            marker.on('click', function () {
                                showModal(uniqueFeature.properties);
                            });

                            // En modo clustering, añadir directamente al cluster
                            clusterGroup.addLayer(marker);
                            allMarkers.push(marker);
                        });
                        
                    } else {
                        // MODO ORIGINAL (sin clustering): Crear marcadores individuales por capa
                        response.features.forEach(function (feature) {

                            // Si el feature tiene capas de texto o textarea
                            if (feature.properties && feature.properties.text_layers) {
                                feature.properties.text_layers.forEach(function (textLayer) {
                                    var marker = L.circleMarker([
                                        feature.geometry.coordinates[1],
                                        feature.geometry.coordinates[0]
                                    ], {
                                       
                                        radius: 5,
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
                    }

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
                                if (!nmMapData.enable_clustering) {
                                    if (isFirstLayer) {
                                        layerGroups[layerConfig.field].addTo(map);
                                        markersLayer.addLayer(layerGroups[layerConfig.field]);
                                        isFirstLayer = false;
                                    }
                                }
                        }
                    });

                    // Actualizar el control de capas con los nuevos overlays y configurar los eventos
                    if (!nmMapData.enable_clustering) {
                        if (controlLayers) {
                            controlLayers.remove();
                        }
                        controlLayers = L.control.layers(baseLayers, overlays, {
                            collapsed: true,
                            sortLayers: true
                        }).addTo(map);
                        addLayersTitle(controlLayers);
                    }

                    // Manejar eventos de cambio de capas
                    if (!nmMapData.enable_clustering) {
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
                    }

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
                    if (nmMapData.enable_clustering) {
                        // MODO CLUSTERING SIN CAPAS: Crear marcadores únicos por coordenada
                        var uniqueFeatures = {}; // Clave: "lat,lng" -> Valor: feature
                        
                        response.features.forEach(function (feature) {
                            var coords = feature.geometry.coordinates;
                            var key = coords[1] + ',' + coords[0]; // lat,lng como clave
                            
                            if (!uniqueFeatures[key]) {
                                uniqueFeatures[key] = feature;
                            }
                        });
                        
                        Object.keys(uniqueFeatures).forEach(function(coordKey) {
                            var feature = uniqueFeatures[coordKey];
                            
                            var marker = L.circleMarker([
                                feature.geometry.coordinates[1],
                                feature.geometry.coordinates[0]
                            ], {
                                radius: 7,
                                fillColor: '#080cf1ff',
                                color: "#ffffffff",
                                weight: 1.5,
                                opacity: 1,
                                fillOpacity: 0.8
                            });

                            marker.feature = feature;
                            marker.on('click', function () {
                                showModal(feature.properties);
                            });
                            
                            clusterGroup.addLayer(marker);
                            allMarkers.push(marker);
                        });
                        
                    } else {
                        // MODO ORIGINAL: marcador individual por feature
                        response.features.forEach(function (feature) {
                            var marker = L.circleMarker([
                                feature.geometry.coordinates[1],
                                feature.geometry.coordinates[0]
                            ], {
                                radius: 7,
                                fillColor: '#080cf1ff',
                                color: "#ffffffff",
                                weight: 1.5,
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
                }

                // Inicializar el contador de puntos con features únicos
                const pointsCountElement = document.getElementById('nm-points-count');
                if (pointsCountElement) {
                    // Contar features únicos en lugar de total de features
                    const uniqueFeatures = getUniqueFeatures(allMarkers);
                    pointsCountElement.textContent = uniqueFeatures.length;
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

                // Actualizar contadores de filtros después de cargar todos los datos
                setTimeout(() => {
                    if (typeof updateFilterCounts === 'function') {
                        updateFilterCounts();
                    }
                    if (typeof updateFilterBadges === 'function') {
                        updateFilterBadges();
                    }
                    
                    // Actualizar contador total inicial
                    const totalPointsElement = document.getElementById('nm-total-points');
                    if (totalPointsElement && allMarkers) {
                        const totalMarkers = getUniqueFeatures(allMarkers);
                        totalPointsElement.textContent = totalMarkers.length;
                    }
                }, 500);
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

        // Añadir el botón de ayuda al comienzo de la barra de controles
        if($helpButton){
            $topControls.prepend($helpButton);
            // Autostart una sola vez si no ha sido visto
            if(!localStorage.getItem('nmMapTourSeen')){
                setTimeout(()=>{ startNmMapTour(true); }, 1200);
            }
        }

        // Botón toggle clustering (desagrupar) sólo si clustering habilitado
        if (nmMapData.enable_clustering) {
            var $clusterToggle = jQuery('<button>', {
                class: 'nm-control-button nm-cluster-toggle',
                title: 'Desagrupar puntos',
                html: '<i class="fa fa-object-ungroup"></i>'
            });
            $clusterToggle.on('click', function(e){
                e.stopPropagation();
                if (!clusterGroup) return;
                if (clusteringActive) {
                    // Desactivar clustering: mover todos los marcadores a un FeatureGroup simple
                    var fg = L.featureGroup();
                    clusterGroup.eachLayer(function(layer){
                        clusterGroup.removeLayer(layer);
                        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                            fg.addLayer(layer);
                        }
                    });
                    map.removeLayer(clusterGroup);
                    fg.addTo(map);
                    markersLayer = fg;
                    clusteringActive = false;
                    $clusterToggle.attr('title','Agrupar puntos').html('<i class="fa fa-object-group"></i>');
                } else {
                    // Reactivar clustering
                    var newCluster = L.markerClusterGroup({
                        maxClusterRadius: function(zoom){return zoom < 6 ? 80 : zoom < 10 ? 60 : 40;},
                        spiderfyOnEveryZoom: false,
                        showCoverageOnHover: false,
                        removeOutsideVisibleBounds: true
                    });
                    markersLayer.eachLayer(function(layer){
                        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                            newCluster.addLayer(layer);
                        }
                    });
                    map.removeLayer(markersLayer);
                    newCluster.addTo(map);
                    clusterGroup = newCluster;
                    markersLayer = newCluster;
                    clusteringActive = true;
                    $clusterToggle.attr('title','Desagrupar puntos').html('<i class="fa fa-object-ungroup"></i>');
                }
            });
            $topControls.append($clusterToggle);
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

            // Calcular el total de features únicos en lugar de marcadores
            const visibleMarkers = getVisibleMarkers();
            // Contemos ambos: marcadores visibles reales y features únicas
            const visibleMarkerCount = visibleMarkers.length;
            const visibleUnique = getUniqueFeatures(visibleMarkers).length;
            const totalMarkerCount = allMarkers.length;
            const totalUnique = getUniqueFeatures(allMarkers).length;

            const filterIndicator = document.createElement('div');
            filterIndicator.className = 'nm-filter-indicator';
            filterIndicator.style.cssText = 'background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px; padding: 10px; margin-bottom: 20px; text-align: center; color: #1976d2; font-weight: bold; width: 100%; box-sizing: border-box;';
            // Si hay diferencia notable entre únicos y marcadores (mismos coords) mostrar ambos
            if (visibleMarkerCount !== visibleUnique) {
                filterIndicator.innerHTML = `📊 Filtrado: ${visibleMarkerCount} marcadores (${visibleUnique} únicos) de ${totalMarkerCount} (${totalUnique} únicos)`;
            } else {
                filterIndicator.innerHTML = `📊 Filtrado: ${visibleUnique} de ${totalUnique} puntos`;
            }

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
            canvasWrapper.style.position = 'relative';
            canvasWrapper.style.marginBottom = '25px';

            // Contenedor header del gráfico (título + acciones)
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.marginBottom = '6px';

            // Añadir título del gráfico
            const titleDiv = document.createElement('div');
            titleDiv.style.textAlign = 'left';
            titleDiv.style.fontWeight = 'bold';
            titleDiv.style.fontSize = '14px';
            titleDiv.textContent = chartConfig.title;
            headerDiv.appendChild(titleDiv);

            // Botón descargar PDF
            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.textContent = '📥 PDF';
            downloadBtn.title = 'Descargar gráfico en PDF';
            downloadBtn.style.cursor = 'pointer';
            downloadBtn.style.background = '#1976d2';
            downloadBtn.style.color = '#fff';
            downloadBtn.style.border = 'none';
            downloadBtn.style.borderRadius = '4px';
            downloadBtn.style.padding = '4px 8px';
            downloadBtn.style.fontSize = '12px';
            downloadBtn.style.display = 'inline-flex';
            downloadBtn.style.alignItems = 'center';
            downloadBtn.style.gap = '4px';
            downloadBtn.addEventListener('mouseenter', () => downloadBtn.style.background = '#145a9c');
            downloadBtn.addEventListener('mouseleave', () => downloadBtn.style.background = '#1976d2');

            downloadBtn.addEventListener('click', () => {
                const canvas = canvasWrapper.querySelector('canvas');
                if(canvas){
                    exportChartToPDF(canvas, chartConfig.title || `grafico-${index+1}`);
                }
            });
            headerDiv.appendChild(downloadBtn);
            canvasWrapper.appendChild(headerDiv);

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
            let categoryValue = feature.properties[categoryFieldName];
            // Si es array (checkbox), contar cada valor por separado
            const valuesArray = Array.isArray(categoryValue) ? categoryValue : [categoryValue];
            valuesArray.forEach(singleVal => {
                const categoryKey = (singleVal !== undefined && singleVal !== null) ? String(singleVal) : '';
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

        let finalOrderedKeys = [];

        // Intentar obtener el orden de las etiquetas desde la configuración de filtros
        // Buscar configuración de filtro que corresponda a este campo (normal o condicional)
        const categoryFilterSetting = nmMapData.filter_settings.find(setting => {
            if (setting.field === chartConfig.category_field) return true; // campo normal
            if (setting.is_conditional && setting.field_name === chartConfig.category_field) return true; // subcampo condicional
            return false;
        });

        if (categoryFilterSetting && Array.isArray(categoryFilterSetting.options)) {
            finalOrderedKeys = categoryFilterSetting.options
                .map(o => (typeof o === 'object' ? (o.value || o.label || o) : o))
                .filter(option => groupedData.hasOwnProperty(option.toString()));
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
    // ================================
    // UTILIDADES Y TEMA DE CHART.JS
    // ================================
    function formatNumber(value) {
        if (value === null || value === undefined || isNaN(value)) return '';
        const n = Number(value);
        // Mostrar enteros sin decimales; si hay decimales relevantes, 1-2 máx
        if (Number.isInteger(n)) return n.toLocaleString();
        return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    function formatPercent(value, total) {
        if (!total) return '';
        const pct = (Number(value) / Number(total)) * 100;
        return pct.toFixed(pct < 1 ? 1 : 0) + '%';
    }

    function abbreviateLabel(label, max = 22) {
        if (!label && label !== 0) return '';
        const s = String(label);
        return s.length > max ? s.slice(0, max - 1) + '…' : s;
    }

    // Registrar un plugin para fondo sutil del área del gráfico
    if (window.Chart && !Chart._nmThemeRegistered) {
        const nmThemeBg = {
            id: 'nmThemeBg',
            beforeDraw(chart, args, opts) {
                const { ctx, chartArea } = chart;
                if (!chartArea) return;
                ctx.save();
                ctx.fillStyle = (opts && opts.fillStyle) || 'rgba(0,0,0,0.025)';
                ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
                ctx.restore();
            }
        };
        const nmValueLabels = {
            id: 'nmValueLabels',
            afterDatasetsDraw(chart, args, pluginOptions){
                const { ctx, data } = chart;
                const isPieChart = chart.config.type === 'pie';
                const maxItems = pluginOptions?.maxItems ?? 10;
                ctx.save();
                ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
                ctx.fillStyle = pluginOptions?.color || '#444';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                if(isPieChart){
                    const ds = data.datasets[0];
                    if(!ds) { ctx.restore(); return; }
                    const total = (ds.data || []).reduce((a,b)=>Number(a)+Number(b||0),0);
                    if(!total) { ctx.restore(); return; }
                    const items = chart.getDatasetMeta(0).data;
                    if(!items || items.length > 16){ ctx.restore(); return; }
                    (items || []).forEach((el, i) => {
                        const v = Number(ds.data[i]||0);
                        if(v <= 0) return;
                        const pct = (v/total)*100;
                        if(pct < (pluginOptions?.pieMinPercent ?? 5)) return; // evitar ruido
                        const pos = el.tooltipPosition();
                        ctx.fillStyle = '#222';
                        ctx.fillText(`${pct.toFixed(pct<10?1:0)}%`, pos.x, pos.y);
                    });
                    ctx.restore();
                    return;
                }

                // Para barras y línea, mostrar valores si hay pocos elementos
                const labelsCount = (data.labels||[]).length;
                if(labelsCount > maxItems){ ctx.restore(); return; }
                (data.datasets||[]).forEach((dataset, dsi) => {
                    const meta = chart.getDatasetMeta(dsi);
                    if(!meta || meta.hidden) return;
                    const isLine = (dataset.type||chart.config.type) === 'line';
                    // Evitar saturación: sólo mostrar del primer dataset en barras apiladas/mixtas
                    if(!isLine && dsi > 0 && (chart.config.type === 'mixed' || chart.config.type === 'bar')) return;
                    (meta.data||[]).forEach((el, idx) => {
                        const raw = dataset.data[idx];
                        const val = Number(raw);
                        if(!isFinite(val) || val === 0) return;
                        const pos = el.tooltipPosition();
                        ctx.fillStyle = '#222';
                        ctx.fillText(formatNumber(val), pos.x, pos.y - 6);
                    });
                });
                ctx.restore();
            }
        };
        Chart.register(nmThemeBg, nmValueLabels);

        // Defaults globales más elegantes
        Chart.defaults.font.family = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#333';
        Chart.defaults.plugins.legend.labels.boxWidth = 12;
        Chart.defaults.plugins.legend.labels.boxHeight = 12;
        Chart._nmThemeRegistered = true;
    }

    function createChart(canvas, chartConfig, data) {
        const ctx = canvas.getContext('2d');

        // Destruir cualquier gráfico anterior dibujado sobre este canvas
        const old = Chart.getChart(canvas);
        if (old) old.destroy();

        // Configuración base para las opciones
        const isPieLike = chartConfig.chart_type === 'pie' || chartConfig.chart_type === 'doughnut';
        const isPolar = chartConfig.chart_type === 'polarArea';
        const isRadar = chartConfig.chart_type === 'radar';
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
                    position: (isPieLike || isPolar) ? 'right' : 'bottom',
                    labels: {
                        padding: 16,
                        boxWidth: 12,
                        usePointStyle: false,
                        // Ocultar entradas con valor 0 en pie/donut
                        filter: function(item, chart) {
                            try {
                                if (!(isPieLike || isPolar)) return true;
                                const v = chart.chart.data.datasets[0].data[item.index] || 0;
                                return Number(v) > 0;
                            } catch (e) { return true; }
                        },
                        generateLabels: function(chart){
                            const defaultGen = Chart.defaults.plugins.legend.labels.generateLabels;
                            const labels = defaultGen(chart);
                            try {
                                if(!(isPieLike || isPolar)) return labels;
                                const ds = chart.data.datasets[0];
                                const total = (ds.data||[]).reduce((a,b)=>Number(a)+Number(b||0),0) || 1;
                                return labels.map(l => {
                                    const val = Number(ds.data[l.index]||0);
                                    const pct = (val/total)*100;
                                    return Object.assign({}, l, { text: `${l.text} (${pct.toFixed(pct<10?1:0)}%)` });
                                });
                            } catch(e){ return labels; }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const raw = context.raw;
                            const label = context.label || '';
                            if (isPieLike || isPolar) {
                                const dataArr = context.dataset.data || [];
                                const total = dataArr.reduce((a, b) => Number(a) + Number(b), 0);
                                return `${label}: ${formatNumber(raw)} (${formatPercent(raw, total)})`;
                            }
                            const dsLabel = context.dataset && context.dataset.label ? context.dataset.label + ': ' : '';
                            return `${dsLabel}${formatNumber(raw)}`;
                        }
                    }
                },
                nmThemeBg: { fillStyle: 'rgba(0,0,0,0.02)' },
                nmValueLabels: { maxItems: 10, pieMinPercent: 5 }
            },
            animation: { duration: 700, easing: 'easeOutCubic' },
            scales: {
                r: (isPolar || isRadar) ? {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    angleLines: { color: 'rgba(0,0,0,0.06)' },
                    pointLabels: { color: '#333', font: { size: 11 } },
                    ticks: { showLabelBackdrop: false, callback: (val) => formatNumber(val) }
                } : undefined,
                y: (isPieLike || isPolar || isRadar) ? undefined : {
                    beginAtZero: true,
                    position: 'left',
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    ticks: {
                        precision: 0,
                        callback: (val) => formatNumber(val),
                        maxTicksLimit: 6
                    },
                    title: {
                        display: true,
                        text: chartConfig.numeric_field1 || 'Cantidad',
                        font: { weight: 'bold' }
                    }
                },
                x: (isPieLike || isPolar || isRadar) ? undefined : {
                    grid: { display: false },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 8,
                        callback: (val, idx, ticks) => abbreviateLabel(data.labels[idx] || '')
                    }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: (isPieLike || isPolar) ? 50 : 10,
                    top: 10,
                    bottom: 10
                }
            }
        };

        // Ajustes específicos según el tipo de gráfico
        if (isPieLike) {
            options.aspectRatio = 1.5;
            if(chartConfig.chart_type === 'doughnut'){
                options.cutout = '55%';
            }
        } else if (isPolar) {
            options.aspectRatio = 1.2;
        } else if (isRadar) {
            options.aspectRatio = 1.3;
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
                dataset.tension = 0.35;
                dataset.pointRadius = 2;
                dataset.pointHoverRadius = 5;
                dataset.borderWidth = 2;
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
                    dataset.borderWidth = 2;
                }
                // Las barras mantienen sus arrays de colores
            });
        }

        // Bordes redondeados y ancho de barra agradable
        if (chartConfig.chart_type === 'bar' || chartConfig.chart_type === 'mixed') {
            data.datasets.forEach(ds => {
                if (!ds.type || ds.type === 'bar') {
                    ds.borderRadius = 8;
                    ds.barPercentage = 0.9;
                    ds.categoryPercentage = 0.8;
                }
            });
        }

        // Ajustes dataset para radar (relleno suave) y polarArea (bordes)
        if (isRadar) {
            data.datasets.forEach(ds => {
                ds.fill = true;
                if (Array.isArray(ds.backgroundColor)) {
                    ds.backgroundColor = ds.backgroundColor[0].replace(', 0.7)', ', 0.3)');
                    ds.borderColor = ds.borderColor[0];
                } else {
                    ds.backgroundColor = (ds.backgroundColor || 'rgba(54,162,235,0.7)').replace(', 0.7)', ', 0.3)');
                }
                ds.pointRadius = 2;
                ds.pointHoverRadius = 5;
            });
        } else if (isPolar) {
            data.datasets.forEach(ds => {
                ds.borderWidth = 1;
            });
        }

        // Ajustes de borde para pie/doughnut
        if (isPieLike) {
            data.datasets.forEach(ds => {
                ds.borderWidth = 1;
                ds.borderColor = Array.isArray(ds.borderColor) ? ds.borderColor : '#fff';
            });
        }

        // ================================
        // RESPETAR OPCIONES AVANZADAS
        // ================================
        // 1) Orientación de barras (bar/mixed)
        if ((chartConfig.chart_type === 'bar' || chartConfig.chart_type === 'mixed')) {
            const orientation = chartConfig.bar_orientation || 'auto';
            if (orientation === 'horizontal') {
                options.indexAxis = 'y';
            } else if (orientation === 'vertical') {
                options.indexAxis = 'x';
            } else if (!options.indexAxis && data.labels.length > 10) {
                options.indexAxis = 'y';
            }
        }

        // 2) Barras apiladas
        if ((chartConfig.chart_type === 'bar' || chartConfig.chart_type === 'mixed')) {
            const stackedMode = chartConfig.stacked || 'auto';
            const shouldStack = stackedMode === 'yes' || (stackedMode === 'auto' && data.datasets.filter(d => (!d.type || d.type === 'bar')).length > 1);
            if (!isPieLike && !isPolar && !isRadar) {
                options.scales.x = options.scales.x || {};
                options.scales.y = options.scales.y || {};
                options.scales.x.stacked = shouldStack;
                options.scales.y.stacked = shouldStack;
            }
            // En mixed, sólo apilar los datasets de barras
            if (chartConfig.chart_type === 'mixed' && shouldStack) {
                let stackId = 'nmStack1';
                data.datasets.forEach(ds => {
                    if (!ds.type || ds.type === 'bar') {
                        ds.stack = stackId;
                    }
                });
            }
        }

        // 3) Etiquetas de valor: forzar siempre/ocultar nunca
        if (options.plugins && options.plugins.nmValueLabels) {
            const mode = chartConfig.value_labels_mode || 'auto';
            if (mode === 'always') {
                options.plugins.nmValueLabels.maxItems = 1000; // mostrar siempre
                options.plugins.nmValueLabels.pieMinPercent = 0; // también en porciones pequeñas
            } else if (mode === 'never') {
                // Desactivar el plugin para este gráfico
                options.plugins.nmValueLabels = false;
            }
        }

    // Crear el gráfico y guardar referencia en dataset para exportación futura
        const chartInstance = new Chart(ctx, {
            type: chartConfig.chart_type,
            data: data,
            options: options
        });
    canvas.chartInstance = chartInstance;
    }    /**
     * Exporta un gráfico (canvas) a PDF utilizando jsPDF
     * @param {HTMLCanvasElement} canvas
     * @param {string} title
     */
    function exportChartToPDF(canvas, title){
        try {
            if(typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined'){
                alert('Librería jsPDF no cargada aún. Intenta de nuevo en un momento.');
                return;
            }
            // Compatibilidad UMD
            const jsPDFLib = window.jspdf || window.jsPDF;
            const doc = new jsPDFLib.jsPDF ? new jsPDFLib.jsPDF({orientation:'landscape'}) : new jsPDFLib({orientation:'landscape'});

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const imgData = canvas.toDataURL('image/png', 1.0);
            // Calcular tamaño proporcional
            const imgWidth = pageWidth - 20; // márgenes
            const ratio = canvas.height / canvas.width;
            const imgHeight = imgWidth * ratio;
            let y = 20;

            doc.setFontSize(14);
            doc.text(title, 10, 12);
            // Centrado vertical si sobra espacio
            if(imgHeight < pageHeight - 30){
                y = (pageHeight - imgHeight)/2;
            }
            doc.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
            const safeTitle = (title||'grafico').toLowerCase().replace(/[^a-z0-9\-_]+/gi,'_').substring(0,60);
            doc.save(`${safeTitle}.pdf`);
        } catch(e){
            console.error('Error exportando PDF', e);
            alert('No se pudo generar el PDF. Revisa la consola.');
        }
    }
    /**
     * Devuelve un array de marcadores que están actualmente visibles en el mapa
     * (es decir, que están añadidos a sus LayerGroups y esos LayerGroups están en el mapa)
     */
    function getVisibleMarkers() {
        const clusteringEnabled = nmMapData.enable_clustering === true || nmMapData.enable_clustering === 'true';
        if (clusteringEnabled) {
            if (clusteringActive && clusterGroup) {
                return allMarkers.filter(m => clusterGroup.hasLayer(m));
            } else if (!clusteringActive && markersLayer) {
                return allMarkers.filter(m => markersLayer.hasLayer(m));
            }
        }
        // Modo original
        const visible = [];
        allMarkers.forEach(marker => {
            if (marker.originalLayerGroup) {
                if (marker.originalLayerGroup.hasLayer(marker) && (map.hasLayer(marker.originalLayerGroup) || (markersLayer && markersLayer.hasLayer(marker.originalLayerGroup) && map.hasLayer(markersLayer)))) {
                    visible.push(marker);
                }
            } else if (markersLayer) {
                // Fallback SIN capas configuradas: el marcador está directamente en markersLayer
                if (markersLayer.hasLayer(marker) && map.hasLayer(markersLayer)) {
                    visible.push(marker);
                }
            }
        });
        return visible;
    }

    /**
     * Devuelve un array de features sin duplicados usando las
     * coordenadas [lon, lat] como clave única.
    
     */
    function getUniqueFeatures(markers) {
        const seen = new Set();
        const unique = [];

        markers.forEach(m => {
            const f = m && m.feature;
            if (!f) return;
            const props = f.properties || {};
            const entryId = props.entry_id || props.nm_entry_id; // preferir ID de entrada si existe
            let key = null;
            if (entryId !== undefined && entryId !== null) {
                key = 'id:' + String(entryId);
            } else {
                const coords = f.geometry && f.geometry.coordinates;
                if (Array.isArray(coords)) key = 'xy:' + coords.join(',');
            }
            if (!key) return;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(f);
            }
        });

        return unique;
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

// =====================================
// SISTEMA DE TOUR / ONBOARDING DEL MAPA
// =====================================
(function(){
    // Evitar redefinición
    if(window.startNmMapTour) return;

    function detectNmTheme(){
        try {
            const styles = Array.from(document.styleSheets).map(s => s.href||'');
            if(styles.some(h=>/theme1\.css/i.test(h))) return 'theme1';
            if(styles.some(h=>/theme2\.css/i.test(h))) return 'theme2';
        }catch(e){}
        return 'default';
    }

    function buildSteps(){
        const steps = [
            {
                selector: '#nm-main-map',
                title: 'Bienvenido',
                content: 'Este mapa interactivo permite explorar capas, filtrar datos y visualizar estadísticas. Vamos a hacer un recorrido rápido.'
            },
            {
                selector: '.nm-control-button[title="Filtros"]',
                title: 'Filtros',
                content: 'Abre el panel de filtros para activar criterios y limitar los puntos visibles. Cada filtro muestra cuántos elementos contiene.'
            },
            {
                selector: '.nm-control-button[title="Leyenda"]',
                title: 'Leyenda',
                content: 'La leyenda explica los colores y capas disponibles. Puedes mostrar u ocultarla cuando quieras.'
            },
            {
                selector: '.nm-search-container .nm-control-button',
                title: 'Búsqueda',
                content: 'Busca ubicaciones rápidamente: escribe una dirección o término y pulsa Enter para centrar el mapa.'
            },
            {
                selector: '.nm-control-button[title="Añadir capa WMS"]',
                title: 'Capas WMS',
                content: 'Añade capas WMS personalizadas proporcionando una URL de servicio para enriquecer el mapa.'
            },
            {
                selector: '.nm-control-button[title^="Ver gráficos"]',
                title: 'Gráficos dinámicos',
                content: 'Genera gráficos interactivos basados en los puntos visibles y filtros activos.'
            },
            {
                selector: '.leaflet-control-layers',
                title: 'Control de capas',
                content: 'Activa o desactiva capas base y overlays. Úsalo para comparar información.'
            },
            {
                selector: '#nm-points-count',
                title: 'Conteo de puntos',
                content: 'Muestra cuántos puntos están visibles respecto al total. Cambia automáticamente al aplicar filtros.'
            },
            {
                selector: '#nm-main-map',
                title: 'Marcas y detalles',
                content: 'Haz clic en un punto para ver sus datos en el panel lateral. ¡Explora y descubre!'
            },
            {
                selector: '#nm-help-tour-btn',
                title: 'Fin',
                content: 'Eso es todo. Puedes volver a ver este tour pulsando el botón con el símbolo “?”.'
            }
        ];
        // Filtrar pasos donde el elemento no existe en el DOM
        return steps.filter(s => document.querySelector(s.selector));
    }

    function createOverlay(){
        const ov = document.createElement('div');
        ov.className = 'nm-tour-overlay';
        ov.setAttribute('data-theme', detectNmTheme());
        document.body.appendChild(ov);
        return ov;
    }

    function createTooltip(){
        const box = document.createElement('div');
        box.className = 'nm-tour-tooltip';
        box.innerHTML = `
            <div class="nm-tour-header">
                <h3 class="nm-tour-title"></h3>
                <button type="button" class="nm-tour-close" aria-label="Cerrar">×</button>
            </div>
            <div class="nm-tour-body"></div>
            <div class="nm-tour-footer">
                <button type="button" class="nm-tour-prev" disabled>Anterior</button>
                <button type="button" class="nm-tour-next">Siguiente</button>
                <button type="button" class="nm-tour-skip">Saltar</button>
            </div>`;
        document.body.appendChild(box);
        return box;
    }

    function scrollIntoViewIfNeeded(el){
        if(!el) return;
        const rect = el.getBoundingClientRect();
        if(rect.top < 0 || rect.bottom > window.innerHeight){
            el.scrollIntoView({behavior:'smooth', block:'center'});
        }
    }

    function positionTooltip(box, target){
        const padding = 10;
        const rect = target.getBoundingClientRect();
        const boxRect = box.getBoundingClientRect();
        let top = rect.bottom + padding;
        let left = rect.left + (rect.width/2) - (boxRect.width/2);
        // Ajustes de límites
        if(left < 10) left = 10;
        if(left + boxRect.width > window.innerWidth - 10){
            left = window.innerWidth - boxRect.width - 10;
        }
        if(top + boxRect.height > window.innerHeight - 10){
            top = rect.top - boxRect.height - padding;
        }
        if(top < 10) top = 10;
        box.style.top = top + 'px';
        box.style.left = left + 'px';
    }

    function highlightElement(overlay, el){
        const r = el.getBoundingClientRect();
        overlay.style.setProperty('--nm-tour-top', r.top + 'px');
        overlay.style.setProperty('--nm-tour-left', r.left + 'px');
        overlay.style.setProperty('--nm-tour-width', r.width + 'px');
        overlay.style.setProperty('--nm-tour-height', r.height + 'px');
        overlay.classList.add('nm-active');
    }

    function clearTour(overlay, tooltip){
        overlay && overlay.remove();
        tooltip && tooltip.remove();
    }

    window.startNmMapTour = function(auto){
        const steps = buildSteps();
        if(!steps.length) return;
        let index = 0;
        const overlay = createOverlay();
        const tooltip = createTooltip();

        const titleEl = tooltip.querySelector('.nm-tour-title');
        const bodyEl = tooltip.querySelector('.nm-tour-body');
        const btnPrev = tooltip.querySelector('.nm-tour-prev');
        const btnNext = tooltip.querySelector('.nm-tour-next');
        const btnSkip = tooltip.querySelector('.nm-tour-skip');
        const btnClose = tooltip.querySelector('.nm-tour-close');

        function update(){
            const step = steps[index];
            const target = document.querySelector(step.selector);
            if(!target){
                // Si desaparece, saltar
                if(index < steps.length -1){ index++; update(); return; }
            }
            titleEl.textContent = step.title;
            bodyEl.textContent = step.content;
            btnPrev.disabled = index === 0;
            btnNext.textContent = index === steps.length -1 ? 'Finalizar' : 'Siguiente';
            highlightElement(overlay, target || document.body);
            positionTooltip(tooltip, target || document.body);
            scrollIntoViewIfNeeded(target);
            // Accesible
            tooltip.setAttribute('role','dialog');
            tooltip.setAttribute('aria-label', step.title);
        }

        function finish(){
            clearTour(overlay, tooltip);
            localStorage.setItem('nmMapTourSeen','1');
        }

        btnPrev.addEventListener('click', function(){
            if(index>0){ index--; update(); }
        });
        btnNext.addEventListener('click', function(){
            if(index < steps.length -1){ index++; update(); } else { finish(); }
        });
        btnSkip.addEventListener('click', finish);
        btnClose.addEventListener('click', finish);
        window.addEventListener('resize', function(){
            const step = steps[index];
            const target = document.querySelector(step.selector);
            if(target){ positionTooltip(tooltip, target); highlightElement(overlay, target); }
        });
        update();
    }
})();

