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
    geocoder.geocode(query, function (results) {
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


/// Función para mostrar el formulario de añadir WMS
function showAddWmsForm() {
    if ($('#nm-wms-form').length === 0) {
        var $wmsForm = $('<div>', { id: 'nm-wms-form', class: 'nm-modal' });
        var $wmsFormContent = $('<div>', { class: 'nm-modal-content' });

        var $formTitle = $('<h3>').text('Añadir capa WMS');
        var $labelUrl = $('<label>', { for: 'nm-wms-url' }).text('URL del servicio WMS:');
        var $inputUrl = $('<input>', { type: 'text', id: 'nm-wms-url', name: 'nm-wms-url' });

        var $labelLayerName = $('<label>', { for: 'nm-wms-layer-name' }).text('Nombre de la capa WMS:');
        var $inputLayerName = $('<input>', { type: 'text', id: 'nm-wms-layer-name', name: 'nm-wms-layer-name' });

        var $addButton = $('<button>', { id: 'nm-wms-add-button' }).text('Agregar capa');
        var $cancelButton = $('<button>', { id: 'nm-wms-cancel-button' }).text('Cancelar');

        // Icono de carga oculto inicialmente
        var $loadingIcon = $('<div>', { id: 'nm-wms-loading', style: 'display:none;' }).html('<img src="' + nmMapData.plugin_url + '/includes/img/Loading_icon.gif" alt="Cargando...">');

        $wmsFormContent.append($formTitle, $labelUrl, $inputUrl, $labelLayerName, $inputLayerName, $addButton, $cancelButton, $loadingIcon);
        $wmsForm.append($wmsFormContent);

        $('#nm-main-map').append($wmsForm);

        $wmsForm.css({
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            'background-color': 'rgba(0,0,0,0.5)',
            'z-index': '1000',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
        });

        $wmsFormContent.css({
            'background-color': '#fff',
            padding: '20px',
            'border-radius': '5px',
            width: '300px'
        });

        $wmsForm.hide();

        $addButton.on('click', function () {
            var wmsUrl = $inputUrl.val();
            var wmsLayerName = $inputLayerName.val();

            if (wmsUrl && wmsLayerName) {
                if (!/^https?:\/\//i.test(wmsUrl)) {
                    alert('Por favor, ingrese una URL válida que comience con http:// o https://');
                    return;
                }

                if (/[^a-zA-Z0-9_:,.-]/.test(wmsLayerName)) {
                    alert('El nombre de la capa contiene caracteres no permitidos.');
                    return;
                }

                // Ocultar botón de agregar y mostrar el icono de carga
                $addButton.hide();
                $loadingIcon.show();

                // Agregar la capa WMS al mapa
                var userWmsLayer = L.tileLayer.wms(wmsUrl, {
                    layers: wmsLayerName,
                    format: 'image/png',
                    transparent: true,
                    attribution: ''
                });

                // Variable para asegurarse de que la alerta se muestre solo una vez
                var alertShown = false;

                userWmsLayer.on('tileload', function () {
                    if (!alertShown) {
                        alertShown = true; // Evitar que la alerta se muestre de nuevo
                        alert('Capa WMS cargada con éxito');
                        $loadingIcon.hide();
                        $addButton.show();
                        $wmsForm.hide();
                        $inputUrl.val('');
                        $inputLayerName.val('');
                    }
                });

                userWmsLayer.on('tileerror', function (error, tile) {
                    alert('Error al cargar la capa WMS. Por favor, verifique la URL y el nombre de la capa.');
                    // Ocultar el icono de carga y mostrar el botón de agregar nuevamente
                    $loadingIcon.hide();
                    $addButton.show();
                    map.removeLayer(userWmsLayer);
                    controlLayers.removeLayer(userWmsLayer);

                });

                userWmsLayer.addTo(map);

                overlays[wmsLayerName] = userWmsLayer;
                controlLayers.addOverlay(userWmsLayer, wmsLayerName);
            } else {
                alert('Por favor, complete todos los campos.');
            }
        });

        $cancelButton.on('click', function () {
            $wmsForm.hide();
            $inputUrl.val('');
            $inputLayerName.val('');
        });
    }

    $('#nm-wms-form').show();
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

