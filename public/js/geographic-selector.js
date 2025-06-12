/**
 * Geographic Selector Frontend JavaScript
 * Handles cascading selects with GeoNames API
 */
(function($) {
    'use strict';

    const GEONAMES_BASE_URL = 'http://api.geonames.org/';
    const REQUEST_TIMEOUT = 10000; // 10 seconds
    const CACHE_DURATION = 300000; // 5 minutes
    
    let cache = {};
    let requestQueue = {};
    
    $(document).ready(function() {
        initializeGeographicSelectors();
    });

    function initializeGeographicSelectors() {
        $('.nm-geographic-selector').each(function() {
            const $container = $(this);
            const config = getFieldConfig($container);
            
            if (config) {
                setupCascadingSelects($container, config);
            }
        });
    }

    function getFieldConfig($container) {
        try {
            const configData = $container.data('config');
            return configData ? (typeof configData === 'string' ? JSON.parse(configData) : configData) : null;
        } catch (e) {
            console.error('Error parsing geographic selector config:', e);
            return null;
        }
    }

    function setupCascadingSelects($container, config) {
        const levels = config.levels || [];
        const fieldNames = config.field_names || {};
        const country = config.country;
        const geonamesUser = config.geonames_user;

        if (!geonamesUser) {
            showError($container, 'Usuario GeoNames no configurado');
            return;
        }

        // Create select elements
        levels.forEach((level, index) => {
            const fieldName = fieldNames[level] || level;
            const selectId = `${$container.attr('id')}_${level}`;
            const isRequired = $container.data('required') || false;
            
            const selectHtml = `
                <div class="nm-geo-level" data-level="${level}">
                    <label for="${selectId}">${fieldName}:</label>
                    <select 
                        id="${selectId}" 
                        name="${level}" 
                        class="nm-geo-select" 
                        data-level="${level}"
                        data-field-name="${fieldName}"
                        ${isRequired ? 'required' : ''}
                        ${index > 0 ? 'disabled' : ''}
                    >
                        <option value="">Seleccionar ${fieldName.toLowerCase()}...</option>
                    </select>
                    <div class="nm-geo-loading" style="display: none;">
                        <span>Cargando...</span>
                    </div>
                    <div class="nm-geo-error" style="display: none; color: red;">
                        <span></span>
                        <button type="button" class="nm-retry-btn">Reintentar</button>
                    </div>
                </div>
            `;
            
            $container.append(selectHtml);
        });

        // Load first level (admin1 for the country)
        if (levels.length > 0) {
            loadGeoData($container, country, null, levels[0], geonamesUser);
        }

        // Setup change handlers
        $container.on('change', '.nm-geo-select', function() {
            handleSelectChange($container, $(this), config);
        });

        // Setup retry handlers
        $container.on('click', '.nm-retry-btn', function() {
            const $level = $(this).closest('.nm-geo-level');
            const level = $level.data('level');
            const $select = $level.find('.nm-geo-select');
            
            // Find parent value
            const parentValue = getParentValue($container, level, config.levels);
            loadGeoData($container, country, parentValue, level, geonamesUser);
        });
    }

    function handleSelectChange($container, $select, config) {
        const currentLevel = $select.data('level');
        const selectedValue = $select.val();
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
        }

        // Load next level if there is one and a value is selected
        if (selectedValue && currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            loadGeoData($container, config.country, selectedValue, nextLevel, config.geonames_user);
        }
    }

    function getParentValue($container, currentLevel, levels) {
        const currentIndex = levels.indexOf(currentLevel);
        if (currentIndex <= 0) return null;
        
        const parentLevel = levels[currentIndex - 1];
        return $container.find(`[data-level="${parentLevel}"]`).find('.nm-geo-select').val();
    }

    function loadGeoData($container, country, parentCode, level, username) {
        const $levelContainer = $container.find(`[data-level="${level}"]`);
        const $select = $levelContainer.find('.nm-geo-select');
        
        // Build cache key
        const cacheKey = `${country}_${parentCode || 'root'}_${level}`;
        
        // Check cache first
        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION)) {
            populateSelect($select, cache[cacheKey].data);
            return;
        }

        // Avoid duplicate requests
        if (requestQueue[cacheKey]) {
            return;
        }

        showLoading($levelContainer);
        hideError($levelContainer);
        
        // Build GeoNames API URL
        let apiUrl;
        if (!parentCode) {
            // First level - get admin1 divisions for country
            apiUrl = `${GEONAMES_BASE_URL}childrenJSON?geonameId=${getCountryGeonameId(country)}&username=${username}`;
        } else {
            // Subsequent levels - get children of selected area
            apiUrl = `${GEONAMES_BASE_URL}childrenJSON?geonameId=${parentCode}&username=${username}`;
        }

        requestQueue[cacheKey] = true;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            timeout: REQUEST_TIMEOUT,
            success: function(response) {
                delete requestQueue[cacheKey];
                hideLoading($levelContainer);
                
                if (response && response.geonames) {
                    // Filter by feature class/code if needed
                    let filteredData = response.geonames;
                    
                    // For administrative divisions, filter by feature code
                    if (level === 'admin1') {
                        filteredData = filteredData.filter(item => 
                            item.fcode === 'ADM1' || item.fcode === 'ADMD'
                        );
                    } else if (level === 'admin2') {
                        filteredData = filteredData.filter(item => 
                            item.fcode === 'ADM2' || item.fcode === 'ADMD'
                        );
                    } else if (level === 'admin3') {
                        filteredData = filteredData.filter(item => 
                            item.fcode === 'ADM3' || item.fcode === 'ADMD' || item.fcode === 'PPL' || item.fcode === 'PPLA'
                        );
                    }
                    
                    // Sort alphabetically
                    filteredData.sort((a, b) => a.name.localeCompare(b.name));
                    
                    // Cache the result
                    cache[cacheKey] = {
                        data: filteredData,
                        timestamp: Date.now()
                    };
                    
                    populateSelect($select, filteredData);
                } else {
                    showError($levelContainer, 'No se encontraron datos para esta ubicación');
                }
            },
            error: function(xhr, status, error) {
                delete requestQueue[cacheKey];
                hideLoading($levelContainer);
                
                let errorMessage = 'Error al cargar los datos';
                if (status === 'timeout') {
                    errorMessage = 'Tiempo de espera agotado. Verifique su conexión a internet';
                } else if (xhr.status === 429) {
                    errorMessage = 'Demasiadas solicitudes. Intente nuevamente en unos minutos';
                } else if (xhr.status === 401) {
                    errorMessage = 'Usuario GeoNames no válido';
                }
                
                showError($levelContainer, errorMessage);
                console.error('GeoNames API Error:', error, xhr.responseText);
            }
        });
    }

    function populateSelect($select, data) {
        const fieldName = $select.data('field-name');
        $select.empty().append(`<option value="">Seleccionar ${fieldName.toLowerCase()}...</option>`);
        
        data.forEach(item => {
            $select.append(`<option value="${item.geonameId}">${item.name}</option>`);
        });
        
        $select.prop('disabled', false);
    }

    function showLoading($levelContainer) {
        $levelContainer.find('.nm-geo-loading').show();
        $levelContainer.find('.nm-geo-select').prop('disabled', true);
    }

    function hideLoading($levelContainer) {
        $levelContainer.find('.nm-geo-loading').hide();
    }

    function showError($levelContainer, message) {
        const $error = $levelContainer.find('.nm-geo-error');
        $error.find('span').text(message);
        $error.show();
    }

    function hideError($levelContainer) {
        $levelContainer.find('.nm-geo-error').hide();
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
            'CL': '3895114'  // Chile
        };
        
        return countryIds[countryCode] || countryCode;
    }

    // Function to get selected values for form submission
    function getSelectedValues($container) {
        const values = {};
        const config = getFieldConfig($container);
        
        if (!config) return values;
        
        config.levels.forEach(level => {
            const $select = $container.find(`[data-level="${level}"]`).find('.nm-geo-select');
            const selectedValue = $select.val();
            const selectedText = $select.find('option:selected').text();
            const fieldName = config.field_names[level] || level;
            
            if (selectedValue) {
                // Save both ID and name, but use custom field names
                values[`${fieldName.toLowerCase().replace(/\s+/g, '_')}_id`] = selectedValue;
                values[`${fieldName.toLowerCase().replace(/\s+/g, '_')}`] = selectedText;
            }
        });
        
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
        
        $form.find('.nm-geographic-selector').each(function() {
            const $container = $(this);
            const values = getSelectedValues($container);
            
            // Add hidden inputs for each selected value
            Object.keys(values).forEach(key => {
                if (values[key]) {
                    $form.append(`<input type="hidden" name="${key}" value="${values[key]}">`);
                }
            });
        });
    });

})(jQuery);
