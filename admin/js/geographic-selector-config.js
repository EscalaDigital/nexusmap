/**
 * Geographic Selector Configuration JavaScript - Dynamic Structure Discovery
 */
(function($) {
    'use strict';

    // Cache para estructuras de países descubiertas dinámicamente
    let countryStructureCache = {};
    let currentField = null;

    $(document).ready(function() {
        initializeGeographicSelector();
        setupEventHandlers();
    });function initializeGeographicSelector() {
        // Initialize existing fields
        $('.nm-geographic-field').each(function() {
            initializeExistingField($(this));
        });
    }function setupEventHandlers() {
        // Configure button click
        $(document).on('click', '.nm-configure-geo-btn', function(e) {
            e.preventDefault();
            currentField = $(this).closest('.nm-geographic-field');
            openConfigPanel(currentField);
        });

        // Remove field button
        $(document).on('click', '.nm-remove-field-btn', function(e) {
            e.preventDefault();
            if (confirm('¿Está seguro de que desea eliminar este campo?')) {
                $(this).closest('.nm-geographic-field').remove();
            }
        });

        // Validate GeoNames user button
        $(document).on('click', '.nm-validate-user-btn', function(e) {
            e.preventDefault();
            const $button = $(this);
            const $input = $button.siblings('.nm-geonames-user');
            const username = $input.val().trim();
            
            if (!username) {
                showUserValidationMessage($button.closest('.nm-config-row'), 'Por favor, ingrese un nombre de usuario', 'error');
                return;
            }
            
            validateGeonamesUser(username, $button.closest('.nm-config-row'));
        });        // Country selector change
        $(document).on('change', '.nm-country-selector', function() {
            const country = $(this).val();
            const panel = $(this).closest('.nm-geo-config-panel');
            const username = panel.find('.nm-geonames-user').val().trim();
            
            if (country && username) {
                discoverCountryStructure(country, username, panel);
            } else {
                panel.find('.nm-levels-config').hide();
                showStructureMessage(panel, 'Selecciona un país y valida el usuario GeoNames para explorar su estructura administrativa.', 'info');
            }
        });

        // Save configuration
        $(document).on('click', '.nm-save-geo-config', function(e) {
            e.preventDefault();
            saveConfiguration();
        });

        // Cancel configuration
        $(document).on('click', '.nm-cancel-geo-config', function(e) {
            e.preventDefault();
            closeConfigPanel();
        });

        // Handle drag and drop of new geographic fields
        if (typeof window.nmFormBuilder !== 'undefined') {
            $(document).on('drop', '.nm-form-droppable', function(e) {
                const fieldType = e.originalEvent.dataTransfer.getData('text/plain');
                if (fieldType === 'geographic-selector') {
                    setTimeout(() => {
                        const newField = $(this).find('.nm-geographic-field').last();
                        if (newField.length) {
                            initializeNewField(newField);
                        }
                    }, 100);
                }
            });
        }    }

    function validateGeonamesUser(username, $configRow) {
        const $button = $configRow.find('.nm-validate-user-btn');
        const originalText = $button.text();
        
        // Update button state
        $button.prop('disabled', true).text('Validando...');
        hideUserValidationMessage($configRow);        // Test with a simple API call through proxy
        callGeonamesProxy('countryInfoJSON', { username: username })
            .done(function(response) {
                $button.prop('disabled', false).text(originalText);
                
                if (response.success && response.data && response.data.geonames && response.data.geonames.length > 0) {
                    showUserValidationMessage($configRow, '✓ Usuario válido. Cargando países...', 'success');
                    loadCountriesFromGeonames(username, $configRow);
                } else {
                    showUserValidationMessage($configRow, 'Usuario válido pero sin datos de países', 'error');
                }
            })
            .fail(function(xhr, status, error) {
                $button.prop('disabled', false).text(originalText);
                
                let errorMessage = 'Error al validar usuario';
                if (status === 'timeout') {
                    errorMessage = 'Tiempo de espera agotado';
                } else if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.geonames_error) {
                    const geonamesError = xhr.responseJSON.data.geonames_error;
                    if (geonamesError.includes('user account not found')) {
                        errorMessage = 'Usuario no encontrado. Verifica que el usuario esté registrado en GeoNames.org';
                    } else if (geonamesError.includes('daily limit')) {
                        errorMessage = 'Límite diario de consultas alcanzado. Intenta mañana';
                    }
                } else if (xhr.status === 429) {
                    errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos';
                }
                
                showUserValidationMessage($configRow, errorMessage, 'error');
                console.error('GeoNames validation error:', error, xhr.responseJSON);
            });
    }

    function loadCountriesFromGeonames(username, $configRow) {
        const $panel = $configRow.closest('.nm-geo-config-panel');
        const $countryRow = $panel.find('.nm-country-row');
        const $countrySelect = $countryRow.find('.nm-country-selector');
        const $loading = $countryRow.find('.nm-country-loading');
        
        // Show country section and loading
        $countryRow.show();
        $loading.show();
        $countrySelect.prop('disabled', true);        callGeonamesProxy('countryInfoJSON', { username: username }, 15000)
            .done(function(response) {
                $loading.hide();
                
                if (response.success && response.data && response.data.geonames && response.data.geonames.length > 0) {
                    // Sort countries alphabetically
                    const countries = response.data.geonames.sort((a, b) => a.countryName.localeCompare(b.countryName));
                    
                    // Populate country selector
                    $countrySelect.empty().append('<option value="">Seleccionar país...</option>');
                    
                    countries.forEach(country => {
                        $countrySelect.append(`<option value="${country.countryCode}">${country.countryName}</option>`);
                    });
                    
                    $countrySelect.prop('disabled', false);
                    showUserValidationMessage($configRow, `✓ ${countries.length} países cargados correctamente`, 'success');
                } else {
                    showUserValidationMessage($configRow, 'No se pudieron cargar los países', 'error');
                    $countrySelect.prop('disabled', true);
                }
            })
            .fail(function(xhr, status, error) {
                $loading.hide();
                $countrySelect.prop('disabled', true);
                
                let errorMessage = 'Error al cargar países';
                if (status === 'timeout') {
                    errorMessage = 'Tiempo de espera agotado al cargar países';
                }
                
                showUserValidationMessage($configRow, errorMessage, 'error');
                console.error('Error loading countries from GeoNames:', error);
            });
    }

    function showUserValidationMessage($configRow, message, type) {
        const $messageDiv = $configRow.find('.nm-user-validation-message');
        $messageDiv.removeClass('success error').addClass(type).text(message).show();
    }    function hideUserValidationMessage($configRow) {
        $configRow.find('.nm-user-validation-message').hide();
    }

    /**
     * Discover country administrative structure dynamically from GeoNames
     */
    function discoverCountryStructure(countryCode, username, panel) {
        console.log(`🔍 Discovering structure for country: ${countryCode}`);
        
        const $levelsConfig = panel.find('.nm-levels-config');
        const $levelsList = panel.find('.nm-levels-list');
        
        // Show loading state
        $levelsConfig.show();
        $levelsList.html('<div class="nm-loading-structure">🌍 Explorando estructura administrativa del país...</div>');
        
        // Check cache first
        const cacheKey = `${countryCode}_${username}`;
        if (countryStructureCache[cacheKey]) {
            console.log('📋 Using cached structure for', countryCode);
            displayDiscoveredStructure(countryStructureCache[cacheKey], $levelsList);
            return;
        }
        
        // Get country GeoName ID and start discovery
        const countryGeoId = getCountryGeonameId(countryCode);
        if (!countryGeoId) {
            showStructureMessage(panel, `❌ No se encontró el país ${countryCode} en la base de datos. Verifica el código del país.`, 'error');
            return;
        }
        
        exploreAdministrativeStructure(countryGeoId, countryCode, username, $levelsList, panel);
    }

    /**
     * Recursively explore administrative structure
     */
    function exploreAdministrativeStructure(geonameId, countryCode, username, $levelsList, panel) {
        console.log(`🔍 Exploring administrative structure for GeoName ID: ${geonameId}`);
        
        const structure = {
            country: countryCode,
            levels: []
        };
        
        // Start with admin1 level
        exploreLevel(geonameId, 'admin1', 1, username, structure, $levelsList, panel);
    }

    /**
     * Explore a specific administrative level
     */
    function exploreLevel(parentGeoId, levelCode, levelNumber, username, structure, $levelsList, panel) {
        console.log(`🔍 Exploring level ${levelNumber} (${levelCode}) under parent ${parentGeoId}`);
        
        // Update loading message
        $levelsList.html(`<div class="nm-loading-structure">🌍 Explorando nivel ${levelNumber} (${levelCode})...</div>`);
        
        callGeonamesProxy('childrenJSON', { 
            username: username, 
            geonameId: parentGeoId,
            featureClass: 'A'
        })
        .done(function(response) {
            if (response.success && response.data && response.data.geonames && response.data.geonames.length > 0) {
                // Filter administrative divisions for this level
                let levelData = response.data.geonames.filter(item => {
                    const fcode = item.fcode;
                    if (levelCode === 'admin1') return fcode === 'ADM1' || fcode === 'ADMD';
                    if (levelCode === 'admin2') return fcode === 'ADM2' || fcode === 'ADMD';
                    if (levelCode === 'admin3') return fcode === 'ADM3' || fcode === 'ADMD';
                    if (levelCode === 'admin4') return fcode === 'ADM4' || fcode === 'ADMD';
                    return false;
                });
                
                if (levelData.length > 0) {
                    // Sort alphabetically
                    levelData.sort((a, b) => a.name.localeCompare(b.name));
                    
                    // Get a sample name for display
                    const sampleName = levelData[0].name;
                    
                    structure.levels.push({
                        code: levelCode,
                        number: levelNumber,
                        name: `Nivel ${levelNumber}`,
                        default_label: `Nivel ${levelNumber}`,
                        sample: sampleName,
                        count: levelData.length,
                        enabled: true
                    });
                    
                    console.log(`✅ Found ${levelData.length} items for ${levelCode}. Sample: ${sampleName}`);
                    
                    // Try to explore next level using first item
                    const nextLevelCode = getNextLevelCode(levelCode);
                    if (nextLevelCode && levelNumber < 4) {
                        exploreLevel(levelData[0].geonameId, nextLevelCode, levelNumber + 1, username, structure, $levelsList, panel);
                    } else {
                        // Finished exploring, display structure
                        finishStructureDiscovery(structure, $levelsList, panel);
                    }
                } else {
                    console.log(`❌ No administrative divisions found for ${levelCode}`);
                    // Finished exploring, display structure
                    finishStructureDiscovery(structure, $levelsList, panel);
                }
            } else {
                console.log(`❌ No data returned for ${levelCode}`);
                // Finished exploring, display structure
                finishStructureDiscovery(structure, $levelsList, panel);
            }
        })
        .fail(function(xhr, status, error) {
            console.error(`❌ Error exploring ${levelCode}:`, error);
            if (structure.levels.length === 0) {
                showStructureMessage(panel, '❌ No se pudo explorar la estructura administrativa de este país. Verifica tu conexión y usuario GeoNames.', 'error');
            } else {
                // Finish with what we have
                finishStructureDiscovery(structure, $levelsList, panel);
            }
        });
    }

    /**
     * Get next administrative level code
     */
    function getNextLevelCode(currentLevel) {
        const levelMap = {
            'admin1': 'admin2',
            'admin2': 'admin3', 
            'admin3': 'admin4',
            'admin4': null
        };
        return levelMap[currentLevel];
    }

    /**
     * Finish structure discovery and display results
     */
    function finishStructureDiscovery(structure, $levelsList, panel) {
        console.log('🎯 Structure discovery completed:', structure);
        
        // Cache the structure
        const countryCode = structure.country;
        const username = panel.find('.nm-geonames-user').val().trim();
        const cacheKey = `${countryCode}_${username}`;
        countryStructureCache[cacheKey] = structure;
        
        // Display the discovered structure
        displayDiscoveredStructure(structure, $levelsList);
    }

    /**
     * Display discovered administrative structure
     */
    function displayDiscoveredStructure(structure, $levelsList) {
        console.log('📋 Displaying discovered structure:', structure);
        
        $levelsList.empty();
        
        if (structure.levels.length === 0) {
            $levelsList.html(`
                <div class="nm-structure-info">
                    <p>❌ No se encontró estructura administrativa para este país.</p>
                    <p>💡 El país puede no tener divisiones administrativas en GeoNames o usar un sistema diferente.</p>
                </div>
            `);
            return;
        }
        
        structure.levels.forEach(levelInfo => {
            const levelDiv = $(`
                <div class="nm-level-config">
                    <input type="checkbox" class="nm-level-enabled" value="${levelInfo.code}" ${levelInfo.enabled ? 'checked' : ''}>
                    <span class="nm-level-info">
                        <strong>${levelInfo.name}</strong>
                        <small>Ejemplo: ${levelInfo.sample} (${levelInfo.count} encontrados)</small>
                    </span>
                    <input type="text" class="nm-level-label" data-level="${levelInfo.code}" 
                           value="${levelInfo.default_label}" placeholder="Nombre personalizado">
                </div>
            `);
            $levelsList.append(levelDiv);
        });
        
        // Add info message
        $levelsList.append(`
            <div class="nm-structure-info">
                <small>🔍 Estructura descubierta dinámicamente desde GeoNames. 
                Puedes personalizar los nombres y activar/desactivar niveles según necesites.</small>
            </div>
        `);
    }

    /**
     * Show structure message
     */
    function showStructureMessage(panel, message, type) {
        const $levelsList = panel.find('.nm-levels-list');
        const cssClass = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
        $levelsList.html(`
            <div class="nm-structure-message nm-structure-${cssClass}">
                <p>${message}</p>
            </div>
        `);    }

    function displayGenericStructureWithMessage($levelsList, countryCode, errorMessage) {
        $levelsList.empty();
        
        // Show error message
        $levelsList.append(`
            <div class="nm-geonames-error" style="background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                <strong>⚠️ ${errorMessage}</strong><br>
                <small>Usando estructura genérica como alternativa</small>
            </div>
        `);
        
        // Use generic structure only
        const config = {
            name: 'Estructura Genérica',
            levels: [
                { code: 'admin1', name: 'Primer Nivel Administrativo', default_label: 'Región/Estado' },
                { code: 'admin2', name: 'Segundo Nivel Administrativo', default_label: 'Provincia/Condado' },
                { code: 'admin3', name: 'Tercer Nivel Administrativo', default_label: 'Municipio/Ciudad' },
                { code: 'admin4', name: 'Cuarto Nivel Administrativo', default_label: 'Distrito/Barrio' }
            ]
        };
        
        $levelsList.append('<h6>📋 Estructura genérica (fallback):</h6>');
        
        config.levels.forEach((level, index) => {
            const isChecked = index < 2;
            const levelDiv = $(`
                <div class="nm-level-config">
                    <input type="checkbox" class="nm-level-enabled" value="${level.code}" ${isChecked ? 'checked' : ''}>
                    <span>${level.name}:</span>
                    <input type="text" class="nm-level-label" data-level="${level.code}" 
                           value="${level.default_label}" placeholder="Nombre personalizado">
                </div>
            `);
            $levelsList.append(levelDiv);
        });
        
        $levelsList.append(`
            <div class="nm-structure-info">
                <small>ℹ️ No se pudo obtener la estructura administrativa desde GeoNames. 
                Usando estructura genérica que funciona para la mayoría de países.</small>
            </div>
        `);
    }

    function determineAdministrativeLevelName(countryCode, level, sampleNames) {
        // Default names based on country and level
        const countryDefaults = {
            'ES': {
                'admin1': 'Comunidad Autónoma',
                'admin2': 'Provincia', 
                'admin3': 'Municipio',
                'admin4': 'Distrito'
            },
            'FR': {
                'admin1': 'Región',
                'admin2': 'Departamento',
                'admin3': 'Comuna',
                'admin4': 'Barrio'
            },
            'US': {
                'admin1': 'Estado',
                'admin2': 'Condado',
                'admin3': 'Ciudad',
                'admin4': 'Distrito'
            },
            'MX': {
                'admin1': 'Estado',
                'admin2': 'Municipio',
                'admin3': 'Localidad',
                'admin4': 'Colonia'
            },
            'BR': {
                'admin1': 'Estado',
                'admin2': 'Mesorregión',
                'admin3': 'Municipio',
                'admin4': 'Distrito'
            }
        };
        
        if (countryDefaults[countryCode] && countryDefaults[countryCode][level]) {
            return countryDefaults[countryCode][level];
        }
        
        // Generic fallback
        const genericNames = {
            'admin1': 'Primer Nivel Administrativo',
            'admin2': 'Segundo Nivel Administrativo', 
            'admin3': 'Tercer Nivel Administrativo',
            'admin4': 'Cuarto Nivel Administrativo'
        };
        
        return genericNames[level] || level;
    }    function displayAdministrativeStructure(structureData, $levelsList, countryCode) {
        $levelsList.empty();
        
        if (structureData.length === 0) {
            displayGenericStructureWithMessage($levelsList, countryCode, 'No se encontraron datos administrativos válidos');
            return;
        }
        
        $levelsList.append('<h6>📊 Estructura administrativa detectada:</h6>');
        
        structureData.forEach((levelInfo, index) => {
            const isChecked = index < 2; // Check first 2 levels by default
            const samplesText = levelInfo.samples.length > 0 ? 
                ` (ej: ${levelInfo.samples.slice(0, 2).join(', ')})` : '';
            
            const levelDiv = $(`
                <div class="nm-level-config nm-detected-level">
                    <input type="checkbox" class="nm-level-enabled" value="${levelInfo.code}" ${isChecked ? 'checked' : ''}>
                    <span class="nm-level-info">
                        <strong>${levelInfo.name}</strong> 
                        <small>(${levelInfo.count} encontrados${samplesText})</small>
                    </span>
                    <input type="text" class="nm-level-label" data-level="${levelInfo.code}" 
                           value="${levelInfo.name}" placeholder="Nombre personalizado">
                </div>
            `);
            $levelsList.append(levelDiv);
        });
        
        // Add info message
        $levelsList.append(`
            <div class="nm-structure-info">
                <small>💡 Estructura cargada automáticamente desde GeoNames. 
                Puedes personalizar los nombres y activar/desactivar niveles según necesites.</small>
            </div>
        `);    }

    function getCountryGeonameId(countryCode) {
        // Common country GeoName IDs
        const countryIds = {
            'ES': '2510769', // Spain
            'FR': '3017382', // France  
            'US': '6252001', // United States
            'MX': '3996063', // Mexico
            'IT': '3175395', // Italy
            'DE': '2921044', // Germany
            'PT': '2264397', // Portugal
            'GB': '2635167', // United Kingdom
            'AR': '3865483', // Argentina
            'BR': '3469034', // Brazil
            'CO': '3686110', // Colombia
            'PE': '3932488', // Peru
            'CL': '3895114', // Chile
            'CA': '6251999', // Canada
            'AU': '2077456', // Australia
            'IN': '1269750', // India
            'CN': '1814991', // China
            'JP': '1861060', // Japan
            'RU': '2017370'  // Russia
        };
        
        return countryIds[countryCode] || countryCode;
    }

    function initializeExistingField($field) {
        const config = getFieldConfig($field);
        if (config && config.config) {
            updatePreview($field, config.config);
        }
    }

    function initializeNewField($field) {
        // Auto-open configuration for new fields
        currentField = $field;
        openConfigPanel($field);
    }

    function openConfigPanel($field) {
        // Close any other open panels
        $('.nm-geo-config-panel').hide();
        
        // Show this panel
        const panel = $field.find('.nm-geo-config-panel');
        panel.show();

        // Load current configuration
        const config = getFieldConfig($field);
        if (config && config.config) {
            loadConfigIntoPanel(panel, config.config);
        }
    }

    function closeConfigPanel() {
        $('.nm-geo-config-panel').hide();
        currentField = null;    }    function loadConfigIntoPanel(panel, config) {
        const $geonamesInput = panel.find('.nm-geonames-user');
        const $countryRow = panel.find('.nm-country-row');
        const $countrySelect = panel.find('.nm-country-selector');
        
        // Load GeoNames user from wp_option (global setting)
        const globalGeonamesUser = nmAdmin.geonames_user || '';
        $geonamesInput.val(globalGeonamesUser);
        
        // If user exists and country is configured, show country section
        if (globalGeonamesUser && config.country) {
            $countryRow.show();
            $countrySelect.prop('disabled', false);
            
            // Load countries and set selected country
            loadCountriesFromGeonames(globalGeonamesUser, panel.find('.nm-config-row').first());
            
            setTimeout(() => {
                $countrySelect.val(config.country || '').trigger('change');
            }, 1000);
        } else {
            $countryRow.hide();
            $countrySelect.prop('disabled', true);
        }
        
        setTimeout(() => {
            // Load level configurations
            if (config.levels && config.field_names) {
                panel.find('.nm-level-enabled').each(function() {
                    const levelCode = $(this).val();
                    const isEnabled = config.levels.includes(levelCode);
                    $(this).prop('checked', isEnabled);
                });

                panel.find('.nm-level-label').each(function() {
                    const levelCode = $(this).data('level');
                    const customName = config.field_names[levelCode];
                    if (customName) {
                        $(this).val(customName);
                    }
                });
            }
        }, 1200);
    }

    function saveConfiguration() {
        if (!currentField) return;

        const panel = currentField.find('.nm-geo-config-panel');
        const geonamesUser = panel.find('.nm-geonames-user').val().trim();
        const country = panel.find('.nm-country-selector').val();

        // Validation
        if (!geonamesUser) {
            alert('Por favor, ingrese su usuario de GeoNames');
            return;
        }

        if (!country) {
            alert('Por favor, seleccione un país');
            return;
        }

        // Collect enabled levels and their custom names
        const levels = [];
        const fieldNames = {};

        panel.find('.nm-level-enabled:checked').each(function() {
            const levelCode = $(this).val();
            const customLabel = panel.find(`.nm-level-label[data-level="${levelCode}"]`).val().trim();
            
            levels.push(levelCode);
            if (customLabel) {
                fieldNames[levelCode] = customLabel;
            }
        });

        if (levels.length === 0) {
            alert('Por favor, seleccione al menos un nivel administrativo');
            return;
        }        // Save configuration
        const fieldLabel = currentField.find('.field-label').val() || 'Selector Geográfico';
        const fieldName = currentField.find('.field-name').val() || fieldLabel.toLowerCase().replace(/\s+/g, '_');
        
        const config = {
            type: 'geographic-selector',
            id: currentField.data('field-id') || generateFieldId(),
            name: fieldName,
            label: fieldLabel,
            config: {
                country: country,
                levels: levels,
                field_names: fieldNames
            }
        };

        // Update hidden field
        currentField.find('.nm-field-config').val(JSON.stringify(config));

        // Update preview
        updatePreview(currentField, config.config);

        // Save GeoNames user globally
        saveGeonamesUser(geonamesUser);

        // Close panel
        closeConfigPanel();

        alert('Configuración guardada correctamente');
    }

    function updatePreview($field, config) {
        const preview = $field.find('.nm-geo-preview');
        preview.empty();

        if (config.levels && config.levels.length > 0) {
            config.levels.forEach(level => {
                const fieldName = config.field_names[level] || level;
                const levelDiv = $(`
                    <div class="nm-geo-level">
                        <label>${fieldName}:</label>
                        <select disabled>
                            <option>Seleccionar ${fieldName.toLowerCase()}...</option>
                        </select>
                    </div>
                `);
                preview.append(levelDiv);
            });
        } else {
            preview.html('<p class="nm-geo-placeholder">Configure el selector geográfico para ver la vista previa</p>');
        }
    }

    function getFieldConfig($field) {
        const configJson = $field.find('.nm-field-config').val();
        try {
            return configJson ? JSON.parse(configJson) : null;
        } catch (e) {
            console.error('Error parsing field config:', e);
            return null;
        }
    }

    function generateFieldId() {
        return 'geo_' + Math.random().toString(36).substr(2, 9);
    }    function saveGeonamesUser(username) {
        // Save globally via AJAX
        $.post(nmAdmin.ajax_url, {
            action: 'nm_save_geonames_user',
            username: username,
            nonce: nmAdmin.nonce
        });
    }

    /**
     * Función auxiliar para llamadas a GeoNames a través del proxy
     * Soluciona el problema de Mixed Content HTTPS/HTTP
     */
    function callGeonamesProxy(endpoint, params, timeout = 10000) {
        const proxyParams = {
            action: 'nm_geonames_proxy',
            nonce: nmAdmin.nonce,
            endpoint: endpoint,
            ...params
        };

        return $.ajax({
            url: nmAdmin.ajax_url,
            method: 'GET',
            data: proxyParams,
            timeout: timeout,
            dataType: 'json'
        });
    }

    // Export functions for external use
    window.nmGeographicSelector = {
        initializeField: initializeExistingField,
        openConfig: openConfigPanel
    };

})(jQuery);
