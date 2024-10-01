jQuery(document).ready(function ($) {
    if ($('#nm-main-map').length) {

        var map = L.map('nm-main-map').setView([nmMapData.lat, nmMapData.lng], nmMapData.zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Load points via AJAX
        $.post(nmMapData.ajax_url, {
            action: 'nm_get_map_points',
            nonce: nmMapData.nonce
        }, function (response) {
            console.log(response);
            if (Array.isArray(response)) {
                response.forEach(function (feature) {
                    if (feature.geometry && feature.geometry.type === 'Point') {
                        var coords = feature.geometry.coordinates;
                        var lng = coords[0];
                        var lat = coords[1];
                        var marker = L.marker([lat, lng]).addTo(map);
                        var title = feature.properties && feature.properties.title ? feature.properties.title : 'Sin título';
                        marker.bindPopup('<strong>Título:</strong> ' + title);
                    } else {
                        console.error('Invalid point data:', feature);
                    }
                });
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

        // Handle form submission
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

                // Añadir otros campos personalizados al GeoJSON en el orden natural
                for (var i = 0; i < otherFields.length; i++) {
                    var field = otherFields[i];
                    orderedGeoJson.properties['nm_' + field.name] = field.value;
                }

                shapes.push(orderedGeoJson);
            });

            formData.append('form_data[map_data]', JSON.stringify(shapes));




            console.log(formData);
            $.ajax({
                url: nmPublic.ajax_url,
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    alert('Form submitted successfully.' + JSON.stringify(formData));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Error submitting form: ' + textStatus);
                    console.error('AJAX Error:', textStatus, errorThrown);
                }
            });
        });
    }
});
