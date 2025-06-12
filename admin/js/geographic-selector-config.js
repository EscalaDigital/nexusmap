/**
 * Geographic Selector Configuration JavaScript
 */
(function($) {
    'use strict';

    // Common country configurations for GeoNames levels
    const COUNTRY_CONFIGS = {
        'ES': {
            name: 'España',
            levels: [
                { code: 'admin1', name: 'Comunidad Autónoma', default_label: 'Comunidad Autónoma' },
                { code: 'admin2', name: 'Provincia', default_label: 'Provincia' },
                { code: 'admin3', name: 'Municipio', default_label: 'Municipio' }
            ]
        },
        'FR': {
            name: 'Francia',
            levels: [
                { code: 'admin1', name: 'Región', default_label: 'Región' },
                { code: 'admin2', name: 'Departamento', default_label: 'Departamento' },
                { code: 'admin3', name: 'Comuna', default_label: 'Comuna' }
            ]
        },
        'US': {
            name: 'Estados Unidos',
            levels: [
                { code: 'admin1', name: 'Estado', default_label: 'Estado' },
                { code: 'admin2', name: 'Condado', default_label: 'Condado' },
                { code: 'admin3', name: 'Ciudad', default_label: 'Ciudad' }
            ]
        },
        'MX': {
            name: 'México',
            levels: [
                { code: 'admin1', name: 'Estado', default_label: 'Estado' },
                { code: 'admin2', name: 'Municipio', default_label: 'Municipio' },
                { code: 'admin3', name: 'Localidad', default_label: 'Localidad' }
            ]
        },
        'IT': {
            name: 'Italia',
            levels: [
                { code: 'admin1', name: 'Región', default_label: 'Región' },
                { code: 'admin2', name: 'Provincia', default_label: 'Provincia' },
                { code: 'admin3', name: 'Comuna', default_label: 'Comuna' }
            ]
        },
        'DE': {
            name: 'Alemania',
            levels: [
                { code: 'admin1', name: 'Estado', default_label: 'Estado' },
                { code: 'admin2', name: 'Distrito', default_label: 'Distrito' },
                { code: 'admin3', name: 'Municipio', default_label: 'Municipio' }
            ]
        }
    };

    let currentField = null;

    $(document).ready(function() {
        initializeGeographicSelector();
        setupEventHandlers();
    });    function initializeGeographicSelector() {
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
                loadCountryStructureFromGeonames(country, username, panel);
            } else if (country && COUNTRY_CONFIGS[country]) {
                // Fallback to predefined config if no username
                showLevelsConfig(panel, country);
            } else {
                panel.find('.nm-levels-config').hide();
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
        }
    }    function loadCountries() {
        const commonCountries = [
            { code: 'ES', name: 'España' },
            { code: 'FR', name: 'Francia' },
            { code: 'US', name: 'Estados Unidos' },
            { code: 'MX', name: 'México' },
            { code: 'IT', name: 'Italia' },
            { code: 'DE', name: 'Alemania' },
            { code: 'PT', name: 'Portugal' },
            { code: 'GB', name: 'Reino Unido' },
            { code: 'AR', name: 'Argentina' },
            { code: 'BR', name: 'Brasil' },
            { code: 'CO', name: 'Colombia' },
            { code: 'PE', name: 'Perú' },
            { code: 'CL', name: 'Chile' }
        ];

        $('.nm-country-selector').each(function() {
            const $select = $(this);
            $select.empty().append('<option value="">Seleccionar país...</option>');
            
            commonCountries.forEach(country => {
                $select.append(`<option value="${country.code}">${country.name}</option>`);
            });
        });
    }

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
    }    function loadCountryStructureFromGeonames(countryCode, username, panel) {
        const $levelsConfig = panel.find('.nm-levels-config');
        const $levelsList = panel.find('.nm-levels-list');
        
        // Show loading state
        $levelsConfig.show();
        $levelsList.html('<div class="nm-loading-structure">🌍 Cargando estructura administrativa del país...</div>');
        
        // Get country GeoName ID first
        const countryGeoId = getCountryGeonameId(countryCode);
        
        // Load administrative structure from GeoNames with fallback
        try {
            loadAdministrativeStructureWithFallback(countryGeoId, username, countryCode, $levelsList, panel);
        } catch (error) {
            console.error('Error loading administrative structure:', error);
            // Ultimate fallback: use predefined structure directly
            displayFallbackStructureWithMessage($levelsList, countryCode, 'Error crítico cargando estructura. Usando configuración predefinida');
        }
    }

    function loadAdministrativeStructureWithFallback(countryGeoId, username, countryCode, $levelsList, panel) {
        const levels = ['admin1', 'admin2', 'admin3', 'admin4'];
        const structureData = [];
        let completed = 0;
        let hasError = false;

        // Check each administrative level - only check first level initially
        for (let index = 0; index < levels.length; index++) {
            const level = levels[index];
            
            callGeonamesProxy('childrenJSON', { 
                username: username, 
                geonameId: countryGeoId, 
                featureClass: 'A' 
            })
            .done(function(response) {
                completed++;
                
                if (response.success && response.data && response.data.geonames && response.data.geonames.length > 0) {
                    // Filter by administrative level
                    let levelData = response.data.geonames;
                    
                    if (level === 'admin1') {
                        levelData = levelData.filter(item => 
                            item.fcode === 'ADM1' || item.fcode === 'ADMD'
                        );
                    }
                    
                    if (levelData.length > 0) {
                        // Get sample names to determine what this level represents
                        const sampleNames = levelData.slice(0, 3).map(item => item.name);
                        const levelName = determineAdministrativeLevelName(countryCode, level, sampleNames);
                        
                        structureData.push({
                            code: level,
                            name: levelName,
                            available: true,
                            count: levelData.length,
                            samples: sampleNames
                        });
                    }
                }
                
                // Check if we need to load next level (only for first level initially)
                if (level === 'admin1' && structureData.length > 0 && structureData[0].available) {
                    // Load one sample admin2 level to see if it exists
                    const sampleAdmin1Id = response.data.geonames[0].geonameId;
                    loadNextLevelWithFallback(sampleAdmin1Id, 'admin2', username, structureData, $levelsList, levels, countryCode, panel);
                } else if (completed === 1) {
                    // If no admin1 found but GeoNames responded, show what we have
                    if (structureData.length > 0) {
                        displayAdministrativeStructure(structureData, $levelsList, countryCode);
                    } else {
                        // No data from GeoNames, use fallback
                        displayFallbackStructureWithMessage($levelsList, countryCode, 'No se encontraron datos administrativos en GeoNames');
                    }
                }
            })
            .fail(function(xhr, status, error) {
                completed++;
                hasError = true;
                console.error(`Error loading ${level}:`, error);
                
                if (completed === 1) {
                    // GeoNames failed, use fallback structure
                    let errorMessage = 'Error de conexión con GeoNames';
                    if (status === 'timeout') {
                        errorMessage = 'Timeout conectando con GeoNames';
                    } else if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.geonames_error) {
                        errorMessage = 'Error en GeoNames: ' + xhr.responseJSON.data.geonames_error;
                    }
                    
                    displayFallbackStructureWithMessage($levelsList, countryCode, errorMessage);
                }
            });
            
            // Only check first level initially
            if (index === 0) break;
        }
    }

    function loadNextLevelWithFallback(parentId, level, username, structureData, $levelsList, allLevels, countryCode, panel) {
        const levelIndex = allLevels.indexOf(level);
        
        callGeonamesProxy('childrenJSON', { 
            username: username, 
            geonameId: parentId, 
            featureClass: 'A' 
        }, 8000)
        .done(function(response) {
            if (response.success && response.data && response.data.geonames && response.data.geonames.length > 0) {
                let levelData = response.data.geonames;
                
                // Filter by administrative level
                if (level === 'admin2') {
                    levelData = levelData.filter(item => 
                        item.fcode === 'ADM2' || item.fcode === 'ADMD'
                    );
                } else if (level === 'admin3') {
                    levelData = levelData.filter(item => 
                        item.fcode === 'ADM3' || item.fcode === 'ADMD' || item.fcode === 'PPL' || item.fcode === 'PPLA'
                    );
                } else if (level === 'admin4') {
                    levelData = levelData.filter(item => 
                        item.fcode === 'ADM4' || item.fcode === 'ADMD' || item.fcode === 'PPL'
                    );
                }
                
                if (levelData.length > 0) {
                    const sampleNames = levelData.slice(0, 3).map(item => item.name);
                    const levelName = determineAdministrativeLevelName(countryCode, level, sampleNames);
                    
                    structureData.push({
                        code: level,
                        name: levelName,
                        available: true,
                        count: levelData.length,
                        samples: sampleNames
                    });
                    
                    // Try to load next level if available
                    if (levelIndex < allLevels.length - 1) {
                        const nextLevel = allLevels[levelIndex + 1];
                        const sampleNextId = levelData[0].geonameId;
                        loadNextLevelWithFallback(sampleNextId, nextLevel, username, structureData, $levelsList, allLevels, countryCode, panel);
                    } else {
                        displayAdministrativeStructure(structureData, $levelsList, countryCode);
                    }
                } else {
                    displayAdministrativeStructure(structureData, $levelsList, countryCode);
                }
            } else {
                displayAdministrativeStructure(structureData, $levelsList, countryCode);
            }
        })
        .fail(function(xhr, status, error) {
            console.error(`Error loading next level ${level}:`, error);
            // If secondary level fails, still show what we have from first level
            displayAdministrativeStructure(structureData, $levelsList, countryCode);
        });
    }

    function displayFallbackStructureWithMessage($levelsList, countryCode, errorMessage) {
        $levelsList.empty();
        
        // Show error message
        $levelsList.append(`
            <div class="nm-geonames-error" style="background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                <strong>⚠️ ${errorMessage}</strong><br>
                <small>Usando estructura predefinida como alternativa</small>
            </div>
        `);
        
        // Use predefined structure or generic one
        let config = COUNTRY_CONFIGS[countryCode];
        
        if (!config) {
            config = {
                name: 'Estructura Genérica',
                levels: [
                    { code: 'admin1', name: 'Primer Nivel', default_label: 'Región/Estado' },
                    { code: 'admin2', name: 'Segundo Nivel', default_label: 'Provincia/Condado' },
                    { code: 'admin3', name: 'Tercer Nivel', default_label: 'Municipio/Ciudad' },
                    { code: 'admin4', name: 'Cuarto Nivel', default_label: 'Distrito/Barrio' }
                ]
            };
        }
        
        $levelsList.append('<h6>📋 Estructura predefinida (fallback):</h6>');
        
        config.levels.forEach((level, index) => {
            const isChecked = index < 2;
            const levelDiv = $(`
                <div class="nm-level-config">
                    <input type="checkbox" class="nm-level-enabled" value="${level.code}" ${isChecked ? 'checked' : ''}>
                    <span>${level.name}:</span>
                    <input type="text" class="nm-level-label" data-level="${level.code}" 
                           value="${level.default_label}" placeholder="Nombre del campo">
                </div>
            `);
            $levelsList.append(levelDiv);
        });
        
        $levelsList.append(`
            <div class="nm-structure-info">
                <small>ℹ️ Se está usando la configuración predefinida debido a problemas con GeoNames. 
                El sistema funcionará correctamente con esta estructura.</small>
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
            displayFallbackStructureWithMessage($levelsList, countryCode, 'No se encontraron datos administrativos válidos');
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
        `);
    }

    function displayFallbackStructure($levelsList, countryCode) {
        $levelsList.empty();
        
        // Use predefined structure or generic one
        let config = COUNTRY_CONFIGS[countryCode];
        
        if (!config) {
            config = {
                name: 'Estructura Genérica',
                levels: [
                    { code: 'admin1', name: 'Primer Nivel', default_label: 'Región/Estado' },
                    { code: 'admin2', name: 'Segundo Nivel', default_label: 'Provincia/Condado' },
                    { code: 'admin3', name: 'Tercer Nivel', default_label: 'Municipio/Ciudad' },
                    { code: 'admin4', name: 'Cuarto Nivel', default_label: 'Distrito/Barrio' }
                ]
            };
        }
        
        $levelsList.append('<h6>⚠️ Usando estructura predefinida:</h6>');
        
        config.levels.forEach((level, index) => {
            const isChecked = index < 2;
            const levelDiv = $(`
                <div class="nm-level-config">
                    <input type="checkbox" class="nm-level-enabled" value="${level.code}" ${isChecked ? 'checked' : ''}>
                    <span>${level.name}:</span>
                    <input type="text" class="nm-level-label" data-level="${level.code}" 
                           value="${level.default_label}" placeholder="Nombre del campo">
                </div>
            `);
            $levelsList.append(levelDiv);
        });
        
        $levelsList.append(`
            <div class="nm-structure-info">
                <small>ℹ️ No se pudo cargar la estructura desde GeoNames. 
                Usando configuración predefinida.</small>
            </div>
        `);
    }

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
        currentField = null;
    }    function showLevelsConfig(panel, country) {
        // First check if we have predefined configuration
        let config = COUNTRY_CONFIGS[country];
        
        // If no predefined config, create a generic one
        if (!config) {
            config = {
                name: panel.find('.nm-country-selector option:selected').text(),
                levels: [
                    { code: 'admin1', name: 'Nivel Administrativo 1', default_label: 'Región/Estado' },
                    { code: 'admin2', name: 'Nivel Administrativo 2', default_label: 'Provincia/Condado' },
                    { code: 'admin3', name: 'Nivel Administrativo 3', default_label: 'Municipio/Ciudad' },
                    { code: 'admin4', name: 'Nivel Administrativo 4', default_label: 'Distrito/Barrio' }
                ]
            };
        }
        
        const levelsContainer = panel.find('.nm-levels-list');
        levelsContainer.empty();
        
        // Add header indicating this is predefined structure
        levelsContainer.append('<h6>📋 Estructura predefinida:</h6>');

        config.levels.forEach((level, index) => {
            const levelDiv = $(`
                <div class="nm-level-config">
                    <input type="checkbox" class="nm-level-enabled" value="${level.code}" ${index < 2 ? 'checked' : ''}>
                    <span>${level.name}:</span>
                    <input type="text" class="nm-level-label" data-level="${level.code}" value="${level.default_label}" placeholder="Nombre del campo">
                </div>
            `);
            levelsContainer.append(levelDiv);
        });
        
        // Add info message about predefined vs dynamic structure
        levelsContainer.append(`
            <div class="nm-structure-info">
                <small>💡 Para cargar la estructura real del país desde GeoNames, 
                valida tu usuario primero y luego selecciona el país nuevamente.</small>
            </div>
        `);

        panel.find('.nm-levels-config').show();
    }function loadConfigIntoPanel(panel, config) {
        const $geonamesInput = panel.find('.nm-geonames-user');
        const $countryRow = panel.find('.nm-country-row');
        const $countrySelect = panel.find('.nm-country-selector');
        
        // Load GeoNames user
        $geonamesInput.val(config.geonames_user || '');
        
        // If user exists and country is configured, show country section
        if (config.geonames_user && config.country) {
            $countryRow.show();
            $countrySelect.prop('disabled', false);
            
            // Load countries and set selected country
            loadCountriesFromGeonames(config.geonames_user, panel.find('.nm-config-row').first());
            
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
        }

        // Save configuration
        const config = {
            type: 'geographic-selector',
            id: currentField.data('field-id') || generateFieldId(),
            name: currentField.find('.nm-field-header label').text().toLowerCase().replace(/\s+/g, '_'),
            label: currentField.find('.nm-field-header label').text(),
            config: {
                geonames_user: geonamesUser,
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
