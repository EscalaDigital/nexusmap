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
 * Muestra un modal con la información de las propiedades de un elemento
 * Extrae y organiza la información para mostrarla de manera legible
 * 
 * @param {Object} properties - Propiedades del elemento a mostrar
 */
/**
 * Muestra un modal con los datos de una entrada de Ninja Maps / NF.
 * Combina:
 *   •  Lógica y flujo del primer script (nm_conditional_groups).
 *   •  Extras de presentación del segundo script (secciones, CSS, animación, etc.).
 *
 * Requiere que existan las utilidades:
 *   isValidURL(), isFile(), getFileExtension(), isImage(), getFieldLabel()
 *   y el objeto global nmFormStructure con el formulario original.
 */
function showModal(properties) {
    /* ----------  Preparación y utilidades ---------- */
    
    console.log('=== DEBUG showModal ===');
    console.log('Properties recibidas:', properties);
    console.log('nmFormStructure disponible:', typeof nmFormStructure !== 'undefined');
    if (typeof nmFormStructure !== 'undefined') {
        console.log('nmFormStructure:', nmFormStructure);
    }

    //Limpiar escapes excesivos
    const cleanValue = (value) => {
        if (typeof value === 'string') {
            return value
                .replace(/\\\\'/g, "'") 
                .replace(/\\\\"/g, '"')     // Reemplazar \\\\' con '
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'")        // Reemplazar \\" con "
                .replace(/\\\\/g, '\\');  // Reemplazar \\\\ con \
        }
        return value;
    };

    // Parsear nm_conditional_groups (formato del primer script)
     let conditionalGroups = {};
    if (properties.nm_conditional_groups) {
        try {
            const cleanedGroups = cleanValue(properties.nm_conditional_groups);
            conditionalGroups = typeof cleanedGroups === 'string'
                ? JSON.parse(cleanedGroups)
                : cleanedGroups;
        } catch (e) {
            console.error('Error parseando nm_conditional_groups:', e);
        }
    }

    // Acceso rápido a la definición de un campo del formulario
    const getFieldDef = (name) => {
        if (typeof nmFormStructure === 'undefined' || !nmFormStructure.fields) return null;
        return nmFormStructure.fields.find(f => f.name === name) || null;
    };

    // Render de un campo (normal o condicional)
      const renderField = (label, value, extraClass = '') => {
        // Limpiar el valor antes de procesarlo
        const cleanedValue = cleanValue(value);
        const cleanedLabel = cleanValue(label);
          // Archivos / URLs
        if (isValidURL(cleanedValue) && isFile(cleanedValue)) {
            const ext = getFileExtension(cleanedValue).toLowerCase();
            if (isImage(ext)) {
                return `<p class="nm-modal-field ${extraClass}">
                            <strong>${cleanedLabel}:</strong><br>
                            <img src="${cleanedValue}" alt="${cleanedLabel}" style="max-width:100%;height:auto;">
                        </p>`;
            }            if (isAudio(ext)) {
                return `<p class="nm-modal-field ${extraClass}">
                            <strong>${cleanedLabel}:</strong><br>
                            <div class="nm-audio-player">
                                <audio controls preload="metadata" class="nm-audio-element">
                                    <source src="${cleanedValue}" type="audio/${ext}">
                                    Tu navegador no soporta la reproducción de audio.
                                </audio>
                            </div>
                        </p>`;
            }
            if (ext === 'pdf') {
                return `<p class="nm-modal-field ${extraClass}">
                            <strong>${cleanedLabel}:</strong>
                            <a href="${cleanedValue}" target="_blank">Ver documento PDF</a>
                        </p>`;
            }
            return `<p class="nm-modal-field ${extraClass}">
                        <strong>${cleanedLabel}:</strong>
                        <a href="${cleanedValue}" download>Descargar archivo</a>
                    </p>`;
        }

        // Texto simple - aplicar limpieza aquí también
        return `<p class="nm-modal-field ${extraClass}">
                    <strong>${cleanedLabel}:</strong> ${cleanedValue}
                </p>`;
    };    /* ----------  Recorremos la estructura del formulario ---------- */

    let currentSection = null;
    const sectionContent = {};     // { "Nombre sección": [html, html...] }

    if (nmFormStructure && nmFormStructure.fields) {
        console.log('=== Procesando campos del formulario ===');
        console.log('Número de campos:', nmFormStructure.fields.length);
        
        nmFormStructure.fields.forEach((field, index) => {
            console.log(`Campo ${index}:`, field);            // --- Cabecera -> abre nueva sección --------------------
            if (field.type === 'header') {
                console.log('Campo header encontrado:', field.label);
                currentSection = field.label || 'Sección';
                sectionContent[currentSection] = [];
                return;
            }            // --- Campo geographic-selector (manejo especial) -------------
            if (field.type === 'geographic-selector') {
                console.log('=== Campo geographic-selector encontrado ===');
                console.log('Field:', field);
                
                let geoHtml = `<div class="nm-geographic-selector-group">
                                <h4 class="nm-geographic-title">${cleanValue(field.label)}</h4>`;
                
                let hasValues = false;
                
                // Buscar automáticamente niveles geográficos comunes
                const commonLevels = ['admin1', 'admin2', 'admin3', 'admin4'];
                
                // Si el campo tiene config, usar esa configuración
                if (field.config && field.config.levels && field.config.field_names) {
                    console.log('Usando configuración del campo:', field.config);
                    field.config.levels.forEach((level) => {
                        const levelKey = `nm_${level}`;
                        const levelValue = properties[levelKey];
                        
                        console.log(`Buscando ${levelKey}:`, levelValue);
                        
                        if (levelValue) {
                            hasValues = true;
                            const levelLabel = field.config.field_names[level] || level;
                            console.log(`Agregando ${levelLabel}: ${levelValue}`);
                            geoHtml += `<p class="nm-modal-field nm-geographic-field">
                                            <strong>${cleanValue(levelLabel)}:</strong> ${cleanValue(levelValue)}
                                        </p>`;
                        }
                    });
                } else {
                    // Buscar automáticamente por niveles comunes
                    console.log('No hay config, buscando niveles automáticamente');
                    commonLevels.forEach((level, index) => {
                        const levelKey = `nm_${level}`;
                        const levelValue = properties[levelKey];
                        
                        console.log(`Buscando ${levelKey}:`, levelValue);
                        
                        if (levelValue) {
                            hasValues = true;
                            const levelLabel = `Nivel ${index + 1}`;
                            console.log(`Agregando ${levelLabel}: ${levelValue}`);
                            geoHtml += `<p class="nm-modal-field nm-geographic-field">
                                            <strong>${cleanValue(levelLabel)}:</strong> ${cleanValue(levelValue)}
                                        </p>`;
                        }
                    });                }
                
                geoHtml += '</div>';
                
                console.log('hasValues:', hasValues);
                console.log('HTML generado:', geoHtml);
                
                // Solo agregar si tiene valores
                if (hasValues) {
                    (sectionContent[currentSection] ||= []).push(geoHtml);
                    console.log('HTML agregado a sección:', currentSection);
                } else {
                    console.log('No se agregó HTML - sin valores');
                }
                return;
            }

            const key = 'nm_' + field.name;
            if (!properties.hasOwnProperty(key)) return;  // no se envió valor

            const value = properties[key];

            // --- Campo condicional basado en select (segundo script) -------------
            if (field.type === 'conditional-select' && field.select_id) {
                const selectedValue = value;
                const baseHtml = renderField(field.label, value);

                // Los campos dependientes vienen serializados en:
                // nm_conditional_fields_{select_id}_{selectedValue}
                const condKey = `nm_conditional_fields_${field.select_id}_${selectedValue}`;
                let condHtml = '';

                if (properties.hasOwnProperty(condKey)) {
                    try {
                        const condFields = JSON.parse(properties[condKey]);
                        condHtml = condFields.map(cf => {
                            const cfKey = 'nm_' + cf.name;
                            const cfValue = properties[cfKey];
                            const cfLabel = `${field.label} - ${cf.label}`;
                            return renderField(cfLabel, cfValue, 'nm-conditional-field');
                        }).join('');
                    } catch (e) {
                        console.error('Error parseando campos condicionales:', e);
                    }
                }

                const groupHtml = `
                    <div class="nm-conditional-group" data-select-id="${field.select_id}">
                        ${baseHtml}
                        <div class="nm-conditional-fields" data-option-value="${selectedValue}">
                            ${condHtml}
                        </div>
                    </div>`;

                (sectionContent[currentSection] ||= []).push(groupHtml);
                return;
            }

            // --- Campo normal -----------------------------------------------------
            (sectionContent[currentSection] ||= []).push(
                renderField(field.label, value)
            );
        });
    }

    /* ----------  Grupos condicionales del PRIMER script ------------- */

    Object.entries(conditionalGroups).forEach(([groupId, group]) => {
        let htmlGroup = `<div class="nm-conditional-group">
                            <h3 class="nm-modal-header">${group.option_label.trim()}</h3>`;

        Object.entries(group.fields).forEach(([fieldName, fieldValue]) => {
            const fieldDef = getFieldDef(fieldName);
            const label = fieldDef ? fieldDef.label : fieldName;
            htmlGroup += renderField(label, fieldValue, 'nm-conditional-field');
        });

        htmlGroup += '</div>';

        // Solo añadimos al currentSection si existe, eliminamos el fallback a 'General'
        if (currentSection) {
            (sectionContent[currentSection] ||= []).push(htmlGroup);
        } else {
            // Si no hay sección, añadimos directamente al contenido sin header
            (sectionContent[''] ||= []).push(htmlGroup);
        }
    });

    /* ----------  Fallback cuando no existe nmFormStructure ---------- */

    if (Object.keys(sectionContent).length === 0) {
        sectionContent[''] = [];  // Cambiamos 'General' por cadena vacía
        for (const [key, value] of Object.entries(properties)) {
            if (!key.startsWith('nm_')) continue;
            if (['layers', 'has_layer', 'text_layers', 'entry_id'].includes(key)) continue;
            const label = getFieldLabel(key);
            sectionContent[''].push(renderField(label, value));
        }    }

    /* ----------  Construir el HTML final del modal ---------- */

    console.log('=== Construyendo HTML final ===');
    console.log('sectionContent:', sectionContent);

    let modalHtml = '<div class="nm-modal-content">';
    Object.entries(sectionContent).forEach(([secName, items]) => {
        console.log(`Sección "${secName}" con ${items.length} items:`, items);
        if (!items.length) return;
        modalHtml += `
            <div class="nm-modal-section">
                ${secName && secName !== '' && secName !== 'null' ? `<h3 class="nm-modal-header">${secName}</h3>` : ''}
                ${items.join('')}
            </div>`;
    });
    modalHtml += '</div>';
    
    console.log('HTML final del modal:', modalHtml);

    /* ----------  Crear o refrescar el modal en el DOM ---------- */

    const $map = jQuery('#nm-main-map');
    let $modal = jQuery('#nm-modal');

    if ($modal.length === 0) {
        $modal = jQuery(`
            <div id="nm-modal" class="nm-modal">
                <span id="nm-modal-close" class="nm-modal-close">&times;</span>
                <div id="nm-modal-body"></div>
            </div>`);
        $map.append($modal);
    }    // Mostrar contenido y animar
    jQuery('#nm-modal-body').html(modalHtml);
    $modal.css('display', 'block');
    void $modal[0].offsetWidth; // forzar reflow
    $modal.addClass('active');

    // Inicializar reproductores de audio si los hay
    setTimeout(() => {
        initializeAudioPlayers();
    }, 100);

    /* ----------  Cierre del modal (click X o exterior) ---------- */
    jQuery('#nm-modal-close').off('click').on('click', closeModal);
    jQuery(window).off('click.modal').on('click.modal', (e) => {
        if (jQuery(e.target).is('#nm-modal')) closeModal();
    });    function closeModal() {
        // Pausar todos los audios antes de cerrar el modal
        jQuery('.nm-audio-element').each(function() {
            if (!this.paused) {
                this.pause();
            }
        });
        
        $modal.removeClass('active');
        setTimeout(() => $modal.css('display', 'none'), 300);
    }
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
 * Verifica si una extensión corresponde a un formato de audio
 * @param {string} extension - La extensión a verificar
 * @returns {boolean} - true si es un archivo de audio, false en caso contrario
 */
function isAudio(extension) {
    var audioExtensions = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'mp4', 'webm'];
    return audioExtensions.includes(extension.toLowerCase());
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

/**
 * Inicializa los reproductores de audio en el modal
 * Añade event listeners y funcionalidades adicionales a los elementos de audio
 */
function initializeAudioPlayers() {
    jQuery('.nm-audio-element').each(function() {
        const audio = this;
        const $audio = jQuery(audio);
        const $container = $audio.closest('.nm-audio-player');
        
        console.log('Inicializando reproductor de audio:', audio.src);
        
        // Event listener para cuando se carga la metadata del audio
        audio.addEventListener('loadedmetadata', function() {
            $audio.removeAttr('data-loading');
            console.log('Audio metadata cargada correctamente:', audio.src);
            // Remover cualquier mensaje de error anterior
            $container.find('.nm-audio-error').remove();
        });
        
        // Event listener para errores de carga
        audio.addEventListener('error', function(e) {
            $audio.removeAttr('data-loading');
            console.error('Error cargando audio:', audio.src, e);
            
            // Remover errores anteriores
            $container.find('.nm-audio-error').remove();
            
            // Mostrar mensaje de error específico
            let errorMessage = 'Error al cargar el archivo de audio';
            if (audio.error) {
                switch(audio.error.code) {
                    case audio.error.MEDIA_ERR_ABORTED:
                        errorMessage = 'Reproducción de audio cancelada por el usuario';
                        break;
                    case audio.error.MEDIA_ERR_NETWORK:
                        errorMessage = 'Error de red al cargar el audio. Verifica la URL y tu conexión.';
                        break;
                    case audio.error.MEDIA_ERR_DECODE:
                        errorMessage = 'Error al decodificar el archivo de audio';
                        break;
                    case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = 'Formato de audio no soportado o archivo no encontrado';
                        break;
                }
            }
            
            $container.append(`
                <div class="nm-audio-error">
                    ${errorMessage}
                    <br><small>URL: ${audio.src}</small>
                </div>
            `);
        });
        
        // Event listener para cuando el audio puede empezar a reproducirse
        audio.addEventListener('canplay', function() {
            $audio.removeAttr('data-loading');
            console.log('Audio listo para reproducir:', audio.src);
        });
        
        // Event listener para cuando comienza a cargar
        audio.addEventListener('loadstart', function() {
            console.log('Iniciando carga de audio:', audio.src);
        });
        
        // Event listener para progreso de carga
        audio.addEventListener('progress', function() {
            console.log('Progreso de carga de audio:', audio.src);
        });
        
        // Marcar como cargando inicialmente
        $audio.attr('data-loading', 'true');
        
        // Intentar cargar el audio
        audio.load();
    });
}



