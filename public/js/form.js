jQuery(document).ready(function ($) {
if (jQuery('#nm-user-form').length) {
    // Initialize map drawing
    var drawMap = L.map('nm-map-canvas').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(drawMap);

    var drawnItems = new L.FeatureGroup();
    drawMap.addLayer(drawnItems);

    // Agregar contenedor de controles para el buscador
    if (jQuery('#nm-map-canvas').parent().find('.nm-form-map-controls').length === 0) {
        jQuery('#nm-map-canvas').before('<div class="nm-form-map-controls"></div>');
    }
    
    var $mapControls = jQuery('.nm-form-map-controls');
    
    // Agregar funcionalidad de búsqueda
    var $searchContainer = jQuery('<div>', { class: 'nm-search-container' });
    var $searchButton = jQuery('<button>', {
        type: 'button', // Importante: evitar que sea tipo submit
        class: 'nm-control-button',
        title: 'Buscar ubicación',
        html: '<i class="fa fa-search"></i>'
    });
    
    $searchButton.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botón de búsqueda clickeado en formulario');
        toggleSearchInputForm();
    });
    $searchContainer.append($searchButton);

    var $searchInput = jQuery('<input>', {
        type: 'text',
        class: 'nm-search-input nm-form-search-input',
        placeholder: 'Buscar ubicación...',
        autocomplete: 'off'
    }).hide();

    // Manejar el envío con Enter
    $searchInput.on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            e.stopPropagation();
            
            var query = $searchInput.val().trim();
            console.log('Búsqueda iniciada en formulario con:', query);
            if (query) {
                performSearchForm(query, drawMap);
            }
        }
    });
    
    // Manejar escape para cerrar
    $searchInput.on('keydown', function (e) {
        if (e.which === 27) { // Escape key
            console.log('Cerrando búsqueda con Escape en formulario');
            $searchInput.hide();
        }
    });

    $searchContainer.append($searchInput);
    $mapControls.append($searchContainer);

    // Función para alternar la visibilidad del campo de búsqueda
    function toggleSearchInputForm() {
        console.log('toggleSearchInputForm llamada');
        var $searchInput = jQuery('.nm-form-search-input');
        console.log('Campo de búsqueda del formulario encontrado:', $searchInput.length > 0);
        
        if ($searchInput.is(':visible')) {
            console.log('Ocultando campo de búsqueda del formulario');
            $searchInput.hide();
        } else {
            console.log('Mostrando campo de búsqueda del formulario');
            $searchInput.show();
            $searchInput.focus();
            
            // Seleccionar todo el texto si hay alguno
            var inputElement = $searchInput[0];
            if (inputElement && inputElement.value) {
                inputElement.select();
            }
        }
    }

    // Función de búsqueda específica para el formulario
    function performSearchForm(query, map) {
        if (window.formSearchInProgress) {
            console.log('Búsqueda de formulario ya en progreso, ignorando nueva búsqueda');
            return;
        }
        
        if (!query) {
            alert('Por favor, ingrese una ubicación para buscar.');
            return;
        }

        // Verificar que el mapa y el geocodificador estén disponibles
        if (typeof L === 'undefined') {
            alert('Error: Leaflet no está cargado.');
            return;
        }
        
        if (typeof L.Control.Geocoder === 'undefined') {
            alert('Error: El geocodificador de Leaflet no está cargado.');
            return;
        }

        // Marcar que hay una búsqueda en progreso
        window.formSearchInProgress = true;
        console.log('Iniciando búsqueda en formulario para:', query);

        // Método usando fetch directamente a Nominatim
        function searchWithFetchForm(query) {
            var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=1';
            
            fetch(url)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    window.formSearchInProgress = false;
                    console.log('Resultados de fetch en formulario:', data);
                    
                    if (data && data.length > 0) {
                        var result = data[0];
                        var lat = parseFloat(result.lat);
                        var lon = parseFloat(result.lon);
                        
                        console.log('Coordenadas encontradas en formulario:', lat, lon);
                        
                        // Centrar el mapa del formulario en el resultado encontrado
                        map.setView([lat, lon], 14);
                        
                        // Ocultar el campo de búsqueda después de una búsqueda exitosa
                        jQuery('.nm-form-search-input').hide();
                        
                        console.log('Búsqueda del formulario completada exitosamente');
                    } else {
                        console.log('No se encontraron resultados en formulario para:', query);
                        alert('No se encontraron resultados para: "' + query + '"');
                    }
                })
                .catch(function(error) {
                    window.formSearchInProgress = false;
                    console.error('Error en la búsqueda del formulario con fetch:', error);
                    alert('Error en la búsqueda. Por favor, inténtelo de nuevo.');
                });
        }

        // Intentar primero con el geocodificador de Leaflet
        try {
            var geocoder = L.Control.Geocoder.nominatim({
                serviceUrl: 'https://nominatim.openstreetmap.org/',
                htmlTemplate: function(r) {
                    return r.display_name;
                }
            });
            
            geocoder.geocode(query, function (results) {
                try {
                    window.formSearchInProgress = false;
                    console.log('Resultados del geocodificador Leaflet en formulario:', results);
                    
                    if (results && results.length > 0) {
                        var result = results[0];
                        console.log('Primer resultado en formulario:', result);
                        
                        // Verificar si tiene coordenadas válidas
                        if (result.center && result.center.lat && result.center.lng) {
                            // Centrar el mapa del formulario en el resultado encontrado
                            map.setView([result.center.lat, result.center.lng], 14);
                            console.log('Mapa del formulario centrado en:', result.center.lat, result.center.lng);
                            
                            // Ocultar el campo de búsqueda después de una búsqueda exitosa
                            jQuery('.nm-form-search-input').hide();
                            
                            console.log('Búsqueda del formulario completada exitosamente con geocodificador Leaflet');
                        } else {
                            console.log('Resultado sin coordenadas válidas en formulario, intentando con fetch');
                            searchWithFetchForm(query);
                        }
                    } else {
                        console.log('Sin resultados del geocodificador en formulario, intentando con fetch');
                        searchWithFetchForm(query);
                    }
                } catch (error) {
                    console.error('Error procesando resultados en formulario:', error);
                    console.log('Error en geocodificador del formulario, intentando con fetch');
                    searchWithFetchForm(query);
                }
            });
        } catch (error) {
            console.error('Error inicializando geocodificador en formulario:', error);
            console.log('Geocodificador del formulario falló, usando fetch');
            searchWithFetchForm(query);
        }
    }



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
