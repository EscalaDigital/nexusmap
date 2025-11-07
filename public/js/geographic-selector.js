/**
 * Geographic Selector Frontend JavaScript
 * Handles cascading selects with GeoNames API
 */
(function($) {
    'use strict';    // Use AJAX proxy to avoid Mixed Content issues
    const PROXY_ENDPOINT = nmPublic.ajax_url; // WordPress AJAX endpoint (HTTPS)
    const REQUEST_TIMEOUT = 10000; // 10 seconds
    const CACHE_DURATION = 300000; // 5 minutes
      let cache = {};
    let requestQueue = {};
    
    /**
     * Call GeoNames API through WordPress AJAX proxy (HTTPS)
     * Prevents Mixed Content issues on HTTPS sites
     */
    function callGeonamesProxy(endpoint, params, timeout = REQUEST_TIMEOUT) {
        const proxyParams = {
            action: 'nm_geonames_proxy',
            nonce: nmPublic.nonce,
            endpoint: endpoint,
            ...params
        };

        return $.ajax({
            url: PROXY_ENDPOINT,
            method: 'GET',
            data: proxyParams,
            timeout: timeout,
            dataType: 'json'
        });
    }    $(document).ready(function() {
        // Wait a bit for the page to fully load
        setTimeout(function() {
            initializeGeographicSelectors();
        }, 100);
    });

    function initializeGeographicSelectors() {
        const $selectors = $('.nm-geographic-selector');
        
        if ($selectors.length === 0) {
            return;
        }
        
        
        $selectors.each(function() {
            const $container = $(this);
            
            
            const config = getFieldConfig($container);
            
            if (config) {
                
                setupCascadingSelects($container, config);
            } else {
                console.error('No valid config for geographic selector', $container.attr('id'));
                // Mostrar mensaje de error al usuario
                $container.html('<div style="color: red; padding: 10px; border: 1px solid red;">Error: Configuración del selector geográfico no válida</div>');
            }
        });
    }    function getFieldConfig($container) {
        try {
            let configData = $container.data('config');
            
            // Si no hay config data o hay problemas, intentar usar la configuración alternativa
            if (!configData) {
                const configId = $container.data('config-id');
                if (configId && window.nmGeoConfigs && window.nmGeoConfigs[configId]) {
                    
                    return window.nmGeoConfigs[configId];
                }
                
                // Config no encontrada en el contenedor ni alternativa
                return null;
            }
            
            // Si es un string, intentar parsearlo
            if (typeof configData === 'string') {
                // Limpiar cualquier contenido HTML que pueda haber sido insertado
                configData = configData.trim();
                
                // Buscar el final del JSON válido
                let jsonEnd = -1;
                let bracketCount = 0;
                let inString = false;
                let escapeNext = false;
                
                for (let i = 0; i < configData.length; i++) {
                    const char = configData[i];
                    
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }
                    
                    if (char === '"' && !escapeNext) {
                        inString = !inString;
                        continue;
                    }
                    
                    if (!inString) {
                        if (char === '{') {
                            bracketCount++;
                        } else if (char === '}') {
                            bracketCount--;
                            if (bracketCount === 0) {
                                jsonEnd = i;
                                break;
                            }
                        }
                    }
                }
                
                if (jsonEnd > -1) {
                    configData = configData.substring(0, jsonEnd + 1);
                } else {
                    // No se detectó final de JSON válido
                    
                    // Intentar usar la configuración alternativa
                    const configId = $container.data('config-id');
                    if (configId && window.nmGeoConfigs && window.nmGeoConfigs[configId]) {
                        
                        return window.nmGeoConfigs[configId];
                    }
                    
                    return null;
                }
                
                return JSON.parse(configData);
            }
            
            // Si ya es un objeto, intentar normalizar si viene anidado dentro de config
            if (configData && typeof configData === 'object' && configData.config && typeof configData.config === 'object') {
                if (!Array.isArray(configData.levels) && Array.isArray(configData.config.levels)) {
                    // Normalizando config anidada (sin levels en raíz)
                    configData = configData.config;
                } else if (Object.keys(configData).length <= 3 && configData.config.levels) { // estructura muy pequeña que probablemente es wrapper
                    // Normalizando config anidada (wrapper ligero)
                    configData = configData.config;
                }
            }

            // Asegurar que fixed_values esté presente aunque sea vacío
            if (configData) {
                if (!configData.fixed_values && configData.config && configData.config.fixed_values) {
                    configData.fixed_values = configData.config.fixed_values;
                }
                if (!configData.fixed_values) {
                    const dataFixed = $container.attr('data-fixed-values');
                    if (dataFixed) {
                        try {
                            const parsedFixed = JSON.parse(dataFixed);
                            if (parsedFixed && typeof parsedFixed === 'object') {
                                // fixed_values recuperado de data-fixed-values
                                configData.fixed_values = parsedFixed;
                            }
                        } catch(e){ /* error parseando data-fixed-values */ }
                    }
                }
            }

            // Config final obtenida
            return configData;
        } catch (e) {
            console.error('Error parsing geographic selector config');
            
            // Intentar usar la configuración alternativa como último recurso
            const configId = $container.data('config-id');
            if (configId && window.nmGeoConfigs && window.nmGeoConfigs[configId]) {
                
                return window.nmGeoConfigs[configId];
            }
            
            return null;
        }
    }    function setupCascadingSelects($container, config) {
    // Iniciando setupCascadingSelects
        const levels = config.levels || [];
        const fieldNames = config.field_names || {};
        const country = config.country;
        const fixedValues = (config.fixed_values) || (config.config && config.config.fixed_values) || {};
    // fixedValues detectados

        // Check if GeoNames is configured via AJAX (secure way)
        checkGeonamesConfig(function(isConfigured) {
            if (!isConfigured) {
                console.error('GeoNames user not configured');
                showError($container, 'Usuario GeoNames no configurado');
                return;
            }
            continueSetup();
        });

        function continueSetup() {
            const $selectorsContainer = $container.find('.nm-geo-selectors-container');
            const $targetContainer = $selectorsContainer.length > 0 ? $selectorsContainer : $container;
            levels.forEach((level, index) => {
                const fieldName = fieldNames[level] || level;
                const selectId = `${$container.attr('id')}_${level}`;
                const isRequired = $container.data('required') || false;
                const selectHtml = `
                    <div class="nm-geo-level" data-level="${level}">
                        <label for="${selectId}">${fieldName}:</label>
                        <select id="${selectId}" name="${level}" class="nm-geo-select" data-level="${level}" data-field-name="${fieldName}" ${isRequired ? 'required' : ''} ${index > 0 ? 'disabled' : ''}>
                            <option value="">Seleccionar ${fieldName.toLowerCase()}...</option>
                        </select>
                        <div class="nm-geo-loading" style="display:none;"><span>Cargando...</span></div>
                        <div class="nm-geo-error" style="display:none;color:red;"><span></span><button type="button" class="nm-retry-btn">Reintentar</button></div>
                    </div>`;
                $targetContainer.append(selectHtml);
            });
            if (levels.length > 0) {
                const firstLevel = levels[0];
                if (firstLevel !== 'admin1') {
                    if (fixedValues['admin1']) {
                        loadGeoDataSecure($container, country, fixedValues['admin1'].geonameId, firstLevel);
                    } else {
                        // Mostrar aviso y no intentar cargar admin1 (evita aparecer comunidad autonoma)
                        const warn = '<div class="nm-geo-general-error" style="color:#b45309;background:#fff4e5;border:1px solid #f7c775;padding:8px;margin:6px 0;font-size:12px;">Configuración incompleta: falta valor fijo de nivel superior (admin1). Edite el formulario.</div>';
                        if ($container.find('.nm-geo-general-error').length === 0) {
                            $container.prepend(warn);
                        }
                        return;
                    }
                } else {
                    loadGeoDataSecure($container, country, null, firstLevel);
                }
            }
            $container.on('change', '.nm-geo-select', function() { handleSelectChange($container, $(this), config); });
            $container.on('click', '.nm-retry-btn', function() {
                const $level = $(this).closest('.nm-geo-level');
                const level = $level.data('level');
                const parentValue = getParentValue($container, level, config.levels);
                loadGeoDataSecure($container, country, parentValue, level);
            });
        }
    }function handleSelectChange($container, $select, config) {
        const currentLevel = $select.data('level');
        const selectedValue = $select.val();
        const selectedOption = $select.find('option:selected');
        const geonameId = selectedOption.data('geoname-id'); // Get the GeoNames ID for API calls
        const levels = config.levels;
        const currentIndex = levels.indexOf(currentLevel);
        
        // Clear and disable subsequent selects
        for (let i = currentIndex + 1; i < levels.length; i++) {
            const nextLevel = levels[i];
            const $nextSelect = $container.find(`[data-level="${nextLevel}"]`).find('.nm-geo-select');
            
            $nextSelect.empty()
                .append(`<option value="">Seleccionar ${$nextSelect.data('field-name').toLowerCase()}...</option>`)
                .prop('disabled', true);
                
            hideError($container.find(`[data-level="${nextLevel}"]`));
        }        // Load next level if there is one and a value is selected
        if (selectedValue && geonameId && currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            loadGeoDataSecure($container, config.country, geonameId, nextLevel);
        }
    }    function getParentValue($container, currentLevel, levels) {
        const currentIndex = levels.indexOf(currentLevel);
        if (currentIndex <= 0) return null;
        
        const parentLevel = levels[currentIndex - 1];
        const $parentSelect = $container.find(`[data-level="${parentLevel}"]`).find('.nm-geo-select');
        const $selectedOption = $parentSelect.find('option:selected');
        
        // Return the GeoNames ID for API calls, not the display value
        return $selectedOption.data('geoname-id') || null;
    }    /* 
    // DEPRECATED: loadGeoData function replaced by loadGeoDataSecure for security
    function loadGeoData($container, country, parentCode, level, username) {
        // This function is deprecated and replaced by loadGeoDataSecure
        // to avoid exposing GeoNames username to frontend
    // Deprecated loadGeoData
        loadGeoDataSecure($container, country, parentCode, level);
    }
    */function populateSelect($select, data) {
        const fieldName = $select.data('field-name');
        $select.empty().append(`<option value="">Seleccionar ${fieldName.toLowerCase()}...</option>`);
        
        data.forEach(item => {
            $select.append(`<option value="${item.name}" data-geoname-id="${item.geonameId}">${item.name}</option>`);
        });
        
        $select.prop('disabled', false);
    }

    function showLoading($levelContainer) {
        $levelContainer.find('.nm-geo-loading').show();
        $levelContainer.find('.nm-geo-select').prop('disabled', true);
    }

    function hideLoading($levelContainer) {
        $levelContainer.find('.nm-geo-loading').hide();
    }    function showError($container, message) {
    console.error('Geographic Selector Error:', message);
        
        // Si $container es el nivel específico, buscar el error ahí
        let $error = $container.find('.nm-geo-error');
        
        // Si no encuentra error en el contenedor, es porque $container es el contenedor principal
        if ($error.length === 0) {
            // Crear un div de error general si no existe
            if ($container.find('.nm-geo-general-error').length === 0) {
                $container.append('<div class="nm-geo-general-error" style="color: red; padding: 10px; border: 1px solid red; background: #ffe6e6; margin: 10px 0;"></div>');
            }
            $container.find('.nm-geo-general-error').text(message).show();
        } else {
            $error.find('span').text(message);
            $error.show();
        }
    }

    function hideError($levelContainer) {
        $levelContainer.find('.nm-geo-error').hide();
    }    function getCountryGeonameId(countryCode) {
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
    }    // Function to get selected values for form submission
    function getSelectedValues($container) {
        const values = {};
        const config = getFieldConfig($container);
        
        if (!config) return values;
        
        config.levels.forEach(level => {
            const $select = $container.find(`[data-level="${level}"]`).find('.nm-geo-select');
            const selectedValue = $select.val(); // This is now the name
            const $selectedOption = $select.find('option:selected');
            const geonameId = $selectedOption.data('geoname-id'); // GeoNames ID
            const fieldName = config.field_names[level] || level;
            
            if (selectedValue) {
                // Save the name as the main value (since that's what's now in the value attribute)
                values[`${fieldName.toLowerCase().replace(/\s+/g, '_')}`] = selectedValue;
                
                // Optionally, also save the GeoNames ID if needed for other purposes
                if (geonameId) {
                    values[`${fieldName.toLowerCase().replace(/\s+/g, '_')}_id`] = geonameId;
                }
            }
        });

        // Incluir valor fijo admin1 si existe y no se muestra como nivel
        const fixedValues = (config.fixed_values) || (config.config && config.config.fixed_values) || {};
        if (fixedValues['admin1'] && (!config.levels || config.levels.indexOf('admin1') === -1)) {
            const name = fixedValues['admin1'].name;
            const geonameId = fixedValues['admin1'].geonameId;
            if (name) {
                values['admin1'] = name;
            }
            if (geonameId) {
                values['admin1_id'] = geonameId;
            }
        }
        
        return values;
    }

    // Expose functions for form submission
    window.nmGeographicSelectorFrontend = {
        getSelectedValues: getSelectedValues,
        initializeSelectors: initializeGeographicSelectors
    };

    // Auto-collect values on form submission
    $(document).on('submit', 'form', function() {
        const $form = $(this);
        
        $form.find('.nm-geographic-selector').each(function() {            const $container = $(this);
            const values = getSelectedValues($container);
            
            // Add hidden inputs for each selected value
            Object.keys(values).forEach(key => {
                if (values[key]) {
                    $form.append(`<input type="hidden" name="${key}" value="${values[key]}">`);
                }
            });
        });
    });

    /**
     * Check if GeoNames is configured (secure way without exposing username)
     */
    function checkGeonamesConfig(callback) {
        $.ajax({
            url: nmGeoSelector.ajax_url,
            type: 'POST',
            data: {
                action: 'nm_check_geonames_config',
                nonce: nmGeoSelector.nonce
            },
            timeout: 5000,
            success: function(response) {
                if (response.success) {
                    callback(response.data.configured || false);
                } else {
                    callback(false);
                }
            },
            error: function() {
                callback(false);
            }
        });
    }

    /**
     * Load geographic data via secure AJAX (without exposing username)
     */
    function loadGeoDataSecure($container, country, parentCode, level) {
        const $levelContainer = $container.find(`[data-level="${level}"]`);
        const $select = $levelContainer.find('.nm-geo-select');
        const $loading = $levelContainer.find('.nm-geo-loading');
        const $error = $levelContainer.find('.nm-geo-error');
        const config = getFieldConfig($container);
        const language = (config && config.language) ? config.language : (config && config.config && config.config.language ? config.config.language : 'es');
        const fixedValues = (config && config.fixed_values) || (config && config.config && config.config.fixed_values) || {};
        if (!parentCode && level !== 'admin1' && fixedValues['admin1']) {
            parentCode = fixedValues['admin1'].geonameId;
        }
        $loading.show();
        $error.hide();
        $select.prop('disabled', true);
        $.ajax({
            url: nmGeoSelector.ajax_url,
            type: 'POST',
            data: { action: 'nm_get_geo_data', nonce: nmGeoSelector.nonce, country: country, parent_code: parentCode, level: level, language: language },
            timeout: 15000,
            success: function(response) {
                $loading.hide();
                if (response.success && response.data && response.data.length > 0) {
                    $select.empty().append('<option value="">Seleccionar...</option>');
                    response.data.forEach(function(item) { $select.append(`<option value="${item.name}" data-geoname-id="${item.geonameId}">${item.name}</option>`); });
                    $select.prop('disabled', false); hideError($levelContainer);
                } else {
                    showError($levelContainer, response.data && response.data.message ? response.data.message : 'Error al cargar datos');
                }
            },
            error: function(xhr, status) {
                $loading.hide();
                let errorMessage = 'Error de conexión';
                if (status === 'timeout') errorMessage = 'Tiempo de espera agotado';
                else if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) errorMessage = xhr.responseJSON.data.message;
                showError($levelContainer, errorMessage);
            }
        });
    }

})(jQuery);
