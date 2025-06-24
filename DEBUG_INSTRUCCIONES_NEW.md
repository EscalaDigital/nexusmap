# Instrucciones de Debug para Galería NexusMap

## 🔍 El Problema
Las tarjetas de la galería muestran "Sin título" e imagen genérica, pero los datos están guardados en la base de datos.

## 📊 Estado Actual
- ✅ Sistema de separación de campos (Image Upload / Document Upload) implementado
- ✅ Validaciones frontend y backend funcionando
- ✅ Configuración de galería guardándose en `wp_options`
- ✅ Función `get_entry_field_value()` corregida para buscar en `map_data` → `properties`
- ✅ Debug logging añadido en múltiples puntos
- ✅ Scripts de debug directo creados
- ❓ **PENDIENTE**: Verificar si la extracción de datos funciona correctamente

## 🚀 Métodos de Debug Disponibles

### Método 1: Debug Directo (Recomendado)
Accede a: `http://localhost/nexusmap/wp-content/plugins/nexusmap/debug_gallery.php`

Este script muestra:
- Configuración actual de la galería
- Estructura real de las entradas en la base de datos
- Decodificación de `map_data`
- Prueba de extracción de campos
- Diagnóstico completo del problema

### Método 2: Logs de WordPress
1. Verificar configuración de WordPress en `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

2. Ejecutar script de verificación de logs:
```powershell
# En PowerShell (Windows)
.\check_logs.ps1
```

3. O manualmente revisar: `/wp-content/debug.log`

### Método 3: Debugging Manual
1. Limpiar logs anteriores
2. Visitar la página con el shortcode `[nm_entries_list]`
3. Revisar los logs generados

## 🔧 Qué Buscar

### En debug_gallery.php:
- ✅ **Configuración de Galería**: Campos seleccionados no vacíos
- ✅ **Entradas**: Datos presentes y decodificables
- ✅ **Extracción**: Valores extraídos correctamente
- ❌ **Problemas**: Errores de JSON, campos faltantes, nombres incorrectos

### En logs de WordPress:
- `=== GALLERY CONFIGURATION ===` - Configuración de la galería
- `=== DEBUG ENTRY ===` - Datos raw de cada entrada
- `=== GET FIELD VALUE ===` - Proceso de extracción de campos
- `=== RENDER GALLERY CARD ===` - Renderización de cada tarjeta

## 📋 Próximos Pasos Según Resultados

### ❌ Si la configuración está vacía:
1. Ir a **NexusMap > Galería**
2. Configurar los campos necesarios
3. Guardar configuración
4. Volver a probar

### ❌ Si los datos no se extraen:
1. Verificar nombres de campo en la configuración vs datos reales
2. Revisar estructura de `map_data` en debug_gallery.php
3. Ajustar nombres de campo si no coinciden

### ❌ Si hay errores de JSON:
1. Revisar formato de datos en la base de datos
2. Verificar que `map_data` sea JSON válido
3. Revisar proceso de guardado de formularios

### ✅ Si todo funciona en debug pero no en frontend:
1. Revisar CSS de las tarjetas
2. Verificar errores JavaScript en navegador (F12)
3. Comprobar funciones de renderizado

## 🛠️ Archivos de Debug Creados

- `debug_gallery.php` - Script de debug directo y completo
- `check_logs.ps1` - Script PowerShell para revisar logs
- `check_logs.sh` - Script Bash para revisar logs (alternativo)

## 📞 Soporte

Si después de usar estos métodos el problema persiste, proporciona:
1. Captura de pantalla de debug_gallery.php
2. Últimos 50 líneas del debug.log relacionadas con NexusMap
3. Configuración actual de la galería (pantalla de admin)
