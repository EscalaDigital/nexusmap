# Shortcode: Lista de Entradas de NexusMap

## Descripción
El shortcode `[nm_entries_list]` permite mostrar las entradas almacenadas en la tabla `nm_entries` en formato de tarjetas similar al diseño de "Conflictos" mostrado en la imagen de referencia.

## Uso básico
```
[nm_entries_list]
```

## Parámetros disponibles

### `per_page` (número)
- **Descripción**: Número de entradas por página
- **Por defecto**: 10
- **Ejemplo**: `[nm_entries_list per_page="8"]`

### `show_pagination` (true/false)
- **Descripción**: Mostrar controles de paginación
- **Por defecto**: "true"
- **Ejemplo**: `[nm_entries_list show_pagination="false"]`

### `show_title` (true/false)
- **Descripción**: Mostrar título de cada entrada
- **Por defecto**: "true"
- **Ejemplo**: `[nm_entries_list show_title="false"]`

### `show_image` (true/false)
- **Descripción**: Mostrar imagen de cada entrada
- **Por defecto**: "true"
- **Ejemplo**: `[nm_entries_list show_image="false"]`

### `show_category` (true/false)
- **Descripción**: Mostrar categoría/etiqueta de cada entrada
- **Por defecto**: "true"
- **Ejemplo**: `[nm_entries_list show_category="false"]`

### `show_date` (true/false)
- **Descripción**: Mostrar fecha de cada entrada
- **Por defecto**: "true"
- **Ejemplo**: `[nm_entries_list show_date="false"]`

## Ejemplos de uso

### Ejemplo básico
```
[nm_entries_list]
```
Muestra 10 entradas aprobadas con paginación y todos los elementos visibles.

### Lista compacta sin imágenes
```
[nm_entries_list show_image="false" per_page="15"]
```
Muestra 15 entradas por página sin imágenes.

### Lista sin paginación
```
[nm_entries_list show_pagination="false"]
```
Muestra todas las entradas aprobadas sin paginación.

### Lista personalizada
```
[nm_entries_list per_page="6" show_date="false" show_category="false"]
```
Muestra 6 entradas por página solo con título e imagen.

## Navegación
El shortcode genera automáticamente la paginación con enlaces "Anterior" y "Siguiente", así como números de página. La navegación se realiza mediante parámetros de URL (`?entries_page=2`).

## Estilos CSS
El shortcode utiliza las clases CSS definidas en `public/css/entries-list.css`. Puedes personalizar los estilos sobrescribiendo estas clases en tu tema:

- `.nm-entries-list-container`: Contenedor principal
- `.nm-entries-grid`: Grid de tarjetas
- `.nm-entry-card`: Tarjeta individual
- `.nm-entry-image`: Contenedor de imagen
- `.nm-entry-content`: Contenido de la tarjeta
- `.nm-entry-title`: Título
- `.nm-category-badge`: Etiqueta de categoría
- `.nm-entry-date`: Fecha
- `.nm-entries-pagination`: Controles de paginación

## Campos buscados automáticamente
El shortcode busca automáticamente los siguientes campos en los datos de entrada:

- **Título**: `title`
- **Imagen**: `image`, `foto`, `imagen`, `picture`
- **Categoría**: `category`
- **Fecha**: Se usa `date_submitted` de la base de datos

## Notas técnicas
- **Solo se muestran entradas aprobadas** - No se pueden ver entradas pendientes o rechazadas
- Las entradas se ordenan por fecha de envío descendente (más recientes primero)
- Las imágenes pueden ser URLs o IDs de attachments de WordPress
- Si no se encuentra imagen, se muestra un placeholder
- Los datos de entrada se esperan en formato JSON en el campo `entry_data`
