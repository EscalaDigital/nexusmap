var map;
var overlay;
// Crear objetos para las capas base y overlays
var baseLayers = {};
var overlays = {};
var controlLayers;

jQuery(document).ready(function ($) {
    if (jQuery('#nm-main-map').length) {
        
        // Depuración: verificar que las librerías estén cargadas
        console.log('=== DEPURACIÓN DE NEXUSMAP ===');
        console.log('jQuery disponible:', typeof jQuery !== 'undefined');
        console.log('Leaflet disponible:', typeof L !== 'undefined');
        console.log('Geocoder disponible:', typeof L !== 'undefined' && typeof L.Control !== 'undefined' && typeof L.Control.Geocoder !== 'undefined');
        console.log('Configuración del mapa:', nmMapData);
        console.log('Búsqueda habilitada:', nmMapData.enable_search);
        console.log('============================');

        map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);



        // Crear el contenedor de controles si aún no existe
        if (jQuery('#nm-top-controls').length === 0) {
            jQuery('#nm-main-map').append('<div id="nm-top-controls" class="nm-top-controls"></div>');
        }        // Referencia al contenedor de controles
        var $topControls = jQuery('#nm-top-controls');        // Botón de búsqueda y campo de entrada
        if (nmMapData.enable_search) {
            console.log('Inicializando funcionalidad de búsqueda...');
            
            var $searchContainer = jQuery('<div>', { class: 'nm-search-container' });
            var $searchButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Buscar ubicación',
                html: '<i class="fa fa-search"></i>'
            });
            
            $searchButton.on('click', function (e) {
                e.stopPropagation();
                console.log('Botón de búsqueda clickeado');
                toggleSearchInput();
            });
            $searchContainer.append($searchButton);

            var $searchInput = jQuery('<input>', {
                type: 'text',
                class: 'nm-search-input',
                placeholder: 'Buscar ubicación...',
                autocomplete: 'off'
            }).hide();            // Manejar el envío con Enter
            $searchInput.on('keypress', function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    e.stopPropagation(); // Evitar propagación del evento
                    
                    var query = $searchInput.val().trim();
                    console.log('Búsqueda iniciada con:', query);
                    if (query) {
                        performSearch(query);
                    }
                }
            });
            
            // Manejar escape para cerrar
            $searchInput.on('keydown', function (e) {
                if (e.which === 27) { // Escape key
                    console.log('Cerrando búsqueda con Escape');
                    $searchInput.hide();
                }
            });

            $searchContainer.append($searchInput);
            $topControls.append($searchContainer);
            
            console.log('Funcionalidad de búsqueda inicializada correctamente');
        } else {
            console.log('Búsqueda deshabilitada en la configuración');
        }// Botón para añadir capas WMS
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

        // Botón para descargar GeoJSON
        if (nmMapData.enable_geojson_download) {
            var $downloadButton = jQuery('<button>', {
                class: 'nm-control-button',
                title: 'Descargar datos en formato GeoJSON',
                html: '<i class="fa fa-download"></i>'
            });
            $downloadButton.on('click', function (e) {
                e.stopPropagation(); // Evita que el evento se propague al mapa
                downloadGeoJson();
            });
            $topControls.append($downloadButton);
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
        }        // Agregar las capas overlay (solo WMS)
        if (Array.isArray(nmMapData.overlay_layers) && nmMapData.overlay_layers.length > 0) {
            nmMapData.overlay_layers.forEach(function (layer) {
                if (layer.type === 'wms') {
                    // Agregar capa WMS
                    overlay = L.tileLayer.wms(layer.url, {
                        layers: layer.wms_layer_name,
                        format: 'image/png',
                        transparent: true,
                        attribution: layer.attribution || ''
                    });
                    overlays[layer.name] = overlay;
                }
            });
        }// Agregar controles de capas
        controlLayers = L.control.layers(baseLayers, overlays).addTo(map);



        // Load points via AJAX
        $.post(nmMapData.ajax_url, {
            action: 'nm_get_map_points',
            nonce: nmMapData.nonce
        }, function (response) {
            if (Array.isArray(response)) {
                L.geoJSON(response, {
                    pointToLayer: function (feature, latlng) {
                        return L.marker(latlng);
                    },
                    onEachFeature: function (feature, layer) {
                        // Agregar un evento de clic al marcador
                        layer.on('click', function () {
                            // Obtener las propiedades del feature
                            var properties = feature.properties;

                            // Clonar el objeto properties para no modificar el original
                            var propertiesToShow = Object.assign({}, properties);

                            // Remover el entry_id de las propiedades a mostrar
                            delete propertiesToShow.entry_id;



                            // Mostrar el modal con las propiedades
                            showModal(propertiesToShow);
                        });
                    }
                }).addTo(map);
            } else {
                console.error('Invalid response from server:', response);
            }

        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        });

    }

});








