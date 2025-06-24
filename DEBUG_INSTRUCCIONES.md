# Debug: Verificar Extracción de Datos de Galería

## Pasos para Debug

### 1. Activar el debugging
He añadido logs de debugging extensivos al código. Ahora necesitas:

1. **Activar logs de WordPress** (si no están activos):
   - Añadir al `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   ```

2. **Configurar la galería** en **NexusMap > Galería**:
   - **Texto/Título**: Seleccionar `nm_titulo`
   - **Imagen**: Seleccionar `nm_imagen`
   - **Archivo**: Seleccionar `nm_documento`
   - **Guardar** la configuración

3. **Visitar la página** con el shortcode `[nm_entries_list]`

4. **Revisar los logs** en `/wp-content/debug.log`

### 2. Qué buscar en los logs

Los logs mostrarán información en este orden:

#### A) Configuración de galería:
```
=== GALLERY CONFIGURATION ===
Gallery settings from DB: Array(...)
Selected fields: Array(...)
```

**Esperado**: Debería mostrar algo como:
```php
Array(
    [selected_fields] => Array(
        [text] => nm_titulo
        [image] => nm_imagen
        [file] => nm_documento
        [audio] => 
        [date] => 
        [textarea] => 
    )
)
```

#### B) Estructura de entrada:
```
=== DEBUG ENTRY ===
Entry ID: X
Raw entry_data: a:2:{s:8:"map_data";s:687:"[{...}]";s:9:"form_type";i:0;}
Processed entry_data: Array(...)
```

**Esperado**: Debería mostrar la estructura deserializada.

#### C) Renderizado de tarjeta:
```
=== RENDER GALLERY CARD ===
Entry data received: Array(...)
Selected fields received: Array(...)
Has any field selected: YES/NO
```

#### D) Extracción de campos:
```
=== GET FIELD VALUE ===
Looking for field: nm_titulo
Entry data structure: Array(...)
Found field in properties: Migración, educación y renta...
```

### 3. Problemas posibles y soluciones

#### Si ves "Has any field selected: NO":
- La configuración de galería no se está guardando correctamente
- Ve a **NexusMap > Galería** y verifica que los campos estén seleccionados
- Guarda la configuración nuevamente

#### Si ves "No map_data found in entry_data":
- El formato de datos en la base de datos es diferente al esperado
- Verifica que `entry_data` contenga `map_data`

#### Si ves "Error decoding map_data":
- El JSON en `map_data` está corrupto
- Verifica el formato del JSON en el log

#### Si ves "Field not found in properties":
- Los nombres de campo no coinciden
- Verifica que `nm_titulo`, `nm_imagen`, `nm_documento` existan en properties

### 4. Verificación manual de la base de datos

Si los logs no son suficientes, puedes verificar directamente:

```sql
-- Verificar configuración de galería
SELECT option_value FROM wp_options WHERE option_name = 'nm_gallery_settings';

-- Verificar entradas
SELECT id, entry_data FROM wp_nm_entries WHERE status = 'approved' LIMIT 1;
```

### 5. Depuración paso a paso

1. **Verifica configuración**: Los logs deben mostrar campos seleccionados
2. **Verifica deserialización**: `entry_data` debe ser un array con `map_data`
3. **Verifica JSON**: `map_data` debe decodificarse correctamente
4. **Verifica properties**: Los campos deben existir en `features[0]['properties']`

### 6. Limpiar debugging

Una vez identificado el problema, puedes eliminar los logs:
- Buscar `error_log` en el código
- Comentar o eliminar las líneas de debugging

### 7. Problemas comunes identificados

#### Formato de configuración incorrecta:
Si la galería no está configurada, verás:
```
Selected fields: Array()
Has any field selected: NO
```

#### Formato de datos incorrecta:
Si `entry_data` no se deserializa correctamente:
```
Processed entry_data: null
No map_data found in entry_data
```

#### Nombres de campo incorrectos:
Si los nombres no coinciden:
```
Looking for field: nm_titulo
Field not found in properties
```

Ejecuta estos pasos y comparte los logs para identificar exactamente dónde está el problema.
