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
        });

        // Country selector change
        $(document).on('change', '.nm-country-selector', function() {
            const country = $(this).val();
            const panel = $(this).closest('.nm-geo-config-panel');
            
            if (country && COUNTRY_CONFIGS[country]) {
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
        hideUserValidationMessage($configRow);
        
        // Test with a simple API call
        $.ajax({
            url: `https://api.geonames.org/countryInfoJSON?username=${username}`,
            method: 'GET',
            timeout: 10000,
            success: function(response) {
                $button.prop('disabled', false).text(originalText);
                
                if (response && response.geonames && response.geonames.length > 0) {
                    showUserValidationMessage($configRow, '✓ Usuario válido. Cargando países...', 'success');
                    loadCountriesFromGeonames(username, $configRow);
                } else {
                    showUserValidationMessage($configRow, 'Usuario válido pero sin datos de países', 'error');
                }
            },
            error: function(xhr, status, error) {
                $button.prop('disabled', false).text(originalText);
                
                let errorMessage = 'Error al validar usuario';
                if (status === 'timeout') {
                    errorMessage = 'Tiempo de espera agotado';
                } else if (xhr.status === 401 || xhr.responseText.includes('user account not found')) {
                    errorMessage = 'Usuario no encontrado. Verifica que el usuario esté registrado en GeoNames.org';
                } else if (xhr.status === 429) {
                    errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos';
                }
                
                showUserValidationMessage($configRow, errorMessage, 'error');
                console.error('GeoNames validation error:', error, xhr.responseText);
            }
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
        $countrySelect.prop('disabled', true);
        
        $.ajax({
            url: `https://api.geonames.org/countryInfoJSON?username=${username}`,
            method: 'GET',
            timeout: 15000,
            success: function(response) {
                $loading.hide();
                
                if (response && response.geonames && response.geonames.length > 0) {
                    // Sort countries alphabetically
                    const countries = response.geonames.sort((a, b) => a.countryName.localeCompare(b.countryName));
                    
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
            },
            error: function(xhr, status, error) {
                $loading.hide();
                $countrySelect.prop('disabled', true);
                
                let errorMessage = 'Error al cargar países';
                if (status === 'timeout') {
                    errorMessage = 'Tiempo de espera agotado al cargar países';
                }
                
                showUserValidationMessage($configRow, errorMessage, 'error');
                console.error('Error loading countries from GeoNames:', error);
            }
        });
    }

    function showUserValidationMessage($configRow, message, type) {
        const $messageDiv = $configRow.find('.nm-user-validation-message');
        $messageDiv.removeClass('success error').addClass(type).text(message).show();
    }

    function hideUserValidationMessage($configRow) {
        $configRow.find('.nm-user-validation-message').hide();
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
                    { code: 'admin3', name: 'Nivel Administrativo 3', default_label: 'Municipio/Ciudad' }
                ]
            };
        }
        
        const levelsContainer = panel.find('.nm-levels-list');
        levelsContainer.empty();

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

    // Export functions for external use
    window.nmGeographicSelector = {
        initializeField: initializeExistingField,
        openConfig: openConfigPanel
    };

})(jQuery);
