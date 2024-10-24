jQuery(document).ready(function($) {
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
    $('.view-data').on('click', function() {
        var jsonData = $(this).data('json');  // Obtiene el JSON deserializado desde PHP
        console.log(jsonData);  // Verifica que estás recibiendo el JSON correcto

        // Aquí accedemos a los datos específicos del objeto JSON
        var mapData = jsonData.map_data;  // Asumiendo que tienes un campo "map_data"

        // Decodifica la cadena JSON escapada antes de parsearla
        var decodedMapData = decodeEscapedJsonString(mapData);

        // Intenta analizar el JSON decodificado
        try {
            var feature = JSON.parse(decodedMapData)[0];  // Toma el primer elemento del array de features
        } catch (error) {
            console.error('Error al analizar el JSON: ', error);
            return;
        }

        var coordinates = feature.geometry.coordinates;  // Extrae las coordenadas del punto
        var properties = feature.properties;  // Extrae las propiedades del feature

        // Muestra el modal
        $('#dataModal').show();

        // Si el mapa ya ha sido inicializado, eliminamos el mapa anterior
        if (map) {
            map.remove();
        }

        // Cargar el mapa de Leaflet dentro del modal
        setTimeout(function() {  // Usar un timeout para asegurarnos de que el modal se haya mostrado
            map = L.map('map').setView([coordinates[1], coordinates[0]], 13);  // Inicializa el mapa en las coordenadas (lat, lng)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Agrega un marcador en las coordenadas
            L.marker([coordinates[1], coordinates[0]]).addTo(map)
                .bindPopup('Coordenadas: ' + coordinates[1] + ', ' + coordinates[0])
                .openPopup();

            // Refresca el tamaño del mapa después de abrir el modal
            map.invalidateSize();
        }, 250);  // Retraso breve para asegurarse de que el modal esté visible

        // Mostrar el resto de las propiedades formateadas en el modal
        var propertyHtml = '';
        $.each(properties, function(key, value) {
            var cleanKey = key.replace('nm_', '');  // Elimina "nm_" del inicio del key
            var content = value;
        
            if (isUrl(content)) {
                var fileType = getFileType(content);
                if (fileType === 'image') {
                    content = '<img src="' + content + '" alt="' + cleanKey + '">';
                } else if (fileType === 'pdf') {
                    content = '<a href="' + content + '" target="_blank">Ver PDF</a>';
                } else {
                    content = '<a href="' + content + '" target="_blank">' + content + '</a>';
                }
            }
        
            // Construye la fila con el título en negrita y el contenido a la derecha
            propertyHtml += '<div class="property-item">';
            propertyHtml += '<strong>' + cleanKey + ':</strong>';
            propertyHtml += '<span>' + content + '</span>';
            propertyHtml += '</div>';
        });

        // Inserta el contenido en el modal
        $('#jsonData').html(propertyHtml);
    });

    // Cerrar el modal cuando se hace clic en el botón de cerrar
    $('.close').on('click', function() {
        $('#dataModal').hide();
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
