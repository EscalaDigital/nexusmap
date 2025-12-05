# Guía de Seguridad del Formulario - NexusMap

## Para Administradores

### Configuración de Campos Obligatorios

Cuando creas un formulario en el constructor, ahora puedes marcar campos como obligatorios:

1. En el constructor de formularios (Form Builder)
2. Selecciona el campo que deseas hacer obligatorio
3. Activa la opción "Campo obligatorio" en las configuraciones del campo
4. Los usuarios verán un asterisco (*) rojo junto al nombre del campo
5. El formulario no se enviará si estos campos están vacíos

### Monitoreo de Seguridad

**Revisar intentos de envío bloqueados:**
- Los intentos bloqueados por rate limiting se registran en los logs de PHP
- Busca mensajes como "Ha excedido el límite de envíos"

**Revisar archivos rechazados:**
- Los archivos rechazados por tipo o tamaño se registran en los logs
- Busca mensajes de error con "excede el tamaño máximo" o "no es un tipo de archivo válido"

### Límites de Archivos

**Límites por defecto:**
- Imágenes: 5 MB máximo
- Documentos: 10 MB máximo
- Audio: 10 MB máximo

**Tipos permitidos:**
- Imágenes: JPG, JPEG, PNG, GIF, WebP
- Documentos: PDF, DOC, DOCX, XLS, XLSX, TXT, RTF
- Audio: MP3, WAV, OGG, FLAC, M4A, AAC

### Rate Limiting

**Configuración actual:**
- 3 envíos máximos por IP
- Ventana de tiempo: 5 minutos
- Después de 5 minutos, el contador se reinicia automáticamente

Si necesitas ajustar estos valores, edita el archivo `public/class-nm-public.php` en la función `submit_form()`:

```php
// Cambiar el número 3 para ajustar la cantidad de envíos permitidos
if ($recent_submissions !== false && $recent_submissions >= 3) {

// Cambiar 5 * MINUTE_IN_SECONDS para ajustar el tiempo de espera
set_transient($transient_key, $count, 5 * MINUTE_IN_SECONDS);
```

## Para Usuarios Finales

### Cómo Usar el Formulario de Forma Segura

1. **Campos obligatorios:**
   - Los campos con asterisco rojo (*) son obligatorios
   - El formulario no se enviará si no los completas

2. **Subida de archivos:**
   - Verifica que tu archivo no exceda los límites de tamaño
   - Solo se aceptan los tipos de archivo listados en cada campo
   - Si tu archivo es rechazado, recibirás un mensaje indicando el problema

3. **Límite de envíos:**
   - Puedes enviar el formulario hasta 3 veces cada 5 minutos
   - Si excedes este límite, espera unos minutos e intenta nuevamente
   - Esto previene el spam y protege el sistema

4. **Mensajes de error:**
   - Los mensajes de error son descriptivos y te indican qué corregir
   - Lee cuidadosamente el mensaje y realiza los ajustes necesarios

### Solución de Problemas Comunes

**"El archivo excede el tamaño máximo permitido"**
- Reduce el tamaño de tu archivo antes de subirlo
- Para imágenes: usa herramientas de compresión online
- Para documentos: verifica que no contengan imágenes de alta resolución

**"No es un tipo de archivo válido"**
- Verifica que la extensión del archivo coincida con los tipos permitidos
- No cambies la extensión manualmente, usa el formato correcto desde el inicio

**"Ha excedido el límite de envíos"**
- Espera 5 minutos antes de intentar enviar nuevamente
- Si necesitas enviar múltiples veces, contacta al administrador

**"Por favor, dibuje al menos una figura en el mapa"**
- Usa las herramientas de dibujo del mapa para marcar tu ubicación
- Puedes dibujar puntos, líneas o polígonos según lo requiera el formulario

## Características de Seguridad Activas

### ✅ Protección Implementada

1. **Protección CSRF:** Previene envíos maliciosos desde otros sitios
2. **Rate Limiting:** Limita la cantidad de envíos por IP
3. **Validación de archivos:** 
   - Verifica tipos MIME reales (no solo extensiones)
   - Limita tamaños de archivo
   - Elimina archivos maliciosos automáticamente
4. **Sanitización de datos:** Limpia todos los datos antes de guardarlos
5. **Validación de coordenadas:** Verifica que las coordenadas del mapa sean válidas
6. **Prevención de XSS:** Protege contra inyección de código malicioso
7. **Campos obligatorios:** Asegura que se complete la información necesaria

### 🔒 Buenas Prácticas de Seguridad

**Para administradores:**
- Revisa periódicamente las entradas guardadas
- Mantén WordPress y el plugin actualizados
- Configura backups automáticos de la base de datos
- Monitorea el uso de almacenamiento de archivos
- Revisa los logs de errores regularmente

**Para usuarios:**
- No intentes subir archivos ejecutables o sospechosos
- Verifica que tus archivos estén libres de virus antes de subirlos
- No compartas el enlace del formulario de forma irresponsable
- Reporta cualquier comportamiento extraño del formulario

## Soporte

Si encuentras problemas de seguridad o tienes preguntas:

**Soporte Técnico:**
- Web: https://escaladigital.es
- Email: soporte@escaladigital.es

**Reportar Vulnerabilidades:**
- Email: security@escaladigital.es
- Respuesta garantizada en 48 horas

---

**Nota:** Este documento es complementario al archivo SECURITY.md que contiene información técnica detallada para desarrolladores.
