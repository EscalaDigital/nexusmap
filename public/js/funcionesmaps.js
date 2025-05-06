/**
 * Conjunto de funciones para la gestión del mapa interactivo de NexusMap
 * Este archivo contiene todas las funcionalidades relacionadas con:
 * - Descarga de datos en formato GeoJSON
 * - Búsqueda de ubicaciones
 * - Visualización de datos en modales
 * - Gestión de capas WMS
 * - Utilidades para manejo de archivos y URLs
 */

/**
 * Descarga los datos del mapa en formato GeoJSON
 * Realiza una petición AJAX para obtener los datos y crear un archivo descargable
 */
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

/**
 * Muestra/oculta el campo de búsqueda en el mapa
 * Gestiona la visibilidad del input de búsqueda y le da foco cuando se muestra
 */
function toggleSearchInput() {
    var $searchInput = jQuery('.nm-search-input');
    $searchInput.toggle();
    if ($searchInput.is(':visible')) {
        $searchInput.focus();
    }
}

/**
 * Realiza una búsqueda de ubicación utilizando OpenStreetMap Nominatim
 * @param {string} query - El texto a buscar (dirección, lugar, etc.)
 */
function performSearch(query) {
    if (!query) {
        alert('Por favor, ingrese una ubicación para buscar.');
        return;
    }

    // Usar el servicio de Nominatim directamente
    var nominatimUrl = 'https://nominatim.openstreetmap.org/search';

    jQuery.ajax({
        url: nominatimUrl,
        data: {
            q: query,
            format: 'json',
            limit: 1
        },
        jsonp: false,
        success: function (results) {
            if (results && results.length > 0) {
                var result = results[0];
                var latlng = [parseFloat(result.lat), parseFloat(result.lon)];

                // Eliminar marcador anterior si existe
                if (window.searchMarker) {
                    map.removeLayer(window.searchMarker);
                }

                // Centrar el mapa en la ubicación
                map.setView(latlng, 16);

                // Mostrar popup con el nombre del lugar
                window.searchMarker.bindPopup(result.display_name).openPopup();
            } else {
                alert('No se encontraron resultados para: ' + query);
            }
        },
        error: function () {
            alert('Error al realizar la búsqueda. Por favor, inténtelo de nuevo.');
        }
    });
}

/**
 * Muestra un modal con la información detallada de un punto del mapa
 * Procesa los datos según el tipo de contenido (texto, imágenes, archivos)
 * y los muestra en un modal interactivo
 * 
 * @param {Object} properties - Propiedades del punto a mostrar
 */
function showModal(properties) {
    var modalContent = '<div class="nm-modal-content">';
    var currentSection = null;
    var sectionContent = {};

    // Organizar campos por secciones usando nmFormStructure
    if (typeof nmFormStructure !== 'undefined' && nmFormStructure.fields) {
        nmFormStructure.fields.forEach(function(field) {
            if (field.type === 'header') {
                currentSection = field.label;
                sectionContent[currentSection] = [];
            } else {
                const fieldKey = 'nm_' + field.name;
                // Solo procesar si existe el valor en properties
                if (properties.hasOwnProperty(fieldKey)) {
                    const value = properties[fieldKey];
                    
                    // Crear el contenido HTML del campo
                    let fieldHtml = '';
                    if (isValidURL(value) && isFile(value)) {
                        const fileType = getFileExtension(value).toLowerCase();
                        if (isImage(fileType)) {
                            fieldHtml = `<p class="nm-modal-field">
                                <strong>${field.label}:</strong><br>
                                <img src="${value}" alt="${field.label}" style="max-width:100%; height:auto;">
                            </p>`;
                        } else if (fileType === 'pdf') {
                            fieldHtml = `<p class="nm-modal-field">
                                <strong>${field.label}:</strong> 
                                <a href="${value}" target="_blank">Ver documento PDF</a>
                            </p>`;
                        } else {
                            fieldHtml = `<p class="nm-modal-field">
                                <strong>${field.label}:</strong> 
                                <a href="${value}" download>Descargar archivo</a>
                            </p>`;
                        }
                    } else {
                        fieldHtml = `<p class="nm-modal-field">
                            <strong>${field.label}:</strong> ${value}
                        </p>`;
                    }

                    // Añadir el campo a la sección correspondiente
                    if (currentSection) {
                        sectionContent[currentSection].push(fieldHtml);
                    } else {
                        // Si no hay sección actual, crear una sección "General"
                        if (!sectionContent['General']) {
                            sectionContent['General'] = [];
                        }
                        sectionContent['General'].push(fieldHtml);
                    }
                }
            }
        });

        // Construir el contenido del modal con las secciones
        Object.keys(sectionContent).forEach(function(sectionName) {
            if (sectionContent[sectionName].length > 0) {
                modalContent += `<div class="nm-modal-section">
                    <h3 class="nm-modal-header">${sectionName}</h3>
                    ${sectionContent[sectionName].join('')}
                </div>`;
            }
        });
    } else {
        // Fallback: si no existe nmFormStructure, mostrar todos los campos sin secciones
        for (var key in properties) {
            if (properties.hasOwnProperty(key) &&
                key !== 'entry_id' && 
                key !== 'layers' && 
                key !== 'has_layer' && 
                key !== 'text_layers' &&
                key.startsWith('nm_')) {

                const label = getFieldLabel(key);
                const value = properties[key];

                if (isValidURL(value) && isFile(value)) {
                    const fileType = getFileExtension(value).toLowerCase();
                    if (isImage(fileType)) {
                        modalContent += `<p><strong>${label}:</strong><br>
                            <img src="${value}" alt="${label}" style="max-width:100%; height:auto;">
                        </p>`;
                    } else if (fileType === 'pdf') {
                        modalContent += `<p><strong>${label}:</strong> 
                            <a href="${value}" target="_blank">Ver documento PDF</a>
                        </p>`;
                    } else {
                        modalContent += `<p><strong>${label}:</strong> 
                            <a href="${value}" download>Descargar archivo</a>
                        </p>`;
                    }
                } else {
                    modalContent += `<p><strong>${label}:</strong> ${value}</p>`;
                }
            }
        }
    }

    modalContent += '</div>';

    // Crear o actualizar el modal
    var $mapContainer = jQuery('#nm-main-map');
    var $modal = jQuery('#nm-modal');

    if ($modal.length === 0) {
        $modal = jQuery('<div id="nm-modal" class="nm-modal">' +
            '<span id="nm-modal-close" class="nm-modal-close">&times;</span>' +
            '<div id="nm-modal-body"></div></div>');
        $mapContainer.append($modal);
    }

    // Actualizar contenido y mostrar modal
    jQuery('#nm-modal-body').html(modalContent);
    $modal.css('display', 'block');
    void $modal[0].offsetWidth;
    $modal.addClass('active');

    // Eventos de cierre
    jQuery('#nm-modal-close').off('click').on('click', function() {
        $modal.removeClass('active');
        setTimeout(function() {
            $modal.css('display', 'none');
        }, 300);
    });

    jQuery(window).off('click.modal').on('click.modal', function(event) {
        if (jQuery(event.target).is('#nm-modal')) {
            $modal.removeClass('active');
            setTimeout(function() {
                $modal.css('display', 'none');
            }, 300);
        }
    });
}
/**
 * Muestra el formulario para añadir una nueva capa WMS al mapa
 * Crea un formulario modal que permite al usuario introducir la URL
 * y el nombre de la capa WMS que desea agregar
 */
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

/**
 * Comprueba si una cadena es una URL válida
 * @param {string} string - La cadena a validar
 * @returns {boolean} - true si es una URL válida, false en caso contrario
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Verifica si una URL corresponde a un archivo
 * @param {string} url - La URL a verificar
 * @returns {boolean} - true si es un archivo, false en caso contrario
 */
function isFile(url) {
    var extension = getFileExtension(url);
    return extension !== '';
}

/**
 * Extrae la extensión de un archivo desde su URL
 * @param {string} url - La URL del archivo
 * @returns {string} - La extensión del archivo o cadena vacía si no tiene
 */
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

/**
 * Verifica si una extensión corresponde a un formato de imagen
 * @param {string} extension - La extensión a verificar
 * @returns {boolean} - true si es una imagen, false en caso contrario
 */
function isImage(extension) {
    var imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(extension);
}

/**
 * Sistema de caché para las etiquetas de los campos del formulario
 * Almacena y recupera las etiquetas para evitar procesarlas múltiples veces
 */
var fieldLabels = {};

/**
 * Obtiene la etiqueta legible para un campo del formulario
 * Si no existe una etiqueta definida, formatea el nombre del campo
 * 
 * @param {string} field - El nombre del campo
 * @returns {string} - La etiqueta legible del campo
 */
function getFieldLabel(field) {
    // Cachea las etiquetas solo una vez
    if (Object.keys(fieldLabels).length === 0 && typeof nmFormStructure !== 'undefined') {
        nmFormStructure.fields.forEach(function (f) {
            fieldLabels['nm_' + f.name] = f.label;
        });
    }

    // Soporta tanto 'field' como 'nm_field'
    var key = field.startsWith('nm_') ? field : 'nm_' + field;
    return fieldLabels[key] || field.replace(/^nm_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}



