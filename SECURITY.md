# Mejoras de Seguridad - NexusMap Plugin

## Resumen

Este documento describe las mejoras de seguridad implementadas en el sistema de formularios de NexusMap para proteger contra vulnerabilidades comunes y ataques maliciosos.

## Mejoras Implementadas

### 1. Protección CSRF (Cross-Site Request Forgery)

**Implementación:**
- Uso de nonces de WordPress (`wp_nonce_field`) en todos los formularios
- Verificación de nonces mediante `check_ajax_referer()` en el backend
- Soporte para usuarios logueados y no logueados mediante `wp_ajax` y `wp_ajax_nopriv`

**Archivos modificados:**
- `public/class-nm-public.php` - Línea de verificación de nonce en `submit_form()`
- `public/views/form-display.php` - Campo de nonce en el formulario

### 2. Rate Limiting (Limitación de Envíos)

**Implementación:**
- Sistema de límite de envíos por IP (máximo 3 envíos cada 5 minutos)
- Uso de transients de WordPress para almacenar contadores temporales
- Detección de IP real del cliente incluso detrás de proxies

**Configuración:**
- Límite: 3 envíos por IP
- Ventana de tiempo: 5 minutos
- Mensaje de error personalizado al exceder el límite

**Funciones:**
- `get_client_ip()` - Obtiene la IP real del cliente
- Rate limiting en `submit_form()` - Líneas iniciales del método

### 3. Validación de Tamaño de Archivos

**Implementación Frontend (JavaScript):**
- Validación antes del envío del formulario
- Límites por tipo de archivo:
  - Imágenes: 5 MB
  - Documentos: 10 MB
  - Audio: 10 MB
- Mensajes de error descriptivos

**Implementación Backend (PHP):**
- Doble validación en el servidor
- Función `validate_file_size($file_size, $max_size_mb)`
- Rechazo de archivos que excedan los límites

**Archivos:**
- `public/js/form.js` - Validación frontend (líneas 251-285)
- `public/class-nm-public.php` - Función `validate_file_size()`

### 4. Validación de Tipos MIME

**Implementación:**
- Verificación de tipos MIME reales (no solo extensiones)
- Uso de `finfo_file()` para detectar el tipo real del archivo
- Eliminación automática de archivos que no pasen la validación
- Listas blancas de tipos MIME permitidos por categoría

**Tipos permitidos:**
- **Imágenes:** JPEG, PNG, GIF, WebP
- **Documentos:** PDF, DOC, DOCX, XLS, XLSX, TXT, RTF
- **Audio:** MP3, WAV, OGG, FLAC, M4A, AAC

**Función:**
- `validate_file_mime($file_path, $allowed_mimes)` en `public/class-nm-public.php`

### 5. Sanitización de Datos

**Implementación:**

**Campos de texto:**
- `sanitize_text_field()` para campos normales
- `esc_url_raw()` para URLs
- `esc_html()` para contenido mostrado al usuario

**GeoJSON/Map Data:**
- Validación de estructura JSON
- Validación de tipo Feature
- Sanitización recursiva de coordenadas con `sanitize_coordinates()`
- Límite de coordenadas a rangos válidos (-180 a 180)

**Propiedades:**
- Sanitización recursiva con `sanitize_properties_recursive()`
- `sanitize_key()` para nombres de propiedades
- Validación y sanitización de URLs en propiedades

**Funciones:**
- `sanitize_coordinates($coords)`
- `sanitize_properties_recursive($data)`

### 6. Campos Obligatorios

**Implementación:**
- Atributo HTML5 `required` en campos marcados como obligatorios
- Indicador visual (*) en etiquetas de campos requeridos
- Validación HTML5 automática del navegador
- Estilos CSS para retroalimentación visual

**Soporte de campos:**
- Text, Number, URL, Date, Range
- Textarea
- Select
- File (imagen y documento)

**Archivos:**
- `public/views/form-display.php` - Atributos required
- `public/css/public.css` - Estilos para campos requeridos

### 7. Prevención de XSS (Cross-Site Scripting)

**Implementación:**
- Escape de toda salida con funciones de WordPress:
  - `esc_html()` - Para texto
  - `esc_attr()` - Para atributos HTML
  - `esc_url()` / `esc_url_raw()` - Para URLs
  - `wp_kses_post()` - Para contenido HTML permitido
- Sanitización de entrada antes de almacenar
- Validación de estructura de datos JSON

### 8. Prevención de Path Traversal

**Implementación:**
- Validación estricta de nombres de plantillas de campos
- No se permite acceso directo a archivos mediante entrada del usuario
- Rutas de archivos predefinidas y validadas

### 9. Validación de Entrada Frontend

**Implementación:**
- Validación de tipos de archivo antes del envío
- Validación de tamaño de archivo antes del envío
- Prevención de envíos múltiples (deshabilitación del botón)
- Indicador visual durante el envío (opacidad reducida)
- Mensajes de error descriptivos

**Archivo:**
- `public/js/form.js` - Validaciones frontend

## Recomendaciones Adicionales

### Configuración del Servidor

1. **Límites de PHP:**
   ```ini
   upload_max_filesize = 10M
   post_max_size = 12M
   max_execution_time = 30
   ```

2. **Permisos de Archivos:**
   - Carpeta uploads: 755
   - Archivos subidos: 644

3. **Headers de Seguridad:**
   ```apache
   Header set X-Content-Type-Options "nosniff"
   Header set X-Frame-Options "SAMEORIGIN"
   Header set X-XSS-Protection "1; mode=block"
   ```

### Monitoreo

1. **Logs de Errores:**
   - Revisar regularmente los logs de PHP
   - Monitorear intentos de subida de archivos rechazados
   - Alertas sobre rate limiting activado

2. **Auditoría:**
   - Revisar entradas guardadas periódicamente
   - Verificar archivos subidos en busca de anomalías
   - Monitorear uso de almacenamiento

### Backup y Recuperación

1. **Respaldos:**
   - Backup diario de la base de datos
   - Backup semanal de archivos subidos
   - Retención de respaldos por 30 días

2. **Plan de Respuesta:**
   - Procedimiento para eliminar entradas maliciosas
   - Procedimiento para bloquear IPs
   - Proceso de restauración desde backup

## Pruebas de Seguridad Realizadas

- ✅ Intento de subir archivos con extensiones falsas
- ✅ Intento de subir archivos que excedan los límites
- ✅ Envíos múltiples desde la misma IP
- ✅ Inyección de código JavaScript en campos de texto
- ✅ Manipulación de datos GeoJSON malformados
- ✅ Envío sin nonce válido
- ✅ Envío sin dibujar geometría en el mapa

## Contacto

Para reportar problemas de seguridad, contactar a:
- Email: security@escaladigital.es
- Web: https://escaladigital.es

## Historial de Cambios

**Versión 1.1.0** (Diciembre 2025)
- Implementadas todas las mejoras de seguridad documentadas
- Rate limiting por IP
- Validación MIME avanzada
- Sanitización mejorada de datos

---

**Última actualización:** Diciembre 5, 2025
**Autor:** Escala Digital
