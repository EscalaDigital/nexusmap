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
            const $panel = $button.closest('.nm-geo-config-panel');
            const username = $input.val().trim();
            const language = $panel.find('.nm-language-selector').val() || 'es';
            
            if (!username) {
                showUserValidationMessage($button.closest('.nm-config-row'), 'Por favor, ingrese un nombre de usuario', 'error');
                return;
            }
            
            validateGeonamesUser(username, language, $button.closest('.nm-config-row'));
        });        // Language selector change - reload countries if user is validated
        $(document).on('change', '.nm-language-selector', function() {
            const $panel = $(this).closest('.nm-geo-config-panel');
            const username = $panel.find('.nm-geonames-user').val().trim();
            const language = $(this).val();
            const $countryRow = $panel.find('.nm-country-row');
            
            // If user is already validated and countries are loaded, reload them in new language
            if (username && $countryRow.is(':visible')) {
                loadCountriesFromGeonames(username, language, $panel.find('.nm-config-row').first());
            }
        });

        // Country selector change
        $(document).on('change', '.nm-country-selector', function() {
            const country = $(this).val();
            const panel = $(this).closest('.nm-geo-config-panel');
            const username = panel.find('.nm-geonames-user').val().trim();
            const language = panel.find('.nm-language-selector').val() || 'es';
            
            if (country && username) {
                discoverCountryStructure(country, username, language, panel);
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

            // Toggle de nivel para mostrar u ocultar selector de valor fijo
            $(document).on('change', '.nm-level-enabled', function() {
                const $levelConfig = $(this).closest('.nm-level-config');
                const level = $(this).val();
                const $fixedWrapper = $levelConfig.find('.nm-fixed-parent');
                if ($(this).is(':checked')) {
                    $fixedWrapper.hide();
                } else {
                    $fixedWrapper.show();
                    // Intentar precargar valores si aún no se han cargado
                    const $select = $fixedWrapper.find('.nm-fixed-value-select');
                    if ($select.children('option').length <= 1) {
                        loadFixedLevelValues($levelConfig.closest('.nm-geo-config-panel'), level, $select);
                    }
                }
            });

            // Botón para cargar valores fijos manualmente
            $(document).on('click', '.nm-load-fixed-values', function(e) {
                e.preventDefault();
                const level = $(this).data('level');
                const $panel = $(this).closest('.nm-geo-config-panel');
                const $select = $panel.find(`.nm-fixed-value-select[data-level="${level}"]`);
                loadFixedLevelValues($panel, level, $select, true);
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

    // Carga valores posibles para un nivel desactivado (valor fijo)
    function loadFixedLevelValues($panel, level, $select, force = false) {
        const country = $panel.find('.nm-country-selector').val();
        const username = $panel.find('.nm-geonames-user').val().trim();
        const language = $panel.find('.nm-language-selector').val() || 'es';
        if (!country || !username) return;

        // geonameId base del país
        const parentCountryId = getCountryGeonameId(country);
        let parentIdForCall = parentCountryId;
        const targetLevelCode = level;

        if (targetLevelCode !== 'admin1') {
            // Necesitamos un geonameId del nivel inmediatamente superior (admin1 fijo)
            const admin1FixedSelect = $panel.find('.nm-fixed-value-select[data-level="admin1"]');
            const admin1FixedOption = admin1FixedSelect.find('option:selected');
            if (admin1FixedOption.length && admin1FixedOption.data('geoname-id')) {
                parentIdForCall = admin1FixedOption.data('geoname-id');
            } else {
                // No se puede determinar padre: intentar cargar primero admin1
                if (level !== 'admin1') {
                    // Cargar admin1 primero
                    parentIdForCall = parentCountryId;
                }
            }
        }

        $select.prop('disabled', true).html('<option value="">Cargando...</option>');
        callGeonamesProxy('childrenJSON', { username: username, geonameId: parentIdForCall, featureClass: 'A', lang: language })
            .done(function(response) {
                if (response.success && response.data && response.data.geonames) {
                    const items = response.data.geonames.filter(item => {
                        const fcode = item.fcode;
                        if (targetLevelCode === 'admin1') return fcode === 'ADM1' || fcode === 'ADMD';
                        if (targetLevelCode === 'admin2') return fcode === 'ADM2' || fcode === 'ADMD';
                        if (targetLevelCode === 'admin3') return fcode === 'ADM3' || fcode === 'ADMD';
                        if (targetLevelCode === 'admin4') return fcode === 'ADM4' || fcode === 'ADMD';
                        return false;
                    }).sort((a,b)=> a.name.localeCompare(b.name));
                    $select.empty().append('<option value="">-- Valor fijo --</option>');
                    items.forEach(it => {
                        $select.append(`<option value="${it.name}" data-geoname-id="${it.geonameId}">${it.name}</option>`);
                    });
                    $select.prop('disabled', false);
                } else {
                    $select.html('<option value="">(Sin datos)</option>');
                }
            })
            .fail(function() {
                $select.html('<option value="">(Error)</option>');
            });
    }

    function validateGeonamesUser(username, language, $configRow) {
        const $button = $configRow.find('.nm-validate-user-btn');
        const originalText = $button.text();
        
        // Update button state
        $button.prop('disabled', true).text('Validando...');
        hideUserValidationMessage($configRow);        // Test with a simple API call through proxy
        callGeonamesProxy('countryInfoJSON', { username: username, lang: language })
            .done(function(response) {
                $button.prop('disabled', false).text(originalText);
                
                if (response.success && response.data && response.data.geonames && response.data.geonames.length > 0) {
                    showUserValidationMessage($configRow, '✓ Usuario válido. Cargando países...', 'success');
                    loadCountriesFromGeonames(username, language, $configRow);
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

    function loadCountriesFromGeonames(username, language, $configRow) {
        const $panel = $configRow.closest('.nm-geo-config-panel');
        const $countryRow = $panel.find('.nm-country-row');
        const $countrySelect = $countryRow.find('.nm-country-selector');
        const $loading = $countryRow.find('.nm-country-loading');
        
        // Show country section and loading
        $countryRow.show();
        $loading.show();
        $countrySelect.prop('disabled', true);        callGeonamesProxy('countryInfoJSON', { username: username, lang: language }, 15000)
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
    function discoverCountryStructure(countryCode, username, language, panel) {
        console.log(`🔍 Discovering structure for country: ${countryCode} in language: ${language}`);
        
        const $levelsConfig = panel.find('.nm-levels-config');
        const $levelsList = panel.find('.nm-levels-list');
        
        // Show loading state
        $levelsConfig.show();
        $levelsList.html('<div class="nm-loading-structure">🌍 Explorando estructura administrativa del país...</div>');
        
        // Check cache first
        const cacheKey = `${countryCode}_${username}_${language}`;
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
        
        exploreAdministrativeStructure(countryGeoId, countryCode, username, language, $levelsList, panel);
    }

    /**
     * Recursively explore administrative structure
     */
    function exploreAdministrativeStructure(geonameId, countryCode, username, language, $levelsList, panel) {
        console.log(`🔍 Exploring administrative structure for GeoName ID: ${geonameId}`);
        
        const structure = {
            country: countryCode,
            language: language,
            levels: []
        };
        
        // Start with admin1 level
        exploreLevel(geonameId, 'admin1', 1, username, language, structure, $levelsList, panel);
    }

    /**
     * Explore a specific administrative level
     */
    function exploreLevel(parentGeoId, levelCode, levelNumber, username, language, structure, $levelsList, panel) {
        console.log(`🔍 Exploring level ${levelNumber} (${levelCode}) under parent ${parentGeoId}`);
        
        // Update loading message
        $levelsList.html(`<div class="nm-loading-structure">🌍 Explorando nivel ${levelNumber} (${levelCode})...</div>`);
        
        callGeonamesProxy('childrenJSON', { 
            username: username, 
            geonameId: parentGeoId,
            featureClass: 'A',
            lang: language
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
                        exploreLevel(levelData[0].geonameId, nextLevelCode, levelNumber + 1, username, language, structure, $levelsList, panel);
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
        const language = structure.language;
        const username = panel.find('.nm-geonames-user').val().trim();
        const cacheKey = `${countryCode}_${username}_${language}`;
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
                <div class="nm-level-config" data-level="${levelInfo.code}">
                    <input type="checkbox" class="nm-level-enabled" value="${levelInfo.code}" ${levelInfo.enabled ? 'checked' : ''}>
                    <span class="nm-level-info">
                        <strong>${levelInfo.name}</strong>
                        <small>Ejemplo: ${levelInfo.sample} (${levelInfo.count} encontrados)</small>
                    </span>
                    <input type="text" class="nm-level-label" data-level="${levelInfo.code}" 
                           value="${levelInfo.default_label}" placeholder="Nombre personalizado">
                    <div class="nm-fixed-parent" data-fixed-for="${levelInfo.code}" style="display:none; margin-left:10px; flex: 1;">
                        <div style="display:flex; gap:6px; align-items:center; margin-top:6px;">
                            <select class="nm-fixed-value-select" data-level="${levelInfo.code}" style="flex:1;">
                                <option value="">-- Valor fijo (${levelInfo.default_label}) --</option>
                            </select>
                            <button type="button" class="button nm-load-fixed-values" data-level="${levelInfo.code}">Cargar valores</button>
                        </div>
                        <small>Si no activas este nivel puedes fijar un valor específico para filtrar los niveles inferiores.</small>
                    </div>
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
        const $languageSelect = panel.find('.nm-language-selector');
        const $countryRow = panel.find('.nm-country-row');
        const $countrySelect = panel.find('.nm-country-selector');
        
        console.log('Loading config into panel:', config);
        
        // Load language setting
        if (config.language) {
            $languageSelect.val(config.language);
            console.log('Set language to:', config.language);
        }
        
        // Load GeoNames user from wp_option (global setting)
        const globalGeonamesUser = nmAdmin.geonames_user || '';
        $geonamesInput.val(globalGeonamesUser);
        
        // If user exists and country is configured, show country section
        if (globalGeonamesUser && config.country) {
            $countryRow.show();
            $countrySelect.prop('disabled', false);
            
            // Load countries and set selected country with correct language
            const language = config.language || 'es';
            loadCountriesFromGeonames(globalGeonamesUser, language, panel.find('.nm-config-row').first());
            
            setTimeout(() => {
                $countrySelect.val(config.country || '').trigger('change');
            }, 1000);
        } else {
            $countryRow.hide();
            $countrySelect.prop('disabled', true);
        }
        
        setTimeout(() => {
            if (config.levels && config.field_names) {
                panel.find('.nm-level-enabled').each(function() {
                    const levelCode = $(this).val();
                    const isEnabled = config.levels.includes(levelCode);
                    $(this).prop('checked', isEnabled);
                    const $fixedWrapper = panel.find(`.nm-fixed-parent[data-fixed-for="${levelCode}"]`);
                    if (!isEnabled) {
                        $fixedWrapper.show();
                    } else {
                        $fixedWrapper.hide();
                    }
                });

                panel.find('.nm-level-label').each(function() {
                    const levelCode = $(this).data('level');
                    const customName = config.field_names[levelCode];
                    if (customName) {
                        $(this).val(customName);
                    }
                });
            }
            if (config.fixed_values) {
                Object.keys(config.fixed_values).forEach(levelCode => {
                    const data = config.fixed_values[levelCode];
                    const $select = panel.find(`.nm-fixed-value-select[data-level="${levelCode}"]`);
                    if ($select.length) {
                        if ($select.find('option').length <= 1) {
                            $select.append(`<option value="${data.name}" data-geoname-id="${data.geonameId}" selected>${data.name}</option>`);
                        } else {
                            $select.val(data.name);
                        }
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
        const language = panel.find('.nm-language-selector').val() || 'es';

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

        // Recolectar niveles activados
        panel.find('.nm-level-enabled:checked').each(function() {
            const levelCode = $(this).val();
            const customLabel = panel.find(`.nm-level-label[data-level="${levelCode}"]`).val().trim();
            
            levels.push(levelCode);
            if (customLabel) {
                fieldNames[levelCode] = customLabel;
            }
        });

        // Recolectar valores fijos para niveles desactivados
        const fixedValues = {};
        panel.find('.nm-level-enabled').not(':checked').each(function() {
            const levelCode = $(this).val();
            const $fixedSelect = panel.find(`.nm-fixed-value-select[data-level="${levelCode}"]`);
            const selectedOption = $fixedSelect.find('option:selected');
            const fixedGeoId = selectedOption.data('geoname-id');
            const fixedName = selectedOption.text();
            if ($fixedSelect.val() && fixedGeoId) {
                fixedValues[levelCode] = { geonameId: String(fixedGeoId), name: fixedName };
            }
        });

        // Validación: si el primer nivel mostrado no es admin1 y no existe valor fijo admin1
        if (levels.length > 0 && levels[0] !== 'admin1' && !fixedValues['admin1']) {
            alert('Has desactivado el nivel superior (admin1) pero no has fijado un valor. Selecciona un valor fijo para la Comunidad Autónoma o activa el nivel.');
            return;
        }

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
                language: language,
                levels: levels,
                field_names: fieldNames,
                fixed_values: fixedValues
            }
        };

        // Update hidden field
        const hiddenField = currentField.find('.nm-field-config');
        const configJson = JSON.stringify(config);
        
        console.log('Saving geographic config:', config);
        console.log('Config JSON:', configJson);
        console.log('Hidden field element:', hiddenField.length);
        
        hiddenField.val(configJson);
        
        // Verify the value was set
        console.log('Hidden field value after setting:', hiddenField.val());

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
        const activeLevels = (config.levels||[]);
        if (activeLevels.length > 0) {
            activeLevels.forEach(level => {
                const fieldName = (config.field_names && config.field_names[level]) || level;
                const levelDiv = $(`
                    <div class="nm-geo-level">
                        <label>${fieldName}:</label>
                        <select disabled>
                            <option>Seleccionar ${fieldName.toLowerCase()}...</option>
                        </select>
                    </div>`);
                preview.append(levelDiv);
            });
            // Mostrar resumen de valores fijos
            if (config.fixed_values && Object.keys(config.fixed_values).length) {
                const list = Object.keys(config.fixed_values).map(k => `${k}: ${config.fixed_values[k].name}`).join(', ');
                preview.append(`<div class="nm-geo-fixed-summary" style="margin-top:8px;font-size:11px;color:#555;">Valores fijos: ${list}</div>`);
            }
        } else {
            preview.html('<p class="nm-geo-placeholder">Configure el selector geográfico para ver la vista previa</p>');
        }
    }

    function getFieldConfig($field) {
        const configElement = $field.find('.nm-field-config');
        const configJson = configElement.val();
        
        console.log('Getting field config from element:', configElement.length);
        console.log('Raw config JSON:', configJson);
        
        try {
            const parsed = configJson ? JSON.parse(configJson) : null;
            console.log('Parsed config:', parsed);
            return parsed;
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

    // Add validation function for debugging
    function validateGeographicFieldSave() {
        console.log('=== Validating Geographic Field Save ===');
        
        $('.nm-geographic-field').each(function(index) {
            const $field = $(this);
            const fieldId = $field.data('field-id');
            const configElement = $field.find('.nm-field-config');
            const configValue = configElement.val();
            
            console.log(`Field ${index + 1}:`);
            console.log('- Field ID:', fieldId);
            console.log('- Config element found:', configElement.length > 0);
            console.log('- Config value:', configValue);
            
            if (configValue) {
                try {
                    const parsed = JSON.parse(configValue);
                    console.log('- Parsed config:', parsed);
                    console.log('- Has language:', !!(parsed.config && parsed.config.language));
                    console.log('- Language value:', parsed.config ? parsed.config.language : 'N/A');
                } catch (e) {
                    console.error('- Parse error:', e);
                }
            }
            console.log('---');
        });
        
        console.log('=== End Validation ===');
    }

    // Export validation function for manual testing
    window.validateGeographicFieldSave = validateGeographicFieldSave;

    // Export functions for external use
    window.nmGeographicSelector = {
        initializeField: initializeExistingField,
        openConfig: openConfigPanel
    };

})(jQuery);
