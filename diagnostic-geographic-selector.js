/**
 * Diagnostic Script for Geographic Selector Frontend Issues
 * 
 * Ejecuta este script en la consola del navegador de la página donde debería
 * aparecer el selector geográfico para diagnosticar problemas.
 */

console.log('🔧 DIAGNOSTIC SCRIPT - Geographic Selector Frontend');
console.log('================================================');

// 1. Verificar que jQuery está cargado
if (typeof jQuery === 'undefined') {
    console.error('❌ jQuery no está cargado');
} else {
    console.log('✅ jQuery está cargado:', jQuery.fn.jquery);
}

// 2. Verificar que el script geographic-selector.js está cargado
if (typeof window.nmGeographicSelectorFrontend === 'undefined') {
    console.error('❌ Script geographic-selector.js no está cargado o no exporta funciones');
} else {
    console.log('✅ Script geographic-selector.js está cargado');
}

// 3. Verificar variables nmPublic
if (typeof window.nmPublic === 'undefined') {
    console.error('❌ Variables nmPublic no están definidas');
    console.log('💡 Esto indica que wp_localize_script no se ejecutó correctamente');
} else {
    console.log('✅ Variables nmPublic están definidas:', window.nmPublic);
}

// 4. Buscar elementos geographic-selector en el DOM
const $geoSelectors = jQuery('.nm-geographic-selector');
console.log('🔍 Elementos .nm-geographic-selector encontrados:', $geoSelectors.length);

if ($geoSelectors.length === 0) {
    console.error('❌ No se encontraron elementos .nm-geographic-selector');
    console.log('💡 Verifica que el template PHP está generando el HTML correctamente');
    
    // Buscar otros elementos relacionados
    const $formFields = jQuery('.nm-form-field');
    console.log('📋 Total de campos de formulario encontrados:', $formFields.length);
    
    $formFields.each(function(index) {
        const $field = jQuery(this);
        const dataType = $field.data('type');
        console.log(`   Campo ${index + 1}: tipo="${dataType}", id="${$field.attr('id')}"`);
    });
} else {
    // Analizar cada selector geográfico
    $geoSelectors.each(function(index) {
        const $container = jQuery(this);
        console.log(`\n📍 Selector Geográfico ${index + 1}:`);
        console.log('   ID:', $container.attr('id'));
        console.log('   Clases:', $container.attr('class'));
        console.log('   data-type:', $container.data('type'));
        
        // Verificar configuración
        const configData = $container.data('config');
        console.log('   data-config (raw):', configData);
        console.log('   data-config (type):', typeof configData);
        
        if (configData) {
            try {
                const parsedConfig = typeof configData === 'string' ? JSON.parse(configData) : configData;
                console.log('   Configuración parseada:', parsedConfig);
                
                // Verificar campos requeridos
                if (!parsedConfig.geonames_user) {
                    console.error('   ❌ No hay usuario GeoNames configurado');
                }
                if (!parsedConfig.country) {
                    console.error('   ❌ No hay país configurado');
                }
                if (!parsedConfig.levels || parsedConfig.levels.length === 0) {
                    console.error('   ❌ No hay niveles configurados');
                }
                if (!parsedConfig.field_names) {
                    console.error('   ❌ No hay nombres de campo configurados');
                }
                
                if (parsedConfig.geonames_user && parsedConfig.country && parsedConfig.levels && parsedConfig.field_names) {
                    console.log('   ✅ Configuración parece válida');
                }
            } catch (e) {
                console.error('   ❌ Error parseando configuración:', e);
            }
        } else {
            console.error('   ❌ No hay configuración disponible');
        }
        
        // Verificar si ya se generaron los selectores
        const $selects = $container.find('.nm-geo-select');
        console.log('   Selectores generados:', $selects.length);
        
        if ($selects.length > 0) {
            $selects.each(function(selectIndex) {
                const $select = jQuery(this);
                const level = $select.data('level');
                const fieldName = $select.data('field-name');
                const optionsCount = $select.find('option').length;
                console.log(`     Selector ${selectIndex + 1}: level="${level}", field="${fieldName}", opciones=${optionsCount}`);
            });
        }
        
        // Verificar errores
        const $errors = $container.find('.nm-geo-error:visible, .nm-geo-general-error:visible');
        if ($errors.length > 0) {
            $errors.each(function() {
                console.error('   ❌ Error visible:', jQuery(this).text());
            });
        }
    });
}

// 5. Verificar si se está ejecutando en el contexto correcto
if (window.location.protocol === 'file:') {
    console.warn('⚠️ Ejecutándose desde archivo local (file://)');
    console.log('💡 Para pruebas completas, ejecuta desde un servidor web');
}

// 6. Verificar si el formulario está en la página
const $forms = jQuery('form');
console.log('\n📝 Formularios encontrados:', $forms.length);

$forms.each(function(index) {
    const $form = jQuery(this);
    const formId = $form.attr('id');
    const formClass = $form.attr('class');
    console.log(`   Formulario ${index + 1}: id="${formId}", class="${formClass}"`);
});

// 7. Función para forzar inicialización
window.forceInitGeographicSelectors = function() {
    console.log('\n🔄 Forzando inicialización de selectores geográficos...');
    if (typeof window.nmGeographicSelectorFrontend !== 'undefined' && 
        window.nmGeographicSelectorFrontend.initializeSelectors) {
        window.nmGeographicSelectorFrontend.initializeSelectors();
    } else {
        console.error('❌ No se puede forzar inicialización - funciones no disponibles');
    }
};

console.log('\n✨ Diagnóstico completado');
console.log('💡 Si hay problemas, ejecuta: forceInitGeographicSelectors()');
console.log('================================================');
