# Pruebas de Validación para Campos de Imagen y Documentos

## Descripción
Este documento describe las pruebas que se deben realizar para verificar que la separación de los campos "File Upload" en "Image Upload" y "Document Upload" funciona correctamente.

## Pruebas a Realizar

### 1. Creación de Formularios
1. **Crear formulario con campo Image Upload**:
   - Ir al constructor de formularios
   - Añadir un campo "Image Upload"
   - Verificar que aparece el icono de imagen en el constructor
   - Guardar el formulario

2. **Crear formulario con campo Document Upload**:
   - Ir al constructor de formularios
   - Añadir un campo "Document Upload"  
   - Verificar que aparece el icono de documento en el constructor
   - Guardar el formulario

### 2. Validación Frontend - Campo Image Upload
1. **Archivos válidos (deben ser aceptados)**:
   - Subir archivo .jpg
   - Subir archivo .jpeg
   - Subir archivo .png
   - Subir archivo .gif
   - Subir archivo .webp

2. **Archivos inválidos (deben ser rechazados)**:
   - Intentar subir archivo .pdf → Debe mostrar: "Tipo de imagen no permitido. Solo se permiten: JPG, JPEG, PNG, GIF, WEBP."
   - Intentar subir archivo .doc → Debe mostrar el mismo mensaje
   - Intentar subir archivo .txt → Debe mostrar el mismo mensaje

### 3. Validación Frontend - Campo Document Upload
1. **Archivos válidos (deben ser aceptados)**:
   - Subir archivo .pdf
   - Subir archivo .doc
   - Subir archivo .docx
   - Subir archivo .xls
   - Subir archivo .xlsx
   - Subir archivo .txt
   - Subir archivo .rtf

2. **Archivos inválidos (deben ser rechazados)**:
   - Intentar subir archivo .jpg → Debe mostrar: "Tipo de documento no permitido. Solo se permiten: PDF, DOC, DOCX, XLS, XLSX, TXT, RTF."
   - Intentar subir archivo .png → Debe mostrar el mismo mensaje
   - Intentar subir archivo .mp3 → Debe mostrar el mismo mensaje

### 4. Validación Backend
1. **Verificar que el backend procesa correctamente los archivos**:
   - Los archivos válidos se suben correctamente
   - Los archivos inválidos son rechazados con mensajes apropiados
   - Los archivos se almacenan en las carpetas correctas

### 5. Visualización en la Galería
1. **Verificar shortcode [nm_entries_list]**:
   - Las imágenes se muestran como miniaturas
   - Los documentos se muestran como enlaces con iconos apropiados
   - Los tipos de archivo se distinguen correctamente

### 6. Compatibilidad
1. **Verificar compatibilidad con formularios existentes**:
   - Los formularios creados antes de la actualización siguen funcionando
   - Los campos de archivo antiguos se comportan como campos de imagen por defecto

## Archivos Modificados en esta Actualización

1. **Frontend JavaScript**: `public/js/form.js`
   - Actualizada la validación de tipos MIME para detectar automáticamente el tipo de campo
   - Mensajes de error específicos para cada tipo de campo

2. **Vistas Frontend**: Ya estaban actualizadas previamente
   - `public/views/form-display.php`
   - `public/views/form-display-ab.php`

3. **Backend**: Ya actualizado previamente
   - `public/class-nm-public.php`

4. **Constructor de Formularios**: Ya actualizado previamente
   - `admin/views/form-builder.php`
   - `form-builder.php`

## Puntos Clave de la Implementación

1. **Detección Automática**: El JavaScript detecta automáticamente el tipo de campo usando el atributo `data-type` del contenedor.

2. **Mensajes Específicos**: Cada tipo de campo tiene mensajes de error específicos que indican exactamente qué formatos son permitidos.

3. **Validación Dual**: Se valida tanto en el frontend (JavaScript) como en el backend (PHP) para máxima seguridad.

4. **Compatibilidad**: Los campos antiguos se tratan como campos de imagen por defecto para mantener la compatibilidad.
