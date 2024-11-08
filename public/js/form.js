jQuery(document).ready(function ($) {
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
        //vaciar drswnItems
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
    });

    jQuery('#nm-user-form').submit(function (e) {
        e.preventDefault();
    
        var formData = new FormData(this);
    
        // Add the required 'action' parameter for WordPress
        formData.append('action', 'nm_submit_form');
    
        // Add the nonce for security verification
        formData.append('nonce', nmPublic.nonce);
    
        // Collect geometries
        var geometries = [];
        drawnItems.eachLayer(function (layer) {
            var geoJson = layer.toGeoJSON();
            geometries.push(geoJson.geometry);
        });
    
        // Determine if there's a single geometry or multiple geometries
        var geometry;
        if (geometries.length === 1) {
            // Single geometry
            geometry = geometries[0];
        } else if (geometries.length > 1) {
            // Multiple geometries: create a GeometryCollection
            geometry = {
                type: 'GeometryCollection',
                geometries: geometries
            };
        } else {
            // No geometries drawn
            alert('Por favor, dibuje al menos una geometría en el mapa.');
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
    
        // Create a single Feature with geometry and properties
        var feature = {
            type: 'Feature',
            geometry: geometry,
            properties: formFields
        };
    
        // Ensure 'geometry' comes before 'properties' in the JSON
        var orderedFeature = {
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties
        };
    
        // Append map data to form data
        formData.append('map_data', JSON.stringify(orderedFeature));
    
        // Send the AJAX request
        jQuery.ajax({
            url: nmPublic.ajax_url,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                alert('Formulario enviado exitosamente.');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error al enviar el formulario: ' + textStatus);
                console.error('AJAX Error:', textStatus, errorThrown);
            }
        });
    });
    


}

});
