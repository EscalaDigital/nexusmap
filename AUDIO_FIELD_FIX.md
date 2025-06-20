# Corrección del Error de Validación de Archivos de Audio

## Problema Identificado
El campo de audio mostraba el error "Tipo de archivo no permitido (solo JPG, PNG o GIF)" al subir archivos MP3, porque el código de procesamiento del servidor trataba todos los archivos con la misma validación de imágenes.

## Solución Implementada

### 1. Corrección en el Servidor (PHP)
**Archivo:** `public/class-nm-public.php`

**Problema:** En la sección de "rescate" de archivos, todos los archivos no procesados se validaban como imágenes/PDF.

**Solución:** Añadida detección inteligente de archivos de audio:
- Detección por tipo MIME del archivo
- Detección por presencia de campo `{campo}_data` (indicador de campo de audio)
- Validación separada para archivos de audio vs. archivos de imagen

```php
// Detectar si es un archivo de audio
$is_audio_file = false;
$file_mime = $_FILES[$inkey]['type'];
$audio_mimes = array('audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac');

if (in_array($file_mime, $audio_mimes) || isset($_POST[$inkey . '_data'])) {
    $is_audio_file = true;
}
```

### 2. Corrección en el Frontend (JavaScript)
**Archivo:** `public/js/form.js`

**Problema:** La validación de archivos en el frontend solo permitía imágenes.

**Solución:** Detección automática del tipo de campo:
- Detecta si el input está dentro de un `.nm-audio-field`
- Aplica validación de audio o imagen según corresponda
- Mensajes de error específicos para cada tipo

```javascript
const isAudioField = $input.closest('.nm-audio-field').length > 0;

if (isAudioField) {
    allowedMime = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac'];
    errorMessage = 'Tipo de archivo de audio no permitido. Use: MP3, WAV, OGG, FLAC, M4A, AAC.';
} else {
    allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
    errorMessage = 'Tipo de archivo no permitido (solo JPG, PNG o GIF).';
}
```

## Tipos MIME Soportados para Audio

| Formato | Extensión | Tipo MIME |
|---------|-----------|-----------|
| MP3 | .mp3 | audio/mpeg |
| WAV | .wav | audio/wav |
| OGG | .ogg | audio/ogg |
| FLAC | .flac | audio/flac |
| M4A | .m4a | audio/mp4 |
| AAC | .aac | audio/aac |

## Resultado
✅ Los archivos MP3 y otros formatos de audio ahora se procesan correctamente  
✅ Las imágenes siguen validándose como antes  
✅ Mensajes de error más específicos y útiles  
✅ Detección automática del tipo de campo  

## Pruebas Realizadas
- [x] Subir archivo MP3 en campo de audio
- [x] Subir archivo WAV en campo de audio
- [x] Subir imagen JPG en campo de imagen
- [x] Verificar mensajes de error apropiados
- [x] Confirmar que se guardan las URLs correctamente

El error está corregido y los archivos de audio ahora se procesan correctamente sin conflictos con la validación de imágenes.
