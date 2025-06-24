# Solución: Entradas no aparecen en la galería

## Problema Identificado
Las entradas están guardadas en la base de datos pero no aparecen al usar el shortcode `[nm_entries_list]`. Esto sucede porque:

1. **Inconsistencia en configuraciones**: El shortcode estaba buscando configuraciones en `nm_gallery_settings` pero la página de configuración guardaba en `nm_entries_display_settings`.

2. **Sistema de detección de campos desactualizado**: No estaba detectando correctamente los nuevos tipos de campo "image" y "file" (documento).

## Cambios Realizados

### 1. Unificación de configuraciones
- **Archivo**: `public/class-nm-public.php`
- **Cambio**: El shortcode ahora usa la misma configuración que la página de administración (`nm_entries_display_settings`)

### 2. Actualización del sistema de renderizado
- **Archivo**: `public/class-nm-public.php`
- **Cambio**: Nueva función `render_gallery_card_content` que:
  - Detecta automáticamente el tipo de cada campo
  - Renderiza imágenes, documentos, audio y otros tipos correctamente
  - Funciona con los nuevos campos `nm_imagen` y `nm_documento`

### 3. Detección mejorada de tipos de campo
- **Archivos**: `public/class-nm-public.php` y `admin/NM_Entries_Display_Settings.php`
- **Cambio**: Nuevas funciones que detectan tipos por:
  - Nombre del campo (`nm_imagen`, `nm_documento`, etc.)
  - Extensión del archivo en URLs
  - Contenido y patrones

## Pasos para Solucionar

### Paso 1: Configurar la galería
1. Ve a **WordPress Admin > NexusMap > Galería**
2. Selecciona los campos que quieres mostrar:
   - **Texto/Título**: Selecciona `nm_titulo` para mostrar el título
   - **Imagen**: Selecciona `nm_imagen` para mostrar la imagen
   - **Archivo**: Selecciona `nm_documento` para mostrar el documento como enlace de descarga
   - Otros campos según necesites (nm_select, etc.)

3. Haz clic en **Guardar** o **Actualizar Configuración**

### Paso 2: Verificar el shortcode
Asegúrate de usar el shortcode correctamente:
```
[nm_entries_list]
```

O con parámetros opcionales:
```
[nm_entries_list per_page="6" show_pagination="true"]
```

### Paso 3: Resultado esperado
Con tu entrada de ejemplo:
- **Título**: "Migración, educación y renta..."
- **Imagen**: Se mostrará la imagen `Asamblea-Profesores-Catlicos.png`
- **Documento**: Se mostrará un enlace de descarga para el PDF

## Verificación de Datos

Tu entrada contiene:
```
- nm_titulo: "Migración, educación y renta..."
- nm_imagen: "https://localhost/nexusmap/wp-content/uploads/2025/06/Asamblea-Profesores-Catlicos.png"
- nm_documento: "https://localhost/nexusmap/wp-content/uploads/2025/06/20250117_ACTA-PROVISIONAL-1-PLAZA-PERIODSTA-VILLAMARTIN.pdf"
- nm_select: "hola"
- nm_numero: ""
- nm_audio: ""
- nm_audio2: ""
```

## Posibles Problemas Adicionales

### Si aún no aparecen las entradas:
1. **Verificar estado**: Asegúrate de que la entrada esté **aprobada** en **NexusMap > Entradas**
2. **Limpiar caché**: Si usas plugins de caché, límpialos
3. **Verificar configuración**: Confirma que tienes campos seleccionados en **Visualización de Entradas**

### Si aparece el mensaje "Configuración necesaria":
- Ve a **NexusMap > Galería** y selecciona al menos un campo

### Para depuración:
Agrega esto temporalmente a tu tema para ver la configuración actual:
```php
// Temporal - para debugging
$config = get_option('nm_gallery_settings', array());
echo '<pre>';
print_r($config);
echo '</pre>';
```

## Estado Final
✅ **Completado**: El sistema ahora detecta y muestra correctamente:
- Campos de imagen (nm_imagen)
- Campos de documento (nm_documento)  
- Todos los demás tipos de campo

La entrada que tienes debería aparecer ahora en la galería una vez configures los campos en **NexusMap > Galería**.
