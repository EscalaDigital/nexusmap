var map;

jQuery(document).ready(function ($) {
    if ($('#nm-main-map').length) {

        map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);

        // Crear objetos para las capas base y overlays
        var baseLayers = {};
        var overlays = {};

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
                var overlay;
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
        L.control.layers(baseLayers, overlays).addTo(map);



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

    if ($('#nm-user-form').length) {
        // Initialize map drawing
        var drawMap = L.map('nm-map-canvas').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(drawMap);

        var drawnItems = new L.FeatureGroup();
        drawMap.addLayer(drawnItems);

        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            }
        });
        drawMap.addControl(drawControl);

        drawMap.on(L.Draw.Event.CREATED, function (e) {
            drawnItems.addLayer(e.layer);
        });

        $('#nm-user-form').submit(function (e) {
            e.preventDefault();

            var formData = new FormData(this);

            // Agregar el parámetro 'action' requerido por WordPress
            formData.append('action', 'nm_submit_form');

            // Agregar el nonce para la verificación de seguridad
            formData.append('nonce', nmPublic.nonce);

            // Obtener los datos de los campos dibujados en el mapa
            var shapes = [];
            var otherFields = $(this).serializeArray();

            drawnItems.eachLayer(function (layer) {
                var geoJson = layer.toGeoJSON();

                // Crear un nuevo objeto GeoJSON con 'geometry' antes que 'properties'
                var orderedGeoJson = {
                    type: geoJson.type,
                    geometry: geoJson.geometry,
                    properties: {}
                };

                // Procesar los campos del formulario y agrupar valores por nombre de campo
                var formFields = {};

                for (var i = 0; i < otherFields.length; i++) {
                    var field = otherFields[i];
                    if (formFields[field.name]) {
                        if (Array.isArray(formFields[field.name])) {
                            formFields[field.name].push(field.value);
                        } else {
                            formFields[field.name] = [formFields[field.name], field.value];
                        }
                    } else {
                        formFields[field.name] = field.value;
                    }
                }

                // Añadir los campos del formulario a orderedGeoJson.properties
                for (var fieldName in formFields) {
                    orderedGeoJson.properties['nm_' + fieldName] = formFields[fieldName];
                }

                shapes.push(orderedGeoJson);
            });

            formData.append('form_data[map_data]', JSON.stringify(shapes));


            $.ajax({
                url: nmPublic.ajax_url,
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    alert('Form submitted successfully.');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Error submitting form: ' + textStatus);
                    console.error('AJAX Error:', textStatus, errorThrown);
                }
            });
        });


    }


});

//funcion para descargar datos en formato geojson
// Manejar el botón de descarga
function downloadGeoJson() {
    $.ajax({
        url: nmMapData.ajax_url,
        method: 'POST',
        data: {
            action: 'nm_download_geojson',
            nonce: nmMapData.nonce
        },
        success: function (response) {
            if (response.success) {
                // Crear un enlace de descarga
                var blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'nexusmap_data.geojson';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('Error downloading GeoJSON: ' + response.data);
            }
        },
        error: function () {
            alert('An error occurred while downloading GeoJSON.');
        }
    });
}

//funcion para abrir el control de busqueda
function toggleSearchInput() {
    var $searchInput = $('.nm-search-input');
    $searchInput.toggle();
    if ($searchInput.is(':visible')) {
        $searchInput.focus();
    }
}

function performSearch(query) {
    if (!query) {
        alert('Por favor, ingrese una ubicación para buscar.');
        return;
    }

    // Usar el geocodificador para obtener las coordenadas
    var geocoder = L.Control.Geocoder.nominatim(); // O el geocodificador que estés utilizando
    geocoder.geocode(query, function(results) {
        if (results && results.length > 0) {
            var result = results[0];
            map.setView(result.center, 18); // Ajusta el nivel de zoom según sea necesario
        } else {
            alert('No se encontraron resultados para: ' + query);
        }
    });
}


//funciones para mostrar datos de elementos puntuales
// Función para mostrar un modal con las propiedades de un elemento
function showModal(properties) {
    var modalContent = '<div class="nm-modal-content">';

    for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
            // Omitir el 'entry_id' si aún está presente
            if (key === 'entry_id') {
                continue;
            }

            // Remover el prefijo 'nm_' si existe (si no lo has hecho ya en el servidor)
            var cleanKey = key.startsWith('nm_') ? key.substring(3) : key;

            // Formatear la clave para mostrarla como etiqueta
            var label = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1).replace(/_/g, ' ');

            var value = properties[key];

            // Verificar si el valor es una URL de archivo
            if (isValidURL(value) && isFile(value)) {
                // Determinar el tipo de archivo por la extensión
                var fileType = getFileExtension(value).toLowerCase();

                if (isImage(fileType)) {
                    // Mostrar la imagen
                    modalContent += '<p><strong>' + label + ':</strong><br><img src="' + value + '" alt="' + label + '" style="max-width:100%; height:auto;"></p>';
                } else if (fileType === 'pdf') {
                    // Mostrar un enlace al PDF
                    modalContent += '<p><strong>' + label + ':</strong> <a href="' + value + '" target="_blank">Ver documento PDF</a></p>';
                } else {
                    // Para otros tipos de archivos, mostrar un enlace de descarga
                    modalContent += '<p><strong>' + label + ':</strong> <a href="' + value + '" download>Descargar archivo</a></p>';
                }
            } else {
                // Mostrar el valor como texto
                modalContent += '<p><strong>' + label + ':</strong> ' + value + '</p>';
            }
        }
    }

    modalContent += '</div>';

    // Insertar el contenido en el cuerpo del modal
    $('#nm-modal-body').html(modalContent);

    // Mostrar el modal
    $('#nm-modal').css('display', 'block');

    // Manejar el cierre del modal
    $('#nm-modal-close').on('click', function () {
        $('#nm-modal').css('display', 'none');
    });

    $(window).on('click', function (event) {
        if ($(event.target).is('#nm-modal')) {
            $('#nm-modal').css('display', 'none');
        }
    });
}


// Función para validar si una cadena es una URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Función para verificar si una URL es de un archivo (por ejemplo, si termina con una extensión de archivo)
function isFile(url) {
    var extension = getFileExtension(url);
    return extension !== '';
}

// Función para obtener la extensión del archivo de una URL
function getFileExtension(url) {
    var parsedUrl = new URL(url);
    var pathname = parsedUrl.pathname;
    var lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
    var dotIndex = lastSegment.lastIndexOf('.');
    if (dotIndex !== -1) {
        return lastSegment.substring(dotIndex + 1);
    }
    return '';
}

// Función para verificar si una extensión es de imagen
function isImage(extension) {
    var imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(extension);
}


