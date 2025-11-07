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
            var searchCircle = null;

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
            if (searchCircle) {
                drawMap.removeLayer(searchCircle);
            }
            // Crear círculo con radio de 100 metros
            searchCircle = L.circle([lat, lng], {
                radius: 100,
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.2
            }).addTo(drawMap);
            
            drawMap.setView([lat, lng], 16);
            searchCircle.bindPopup(`Latitud: ${lat}<br>Longitud: ${lng}`).openPopup();
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
                if (searchCircle) {
                    drawMap.removeLayer(searchCircle);
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
                                // Crear círculo con radio de 100 metros
                                searchCircle = L.circle(latlng, {
                                    radius: 100,
                                    color: '#3388ff',
                                    fillColor: '#3388ff',
                                    fillOpacity: 0.2
                                }).addTo(drawMap);
                                
                                drawMap.setView(latlng, 16);
                                searchCircle.bindPopup(result.display_name).openPopup();
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
                    // Crear círculo con radio de 100 metros
                    searchCircle = L.circle(latlng, {
                        radius: 100,
                        color: '#3388ff',
                        fillColor: '#3388ff',
                        fillOpacity: 0.2
                    }).addTo(drawMap);
                    
                    drawMap.setView(latlng, 16);
                    searchCircle.bindPopup(result.display_name).openPopup();
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

            /* ---------------------------------------------------------------------------
 *  ENVÍO DEL FORMULARIO
 * ------------------------------------------------------------------------ */
            jQuery('#nm-user-form').on('submit', function (e) {
                e.preventDefault();
                jQuery('#nm-form-messages').hide();

                /* ------------------------------------------------
                 * 1.  VALIDAR ARCHIVOS (tamaño y tipo)
                 * ---------------------------------------------- */                let hasFileError = false;
                jQuery('input[type="file"]').each(function () {
                    if (this.files.length === 0) return;

                    const file = this.files[0];
                    const maxSize = 5 * 1024 * 1024;                     // 5 MB
                    const $input = jQuery(this);                    // Detectar el tipo de campo usando el atributo data-type del contenedor
                    const $fieldContainer = $input.closest('.nm-form-field');
                    const fieldType = $fieldContainer.attr('data-type');
                    
                    let allowedMime;
                    let errorMessage;
                    
                    if (fieldType === 'audio') {
                        allowedMime = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac'];
                        errorMessage = 'Tipo de archivo de audio no permitido. Use: MP3, WAV, OGG, FLAC, M4A, AAC.';
                    } else if (fieldType === 'image') {
                        allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        errorMessage = 'Tipo de imagen no permitido. Solo se permiten: JPG, JPEG, PNG, GIF, WEBP.';
                    } else if (fieldType === 'file') {
                        allowedMime = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/rtf'];
                        errorMessage = 'Tipo de documento no permitido. Solo se permiten: PDF, DOC, DOCX, XLS, XLSX, TXT, RTF.';
                    } else {
                        // Para compatibilidad con campos antiguos (asumimos imagen)
                        allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        errorMessage = 'Tipo de imagen no permitido. Solo se permiten: JPG, JPEG, PNG, GIF, WEBP.';
                    }

                    if (file.size > maxSize) {
                        showMessage('El archivo es demasiado grande. Tamaño máximo: 5 MB.', 'error');
                        hasFileError = true;
                        return false;                                       // break
                    }
                    if (!allowedMime.includes(file.type)) {
                        showMessage(errorMessage, 'error');
                        hasFileError = true;
                        return false;                                       // break
                    }
                });
                if (hasFileError) return;

                /* ------------------------------------------------
                 * 2.  OBTENER GEOMETRÍAS DIBUJADAS (Leaflet)
                 * ---------------------------------------------- */
                const geometries = [];
                drawnItems.eachLayer(layer => geometries.push(layer.toGeoJSON().geometry));

                if (geometries.length === 0) {
                    showMessage('Por favor, dibuje al menos una geometría en el mapa.', 'error');
                    return;
                }
                const geometry = (geometries.length === 1)
                    ? geometries[0]
                    : { type: 'GeometryCollection', geometries };

                /* ------------------------------------------------
                 * 3.  CAMPOS DEL FORMULARIO
                 *     – normales  → formFields[ nm_<name> ]
                 *     – condicionales agrupados → nm_conditional_groups  (JSON)
                 * ---------------------------------------------- */
                const formFields = {};
                const skipNames = new Set();   // evita duplicar sub-campos
                const conditionalGroups = {};          // {selectId: {select_name, …}}

                /* 3.1 – Agrupar condicionales */
                jQuery('.nm-conditional-select').each(function () {
                    const $select = jQuery(this);
                    const selectId = $select.data('select-id');
                    const selValue = $select.val();
                    if (!selValue) return;                                // nada elegido

                    const group = {
                        select_name: $select.attr('name'),
                        selected_value: selValue,
                        option_label: $select.find('option:selected').text(),
                        fields: {}
                    };

                    $select.closest('.nm-form-field')
                        .find('.conditional-target :input[name]')
                        .each(function () {
                            const $input = jQuery(this);
                            const name = $input.attr('name');
                            let value;

                            if ($input.is(':checkbox')) {
                                if (!group.fields[name]) group.fields[name] = [];
                                if ($input.is(':checked')) group.fields[name].push($input.val());
                            } else if ($input.is(':radio')) {
                                if ($input.is(':checked')) value = $input.val();
                            } else {
                                value = $input.val();
                            }
                            if (value !== undefined && !Array.isArray(group.fields[name])) {
                                group.fields[name] = value;
                            }
                            skipNames.add(name);                      // no duplicar
                        });

                    conditionalGroups[selectId] = group;
                });

                /* 3.2 – Campos normales */
                jQuery(this).serializeArray().forEach(({ name, value }) => {
                    if (skipNames.has(name)) return;                      // ya tratado

                    const key = 'nm_' + name;
                    if (formFields[key] === undefined) {
                        formFields[key] = value;
                    } else {
                        if (!Array.isArray(formFields[key])) {
                            formFields[key] = [formFields[key]];
                        }
                        formFields[key].push(value);
                    }
                });

                /* 3.3 – Añadir los condicionales agrupados */
                formFields['nm_conditional_groups'] = JSON.stringify(conditionalGroups);

                /* ------------------------------------------------
                 * 4.  FEATURE GEOJSON COMPLETO
                 * ---------------------------------------------- */
                const feature = {
                    type: 'Feature',
                    geometry: geometry,
                    properties: formFields
                };

                /* ------------------------------------------------
                 * 5.  FormData + AJAX
                 * ---------------------------------------------- */
                const formData = new FormData(this);
                formData.append('action', 'nm_submit_form');
                formData.append('nonce', nmPublic.nonce);
                formData.append('map_data', JSON.stringify(feature));

                const $btn = jQuery(this).find('button[type="submit"]');
                const btnTxtOrig = $btn.text();
                $btn.prop('disabled', true).text('Enviando…');

                jQuery.ajax({
                    url: nmPublic.ajax_url,
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,

                    success: function (resp) {
                        if (resp.success) {
                            showMessage('Formulario enviado exitosamente.', 'success');
                            jQuery('#nm-user-form')[0].reset();
                            drawnItems.clearLayers();
                        } else {
                            showMessage('Error al enviar el formulario: ' +
                                parseServerError(resp), 'error');
                        }
                    },
                    error: function (jqXHR, textStatus) {
                        let msg = 'Error al enviar el formulario: ';
                        switch (jqXHR.status) {
                            case 413: msg += 'El archivo es demasiado grande para el servidor.'; break;
                            case 404: msg += 'No se encontró la URL del servidor.'; break;
                            case 500: msg += 'Error interno del servidor.'; break;
                            case 0: msg += 'No se pudo conectar con el servidor.'; break;
                            default: msg += textStatus || 'Error desconocido';
                        }
                        showMessage(msg, 'error');
                        console.error('AJAX Error →', jqXHR.status, textStatus);
                    },
                    complete: () => $btn.prop('disabled', false).text(btnTxtOrig)
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
