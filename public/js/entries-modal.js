/**
 * JavaScript para el modal de detalles de entradas de NexusMap
 */

document.addEventListener('DOMContentLoaded', function() {
    // Crear el HTML del modal y añadirlo al DOM
    createModalHTML();
    
    // Añadir event listeners a las tarjetas
    attachCardListeners();
});

/**
 * Crear la estructura HTML del modal
 */
function createModalHTML() {
    const modalHTML = `
        <div id="nm-entries-modal" class="nm-entry-modal">
            <div class="nm-modal-content">
                <div class="nm-modal-header">
                    <button class="nm-modal-close" onclick="closeEntryModal()">&times;</button>
                    <h2 class="nm-modal-title" id="nm-modal-title">Cargando...</h2>
                </div>
                <div class="nm-modal-body" id="nm-modal-body">
                    <div class="nm-modal-loading">
                        Cargando información...
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
    const modalTitle = document.getElementById('nm-modal-title');
    const modalBody = document.getElementById('nm-modal-body');
    
    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Evitar scroll del body
    
    // Resetear contenido
    modalTitle.textContent = 'Cargando...';
    modalBody.innerHTML = '<div class="nm-modal-loading">Cargando información...</div>';
    
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
    })    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayEntryDetails(data.data);
        } else {
            showModalError('Error al cargar los detalles: ' + (data.data || 'Error desconocido'));
        }
    })
    .catch(error => {
        showModalError('Error de conexión al cargar los detalles');
    });
}

/**
 * Mostrar los detalles de la entrada en el modal
 */
function displayEntryDetails(entryData) {
    const modalTitle = document.getElementById('nm-modal-title');
    const modalBody = document.getElementById('nm-modal-body');
    
    // Actualizar título
    modalTitle.textContent = entryData.title || 'Sin título';
    
    // Construir el contenido del modal
    let content = '';
    
    // Imagen
    if (entryData.image) {
        content += `
            <div class="nm-modal-image">
                <img src="${entryData.image}" alt="${entryData.title || 'Imagen'}" />
            </div>
        `;
    } else {
        content += `
            <div class="nm-modal-image no-image">
                📷
            </div>
        `;
    }
    
    content += '<div class="nm-modal-details">';
    
    // Descripción/contenido principal
    if (entryData.description) {
        content += `
            <div class="nm-modal-section">
                <h3>Descripción</h3>
                <p>${entryData.description}</p>
            </div>
        `;
    }
    
    // Audio
    if (entryData.audio) {
        content += `
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
        content += `
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
    
    // Información adicional
    const additionalInfo = [];
    
    if (entryData.date) {
        additionalInfo.push(`<strong>Fecha:</strong> ${entryData.date}`);
    }
    
    if (entryData.location) {
        additionalInfo.push(`<strong>Ubicación:</strong> ${entryData.location}`);
    }
    
    // Añadir todos los campos personalizados
    if (entryData.custom_fields && Object.keys(entryData.custom_fields).length > 0) {
        content += '<div class="nm-modal-section"><h3>Información Adicional</h3>';
        
        for (const [key, value] of Object.entries(entryData.custom_fields)) {
            if (value && value !== '') {
                const fieldLabel = key.replace(/^nm_/, '').replace(/_/g, ' ');
                content += `<p><strong>${capitalizeFirst(fieldLabel)}:</strong> ${value}</p>`;
            }
        }
        
        content += '</div>';
    }
    
    if (additionalInfo.length > 0) {
        content += `
            <div class="nm-modal-section">
                <h3>Detalles</h3>
                ${additionalInfo.map(info => `<p>${info}</p>`).join('')}
            </div>
        `;
    }
    
    content += '</div>'; // Cerrar nm-modal-details
    
    modalBody.innerHTML = content;
}

/**
 * Mostrar un error en el modal
 */
function showModalError(message) {
    const modalTitle = document.getElementById('nm-modal-title');
    const modalBody = document.getElementById('nm-modal-body');
    
    modalTitle.textContent = 'Error';
    modalBody.innerHTML = `
        <div class="nm-modal-details">
            <div class="nm-modal-section">
                <p style="color: #d63384; text-align: center;">
                    ❌ ${message}
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
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restaurar scroll del body
}

/**
 * Capitalizar la primera letra de una cadena
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Hacer la función disponible globalmente
window.closeEntryModal = closeEntryModal;
