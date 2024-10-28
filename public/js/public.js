var map;
var overlay;
// Crear objetos para las capas base y overlays
var baseLayers = {};
var overlays = {};
var controlLayers;

jQuery(document).ready(function ($) {
    if ($('#nm-main-map').length) {

        map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);



        // Crear el contenedor de controles si aún no existe
        if ($('#nm-top-controls').length === 0) {
            $('#nm-main-map').append('<div id="nm-top-controls" class="nm-top-controls"></div>');
        }

        // Referencia al contenedor de controles
        var $topControls = $('#nm-top-controls');

        // Botón de descarga de GeoJSON
        if (nmMapData.enable_geojson_download) {
            var $downloadButton = $('<button>', {
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
            var $searchContainer = $('<div>', { class: 'nm-search-container' });
            var $searchButton = $('<button>', {
                class: 'nm-control-button',
                title: 'Buscar',
                html: '<i class="fa fa-search"></i>'
            });
            $searchButton.on('click', function (e) {
                e.stopPropagation();
                toggleSearchInput();
            });
            $searchContainer.append($searchButton);

            var $searchInput = $('<input>', {
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
            var $addWmsButton = $('<button>', {
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
        $('#nm-main-map').css('position', 'relative');

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








