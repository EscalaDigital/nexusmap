# Shortcode: Lista de Entradas de NexusMap

## Descripción
El shortcode `[nm_entries_list]` permite mostrar las entradas almacenadas en la tabla `nm_entries` en formato de tarjetas. Los campos que se muestran en cada tarjeta se configuran desde el menú **"Galería"** en el panel de administración de NexusMap.

## Uso básico
```
[nm_entries_list]
```

## Configuración de campos
⚠️ **Importante**: Para que el shortcode muestre campos específicos, primero debes configurar qué campos mostrar en el menú **"Galería"** del panel de administración de WordPress.

### Cómo configurar los campos:
1. Ve a **NexusMap > Galería** en el panel de administración
2. Selecciona los campos que quieres mostrar:
   - **📝 Texto**: Se muestra como título
   - **📷 Imagen**: Se muestra como imagen destacada
   - **🎵 Audio**: Se muestra como reproductor
   - **📄 Archivo**: Se muestra como botón de descarga
   - **📅 Fecha**: Se formatea automáticamente
   - **📋 Texto largo**: Se trunca si es muy largo
3. Guarda la configuración

## Parámetros disponibles

### `per_page` (número)
- **Descripción**: Número de entradas por página
- **Por defecto**: 10
- **Ejemplo**: `[nm_entries_list per_page="8"]`

### `show_pagination` (true/false)
- **Descripción**: Mostrar controles de paginación
- **Por defecto**: "true"
- **Ejemplo**: `[nm_entries_list show_pagination="false"]`

## Ejemplos de uso

### Ejemplo básico
```
[nm_entries_list]
```
Muestra 10 entradas aprobadas con paginación. Los campos mostrados dependen de la configuración en el menú "Galería".

### Lista con menos entradas por página
```
[nm_entries_list per_page="6"]
```
Muestra 6 entradas por página con los campos configurados en "Galería".

### Lista sin paginación
```
[nm_entries_list show_pagination="false"]
```
Muestra todas las entradas aprobadas sin paginación.

## Navegación
El shortcode genera automáticamente la paginación con enlaces "Anterior" y "Siguiente", así como números de página. La navegación se realiza mediante parámetros de URL (`?entries_page=2`).

## Tipos de campos soportados

### 📝 Texto/Título
- Se muestra como título principal de la tarjeta
- Fuente: Campos de tipo `text` o `header` del formulario

### 📷 Imagen
- Se muestra como imagen destacada en la parte superior de la tarjeta
- Fuente: Campos de tipo `image` del formulario
- Formatos permitidos: JPG, JPEG, PNG, GIF, WebP
- Soporta URLs e IDs de attachments de WordPress

### 🎵 Audio
- Se muestra como reproductor de audio integrado
- Fuente: Campos de tipo `audio` del formulario
- Soporta formatos: MP3, WAV, OGG, FLAC, M4A, AAC

### 📄 Archivo/Documento
- Se muestra como botón de descarga
- Fuente: Campos de tipo `file` del formulario
- Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, RTF
- Permite descargar documentos de oficina y texto

### 📅 Fecha
- Se formatea automáticamente (DD/MM/AAAA)
- Fuente: Campos de tipo `date` del formulario
- Si no se selecciona, muestra la fecha de envío como fallback

### 📋 Texto largo
- Se muestra como descripción, truncado a 120 caracteres
- Fuente: Campos de tipo `textarea` del formulario
- Se agrega "..." si el texto es más largo

## Estilos CSS
El shortcode utiliza las clases CSS definidas en `public/css/entries-list.css`. Puedes personalizar los estilos sobrescribiendo estas clases en tu tema:

- `.nm-entries-list-container`: Contenedor principal
- `.nm-entries-grid`: Grid de tarjetas
- `.nm-entry-card`: Tarjeta individual
- `.nm-entry-image`: Contenedor de imagen
- `.nm-entry-content`: Contenido de la tarjeta
- `.nm-entry-title`: Título
- `.nm-entry-description`: Texto largo/descripción
- `.nm-entry-audio`: Reproductor de audio
- `.nm-entry-file`: Contenedor de archivo
- `.nm-download-btn`: Botón de descarga
- `.nm-entry-date`: Fecha
- `.nm-entries-pagination`: Controles de paginación

## Notas técnicas
- **Solo se muestran entradas aprobadas** - No se pueden ver entradas pendientes o rechazadas
- Las entradas se ordenan por fecha de envío descendente (más recientes primero)
- **Los campos mostrados dependen exclusivamente de la configuración en el menú "Galería"**
- Si no hay configuración de galería, las tarjetas mostrarán un mensaje pidiendo configuración
- No se muestra información adicional (como fecha de envío) a menos que esté específicamente configurada
- Los reproductores de audio tienen controles nativos del navegador
- Los archivos se abren en nueva pestaña al descargar

## Configuración recomendada
1. **Asegúrate de tener un formulario creado** con campos variados
2. **Configura al menos un campo de texto** para el título en "Galería"
3. **Selecciona una imagen** si quieres tarjetas más visuales
4. **Considera agregar fecha o descripción** para más información
