# Guía de Diagnóstico - Selector Geográfico con Idiomas

## Problema Reportado
El formulario no se guarda en la base de datos después de configurar el selector geográfico con idioma.

## Pasos para Diagnosticar

### 1. Verificar en la Consola del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Configura un campo geográfico:
   - Arrastra el campo al formulario
   - Configúralo con usuario GeoNames, idioma, país y niveles
   - Haz clic en "Guardar Configuración"
4. Intenta guardar el formulario
5. Revisa los logs en la consola

### 2. Verificar Configuración del Campo
Después de configurar un campo geográfico, ejecuta en la consola:
```javascript
validateGeographicFieldSave()
```

Esto mostrará información detallada sobre la configuración de todos los campos geográficos.

### 3. Logs Esperados
Deberías ver logs como:
```
Saving geographic config: {type: "geographic-selector", ...}
Geographic field found: geographic-selector
Parsed config data: {...}
Final field config: {language: "es", country: "ES", ...}
```

### 4. Verificar en el Backend
Revisa los logs de WordPress en `/wp-content/debug.log` para ver:
```
save_form method called
Form data received: Array(...)
Number of fields to save: X
Save result: success
```

## Posibles Causas y Soluciones

### A. El campo hidden no se actualiza
**Síntoma**: No aparece "Hidden field value after setting" en la consola
**Solución**: Verificar que el selector `.nm-field-config` existe

### B. La configuración no se serializa correctamente
**Síntoma**: Error "Error parsing geographic-selector config"
**Solución**: Verificar formato JSON en el campo hidden

### C. El idioma no se guarda
**Síntoma**: El idioma aparece como undefined en los logs
**Solución**: Verificar que el selector de idioma tiene el valor correcto

### D. Error en el AJAX
**Síntoma**: Error en la consola durante el guardado
**Solución**: Verificar permisos y nonce de seguridad

## Verificaciones Manuales

### 1. Comprobar Elemento Hidden
En la consola del navegador:
```javascript
$('.nm-field-config').each(function(i, el) {
    console.log('Config ' + i + ':', $(el).val());
});
```

### 2. Comprobar Configuración Guardada
En la base de datos, tabla `wp_nm_forms`, verificar que el campo `form_data` contiene la configuración del campo geográfico con el idioma.

### 3. Verificar Usuario GeoNames
```javascript
console.log('GeoNames user:', nmAdmin.geonames_user);
```

## Archivos Modificados
- `geographic-selector.php` - Template con selector de idioma
- `geographic-selector-config.js` - JavaScript de configuración
- `NM_Ajax_Handlers.php` - Backend con soporte de idioma
- `geographic-selector.js` - Frontend con idioma
- `admin.js` - Procesamiento de formularios

## Contacto para Soporte
Si el problema persiste, proporciona:
1. Los logs de la consola del navegador
2. Los logs de WordPress debug.log
3. El contenido de la tabla wp_nm_forms
4. Los pasos exactos realizados
