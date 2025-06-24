# Modal de Detalles para NexusMap

## Descripción

Se ha implementado un modal elegante y responsive que muestra toda la información de una entrada cuando el usuario hace clic en cualquier tarjeta de la galería. Esta funcionalidad mejora significativamente la experiencia de usuario al permitir ver todos los detalles sin salir de la página.

## Características

### ✨ Funcionalidades del Modal

- **Apertura automática**: Al hacer clic en cualquier tarjeta de la galería
- **Información completa**: Muestra todos los campos disponibles de la entrada
- **Responsive**: Se adapta perfectamente a dispositivos móviles y de escritorio
- **Navegación intuitiva**: Se puede cerrar con la tecla Escape, clic fuera del modal, o botón X
- **Carga asíncrona**: Los datos se cargan dinámicamente via AJAX

### 📱 Diseño Responsive

- **Desktop**: Modal centrado con ancho máximo de 800px
- **Tablet**: Modal ocupa el 95% del ancho de pantalla
- **Móvil**: Modal ocupa el 98% del ancho con márgenes mínimos

### 🎨 Elementos Visuales

- **Cabecera**: Gradiente atractivo con título y botón de cierre
- **Imagen principal**: Muestra la imagen de la entrada a tamaño completo
- **Secciones organizadas**: Información estructurada por tipo de campo
- **Animaciones suaves**: Efectos de aparición y desplazamiento elegantes

## Cómo Usar

### Para el Administrador

1. **Configurar la galería**: Ve a "NexusMap > Galería" y selecciona los campos que quieres mostrar en las tarjetas
2. **Añadir el shortcode**: Coloca `[nm_entries_list]` en cualquier página o entrada
3. **¡Listo!**: Los usuarios podrán hacer clic en las tarjetas para ver todos los detalles

### Para los Usuarios

1. **Navegar a la galería**: Ve a la página que contiene el shortcode `[nm_entries_list]`
2. **Hacer clic en una tarjeta**: Cualquier tarjeta mostrará una indicación visual de que es clickeable
3. **Ver los detalles**: El modal se abrirá mostrando toda la información disponible
4. **Cerrar el modal**: 
   - Hacer clic en el botón X
   - Presionar la tecla Escape
   - Hacer clic fuera del modal

## Información Técnica

### Archivos Afectados

1. **CSS**: `public/css/entries-list.css`
   - Estilos del modal y efectos visuales
   - Media queries para responsive design

2. **JavaScript**: `public/js/entries-modal.js`
   - Lógica de apertura/cierre del modal
   - Peticiones AJAX para cargar datos
   - Event listeners para interacciones

3. **PHP**: `public/class-nm-public.php`
   - Endpoint AJAX `nm_get_entry_details`
   - Enqueue automático de scripts cuando se usa el shortcode
   - Atributos data-entry-index en las tarjetas

### Flujo de Funcionamiento

1. **Inicialización**: Cuando se carga la página, se añaden los event listeners a las tarjetas
2. **Clic en tarjeta**: Se extrae el índice de la entrada desde el atributo `data-entry-index`
3. **Petición AJAX**: Se envía una petición al endpoint `nm_get_entry_details`
4. **Procesamiento**: El servidor busca la entrada y extrae todos los campos disponibles
5. **Respuesta**: Se devuelven los datos estructurados en JSON
6. **Renderizado**: El modal se construye dinámicamente con toda la información

### Campos Mostrados en el Modal

- **Título**: Campo de texto principal
- **Imagen**: Imagen principal de la entrada
- **Descripción**: Texto largo descriptivo
- **Audio**: Reproductor de audio embebido
- **Archivo/Documento**: Enlace de descarga del archivo
- **Fecha**: Fecha formateada (si está disponible)
- **Campos personalizados**: Todos los campos adicionales encontrados en los datos

## Personalización

### Modificar Estilos

Los estilos del modal se encuentran en `public/css/entries-list.css`. Puedes personalizar:

- Colores del gradiente de la cabecera
- Tamaños y espaciados
- Animaciones y transiciones
- Responsive breakpoints

### Añadir Nuevos Campos

El modal muestra automáticamente todos los campos disponibles en los datos de la entrada. Para añadir nuevos tipos de campo, modifica la función `displayEntryDetails()` en `entries-modal.js`.

## Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles y tablets
- ✅ WordPress 5.0+
- ✅ PHP 7.4+

## Resolución de Problemas

### El modal no se abre
- Verificar que el JavaScript se está cargando correctamente
- Comprobar la consola del navegador para errores
- Asegurarse de que las variables AJAX están disponibles

### Datos no se cargan
- Verificar que existen entradas aprobadas en la base de datos
- Comprobar la configuración de la galería en el panel de administración
- Revisar los logs de WordPress para errores del endpoint AJAX

### Problemas de diseño
- Verificar que el CSS se está cargando correctamente
- Comprobar conflictos con el tema activo
- Revisar media queries para problemas responsive

## Actualizaciones Futuras

### Características planificadas:
- Navegación entre entradas dentro del modal
- Integración con mapa para mostrar ubicación
- Compartir entrada desde el modal
- Modo pantalla completa para imágenes
