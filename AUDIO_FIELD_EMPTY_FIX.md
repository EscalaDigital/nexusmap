# Corrección del Campo de Audio Vacío

## Problema Identificado
El campo de audio se guardaba vacío (`nm_audio_data: ""`) en la base de datos porque:

1. **Conflicto de nombres:** El input file y el input hidden tenían nombres conflictivos
2. **JavaScript no llenaba correctamente el campo hidden**
3. **El procesamiento del servidor no detectaba correctamente los archivos de audio**

## Solución Implementada

### 1. Separación de Nombres de Campos
**Archivo:** `public/views/form-display.php`

**Antes:**
```php
<input type="file" name="audio_field" ...>
<input type="hidden" name="audio_field_data" ...>
```

**Después:**
```php
<input type="file" name="audio_field_file" ...>
<input type="hidden" name="audio_field" ...>
```

### 2. Actualización del Procesamiento del Servidor
**Archivo:** `public/class-nm-public.php`

- **Nuevo manejo de archivos separados:** Los archivos de audio ahora usan `{field_name}_file`
- **Fallback mejorado:** Si no hay datos en el campo hidden, busca directamente el archivo
- **Detección mejorada:** La sección de "rescate" detecta archivos `_file` como audio

```php
// Buscar archivo en {field_name}_file
$file_field_name = $html_name . '_file';
if (isset($_FILES[$file_field_name]) && $_FILES[$file_field_name]['error'] === UPLOAD_ERR_OK) {
    // Procesar archivo de audio
}
```

### 3. Mejoras en JavaScript
**Archivo:** `public/js/public.js`

- **Validación mejorada:** Limpia el campo hidden si no hay archivo
- **Manejo correcto:** Llena siempre el campo hidden con el estado actual
- **Eliminación mejorada:** Limpia correctamente todos los estados

```javascript
// Marcar que hay un archivo cargado en el campo hidden
$field.find('.nm-audio-data').val('upload:' + file.name);

// Si no hay archivo, limpiar el campo hidden
if (!file) {
    $field.find('.nm-audio-data').val('');
}
```

### 4. Detección Mejorada en Sección de Rescate
**Archivo:** `public/class-nm-public.php`

```php
// Verificar si el nombre del campo termina en '_file' (indica campo de audio)
if (strpos($inkey, '_file') !== false) {
    $base_field = str_replace('_file', '', $inkey);
    // Verificar si existe el campo de datos correspondiente
    if (isset($_POST[$base_field])) {
        $is_audio_file = true;
    }
}
```

## Flujo de Datos Corregido

### Para Archivo Subido:
1. Usuario selecciona archivo → `audio_field_file` (FormData)
2. JavaScript detecta archivo → `audio_field = "upload:filename.mp3"` (hidden)
3. Servidor recibe ambos campos
4. Procesa archivo usando `wp_handle_upload()`
5. Guarda URL en `nm_audio_field`

### Para Grabación:
1. Usuario graba audio → JavaScript convierte a base64
2. JavaScript guarda → `audio_field = "recording:data:audio/wav;base64,..."`
3. Servidor detecta prefijo "recording:"
4. Convierte base64 a archivo
5. Guarda URL en `nm_audio_field`

## Resultado Esperado

**Antes (problema):**
```
nm_audio_data: ""
```

**Después (corregido):**
```
nm_audio: "https://example.com/wp-content/uploads/2025/06/audio_filename_1718884800.mp3"
```

## Archivos Modificados
1. ✅ `public/views/form-display.php` - Separación de nombres de campos
2. ✅ `public/class-nm-public.php` - Procesamiento mejorado del servidor
3. ✅ `public/js/public.js` - Manejo mejorado de JavaScript
4. ✅ `public/js/form.js` - Validación actualizada

## Verificación
Para verificar que funciona:
1. Añadir campo de audio al formulario
2. Subir un archivo MP3
3. Enviar formulario
4. Verificar en la base de datos que `nm_audio` contiene la URL del archivo

El campo de audio ahora debería guardar correctamente la URL del archivo en lugar de estar vacío.
