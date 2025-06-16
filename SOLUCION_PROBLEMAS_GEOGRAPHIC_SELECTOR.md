# Solución de Problemas - Geographic Selector

## Problemas Identificados y Solucionados

### 1. Error: Template "hierarchical-select.php" no encontrado

**Problema**: El sistema intentaba incluir un archivo de template que no existe.

**Causa**: Los datos guardados tenían un tipo de campo incorrecto o corrupto.

**Solución**:
- ✅ Añadida validación en `form-builder.php` para verificar que los templates existan antes de incluirlos
- ✅ Añadidos mensajes de error informativos cuando falta un template
- ✅ Añadidos logs de debug para identificar campos problemáticos

### 2. Error 400 en petición AJAX al guardar formulario

**Problema**: La petición AJAX fallaba con error 400 (Bad Request).

**Causa**: 
- Campos sin propiedades obligatorias (`name`, `label`, `type`)
- Manejo inadecuado de errores en el servidor
- Falta de validación de datos antes del envío

**Solución**:
- ✅ Mejorada validación en `admin.js` antes de enviar datos
- ✅ Añadida generación automática de `name` y `label` si faltan
- ✅ Mejorado manejo de errores en `NM_Ajax_Handlers.php`
- ✅ Añadido mejor logging para debug
- ✅ Mejorado el método `save_form` en el modelo para retornar valores útiles

### 3. Configuración del Geographic Selector no se preserva

**Problema**: La configuración se perdía al guardar y recargar el formulario.

**Solución**:
- ✅ Ya solucionado en iteraciones anteriores
- ✅ Añadida validación adicional para asegurar integridad de datos

## Archivos Modificados en Esta Iteración

### 1. `includes/models/class-nm-model.php`
- Añadido logging de debug para campos procesados
- Mejorado el método `save_form` para retornar ID o false
- Añadido manejo de errores de base de datos

### 2. `admin/views/form-builder.php`
- Añadida validación de existencia de templates antes de incluirlos
- Añadidos mensajes de error informativos
- Aplicado a todas las secciones (Form A, Form B, Form único)

### 3. `admin/NM_Ajax_Handlers.php`
- Mejorada validación de datos entrantes
- Añadida generación automática de propiedades faltantes
- Mejorado manejo de errores y logging
- Añadida validación de formato de datos

### 4. `admin/js/admin.js`
- Añadida validación pre-envío de datos
- Mejorados valores por defecto para campos
- Añadido manejo detallado de errores AJAX
- Añadidos logs de debug más informativos

### 5. Archivos de Debug Creados
- `debug-geographic-selector.php` - Para verificar estructura de archivos
- `test-geographic-selector-fix.html` - Documentación de correcciones

## Cómo Verificar las Correcciones

### Paso 1: Verificar Templates
Ejecuta: `http://localhost/nexusmap/wp-content/plugins/nexusmap/debug-geographic-selector.php`

### Paso 2: Probar el Constructor de Formularios
1. Ve al admin de WordPress → NexusMap
2. Arrastra un "Selector Geográfico" al formulario
3. Configúralo (usuario GeoNames, país, niveles)
4. Guarda el formulario
5. Verifica que no hay errores en la consola del navegador

### Paso 3: Verificar Persistencia
1. Recarga la página del constructor
2. Verifica que la configuración se mantiene
3. Verifica que no aparecen errores de templates faltantes

### Paso 4: Probar en Frontend
1. Ve a una página/post donde muestres el formulario
2. Verifica que el selector geográfico aparece correctamente
3. Prueba la funcionalidad de selección

## Debug y Troubleshooting

### Si aún hay errores:

1. **Activa WP_DEBUG** en `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

2. **Revisa los logs**:
   - Consola del navegador (F12)
   - Archivo de logs de WordPress: `/wp-content/debug.log`
   - Logs del servidor web

3. **Verifica permisos de archivos**:
   - Todos los archivos PHP deben ser legibles
   - Directorio de uploads debe ser escribible

4. **Verifica la base de datos**:
   - Tabla `wp_nm_forms` debe existir
   - Debe tener permisos de escritura

## Próximos Pasos

Si los problemas persisten:
1. Revisar logs específicos generados
2. Verificar conflictos con otros plugins
3. Probar en entorno de desarrollo limpio
4. Verificar configuración de servidor web

---

**Fecha de corrección**: <?php echo date('Y-m-d H:i:s'); ?>
**Estado**: Problemas principales solucionados
