# Debug del Error del Servidor - Campo de Audio

## Problema Reportado
Error: "Error al enviar el formulario: Error desconocido en el servidor"

## Análisis del Problema
El error ocurre después de implementar los cambios para corregir el campo de audio vacío. Posibles causas:

1. **Conflicto en el procesamiento de campos**
2. **Error en la función save_audio_recording**
3. **Problema con los nombres de campos**
4. **Exception no capturada**

## Cambios Realizados para Debuggear

### 1. Logging Extensivo
```php
error_log("Processing audio field '{$html_name}', data: '{$audio_data}'");
error_log("Looking for file field: '{$file_field_name}'");
error_log("FILES data: " . print_r($_FILES, true));
error_log("POST data: " . print_r($_POST, true));
```

### 2. Try-Catch Añadido
```php
try {
    // Código de procesamiento de audio
} catch (Exception $e) {
    error_log("Exception in audio processing: " . $e->getMessage());
    wp_send_json_error('Error interno al procesar audio: ' . $e->getMessage());
    wp_die();
}
```

### 3. Marcado de Campos Procesados
```php
// También marcar el campo de archivo asociado como procesado
$already_processed[] = $html_name . '_file';
```

### 4. Simplificación de la Lógica
- Removida la lógica compleja de grabación temporalmente
- Focus en solo procesar archivos subidos
- Mejor manejo de errores

## Para Debuggear

### 1. Verificar Logs de WordPress
```bash
# En WordPress debug log (wp-content/debug.log)
tail -f wp-content/debug.log
```

### 2. Verificar Logs del Servidor
```bash
# En error log de Apache/Nginx
tail -f /var/log/apache2/error.log
# o
tail -f /var/log/nginx/error.log
```

### 3. Habilitar Debug en WordPress
```php
// En wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Datos que se Logearán

### Datos POST:
- Valores de todos los campos del formulario
- Estado del campo de audio
- Campos relacionados con archivos

### Datos FILES:
- Información de archivos subidos
- Errores de upload
- Tipos MIME detectados

### Flujo de Procesamiento:
- Qué tipo de procesamiento se activa
- Resultados de wp_handle_upload
- URLs generadas

## Posibles Soluciones

### Si el error es por campo vacío:
```php
// Permitir campos de audio vacíos
if (empty($audio_data) && !isset($_FILES[$file_field_name])) {
    // No procesar, dejar vacío
    continue;
}
```

### Si el error es por conflicto de nombres:
```php
// Asegurar que no se procese dos veces
$already_processed[] = $html_name;
$already_processed[] = $html_name . '_file';
```

### Si el error es por permisos de archivo:
```php
// Verificar permisos de directorio de uploads
$upload_dir = wp_upload_dir();
if (!is_writable($upload_dir['path'])) {
    wp_send_json_error('Directorio de uploads no escribible');
}
```

## Pasos para Resolver

1. **Revisar logs** para identificar la causa exacta
2. **Simplificar el código** removiendo funcionalidad compleja
3. **Probar con diferentes escenarios**:
   - Formulario sin campo de audio
   - Formulario con campo de audio vacío
   - Formulario con archivo subido
4. **Verificar que no hay conflictos** con otros campos

## Estado Actual
- ✅ Logging extensivo añadido
- ✅ Try-catch implementado
- ✅ Lógica simplificada
- ⏳ Esperando logs para identificar causa exacta

El próximo paso es revisar los logs generados para identificar exactamente dónde y por qué falla el procesamiento.
