jQuery(document).ready(function ($) {
    // Función para mostrar mensajes
    function showMessage(message, type) {
        const messageDiv = $('#nm-form-messages');
        messageDiv.removeClass('error success').addClass(type);
        messageDiv.html(message);
        messageDiv.show();

        // Scroll hacia el mensaje
        $('html, body').animate({
            scrollTop: messageDiv.offset().top - 100
        }, 500);
    }

    // Función para parsear el error del servidor
    function parseServerError(response) {
        if (typeof response === 'string') {
            return response;
        }
        if (response.error) {
            return response.error;
        }
        if (response.message) {
            return response.message;
        }
        return 'Error desconocido en el servidor';
    }

    if (jQuery('#nm-user-form').length) {
        // Initialize map drawing
        // ① Comprobamos que exista el contenedor
        var $mapCanvas = $('#nm-map-canvas');
        if ($mapCanvas.length) {

            // ② Solo entonces iniciamos Leaflet
            var drawMap = L.map($mapCanvas[0]).setView([0, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(drawMap);

            // Agregar control de búsqueda
            var searchControl = L.control({ position: 'topleft' });
            searchControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'leaflet-control-search');
                div.innerHTML = `
                <div class="search-container" style="background: white; padding: 5px; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);">
                    <input type="text" id="search-input" placeholder="Buscar lugar o coordenadas" style="width: 200px; padding: 5px;">
                    <button id="search-button" style="margin-left: 5px;"><i class="fas fa-search"></i></button>
                </div>
            `;
                return div;
            };
            searchControl.addTo(drawMap);

            // Prevenir que el mapa se mueva al interactuar con el control de búsqueda
            L.DomEvent.disableClickPropagation(searchControl.getContainer());
            L.DomEvent.disableScrollPropagation(searchControl.getContainer());

            // Variable para almacenar el marcador de búsqueda
            var searchMarker = null;

            // Función de búsqueda
            function performSearch(query) {
                if (!query) {
                    showMessage('Por favor, ingrese una ubicación o coordenadas para buscar.', 'error');
                    return;
                }

                // Comprobar si son coordenadas (formato: latitud,longitud)
                const coordsRegex = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
                const coordsMatch = query.match(coordsRegex);

                if (coordsMatch) {
                    const lat = parseFloat(coordsMatch[1]);
                    const lng = parseFloat(coordsMatch[2]);

                    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        if (searchMarker) {
                            drawMap.removeLayer(searchMarker);
                        }
                        searchMarker = L.marker([lat, lng]).addTo(drawMap);
                        drawMap.setView([lat, lng], 16);
                        searchMarker.bindPopup(`Latitud: ${lat}<br>Longitud: ${lng}`).openPopup();
                    } else {
                        showMessage('Coordenadas fuera de rango. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.', 'error');
                    }
                    return;
                }

                // Si no son coordenadas, buscar por nombre usando Nominatim
                $.ajax({
                    url: 'https://nominatim.openstreetmap.org/search',
                    data: {
                        q: query,
                        format: 'json',
                        limit: 5
                    },
                    success: function (results) {
                        if (results && results.length > 0) {
                            if (searchMarker) {
                                drawMap.removeLayer(searchMarker);
                            }

                            if (results.length > 1) {
                                // Crear modal para múltiples resultados
                                const $modal = $('<div>').addClass('search-results-modal').css({
                                    'position': 'fixed',
                                    'top': '50%',
                                    'left': '50%',
                                    'transform': 'translate(-50%, -50%)',
                                    'background': 'white',
                                    'padding': '20px',
                                    'border-radius': '5px',
                                    'z-index': '1000',
                                    'max-height': '80vh',
                                    'overflow-y': 'auto'
                                });

                                const $list = $('<ul>').css({
                                    'list-style': 'none',
                                    'padding': '0'
                                });

                                results.forEach(result => {
                                    $('<li>')
                                        .text(result.display_name)
                                        .css({
                                            'padding': '10px',
                                            'cursor': 'pointer',
                                            'border-bottom': '1px solid #eee'
                                        })
                                        .hover(
                                            function () { $(this).css('background-color', '#f0f0f0'); },
                                            function () { $(this).css('background-color', 'transparent'); }
                                        )
                                        .on('click', function () {
                                            const latlng = [parseFloat(result.lat), parseFloat(result.lon)];
                                            searchMarker = L.marker(latlng).addTo(drawMap);
                                            drawMap.setView(latlng, 16);
                                            searchMarker.bindPopup(result.display_name).openPopup();
                                            $modal.remove();
                                        })
                                        .appendTo($list);
                                });

                                $modal.append($list);
                                $('body').append($modal);

                                // Cerrar modal al hacer clic fuera
                                $(document).on('click', function (e) {
                                    if (!$(e.target).closest('.search-results-modal').length) {
                                        $modal.remove();
                                    }
                                });
                            } else {
                                const result = results[0];
                                const latlng = [parseFloat(result.lat), parseFloat(result.lon)];
                                searchMarker = L.marker(latlng).addTo(drawMap);
                                drawMap.setView(latlng, 16);
                                searchMarker.bindPopup(result.display_name).openPopup();
                            }
                        } else {
                            showMessage('No se encontraron resultados para: ' + query, 'error');
                        }
                    },
                    error: function () {
                        showMessage('Error al realizar la búsqueda. Por favor, inténtelo de nuevo.', 'error');
                    }
                });
            }

            // Manejar evento de búsqueda
            $('#search-button').on('click', function () {
                performSearch($('#search-input').val().trim());
            });

            // Manejar búsqueda con Enter
            $('#search-input').on('keypress', function (e) {
                if (e.which === 13) {
                    performSearch($(this).val().trim());
                }
            });

            var drawnItems = new L.FeatureGroup();
            drawMap.addLayer(drawnItems);

            // Configuración de Leaflet Draw
            var drawControl = new L.Control.Draw({
                draw: {
                    polyline: false,    // Deshabilita líneas
                    polygon: false,     // Deshabilita polígonos
                    rectangle: false,   // Deshabilita rectángulos
                    circle: false,      // Deshabilita círculos
                    circlemarker: false,// Deshabilita marcadores de círculo
                    marker: true        // Solo habilita el marcador
                },
                edit: {
                    featureGroup: drawnItems // Añadir el grupo de características editables
                }
            });
            drawMap.addControl(drawControl);

            drawMap.on(L.Draw.Event.CREATED, function (e) {
                // Vaciar drawnItems
                drawnItems.clearLayers();
                drawnItems.addLayer(e.layer);
            });

            jQuery('#nm-user-form').submit(function (e) {
                e.preventDefault();
                $('#nm-form-messages').hide();

                var formData = new FormData(this);
                formData.append('action', 'nm_submit_form');
                formData.append('nonce', nmPublic.nonce);

                // Validar archivos si existen
                const fileInputs = $('input[type="file"]');
                let hasFileError = false;

                fileInputs.each(function () {
                    if (this.files.length > 0) {
                        const file = this.files[0];
                        const maxSize = 5 * 1024 * 1024; // 5MB
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

                        if (file.size > maxSize) {
                            showMessage('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.', 'error');
                            hasFileError = true;
                            return false;
                        }

                        if (!allowedTypes.includes(file.type)) {
                            showMessage('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG y GIF.', 'error');
                            hasFileError = true;
                            return false;
                        }
                    }
                });

                if (hasFileError) {
                    return;
                }

                // Collect geometries
                var geometries = [];
                drawnItems.eachLayer(function (layer) {
                    var geoJson = layer.toGeoJSON();
                    geometries.push(geoJson.geometry);
                });

                var geometry;
                if (geometries.length === 1) {
                    geometry = geometries[0];
                } else if (geometries.length > 1) {
                    geometry = {
                        type: 'GeometryCollection',
                        geometries: geometries
                    };
                } else {
                    showMessage('Por favor, dibuje al menos una geometría en el mapa.', 'error');
                    return;
                }

                // Collect form fields into an object
                var formFields = {};
                jQuery('#nm-user-form').serializeArray().forEach(function (field) {
                    // Handle multiple values for checkboxes
                    if (formFields['nm_' + field.name]) {
                        if (Array.isArray(formFields['nm_' + field.name])) {
                            formFields['nm_' + field.name].push(field.value);
                        } else {
                            formFields['nm_' + field.name] = [formFields['nm_' + field.name], field.value];
                        }
                    } else {
                        formFields['nm_' + field.name] = field.value;
                    }
                });

                var feature = {
                    type: 'Feature',
                    geometry: geometry,
                    properties: formFields
                };

                var orderedFeature = {
                    type: feature.type,
                    geometry: feature.geometry,
                    properties: feature.properties
                };

                formData.append('map_data', JSON.stringify(orderedFeature));

                // Mostrar indicador de carga
                const submitButton = $(this).find('button[type="submit"]');
                const originalText = submitButton.text();
                submitButton.prop('disabled', true).text('Enviando...');

                jQuery.ajax({
                    url: nmPublic.ajax_url,
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.success) {
                            showMessage('Formulario enviado exitosamente.', 'success');
                            // Opcional: limpiar el formulario
                            $('#nm-user-form')[0].reset();
                            drawnItems.clearLayers();
                        } else {
                            const errorMessage = parseServerError(response);
                            showMessage('Error al enviar el formulario: ' + errorMessage, 'error');
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let errorMessage = 'Error al enviar el formulario: ';

                        switch (jqXHR.status) {
                            case 413:
                                errorMessage += 'El archivo es demasiado grande para el servidor.';
                                break;
                            case 404:
                                errorMessage += 'No se encontró la URL del servidor.';
                                break;
                            case 500:
                                errorMessage += 'Error interno del servidor.';
                                break;
                            case 0:
                                errorMessage += 'No se pudo conectar con el servidor. Compruebe su conexión.';
                                break;
                            default:
                                errorMessage += textStatus || 'Error desconocido';
                        }

                        showMessage(errorMessage, 'error');
                        console.error('AJAX Error:', {
                            status: jqXHR.status,
                            textStatus: textStatus,
                            errorThrown: errorThrown
                        });
                    },
                    complete: function () {
                        // Restaurar el botón de envío
                        submitButton.prop('disabled', false).text(originalText);
                    }
                });
            });

        }
    }

    /*-------------------------------------------
     * Campos condicionales (front)
     *------------------------------------------*/
    $(document).on('change', 'select.nm-conditional-select', function () {

        const $select = $(this);
        const optionId = $select.find('option:selected').data('option-id') || '';
        const selectId = $select.data('select-id');
        const $target = $select.closest('.nm-form-field').find('.conditional-target');

        if (!optionId) {                // sin opción → limpiamos
            $target.empty();
            return;
        }

        $.post(nmPublic.ajax_url, {
            action: 'nm_get_conditional_fields',
            nonce: nmPublic.nonce,
            select_id: selectId,
            option_id: optionId
        }, function (response) {
            $target.html(response.success ? response.data : '');
        }, 'json');
    });


});
