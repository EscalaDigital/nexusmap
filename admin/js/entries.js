jQuery(document).ready(function ($) {
    var map;  // Definir el mapa como una variable global

    // Función para comprobar si una cadena es una URL
    function isUrl(string) {

        try {
            new URL(string);

            return true;
        } catch (_) {
            return false;
        }
    }

    // Función para determinar si una URL es una imagen o un PDF
    function getFileType(url) {
        var extension = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
            return 'image';
        } else if (extension === 'pdf') {
            return 'pdf';
        }
        return null;
    }

    // Cuando se hace clic en el botón "Ver Datos"
    jQuery('.view-data').on('click', function () {
        var jsonData = jQuery(this).data('json');  // Obtiene el JSON deserializado desde PHP


        // Aquí accedemos a los datos específicos del objeto JSON
        var mapData = jsonData.map_data;  // Obtiene la cadena JSON escapada de la base de datos

        // Decodifica la cadena JSON escapada antes de parsearla
        var decodedMapData = decodeEscapedJsonString(mapData);

        // Intenta analizar el JSON decodificado
        try {
            var feature = JSON.parse(decodedMapData)[0];  // Toma el primer elemento del array de features
        } catch (error) {
            console.error('Error al analizar el JSON: ', error);
            return;
        }

        var geometry = feature.geometry;  // Extrae la geometría del feature
        var properties = feature.properties;  // Extrae las propiedades del feature

        // Muestra el modal
        jQuery('#dataModal').show();

        // Si el mapa ya ha sido inicializado, eliminamos el mapa anterior
        if (map) {
            map.remove();
        }

        // Cargar el mapa de Leaflet dentro del modal
        setTimeout(function () {  // Usar un timeout para asegurarnos de que el modal se haya mostrado
            map = L.map('map').setView([0, 0], 2);  // Inicializa el mapa con una vista global

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
            }).addTo(map);

         
                  function addGeometryToMap(geometry) {
                console.log('Processing geometry type:', geometry.type);
                var type = geometry.type.toLowerCase();
                
                if (type === 'point') {
                    var latLng = [geometry.coordinates[1], geometry.coordinates[0]];
                    console.log('Adding Point:', latLng);
                    L.marker(latLng).addTo(map);
                    bounds.extend(latLng);
                } else if (type === 'polygon' || type === 'multipolygon') {
                    console.log('Adding Polygon:', geometry.coordinates);
                    var latLngs;
                
                    if (type === 'polygon') {
                        latLngs = geometry.coordinates[0].map(function (coord) {
                            return [coord[1], coord[0]];
                        });
                    } else if (type === 'multipolygon') {
                        latLngs = geometry.coordinates.map(function (polygon) {
                            return polygon[0].map(function (coord) {
                                return [coord[1], coord[0]];
                            });
                        }).flat();
                    }
                
                    console.log('Polygon LatLngs:', latLngs);
                    L.polygon(latLngs, {
                        color: '#237CC9',
                        fillColor: '#237CC9',
                        fillOpacity: 0.5
                    }).addTo(map);
                    latLngs.forEach(function(latLng) {
                        bounds.extend(latLng);
                    });
                } else if (geometry.type === 'GeometryCollection') {
                    console.log('Adding GeometryCollection:', geometry.geometries);
                    geometry.geometries.forEach(function (geom) {
                        addGeometryToMap(geom);
                    });
                } else {
                    console.log('Unknown geometry type:', geometry.type);
                }
            }
            
            var bounds = L.latLngBounds();
            
            addGeometryToMap(geometry);
            
            if (bounds.isValid()) {
                map.fitBounds(bounds);
            }
            
            // Refresca el tamaño del mapa después de abrir el modal
            map.invalidateSize();
        
        }, 250);  // Retraso breve para asegurarse de que el modal esté visible

        // Mostrar el resto de las propiedades formateadas en el modal
        var propertyHtml = '';

        $.each(properties, function (key, value) {
            var cleanKey = key.replace('nm_', '');  // Elimina "nm_" del inicio del key
            var displayKey = cleanKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Formatea el key
            var content = value;
         
            // Verificar si el contenido está vacío o es nulo
            if (!content || content === '' || content === null || content === undefined) {
                content = '<em style="color: #999; font-style: italic;">Sin información</em>';
            } else if (isUrl(content)) {
                var fileType = getFileType(content);
                if (fileType === 'image') {
                    content = '<img src="' + content + '" alt="' + displayKey + '" loading="lazy">';
                } else if (fileType === 'pdf') {
                    content = '<a href="' + content + '" target="_blank" rel="noopener">📄 Ver PDF</a>';
                } else {
                    content = '<a href="' + content + '" target="_blank" rel="noopener">🔗 ' + content + '</a>';
                }
            } else if (typeof content === 'string' && content.length > 200) {
                // Para textos largos, agregar funcionalidad de expandir/contraer
                var shortContent = content.substring(0, 200) + '...';
                content = '<span class="short-content">' + shortContent + '</span>' +
                         '<span class="full-content" style="display: none;">' + content + '</span>' +
                         '<br><button class="toggle-content button" style="margin-top: 8px; font-size: 12px;">Ver más</button>';
            }

            // Construye la fila con el título y el contenido
            propertyHtml += '<div class="property-item">';
            propertyHtml += '<strong>' + displayKey + '</strong>';
            propertyHtml += '<span>' + content + '</span>';
            propertyHtml += '</div>';
        });

        // Inserta el contenido en el modal
        jQuery('#jsonData').html(propertyHtml);
        
        // Agregar funcionalidad para expandir/contraer textos largos
        jQuery('.toggle-content').on('click', function() {
            var $button = jQuery(this);
            var $propertyItem = $button.closest('.property-item');
            var $shortContent = $propertyItem.find('.short-content');
            var $fullContent = $propertyItem.find('.full-content');
            
            if ($fullContent.is(':visible')) {
                $fullContent.hide();
                $shortContent.show();
                $button.text('Ver más');
            } else {
                $shortContent.hide();
                $fullContent.show();
                $button.text('Ver menos');
            }
        });
    });

    // Cerrar el modal cuando se hace clic en el botón de cerrar o fuera del modal
    jQuery(document).on('click', '.close', function () {
        jQuery('#dataModal').hide();
        if (map) {
            map.remove();
            map = null;
        }
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    jQuery('#dataModal').on('click', function(e) {
        if (e.target === this) {
            jQuery(this).hide();
            if (map) {
                map.remove();
                map = null;
            }
        }
    });
    
    // Cerrar modal con la tecla Escape
    jQuery(document).on('keydown', function(e) {
        if (e.key === 'Escape' && jQuery('#dataModal').is(':visible')) {
            jQuery('#dataModal').hide();
            if (map) {
                map.remove();
                map = null;
            }
        }
    });
});



function decodeEscapedJsonString(escapedString) {
    // Reemplaza todas las secuencias de escape que están duplicadas para que sea un JSON válido
    return escapedString
        .replace(/\\"/g, '"')  // Reemplaza las comillas escapadas
        .replace(/\\n/g, '')   // Remueve los saltos de línea escapados
        .replace(/\\r/g, '')   // Remueve los retornos de carro escapados
        .replace(/\\\\/g, '\\');  // Reemplaza las barras invertidas dobles con una sola barra invertida
}
