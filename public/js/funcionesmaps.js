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
    };

    // Detectar el título y su clave de propiedad para no duplicarlo después
    let selectedTitleKey = null; // ejemplo: "nm_denom..."
    let titleHtml = '';
    (function detectTitle(){
        const getProp = (field) => {
            const k = 'nm_' + field.name;
            return Object.prototype.hasOwnProperty.call(properties, k) ? properties[k] : '';
        };
        const pick = (key, rawVal) => {
            const v = cleanValue(rawVal);
            const has = typeof v === 'string' ? v.trim() !== '' : !!v;
            if (has) {
                selectedTitleKey = key;
                titleHtml = `<h2 class="nm-modal-title">${v}</h2>`;
                return true;
            }
            return false;
        };

        // 1) Campo marcado explícitamente como título
        if (nmFormStructure && Array.isArray(nmFormStructure.fields)) {
            const flagged = nmFormStructure.fields.find(f => f.type === 'text' && (f.is_title === 1 || f.is_title === '1'));
            if (flagged) {
                const key = 'nm_' + flagged.name;
                if (pick(key, getProp(flagged))) return;
            }

            // 2) Heurística por label/nombre: título, denominación, nombre
            const titleRegex = /(t[íi]tulo|titulo|denominaci[óo]n|nombre)/i;
            const byLabel = nmFormStructure.fields.find(f => f.type === 'text' && (titleRegex.test(f.label || '') || titleRegex.test(f.name || '')) && (cleanValue(getProp(f)) || '').toString().trim() !== '');
            if (byLabel) {
                const key = 'nm_' + byLabel.name;
                if (pick(key, getProp(byLabel))) return;
            }

            // 3) Primer campo de texto con valor
            const firstText = nmFormStructure.fields.find(f => f.type === 'text' && (cleanValue(getProp(f)) || '').toString().trim() !== '');
            if (firstText) {
                const key = 'nm_' + firstText.name;
                if (pick(key, getProp(firstText))) return;
            }
        }

        // 4) Último recurso: inspección directa de propiedades
        const entries = Object.entries(properties || {}).filter(([k]) => /^nm_/i.test(k));
        const heuristic = entries.find(([k, v]) => /(denominaci[óo]n|titulo|t[íi]tulo|nombre)/i.test(k) && (cleanValue(v) || '').toString().trim() !== '');
        if (heuristic) pick(heuristic[0], heuristic[1]);
    })();

    /* ----------  Recorremos la estructura del formulario ---------- */

    let currentSection = null;
    const sectionContent = {};     // { "Nombre sección": [html, html...] }

    if (nmFormStructure && nmFormStructure.fields) {
      
        nmFormStructure.fields.forEach((field, index) => {
            // --- Cabecera -> abre nueva sección --------------------
            if (field.type === 'header') {
                currentSection = field.label || 'Sección';
                sectionContent[currentSection] = [];
                return;
            }            // --- Campo geographic-selector (manejo especial) -------------
            if (field.type === 'geographic-selector') {
                
                let geoHtml = `<div class="nm-geographic-selector-group">
                                <h4 class="nm-geographic-title">${cleanValue(field.label)}</h4>`;
                
                let hasValues = false;
                
                // Buscar automáticamente niveles geográficos comunes
                const commonLevels = ['admin1', 'admin2', 'admin3', 'admin4'];
                  // Si el campo tiene config, usar esa configuración
                if (field.config && field.config.levels && field.config.field_names) {
                    field.config.levels.forEach((level) => {
                        const levelKey = `nm_${level}`;
                        const levelValue = properties[levelKey];
                        
                        if (levelValue) {
                            hasValues = true;
                            const levelLabel = field.config.field_names[level] || level;
                            geoHtml += `<p class="nm-modal-field nm-geographic-field">
                                            <strong>${cleanValue(levelLabel)}:</strong> ${cleanValue(levelValue)}
                                        </p>`;
                        }
                    });
                } else {
                    // Buscar automáticamente por niveles comunes
                    commonLevels.forEach((level, index) => {
                        const levelKey = `nm_${level}`;
                        const levelValue = properties[levelKey];
                        
                        if (levelValue) {
                            hasValues = true;
                            const levelLabel = `Nivel ${index + 1}`;
                            geoHtml += `<p class="nm-modal-field nm-geographic-field">
                                            <strong>${cleanValue(levelLabel)}:</strong> ${cleanValue(levelValue)}
                                        </p>`;
                        }
                    });
                }
                  geoHtml += '</div>';
                  // Solo agregar si tiene valores
                if (hasValues) {
                    (sectionContent[currentSection] ||= []).push(geoHtml);
                }
                return;
            }

            const key = 'nm_' + field.name;
            // Omitir el campo que fue seleccionado como título (explícito o por fallback)
            if (selectedTitleKey && key === selectedTitleKey) {
                return;
            }
            
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
            // No duplicar el campo ya usado como título
            if (selectedTitleKey && key === selectedTitleKey) continue;
            
            // Filtrar nm_conditional_groups si está vacío, es {} o []
            if (key === 'nm_conditional_groups' && (value === '' || value === '{}' || value === '[]')) continue;
            
            const label = getFieldLabel(key);
            sectionContent[''].push(renderField(label, value || 'Sin especificar'));
        }
    }

    /* ----------  Construir el HTML final del modal ---------- */
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const currentThemeHref = Array.from(document.styleSheets).map(s=>s.href||'').find(h=>/theme3\.css/i.test(h));
    const isAudioGuide = !!currentThemeHref; // Theme 3 activo

    let modalHtml = '<div class="nm-modal-content">';

    if(isMobile && isAudioGuide){
        // Recopilar imágenes y primer audio
        const imageHtmlMatches = [];
        const audioMatches = [];
        Object.values(sectionContent).forEach(arr=>{
            arr.forEach(html=>{
                if(/<img /i.test(html)) imageHtmlMatches.push(html.match(/<img [^>]*>/i)[0]);
                if(/<audio /i.test(html)) audioMatches.push(html.match(/<audio[\s\S]*?<\/audio>/i)[0]);
            });
        });
        const heroSlides = imageHtmlMatches.length ? imageHtmlMatches.map(img=>`<div class="nm-audio-hero-slide">${img}</div>`).join('') : `<div class="nm-audio-hero-slide" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">Sin imágenes</div>`;
        const audioTag = audioMatches.length ? audioMatches[0] : '';
        // Título primero, luego hero con timeline y play
        modalHtml += `
            ${titleHtml}
            <div class="nm-audio-hero">
                <div class="nm-audio-hero-slider" data-index="0">${heroSlides}</div>
                <div class="nm-audio-hero-nav">
                    <button type="button" class="nm-audio-prev" aria-label="Anterior">❮</button>
                    <button type="button" class="nm-audio-next" aria-label="Siguiente">❯</button>
                </div>
                <div class="nm-audio-play-wrapper">
                    <button type="button" class="nm-audio-play-btn" aria-label="Reproducir / Pausar"><span class="nm-audio-play-icon">▶</span></button>
                    <div class="nm-audio-timeline">
                        <span class="nm-audio-current">00:00</span>
                        <input type="range" min="0" value="0" class="nm-audio-progress" />
                        <span class="nm-audio-duration">00:00</span>
                    </div>
                    <div class="nm-audio-hidden" style="height:0;overflow:hidden;">${audioTag}</div>
                </div>
            </div>
            <div class="nm-modal-sections-wrapper">
        `;
        Object.entries(sectionContent).forEach(([secName, items]) => {
            if (!items.length) return;
            // Filtrar items que ya formaron parte del hero (imagenes/audio duplicados)
            const filteredItems = items.filter(it=>!/<img /i.test(it) && !/<audio /i.test(it));
            if(!filteredItems.length) return;
            modalHtml += `
                <div class="nm-modal-section">
                    ${secName && secName !== '' && secName !== 'null' ? `<h3 class="nm-modal-header">${secName}</h3>` : ''}
                    ${filteredItems.join('')}
                </div>`;
        });
        modalHtml += '</div>'; // wrapper
    } else {
        // Desktop: título al inicio
        if (titleHtml) {
            modalHtml += titleHtml;
        }
        Object.entries(sectionContent).forEach(([secName, items]) => {
            if (!items.length) return;
            modalHtml += `
                <div class="nm-modal-section">
                    ${secName && secName !== '' && secName !== 'null' ? `<h3 class="nm-modal-header">${secName}</h3>` : ''}
                    ${items.join('')}
                </div>`;
        });
    }
    modalHtml += '</div>';

    /* ----------  Crear o refrescar el modal en el DOM ---------- */

    const $map = jQuery('#nm-main-map');
    let $modal = jQuery('#nm-modal');    if ($modal.length === 0) {
        $modal = jQuery(`
            <div id="nm-modal" class="nm-modal">
                <span id="nm-modal-close" class="nm-modal-close">&times;</span>
                <div id="nm-modal-body"></div>
            </div>`);
        $map.append($modal);
    }

    // Mostrar contenido y animar
    jQuery('#nm-modal-body').html(modalHtml);
    $modal.css('display', 'block');
    void $modal[0].offsetWidth; // forzar reflow
    $modal.addClass('active');

    // Inicializar reproductores de audio si los hay
    setTimeout(() => {
        initializeAudioPlayers();
        if(isMobile && isAudioGuide){
            initAudioGuideUI();
        }
    }, 100);    /* ----------  Cierre del modal (click X o exterior) ---------- */
    jQuery('#nm-modal-close').off('click').on('click', closeModal);
    jQuery(window).off('click.modal').on('click.modal', (e) => {
        if (jQuery(e.target).is('#nm-modal')) closeModal();
    });

    function closeModal() {
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

// =======================
// Audioguía UI helpers
// =======================
function initAudioGuideUI(){
    const root = jQuery('#nm-modal');
    const slider = root.find('.nm-audio-hero-slider');
    const slides = slider.find('.nm-audio-hero-slide');
    const btnPrev = root.find('.nm-audio-prev');
    const btnNext = root.find('.nm-audio-next');
    const playBtn = root.find('.nm-audio-play-btn');
    const playIcon = root.find('.nm-audio-play-icon');
    const range = root.find('.nm-audio-progress');
    const cur = root.find('.nm-audio-current');
    const dur = root.find('.nm-audio-duration');
    const audio = root.find('.nm-audio-hidden audio')[0];
    let index = 0;

    function updateSlider(){ slider.css('transform',`translateX(-${index*100}%)`); }
    function pad(t){ return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0'); }
    btnPrev.on('click',()=>{ index = (index-1+slides.length)%slides.length; updateSlider(); });
    btnNext.on('click',()=>{ index = (index+1)%slides.length; updateSlider(); });
    if(audio){
        audio.addEventListener('loadedmetadata',()=>{ range.attr('max', Math.floor(audio.duration)); dur.text(pad(audio.duration||0)); });
        audio.addEventListener('timeupdate',()=>{ range.val(Math.floor(audio.currentTime)); cur.text(pad(audio.currentTime)); const pct = (audio.currentTime/audio.duration)*100; range[0].style.setProperty('--nm-audio-progress', pct+'%'); });
        range.on('input',()=>{ audio.currentTime = range.val(); });
        playBtn.on('click',()=>{ if(audio.paused){ audio.play(); playIcon.text('⏸'); playBtn.addClass('paused'); } else { audio.pause(); playIcon.text('▶'); playBtn.removeClass('paused'); } });
    } else {
        playBtn.hide();
        range.closest('.nm-audio-timeline').hide();
    }
}


/**
 * Muestra el formulario para añadir una nueva capa WMS al mapa
 * Crea un formulario modal que permite al usuario introducir la URL
 * y el nombre de la capa WMS que desea agregar
 */
window.showAddWmsForm = function() {
    
    
    if (jQuery('#nm-wms-form').length === 0) {
        
        var $wmsForm = jQuery('<div>', { id: 'nm-wms-form', class: 'nm-wms-modal' }); // Cambiar clase para evitar conflictos
        var $wmsFormContent = jQuery('<div>', { class: 'nm-modal-content' });
        
        // Agregar botón de cerrar
        var $closeButton = jQuery('<span>', { class: 'nm-modal-close' }).html('&times;');

        var $formTitle = jQuery('<h3>').text('Añadir capa WMS');
        var $labelUrl = jQuery('<label>', { for: 'nm-wms-url' }).text('URL del servicio WMS:');
        var $inputUrl = jQuery('<input>', { type: 'text', id: 'nm-wms-url', name: 'nm-wms-url', placeholder: 'https://ejemplo.com/wms' });

        var $labelLayerName = jQuery('<label>', { for: 'nm-wms-layer-name' }).text('Nombre de la capa WMS:');
        var $inputLayerName = jQuery('<input>', { type: 'text', id: 'nm-wms-layer-name', name: 'nm-wms-layer-name', placeholder: 'nombre_de_la_capa' });

        var $addButton = jQuery('<button>', { id: 'nm-wms-add-button' }).text('Agregar capa');
        var $cancelButton = jQuery('<button>', { id: 'nm-wms-cancel-button' }).text('Cancelar');

        // Icono de carga oculto inicialmente
        var $loadingIcon = jQuery('<div>', { id: 'nm-wms-loading', style: 'display:none;' }).html('<img src="' + nmMapData.plugin_url + '/includes/img/Loading_icon.gif" alt="Cargando...">');

        $wmsFormContent.append($closeButton, $formTitle, $labelUrl, $inputUrl, $labelLayerName, $inputLayerName, $addButton, $cancelButton, $loadingIcon);
        $wmsForm.append($wmsFormContent);

        jQuery('body').append($wmsForm);

        $wmsForm.css({
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            'background-color': 'rgba(0,0,0,0.5)',
            'z-index': '10000',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'transform': 'none', // Asegurar que no se aplique transform
            'right': 'auto', // Resetear right
            'box-shadow': 'none', // Remover box-shadow
            'transition': 'none', // Remover transición
            'max-height': 'none', // Resetear max-height
            'padding': '20px', // Añadir padding para que no se pegue a los bordes
            'box-sizing': 'border-box' // Incluir padding en las dimensiones
        });

        $wmsFormContent.css({
            'background-color': '#fff',
            padding: '20px',
            'border-radius': '5px',
            width: '400px',
            'max-width': '90%',
            'max-height': '90vh',
            position: 'relative',
            'overflow-y': 'auto',
            margin: 'auto'
        });
        
        // Estilos para el botón de cerrar
        $closeButton.css({
            position: 'absolute',
            top: '10px',
            right: '15px',
            'font-size': '24px',
            'font-weight': 'bold',
            cursor: 'pointer',
            color: '#aaa'
        });
        
        // Estilos para los campos del formulario
        $labelUrl.css({ display: 'block', 'margin-top': '10px', 'font-weight': 'bold' });
        $labelLayerName.css({ display: 'block', 'margin-top': '10px', 'font-weight': 'bold' });
        $inputUrl.css({ width: '100%', padding: '8px', 'margin-top': '5px', 'box-sizing': 'border-box' });
        $inputLayerName.css({ width: '100%', padding: '8px', 'margin-top': '5px', 'box-sizing': 'border-box' });
        
        // Estilos para los botones
        $addButton.css({ 
            'background-color': '#0073aa', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            'border-radius': '3px',
            cursor: 'pointer',
            'margin-top': '15px',
            'margin-right': '10px'
        });
        $cancelButton.css({ 
            'background-color': '#666', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            'border-radius': '3px',
            cursor: 'pointer',
            'margin-top': '15px'
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
                
                // Verificar que las variables globales necesarias estén disponibles
                if (typeof map === 'undefined' || typeof overlays === 'undefined' || typeof controlLayers === 'undefined') {
                    alert('Error: El mapa no está inicializado correctamente.');
                    console.error('Variables globales del mapa no disponibles:', {
                        map: typeof map,
                        overlays: typeof overlays,
                        controlLayers: typeof controlLayers
                    });
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
                        $wmsForm.css('display', 'none').hide();
                        $inputUrl.val('');
                        $inputLayerName.val('');
                    }
                });

                userWmsLayer.on('tileerror', function (error, tile) {
                    alert('Error al cargar la capa WMS. Por favor, verifique la URL y el nombre de la capa.');
                    // Ocultar el icono de carga y mostrar el botón de agregar nuevamente
                    $loadingIcon.hide();
                    $addButton.show();
                    if (map && typeof map.removeLayer === 'function') {
                        map.removeLayer(userWmsLayer);
                    }
                    if (controlLayers && typeof controlLayers.removeLayer === 'function') {
                        controlLayers.removeLayer(userWmsLayer);
                    }
                });

                if (map && typeof map.addLayer === 'function') {
                    userWmsLayer.addTo(map);
                }

                if (overlays && controlLayers) {
                    overlays[wmsLayerName] = userWmsLayer;
                    if (typeof controlLayers.addOverlay === 'function') {
                        controlLayers.addOverlay(userWmsLayer, wmsLayerName);
                    }
                }
            } else {
                alert('Por favor, complete todos los campos.');
            }
        });

        $cancelButton.on('click', function () {
            $wmsForm.css('display', 'none').hide();
            $inputUrl.val('');
            $inputLayerName.val('');
        });
        
        // Event handler para el botón de cerrar (X)
        $closeButton.on('click', function () {
            $wmsForm.css('display', 'none').hide();
            $inputUrl.val('');
            $inputLayerName.val('');
        });
        
        // Cerrar modal al hacer clic en el fondo
        $wmsForm.on('click', function (e) {
            if (e.target === this) {
                $wmsForm.css('display', 'none').hide();
                $inputUrl.val('');
                $inputLayerName.val('');
            }
        });
    }

    var $wmsForm = jQuery('#nm-wms-form');
    
    
    
    // Forzar la visibilidad con estilos más agresivos
    $wmsForm.css({
        'display': 'flex !important',
        'visibility': 'visible !important',
        'opacity': '1 !important',
        'position': 'fixed !important',
        'top': '0 !important',
        'left': '0 !important',
        'width': '100% !important',
        'height': '100% !important',
        'z-index': '999999 !important',
        'background-color': 'rgba(0,0,0,0.8) !important',
        'transform': 'none !important', // Resetear transform que lo mueve fuera de pantalla
        'right': 'auto !important', // Resetear right
        'box-shadow': 'none !important', // Remover box-shadow
        'transition': 'none !important', // Remover transición
        'max-height': 'none !important', // Resetear max-height
        'padding': '20px !important', // Padding para separar del borde
        'box-sizing': 'border-box !important' // Incluir padding en dimensiones
    });
    
    // Forzar que sea visible
    $wmsForm.show();
    $wmsForm.attr('style', $wmsForm.attr('style') + '; display: flex !important;');
    
    
    
    // Intentar traer el elemento al frente de forma agresiva
    $wmsForm.appendTo('body');
    $wmsForm.focus();
    
    // Si después de todo esto el modal sigue sin tener dimensiones, usar el respaldo
    setTimeout(function() {
        if ($wmsForm[0].offsetWidth === 0 || $wmsForm[0].offsetHeight === 0) {
            
            $wmsForm.remove(); // Limpiar el modal problemático
            showSimpleWmsForm(); // Llamar función de respaldo
        }
    }, 100);
};

/**
 * Función de respaldo para crear un modal WMS simple y visible
 * Se usa si la función principal no funciona correctamente
 */
window.showSimpleWmsForm = function() {
    // Eliminar cualquier modal existente
    jQuery('#nm-wms-form-simple').remove();
    
    // Crear modal simple con HTML directo
    var modalHtml = `
        <div id="nm-wms-form-simple" style="
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0,0,0,0.8) !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: Arial, sans-serif !important;
        ">
            <div style="
                background-color: white !important;
                padding: 30px !important;
                border-radius: 8px !important;
                width: 400px !important;
                max-width: 90% !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                position: relative !important;
            ">
                <span id="nm-close-simple" style="
                    position: absolute !important;
                    top: 10px !important;
                    right: 15px !important;
                    font-size: 28px !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    color: #aaa !important;
                ">&times;</span>
                
                <h3 style="margin-top: 0 !important; color: #333 !important;">Añadir capa WMS</h3>
                
                <label style="display: block !important; margin-top: 15px !important; font-weight: bold !important; color: #333 !important;">
                    URL del servicio WMS:
                </label>
                <input type="text" id="nm-simple-wms-url" placeholder="https://ejemplo.com/wms" style="
                    width: 100% !important;
                    padding: 10px !important;
                    margin-top: 5px !important;
                    border: 1px solid #ccc !important;
                    border-radius: 4px !important;
                    box-sizing: border-box !important;
                    font-size: 14px !important;
                ">
                
                <label style="display: block !important; margin-top: 15px !important; font-weight: bold !important; color: #333 !important;">
                    Nombre de la capa WMS:
                </label>
                <input type="text" id="nm-simple-wms-layer" placeholder="nombre_de_la_capa" style="
                    width: 100% !important;
                    padding: 10px !important;
                    margin-top: 5px !important;
                    border: 1px solid #ccc !important;
                    border-radius: 4px !important;
                    box-sizing: border-box !important;
                    font-size: 14px !important;
                ">
                
                <div style="margin-top: 20px !important;">
                    <button id="nm-simple-add-btn" style="
                        background-color: #0073aa !important;
                        color: white !important;
                        padding: 12px 24px !important;
                        border: none !important;
                        border-radius: 4px !important;
                        cursor: pointer !important;
                        margin-right: 10px !important;
                        font-size: 14px !important;
                    ">Agregar capa</button>
                    
                    <button id="nm-simple-cancel-btn" style="
                        background-color: #666 !important;
                        color: white !important;
                        padding: 12px 24px !important;
                        border: none !important;
                        border-radius: 4px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                    ">Cancelar</button>
                </div>
                
                <div id="nm-simple-loading" style="display: none !important; text-align: center !important; margin-top: 15px !important;">
                    <div style="color: #666 !important;">Cargando...</div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar al body
    jQuery('body').append(modalHtml);
    
    // Event handlers
    jQuery('#nm-close-simple, #nm-simple-cancel-btn').on('click', function() {
        jQuery('#nm-wms-form-simple').remove();
    });
    
    jQuery('#nm-simple-add-btn').on('click', function() {
        var url = jQuery('#nm-simple-wms-url').val();
        var layerName = jQuery('#nm-simple-wms-layer').val();
        
        if (!url || !layerName) {
            alert('Por favor, complete todos los campos.');
            return;
        }
        
        if (!/^https?:\/\//i.test(url)) {
            alert('Por favor, ingrese una URL válida que comience con http:// o https://');
            return;
        }
        
        // Verificar variables globales
        if (typeof map === 'undefined' || typeof overlays === 'undefined' || typeof controlLayers === 'undefined') {
            alert('Error: El mapa no está inicializado correctamente.');
            return;
        }
        
        // Mostrar loading
        jQuery('#nm-simple-loading').show();
        jQuery('#nm-simple-add-btn').prop('disabled', true);
        
        // Crear capa WMS
        var userWmsLayer = L.tileLayer.wms(url, {
            layers: layerName,
            format: 'image/png',
            transparent: true,
            attribution: ''
        });
        
        var alertShown = false;
        
        userWmsLayer.on('tileload', function () {
            if (!alertShown) {
                alertShown = true;
                alert('Capa WMS cargada con éxito');
                jQuery('#nm-wms-form-simple').remove();
            }
        });
        
        userWmsLayer.on('tileerror', function () {
            alert('Error al cargar la capa WMS. Verifique la URL y el nombre de la capa.');
            jQuery('#nm-simple-loading').hide();
            jQuery('#nm-simple-add-btn').prop('disabled', false);
        });
        
        userWmsLayer.addTo(map);
        overlays[layerName] = userWmsLayer;
        if (controlLayers && typeof controlLayers.addOverlay === 'function') {
            controlLayers.addOverlay(userWmsLayer, layerName);
        }
    });
    
    // Cerrar al hacer clic en el fondo
    jQuery('#nm-wms-form-simple').on('click', function(e) {
        if (e.target === this) {
            jQuery(this).remove();
        }
    });
    
    
};

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
        
        // Event listener para cuando se carga la metadata del audio
        audio.addEventListener('loadedmetadata', function() {
            $audio.removeAttr('data-loading');
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
        });
        
        // Event listener para cuando comienza a cargar
        audio.addEventListener('loadstart', function() {
        });
        
        // Event listener para progreso de carga
        audio.addEventListener('progress', function() {
        });
        
        // Marcar como cargando inicialmente
        $audio.attr('data-loading', 'true');
        
        // Intentar cargar el audio
        audio.load();
    });
}



