

//funcion para descargar datos en formato geojson
// Manejar el botón de descarga
function downloadGeoJson() {
    jQuery.ajax({
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
    var $searchInput = jQuery('.nm-search-input');
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
    var modalContent = '<div class="nm-modal-data">';

    for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
            // Omitir campos específicos
            if (key === 'entry_id' || key === 'form_type') {
                continue;
            }

            // Remover el prefijo 'nm_' si existe
            var cleanKey = key.startsWith('nm_') ? key.substring(3) : key;

            // Formatear la clave para mostrarla como etiqueta
            var label = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1).replace(/_/g, ' ');

            var value = properties[key];

            // Si el valor está vacío, omitir el campo
            if (!value || value === '' || value === null) {
                continue;
            }

            modalContent += '<div class="nm-modal-field">';
            modalContent += '<div class="nm-modal-label">' + label + ':</div>';
            modalContent += '<div class="nm-modal-value">';

            // Verificar si el valor es una URL de archivo
            if (isValidURL(value) && isFile(value)) {
                var fileType = getFileExtension(value).toLowerCase();                if (isImage(fileType)) {
                    // Mostrar la imagen con funcionalidad de ampliación
                    modalContent += '<div class="nm-image-container" data-image-src="' + value + '">';
                    modalContent += '<img src="' + value + '" alt="' + label + '" class="nm-modal-image">';
                    modalContent += '<div class="nm-image-overlay"><i class="fas fa-search-plus"></i></div>';
                    modalContent += '</div>';
                } else if (fileType === 'pdf') {
                    modalContent += '<a href="' + value + '" target="_blank" class="nm-file-link nm-pdf-link">';
                    modalContent += '<i class="fas fa-file-pdf"></i> Ver documento PDF</a>';
                } else {
                    modalContent += '<a href="' + value + '" download class="nm-file-link nm-download-link">';
                    modalContent += '<i class="fas fa-download"></i> Descargar archivo</a>';
                }
            } else if (isValidURL(value)) {
                // URL clicable
                modalContent += '<a href="' + value + '" target="_blank" class="nm-url-link">';
                modalContent += '<i class="fas fa-external-link-alt"></i> ' + value + '</a>';
            } else {
                // Verificar si es un valor de checkbox múltiple (separado por comas)
                if (typeof value === 'string' && value.includes(',')) {
                    var values = value.split(',');
                    modalContent += '<div class="nm-checkbox-values">';
                    values.forEach(function(val, index) {
                        val = val.trim();
                        if (val) {
                            modalContent += '<span class="nm-checkbox-item">' + val + '</span>';
                        }
                    });
                    modalContent += '</div>';
                } else {
                    // Valor de texto normal
                    modalContent += '<span class="nm-text-value">' + value + '</span>';
                }
            }

            modalContent += '</div></div>';
        }
    }

    modalContent += '</div>';    // Insertar el contenido en el cuerpo del modal
    jQuery('#nm-modal-body').html(modalContent);

    // Agregar event listeners para las imágenes
    jQuery('.nm-image-container').off('click').on('click', function() {
        var imageSrc = jQuery(this).attr('data-image-src');
        if (imageSrc) {
            openImageModal(imageSrc);
        }
    });

    // Mostrar el modal
    jQuery('#nm-modal').css('display', 'flex');    // Manejar el cierre del modal
    jQuery('#nm-modal-close').off('click').on('click', function () {
        jQuery('#nm-modal').css('display', 'none');
        closeImageModal(); // Cerrar también el modal de imagen si está abierto
    });

    jQuery(window).off('click.modal').on('click.modal', function (event) {
        if (jQuery(event.target).is('#nm-modal')) {
            jQuery('#nm-modal').css('display', 'none');
            closeImageModal();
        }
    });
    
    // Cerrar modal con tecla Escape
    jQuery(document).off('keydown.modal').on('keydown.modal', function(e) {
        if (e.keyCode === 27) { // Escape key
            jQuery('#nm-modal').css('display', 'none');
            closeImageModal();
        }
    });
}

// Función para abrir modal de imagen ampliada
function openImageModal(imageSrc) {
    // Crear modal de imagen si no existe
    if (jQuery('#nm-image-modal').length === 0) {
        var imageModal = '<div id="nm-image-modal" class="nm-image-modal">' +
                        '<div class="nm-image-modal-content">' +
                        '<span class="nm-image-modal-close">&times;</span>' +
                        '<img id="nm-enlarged-image" src="" alt="Imagen ampliada">' +
                        '</div></div>';
        jQuery('body').append(imageModal);
        
        // Agregar event listener para el botón de cierre
        jQuery(document).on('click', '.nm-image-modal-close', function() {
            closeImageModal();
        });
          // Cerrar modal al hacer clic fuera de la imagen
        jQuery(document).on('click', '#nm-image-modal', function(e) {
            if (e.target === this) {
                closeImageModal();
            }
        });
        
        // Cerrar modal de imagen con Escape
        jQuery(document).on('keydown.imageModal', function(e) {
            if (e.keyCode === 27 && jQuery('#nm-image-modal').is(':visible')) {
                closeImageModal();
            }
        });
    }
    
    // Mostrar la imagen
    jQuery('#nm-enlarged-image').attr('src', imageSrc);
    jQuery('#nm-image-modal').css('display', 'flex');
}

// Función para cerrar modal de imagen
function closeImageModal() {
    jQuery('#nm-image-modal').css('display', 'none');
    // Limpiar event listeners específicos del modal de imagen
    jQuery(document).off('keydown.imageModal');
}


/// Función para mostrar el formulario de añadir WMS
function showAddWmsForm() {
    if (jQuery('#nm-wms-form').length === 0) {
        var $wmsForm = jQuery('<div>', { id: 'nm-wms-form', class: 'nm-modal' });
        var $wmsFormContent = jQuery('<div>', { class: 'nm-modal-content' });

        var $formTitle = jQuery('<h3>').text('Añadir capa WMS');
        var $labelUrl = jQuery('<label>', { for: 'nm-wms-url' }).text('URL del servicio WMS:');
        var $inputUrl = jQuery('<input>', { type: 'text', id: 'nm-wms-url', name: 'nm-wms-url' });

        var $labelLayerName = jQuery('<label>', { for: 'nm-wms-layer-name' }).text('Nombre de la capa WMS:');
        var $inputLayerName = jQuery('<input>', { type: 'text', id: 'nm-wms-layer-name', name: 'nm-wms-layer-name' });

        var $addButton = jQuery('<button>', { id: 'nm-wms-add-button' }).text('Agregar capa');
        var $cancelButton = jQuery('<button>', { id: 'nm-wms-cancel-button' }).text('Cancelar');

        // Icono de carga oculto inicialmente
        var $loadingIcon = jQuery('<div>', { id: 'nm-wms-loading', style: 'display:none;' }).html('<img src="' + nmMapData.plugin_url + '/includes/img/Loading_icon.gif" alt="Cargando...">');

        $wmsFormContent.append($formTitle, $labelUrl, $inputUrl, $labelLayerName, $inputLayerName, $addButton, $cancelButton, $loadingIcon);
        $wmsForm.append($wmsFormContent);

        jQuery('#nm-main-map').append($wmsForm);

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

    jQuery('#nm-wms-form').show();
}



// Función para validar si una cadena es una URL
function isValidURL(string) {
    // Verificar que no esté vacío y que tenga una longitud mínima
    if (!string || string.length < 7) return false;
    
    try {
        var url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        // Fallback para URLs sin protocolo
        if (string.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/) || string.includes('www.')) {
            try {
                new URL('http://' + string);
                return true;
            } catch (_) {
                return false;
            }
        }
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

