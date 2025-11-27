# Funcionalidad de Galería Agrupada - NexusMap

## Descripción General

La funcionalidad de galería agrupada permite organizar las entradas del formulario en categorías basadas en un campo select. Los usuarios pueden ver las categorías con imágenes y al hacer clic en una, se filtran las entradas correspondientes.

## Características

- ✅ Agrupación de entradas por campo select del formulario
- ✅ Imágenes personalizadas para cada categoría
- ✅ Galería visual de categorías con efecto hover
- ✅ Filtrado dinámico de entradas por categoría
- ✅ Estados activo/inactivo para categorías
- ✅ Paginación de entradas filtradas
- ✅ Transiciones y animaciones suaves
- ✅ Diseño responsive

## Configuración en el Administrador

### Paso 1: Activar la Agrupación

1. Ve a **NexusMap > Galería** en el panel de administración
2. Desplázate hasta la sección **"Agrupación por Campo Select"**
3. Marca la casilla **"Activar Agrupación"**

### Paso 2: Seleccionar Campo Select

1. En el dropdown **"Agrupar por Campo Select"**, elige el campo select del formulario que deseas usar para agrupar
2. Solo aparecerán los campos de tipo `select` que hayas creado en tu formulario

### Paso 3: Asignar Imágenes a las Categorías

1. Una vez seleccionado el campo select, aparecerá la sección **"Imágenes por Categoría"**
2. Para cada opción del select, puedes:
   - Hacer clic en **"Seleccionar Imagen"** para elegir una imagen de la biblioteca de medios
   - Hacer clic en **"Eliminar"** para quitar la imagen asignada
3. Las imágenes se mostrarán como preview en miniatura

### Paso 4: Guardar la Configuración

1. Haz clic en el botón **"Guardar Configuración"**
2. Verás un mensaje de confirmación cuando se guarde correctamente

## Uso del Shortcode

### Shortcode Básico

```
[nm_entries_group]
```

### Shortcode con Parámetros

```
[nm_entries_group per_page="12"]
```

### Parámetros Disponibles

| Parámetro | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `per_page` | integer | 10 | Número de entradas a mostrar por página en cada categoría |

## Comportamiento del Frontend

### Vista Inicial

- Se muestra una galería con todas las opciones del campo select
- Cada categoría muestra su imagen asignada (o un placeholder con la inicial)
- El título de cada categoría se muestra debajo de la imagen

### Interacción

1. **Al hacer clic en una categoría:**
   - La categoría seleccionada se marca como activa (borde azul)
   - Las demás categorías se vuelven semi-transparentes y en escala de grises
   - Aparece la galería de entradas filtradas debajo
   - Se muestra un título con el nombre de la categoría activa

2. **Al cambiar de categoría:**
   - Se actualiza el estado visual de las categorías
   - Las entradas se filtran y muestran con una animación de fade
   - La paginación se reinicia a la página 1

3. **Paginación:**
   - Si hay más entradas de las que caben en una página, aparecen los controles de paginación
   - Al cambiar de página, se realiza un scroll suave hacia arriba
   - Las entradas se cargan dinámicamente vía AJAX

## Estructura de Archivos

### Backend (Administración)

```
admin/
├── NM_Gallery.php                     # Clase principal de la galería
│   ├── get_select_fields()            # Obtiene campos select del formulario
│   ├── get_default_settings()         # Configuración por defecto con agrupación
│   ├── save_gallery_settings()        # Guarda configuración incluyendo agrupación
│   └── get_image_url()                # AJAX: Obtiene URL de imagen por ID
│
└── views/
    └── gallery.php                    # Vista de configuración
        ├── Sección de agrupación
        ├── Selector de campo select
        ├── Campos de imagen por categoría
        └── JavaScript para manejo de imágenes
```

### Frontend (Público)

```
public/
├── class-nm-public.php
│   ├── display_entries_group()        # Renderiza el shortcode [nm_entries_group]
│   └── get_filtered_entries()         # AJAX: Devuelve entradas filtradas
│
├── css/
│   └── entries-group.css              # Estilos de la galería agrupada
│
└── js/
    └── entries-group.js               # Lógica de interacción y filtrado
```

## Estilos CSS Principales

### Categorías

- `.nm-group-categories` - Grid de categorías
- `.nm-group-category` - Tarjeta individual de categoría
- `.nm-group-category.active` - Categoría seleccionada
- `.nm-group-category.inactive` - Categorías no seleccionadas
- `.nm-category-image` - Contenedor de imagen
- `.nm-category-placeholder` - Placeholder cuando no hay imagen

### Entradas Filtradas

- `.nm-group-entries-container` - Contenedor de entradas filtradas
- `.nm-group-entries-header` - Header con título de categoría
- `.nm-entries-grid` - Grid de tarjetas de entrada
- `.nm-entries-pagination` - Controles de paginación

## JavaScript Principales

### Funciones

- `initEntriesGroup()` - Inicializa los event listeners
- `loadFilteredEntries(category, page)` - Carga entradas vía AJAX
- `showError(message)` - Muestra mensajes de error

### Variables Globales

- `currentCategory` - Categoría actualmente seleccionada
- `currentPage` - Página actual de paginación
- `isLoading` - Estado de carga para evitar múltiples peticiones

## AJAX Endpoints

### `nm_get_filtered_entries`

**Parámetros:**
- `category` - Valor de la categoría a filtrar
- `group_field` - Nombre del campo select usado para agrupar
- `page` - Número de página
- `per_page` - Entradas por página

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "cards_html": "<div>...</div>",
    "pagination_html": "<div>...</div>",
    "total_entries": 25,
    "total_pages": 3,
    "current_page": 1
  }
}
```

### `nm_get_image_url`

**Parámetros:**
- `image_id` - ID de la imagen en WordPress

**Respuesta:**
```json
{
  "success": true,
  "data": "https://ejemplo.com/wp-content/uploads/2024/11/imagen.jpg"
}
```

## Base de Datos

La configuración se guarda en la tabla `wp_options`:

```php
Option Name: nm_gallery_settings

Option Value (Array):
[
    'selected_fields' => [
        'text' => 'nm_titulo',
        'image' => 'nm_imagen',
        // ... otros campos
    ],
    'enable_grouping' => true,
    'group_by_field' => 'nm_categoria',
    'group_images' => [
        'Categoría 1' => 123,  // ID de imagen
        'Categoría 2' => 456,
        // ... más categorías
    ]
]
```

## Requisitos

- WordPress 5.0+
- jQuery (incluido en WordPress)
- Plugin NexusMap activo
- Formulario creado con al menos un campo select
- Entradas aprobadas en la base de datos

## Troubleshooting

### Las categorías no aparecen

- Verifica que la agrupación esté activada en la configuración
- Asegúrate de haber seleccionado un campo select
- Verifica que existan entradas aprobadas con valores en ese campo select

### Las imágenes no se muestran

- Verifica que las imágenes estén correctamente subidas a la biblioteca de medios
- Comprueba los permisos de los archivos
- Revisa la consola del navegador para errores

### Las entradas no se filtran

- Abre la consola del navegador (F12) para ver errores JavaScript
- Verifica que el AJAX endpoint esté respondiendo correctamente
- Comprueba que el campo select tenga el prefijo `nm_` en la base de datos

### Errores de permisos

- Verifica que el usuario tenga el capability `manage_options`
- Comprueba que los nonces se estén generando correctamente

## Mejoras Futuras

- [ ] Ordenamiento de categorías (alfabético, por número de entradas, etc.)
- [ ] Búsqueda dentro de categorías
- [ ] Mostrar contador de entradas por categoría
- [ ] Filtros adicionales combinables
- [ ] Exportación de datos por categoría
- [ ] Vista de mosaico alternativa
- [ ] Lazy loading de imágenes

## Soporte

Para reportar bugs o solicitar features, contacta con el equipo de desarrollo.

---

**Versión:** 1.0.0  
**Fecha:** Noviembre 2024  
**Autor:** Escala Digital
