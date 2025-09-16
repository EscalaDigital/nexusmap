/**
 * JavaScript para el modal de detalles de entradas de NexusMap
 */

// Variable global para el mapa
let modalMap = null;
let leafletLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en el contexto correcto (frontend con entradas)
    if (!document.querySelector('.nm-entry-card') && !document.querySelector('.nm-entries-grid')) {
        
        return;
    }
    
    
    
    // Crear el HTML del modal y añadirlo al DOM
    createModalHTML();
    
    // Añadir event listeners a las tarjetas
    attachCardListeners();
    
    // Verificar si Leaflet está disponible, si no, intentar cargarlo
    checkAndLoadLeaflet().catch(error => {
        console.warn('NexusMap: Leaflet no se pudo precargar, se cargará cuando sea necesario:', error);
    });
});

/**
 * Crear la estructura HTML del modal
 */
function createModalHTML() {
    const modalHTML = `
        <div id="nm-entries-modal" class="nm-entry-modal">
            <div class="nm-modal-content">
                <div class="nm-modal-header">
                    <h2 class="nm-modal-title" id="nm-modal-title">Información de la Entrada</h2>
                    <button class="nm-modal-close" onclick="closeEntryModal()" type="button">&times;</button>
                </div>
                <div class="nm-modal-body" id="nm-modal-body">
                    <div class="nm-modal-map-section">
                        <div id="nm-modal-map" style="width: 100%; height: 100%; min-height: 400px;">
                            <div class="nm-modal-loading">Cargando mapa...</div>
                        </div>
                    </div>
                    <div class="nm-modal-data-section">
                        <h3 class="nm-data-section-title">Datos del Formulario</h3>
                        <div class="nm-property-grid" id="nm-modal-data">
                            <div class="nm-modal-loading">Cargando información...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Añadir el modal al final del body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('nm-entries-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEntryModal();
        }
    });
    
    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('nm-entries-modal');
            if (modal && modal.style.display === 'block') {
                closeEntryModal();
            }
        }
    });
}

/**
 * Añadir event listeners a las tarjetas
 */
function attachCardListeners() {
    const cards = document.querySelectorAll('.nm-entry-card');
    
    cards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            // Evitar que se abra el modal si se hace clic en un enlace
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            // Obtener el índice de la entrada desde el atributo data
            const entryIndex = card.getAttribute('data-entry-index');
            
            if (entryIndex !== null) {
                openEntryModal(parseInt(entryIndex));
            }
        });
    });
}

/**
 * Abrir el modal con los detalles de una entrada
 */
function openEntryModal(entryIndex) {
    const modal = document.getElementById('nm-entries-modal');
    const modalMap = document.getElementById('nm-modal-map');
    const modalData = document.getElementById('nm-modal-data');
    
    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Evitar scroll del body
    
    // Resetear contenido
    modalMap.innerHTML = '<div class="nm-modal-loading">Cargando mapa...</div>';
    modalData.innerHTML = '<div class="nm-modal-loading">Cargando información...</div>';
    
    // Verificar que nm_ajax está disponible
    if (typeof nm_ajax === 'undefined') {
        showModalError('Error de configuración: Variables AJAX no disponibles');
        return;
    }
    
    // Hacer petición AJAX para obtener los datos completos
    fetch(nm_ajax.ajax_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'action': 'nm_get_entry_details',
            'entry_index': entryIndex,
            'nonce': nm_ajax.nonce
        })
    })
    .then(response => response.json())
    .then(data => {
        
        if (data.success) {
            
            displayEntryDetails(data.data);
        } else {
            console.error('Error en la respuesta:', data.data); // Debug
            showModalError('Error al cargar los detalles: ' + (data.data || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error de conexión:', error); // Debug
        showModalError('Error de conexión al cargar los detalles');
    });
}

/**
 * Mostrar los detalles de la entrada en el modal
 */
function displayEntryDetails(entryData) {
    const modalMapContainer = document.getElementById('nm-modal-map');
    const modalData = document.getElementById('nm-modal-data');
    
    // Inicializar el mapa
    initModalMap(entryData, modalMapContainer);
    
    // Construir el contenido de datos
    let dataContent = '';
    
    // Función auxiliar para formatear texto largo
    function formatLongText(text) {
        if (typeof text === 'string' && text.length > 200) {
            const shortText = text.substring(0, 200) + '...';
            return `
                <span class="short-content">${shortText}</span>
                <span class="full-content" style="display: none;">${text}</span>
                <br><button class="nm-toggle-content" style="margin-top: 8px; font-size: 12px;">Ver más</button>
            `;
        }
        return text;
    }
    
    // Función auxiliar para formatear URLs
    function formatUrl(content) {
        try {
            new URL(content);
            const extension = content.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
                return `<img src="${content}" alt="Imagen" loading="lazy">`;
            } else if (extension === 'pdf') {
                return `<a href="${content}" target="_blank" rel="noopener">📄 Ver PDF</a>`;
            } else {
                return `<a href="${content}" target="_blank" rel="noopener">🔗 ${content}</a>`;
            }
        } catch {
            return content;
        }
    }
    
    // Descripción/contenido principal
    if (entryData.description) {
        dataContent += `
            <div class="nm-modal-section">
                <h3>Descripción</h3>
                <div>${formatLongText(entryData.description)}</div>
            </div>
        `;
    }
    
    // Audio
    if (entryData.audio) {
        dataContent += `
            <div class="nm-modal-section">
                <h3>Audio</h3>
                <div class="nm-modal-audio">
                    <audio controls>
                        <source src="${entryData.audio}" type="audio/mpeg">
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            </div>
        `;
    }
    
    // Archivo/Documento
    if (entryData.file) {
        const fileName = entryData.file.split('/').pop();
        dataContent += `
            <div class="nm-modal-section">
                <h3>Documento</h3>
                <div class="nm-modal-file">
                    <a href="${entryData.file}" class="nm-modal-download-btn" target="_blank" download>
                        📄 Descargar ${fileName}
                    </a>
                </div>
            </div>
        `;
    }
    
    // Información básica
    const basicInfo = [];
    if (entryData.date) {
        basicInfo.push(`<strong>Fecha:</strong> ${entryData.date}`);
    }
    if (entryData.location) {
        basicInfo.push(`<strong>Ubicación:</strong> ${entryData.location}`);
    }
    
    if (basicInfo.length > 0) {
        dataContent += `
            <div class="nm-modal-section">
                <h3>Información Básica</h3>
                <div>${basicInfo.join('<br>')}</div>
            </div>
        `;
    }
    
    // Campos personalizados
    if (entryData.custom_fields && Object.keys(entryData.custom_fields).length > 0) {
        for (const [key, value] of Object.entries(entryData.custom_fields)) {
            if (value && value !== '' && value !== null && value !== undefined) {
                const fieldLabel = key.replace(/^nm_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                let formattedValue = value;
                
                // Verificar si es una URL
                if (typeof value === 'string' && value.startsWith('http')) {
                    formattedValue = formatUrl(value);
                } else {
                    formattedValue = formatLongText(value);
                }
                
                dataContent += `
                    <div class="nm-modal-section">
                        <h3>${fieldLabel}</h3>
                        <div>${formattedValue}</div>
                    </div>
                `;
            }
        }
    }
    
    // Si no hay contenido, mostrar mensaje
    if (!dataContent) {
        dataContent = `
            <div class="nm-modal-section">
                <div class="nm-empty-field">No hay información adicional disponible</div>
            </div>
        `;
    }
    
    modalData.innerHTML = dataContent;
    
    // Agregar funcionalidad para expandir/contraer textos largos
    const toggleButtons = modalData.querySelectorAll('.nm-toggle-content');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.nm-modal-section');
            const shortContent = section.querySelector('.short-content');
            const fullContent = section.querySelector('.full-content');
            
            if (fullContent.style.display === 'none') {
                shortContent.style.display = 'none';
                fullContent.style.display = 'inline';
                this.textContent = 'Ver menos';
            } else {
                shortContent.style.display = 'inline';
                fullContent.style.display = 'none';
                this.textContent = 'Ver más';
            }
        });
    });
}

/**
 * Mostrar un error en el modal
 */
function showModalError(message) {
    const modalMapContainer = document.getElementById('nm-modal-map');
    const modalData = document.getElementById('nm-modal-data');
    
    modalMapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #dc3545, #c82333); color: white; text-align: center; padding: 30px;">
            <div style="font-size: 72px; margin-bottom: 20px; opacity: 0.9; text-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: nm-error-shake 0.5s ease-in-out;">❌</div>
            <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">Error de Conexión</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 14px; max-width: 300px; line-height: 1.5;">No se pudieron cargar los datos de esta entrada</p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); font-size: 13px; max-width: 350px;">
                <strong>Detalles del error:</strong><br>
                <span style="opacity: 0.8; font-style: italic;">${message}</span>
            </div>
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                <span style="margin-right: 5px;">🔄</span>
                Intente refrescar la página o contacte al administrador
            </div>
        </div>
        <style>
            @keyframes nm-error-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        </style>
    `;
    
    modalData.innerHTML = `
        <div class="nm-modal-section" style="text-align: center; background: linear-gradient(135deg, #f8d7da, #ffffff); border: 1px solid #f5c6cb; color: #721c24;">
            <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.8;">⚠️</div>
            <h3 style="color: #721c24; margin-bottom: 15px;">Información No Disponible</h3>
            <div style="color: #721c24; line-height: 1.6;">
                <p><strong>Ha ocurrido un problema:</strong></p>
                <p style="background: rgba(114, 28, 36, 0.1); padding: 12px; border-radius: 6px; font-style: italic; margin: 15px 0;">${message}</p>
                <p style="font-size: 14px; margin-top: 20px;">
                    <strong>Qué puede hacer:</strong><br>
                    • Verificar su conexión a internet<br>
                    • Refrescar la página (F5)<br>
                    • Intentar de nuevo en unos momentos<br>
                    • Contactar al administrador si persiste
                </p>
            </div>
        </div>
    `;
}

/**
 * Cerrar el modal
 */
function closeEntryModal() {
    const modal = document.getElementById('nm-entries-modal');
    if (!modal) {
        console.warn('Modal no encontrado para cerrar');
        return;
    }
    
    // Añadir animación de salida
    modal.style.animation = 'nm-fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.animation = ''; // Limpiar animación
        document.body.style.overflow = ''; // Restaurar scroll del body
        
        // Limpiar el mapa si existe
        if (modalMap) {
            try {
                modalMap.remove();
                
            } catch (error) {
                console.warn('Error limpiando el mapa:', error);
            }
            modalMap = null;
        }
        
        // Limpiar contenido del modal para liberar memoria
        const modalMapContainer = document.getElementById('nm-modal-map');
        const modalData = document.getElementById('nm-modal-data');
        
        if (modalMapContainer) {
            modalMapContainer.innerHTML = '<div class="nm-modal-loading">Cargando mapa...</div>';
        }
        
        if (modalData) {
            modalData.innerHTML = '<div class="nm-modal-loading">Cargando información...</div>';
        }
        
        
    }, 300);
}

/**
 * Capitalizar la primera letra de una cadena
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Inicializar el mapa en el modal
 */
async function initModalMap(entryData, mapContainer) {
    
    
    // Mostrar indicador de carga mejorado
    mapContainer.innerHTML = `
        <div class="nm-modal-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #f8f9fa, #e9ecef); color: #667eea;">
            <div style="font-size: 48px; margin-bottom: 15px; animation: nm-pulse 1.5s ease-in-out infinite;">🗺️</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Cargando mapa interactivo...</div>
            <div style="font-size: 13px; opacity: 0.7;">Preparando visualización geográfica</div>
            <div class="loading-bar" style="width: 200px; height: 3px; background: #e1e5e9; border-radius: 2px; margin-top: 15px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transform: translateX(-100%); animation: nm-loading-bar 2s ease-in-out infinite;"></div>
            </div>
        </div>
        <style>
            @keyframes nm-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            @keyframes nm-loading-bar {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
        </style>
    `;
    
    try {
        // Verificar si Leaflet está disponible, si no, cargarlo
        if (!leafletLoaded && typeof L === 'undefined') {
            
            
            // Actualizar indicador de carga
            mapContainer.innerHTML = `
                <div class="nm-modal-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #f8f9fa, #e9ecef); color: #667eea;">
                    <div style="font-size: 48px; margin-bottom: 15px; animation: nm-bounce 1s ease-in-out infinite;">📦</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Descargando biblioteca de mapas...</div>
                    <div style="font-size: 13px; opacity: 0.7;">Por favor espere un momento</div>
                    <div class="loading-bar" style="width: 250px; height: 4px; background: #e1e5e9; border-radius: 2px; margin-top: 15px; overflow: hidden;">
                        <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transform: translateX(-100%); animation: nm-loading-bar 1.5s ease-in-out infinite;"></div>
                    </div>
                </div>
                <style>
                    @keyframes nm-bounce {
                        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                        40% { transform: translateY(-10px); }
                        60% { transform: translateY(-5px); }
                    }
                </style>
            `;
            
            await loadLeaflet();
        }
        
        // Verificar de nuevo después de cargar
        if (typeof L === 'undefined') {
            throw new Error('Leaflet no se pudo cargar correctamente');
        }
        
        // Limpiar el contenedor del mapa
        mapContainer.innerHTML = '';
        
        // Limpiar mapa anterior si existe
        if (modalMap) {
            modalMap.remove();
            modalMap = null;
        }
        
        // Crear nuevo mapa
        modalMap = L.map(mapContainer).setView([40.4168, -3.7038], 6); // Madrid como centro por defecto
        
        // Añadir capa base con manejo de errores
        try {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap contributors',
                errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPg=='
            }).addTo(modalMap);
        } catch (tileError) {
            console.warn('Error cargando tiles del mapa:', tileError);
            // Continuar sin las tiles, el mapa aún puede funcionar
        }
        
        // Procesar datos geográficos si existen
        if (entryData.map_data || entryData.geometry || entryData.coordinates) {
            
            addGeographicData(modalMap, entryData);
        } else {
            console.warn('No se encontraron datos geográficos en:', entryData); // Debug
            // Si no hay datos geográficos, mostrar mensaje con estilo mejorado
            const noGeoData = L.control({position: 'topright'});
            noGeoData.onAdd = function(map) {
                const div = L.DomUtil.create('div', 'leaflet-control-no-geo');
                div.style.cssText = `
                    background: rgba(255,255,255,0.95); 
                    padding: 12px 16px; 
                    border-radius: 8px; 
                    font-size: 13px; 
                    font-weight: 600; 
                    color: #667eea; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    border: 1px solid #e1e5e9;
                    max-width: 200px;
                    text-align: center;
                `;
                div.innerHTML = '<span style="font-size: 16px; margin-right: 6px;">📍</span>Sin ubicación específica';
                return div;
            };
            noGeoData.addTo(modalMap);
        }
        
        // Invalidar el tamaño del mapa después de un breve retraso
        setTimeout(() => {
            if (modalMap) {
                modalMap.invalidateSize();
            }
        }, 250);
        
    } catch (error) {
        console.error('Error inicializando el mapa:', error);
        // Mostrar una imagen o contenido alternativo si el mapa falla
        showAlternativeMapContent(mapContainer, entryData);
    }
}

/**
 * Mostrar contenido alternativo cuando el mapa no puede cargarse
 */
function showAlternativeMapContent(mapContainer, entryData) {
    let content = '';
    
    // Si hay una imagen, mostrarla con info adicional
    if (entryData.image) {
        // Buscar información de ubicación para mostrar junto a la imagen
        let locationInfo = '';
        if (entryData.custom_fields) {
            for (const [key, value] of Object.entries(entryData.custom_fields)) {
                if (key.toLowerCase().includes('ubicacion') || 
                    key.toLowerCase().includes('location') || 
                    key.toLowerCase().includes('lugar') ||
                    key.toLowerCase().includes('direccion') ||
                    key.toLowerCase().includes('address') ||
                    key.toLowerCase().includes('coordenadas')) {
                    const fieldLabel = key.replace(/^nm_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    locationInfo += `<div class="location-item"><strong>${fieldLabel}:</strong> ${value}</div>`;
                }
            }
        }
        
        content = `
            <div class="nm-alternative-content" style="width: 100%; height: 100%; position: relative; overflow: hidden; border-radius: 8px;">
                <div class="nm-image-container" style="width: 100%; height: 100%; position: relative;">
                    <img src="${entryData.image}" alt="Imagen de la entrada" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="nm-image-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 20px;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 24px; margin-right: 10px;">📍</span>
                            <h4 style="margin: 0; font-size: 16px; font-weight: 600;">Información de Ubicación</h4>
                        </div>
                        <div class="location-info" style="font-size: 13px; line-height: 1.4;">
                            ${locationInfo || '<div style="opacity: 0.8;">📍 Entrada con imagen - Mapa no disponible</div>'}
                        </div>
                    </div>
                </div>
                <div class="nm-fallback-indicator" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); color: #667eea; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    🗺️ Vista de imagen
                </div>
            </div>
        `;
    } else {
        // Mostrar información de ubicación decorativa sin imagen
        let locationInfo = '';
        let hasLocationData = false;
        
        // Buscar información de ubicación en los datos
        if (entryData.custom_fields) {
            for (const [key, value] of Object.entries(entryData.custom_fields)) {
                if (key.toLowerCase().includes('ubicacion') || 
                    key.toLowerCase().includes('location') || 
                    key.toLowerCase().includes('lugar') ||
                    key.toLowerCase().includes('direccion') ||
                    key.toLowerCase().includes('address') ||
                    key.toLowerCase().includes('coordenadas') ||
                    key.toLowerCase().includes('ciudad') ||
                    key.toLowerCase().includes('pais') ||
                    key.toLowerCase().includes('provincia') ||
                    key.toLowerCase().includes('region')) {
                    const fieldLabel = key.replace(/^nm_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    locationInfo += `
                        <div class="location-detail" style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin: 8px 0; border-left: 4px solid rgba(255,255,255,0.3);">
                            <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${fieldLabel}</div>
                            <div style="font-size: 16px; font-weight: 500;">${value}</div>
                        </div>
                    `;
                    hasLocationData = true;
                }
            }
        }
        
        // También buscar en la descripción si hay menciones de ubicación
        let descriptionPreview = '';
        if (entryData.description && typeof entryData.description === 'string') {
            const preview = entryData.description.substring(0, 150);
            descriptionPreview = `
                <div class="description-preview" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid rgba(255,255,255,0.2);">
                    <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">📝 Descripción</div>
                    <div style="font-size: 14px; line-height: 1.5; font-style: italic; opacity: 0.9;">${preview}${entryData.description.length > 150 ? '...' : ''}</div>
                </div>
            `;
        }
        
        content = `
            <div class="nm-alternative-content nm-no-map" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; position: relative; overflow-y: auto;">
                <div class="nm-fallback-header" style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 72px; margin-bottom: 15px; opacity: 0.9; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">�️</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">Información de Ubicación</h3>
                    <p style="margin: 0; opacity: 0.8; font-size: 14px;">Mapa no disponible - Mostrando datos disponibles</p>
                </div>
                
                <div class="nm-location-data" style="width: 100%; max-width: 400px;">
                    ${locationInfo}
                    ${descriptionPreview}
                    ${!hasLocationData && !descriptionPreview ? `
                        <div class="no-data-message" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; border: 2px dashed rgba(255,255,255,0.3);">
                            <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.7;">📍</div>
                            <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Sin datos geográficos</div>
                            <div style="font-size: 13px; opacity: 0.8;">Esta entrada no contiene información de ubicación específica</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="nm-fallback-footer" style="position: absolute; bottom: 15px; right: 15px; left: 15px; text-align: center;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 20px; font-size: 12px; opacity: 0.8; display: inline-block;">
                        ⚠️ Servicio de mapas no disponible
                    </div>
                </div>
            </div>
        `;
    }
    
    mapContainer.innerHTML = content;
}

/**
 * Añadir datos geográficos al mapa
 */
function addGeographicData(map, entryData) {
    
    let bounds = L.latLngBounds();
    let hasData = false;
    
    try {
        // Función para procesar geometría
        function processGeometry(geometry) {
            
            if (!geometry || !geometry.type) {
                console.warn('Geometría inválida:', geometry);
                return;
            }
            
            const type = geometry.type.toLowerCase();
            
            if (type === 'point') {
                const latLng = [geometry.coordinates[1], geometry.coordinates[0]];
                
                L.marker(latLng).addTo(map);
                bounds.extend(latLng);
                hasData = true;
            } else if (type === 'polygon') {
                
                const latLngs = geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                L.polygon(latLngs, {
                    color: '#667eea',
                    fillColor: '#667eea',
                    fillOpacity: 0.5
                }).addTo(map);
                latLngs.forEach(latLng => bounds.extend(latLng));
                hasData = true;
            } else if (type === 'multipolygon') {
                
                geometry.coordinates.forEach(polygon => {
                    const latLngs = polygon[0].map(coord => [coord[1], coord[0]]);
                    L.polygon(latLngs, {
                        color: '#667eea',
                        fillColor: '#667eea',
                        fillOpacity: 0.5
                    }).addTo(map);
                    latLngs.forEach(latLng => bounds.extend(latLng));
                });
                hasData = true;
            } else if (type === 'geometrycollection') {
                
                geometry.geometries.forEach(geom => processGeometry(geom));
            } else {
                console.warn('Tipo de geometría no soportado:', type);
            }
        }
        
        // Procesar map_data si existe (formato JSON string)
        if (entryData.map_data) {
            
            try {
                const decodedData = decodeEscapedJsonString(entryData.map_data);
                
                const geoData = JSON.parse(decodedData);
                
                
                if (Array.isArray(geoData)) {
                    geoData.forEach((feature, index) => {
                        
                        if (feature.geometry) {
                            processGeometry(feature.geometry);
                        }
                    });
                } else if (geoData.geometry) {
                    processGeometry(geoData.geometry);
                }
            } catch (e) {
                console.error('Error procesando map_data:', e, entryData.map_data);
            }
        }
        
        // Procesar geometry directo si existe
        if (entryData.geometry) {
            
            processGeometry(entryData.geometry);
        }
        
        // Procesar coordinates simples si existen
        if (entryData.coordinates && Array.isArray(entryData.coordinates)) {
            
            const latLng = [entryData.coordinates[1], entryData.coordinates[0]];
            L.marker(latLng).addTo(map);
            bounds.extend(latLng);
            hasData = true;
        }
        
        // Buscar en custom_fields por si hay datos geográficos allí
        if (entryData.custom_fields) {
            
            for (const [key, value] of Object.entries(entryData.custom_fields)) {
                if (key === 'map_data' && value) {
                    
                    try {
                        const decodedData = decodeEscapedJsonString(value);
                        const geoData = JSON.parse(decodedData);
                        
                        if (Array.isArray(geoData)) {
                            geoData.forEach(feature => {
                                if (feature.geometry) {
                                    processGeometry(feature.geometry);
                                }
                            });
                        } else if (geoData.geometry) {
                            processGeometry(geoData.geometry);
                        }
                    } catch (e) {
                        console.error('Error procesando map_data de custom_fields:', e);
                    }
                }
            }
        }
        
        // Ajustar vista del mapa a los datos
        if (hasData && bounds.isValid()) {
            
            map.fitBounds(bounds, { padding: [20, 20] });
        } else {
            console.warn('No se encontraron datos geográficos válidos para mostrar');
        }
        
    } catch (error) {
        console.error('Error procesando datos geográficos:', error);
    }
}

/**
 * Función auxiliar para decodificar JSON escapado (similar a la del admin)
 */
function decodeEscapedJsonString(escapedString) {
    return escapedString
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\');
}

/**
 * Verificar y cargar Leaflet si no está disponible
 */
async function checkAndLoadLeaflet() {
    if (typeof L !== 'undefined') {
        leafletLoaded = true;
        
        return Promise.resolve();
    }
    
    
    try {
        await loadLeaflet();
        leafletLoaded = true;
        
        return Promise.resolve();
    } catch (error) {
        console.error('Error al cargar Leaflet:', error);
        leafletLoaded = false;
        return Promise.reject(error);
    }
}

/**
 * Cargar Leaflet dinámicamente
 */
function loadLeaflet() {
    return new Promise((resolve, reject) => {
        // Verificar si ya se está cargando
        if (document.querySelector('script[src*="leaflet"]')) {
            
            // Esperar un momento y verificar de nuevo
            setTimeout(() => {
                if (typeof L !== 'undefined') {
                    resolve();
                } else {
                    reject(new Error('Leaflet no se cargó correctamente'));
                }
            }, 2000);
            return;
        }
        
        let cssLoaded = false;
        let jsLoaded = false;
        let cssError = false;
        let jsError = false;
        
        function checkComplete() {
            if ((cssLoaded || cssError) && (jsLoaded || jsError)) {
                if (cssError && jsError) {
                    reject(new Error('Error cargando CSS y JS de Leaflet'));
                } else if (jsError) {
                    reject(new Error('Error cargando JavaScript de Leaflet'));
                } else if (typeof L !== 'undefined') {
                    resolve();
                } else {
                    reject(new Error('Leaflet no está disponible después de cargar'));
                }
            }
        }
        
        // Cargar CSS de Leaflet
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        cssLink.crossOrigin = '';
        
        cssLink.onload = function() {
            
            cssLoaded = true;
            checkComplete();
        };
        
        cssLink.onerror = function() {
            console.error('Error cargando CSS de Leaflet');
            cssError = true;
            checkComplete();
        };
        
        // Cargar JavaScript de Leaflet
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        
        script.onload = function() {
            
            jsLoaded = true;
            // Pequeña espera para asegurar que L esté disponible
            setTimeout(() => {
                checkComplete();
            }, 100);
        };
        
        script.onerror = function() {
            console.error('Error cargando JavaScript de Leaflet');
            jsError = true;
            checkComplete();
        };
        
        // Añadir al DOM
        document.head.appendChild(cssLink);
        document.head.appendChild(script);
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!cssLoaded && !cssError) {
                console.warn('Timeout cargando CSS de Leaflet');
                cssError = true;
                checkComplete();
            }
            if (!jsLoaded && !jsError) {
                console.warn('Timeout cargando JavaScript de Leaflet');
                jsError = true;
                checkComplete();
            }
        }, 10000); // 10 segundos de timeout
    });
}

/**
 * DIAGNÓSTICO DEL MODAL - Para uso en consola del navegador
 * Ejecute "window.nmModalDiagnostic()" en la consola para obtener información del estado
 */
window.nmModalDiagnostic = function() {
    
    
    if (typeof nm_ajax !== 'undefined') {
        
    }
    
    if (modalMap) {
        
    } else {
        
    }
    
    // Verificar si hay errores en la consola
    
};

/**
 * FUNCIÓN DE PRUEBA - Cargar Leaflet manualmente
 */
window.nmTestLeaflet = function() {
    
    loadLeaflet()
        .then(() => {
            
        })
        .catch(error => {
            console.error('❌ Error cargando Leaflet:', error);
        });
};

/**
 * FUNCIÓN DE PRUEBA - Abrir modal con datos de prueba
 */
window.nmTestModal = function(entryIndex = 0) {
    
    
    if (!document.getElementById('nm-entries-modal')) {
        console.error('❌ Modal no encontrado en el DOM');
        return;
    }
    
    const cards = document.querySelectorAll('.nm-entry-card');
    if (cards.length === 0) {
        console.error('❌ No se encontraron tarjetas de entrada');
        return;
    }
    
    if (entryIndex >= cards.length) {
        console.warn('⚠️ Índice fuera de rango, usando el primer elemento');
        entryIndex = 0;
    }
    
    openEntryModal(entryIndex);
};

/**
 * FUNCIÓN DE UTILIDAD - Información del entorno
 */
window.nmEnvironmentInfo = function() {
    
};

 
