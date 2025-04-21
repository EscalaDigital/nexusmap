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
        var drawMap = L.map('nm-map-canvas').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(drawMap);

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

            fileInputs.each(function() {
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
                complete: function() {
                    // Restaurar el botón de envío
                    submitButton.prop('disabled', false).text(originalText);
                }
            });
        });
    }
});
