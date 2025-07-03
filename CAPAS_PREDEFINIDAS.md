# Capas Base Predefinidas - NexusMap

## Descripción
Se ha implementado una nueva funcionalidad en NexusMap que permite seleccionar capas base de un catálogo de servicios predefinidos, manteniendo la funcionalidad existente de añadir capas personalizadas.

## Características Principales

### 🌟 Capas Base Predefinidas
- **11 capas base organizadas por categorías**
- **Servicios públicos sin necesidad de API keys**
- **Verificación automática de capas ya añadidas**
- **Interfaz visual intuitiva**

### 📂 Categorías de Capas

#### Mapas Estándar
- **OpenStreetMap**: Mapa colaborativo estándar
- **Esri World Street Map**: Mapa de calles de Esri
- **CartoDB Voyager**: Mapa de navegación de CartoDB

#### Mapas Minimalistas
- **CartoDB Positron**: Mapa claro y minimalista
- **CartoDB Dark Matter**: Mapa oscuro elegante
- **Stamen Toner**: Mapa en blanco y negro

#### Mapas de Terreno
- **OpenTopoMap**: Mapa topográfico detallado
- **Esri World Terrain**: Terreno de Esri
- **Stamen Terrain**: Terreno estilizado

#### Imágenes Satelitales
- **Esri World Imagery**: Imágenes satelitales de alta resolución

#### Mapas Artísticos
- **Stamen Watercolor**: Mapa estilo acuarela

## Funcionalidades Implementadas

### ✅ Gestión Inteligente
- **Detección automática**: El sistema detecta si una capa ya está añadida
- **Prevención de duplicados**: No permite añadir la misma capa dos veces
- **Indicadores visuales**: Muestra claramente qué capas están disponibles y cuáles ya están añadidas

### 🎨 Interfaz Mejorada
- **Diseño por tarjetas**: Cada capa se muestra en una tarjeta visual
- **Iconos representativos**: Cada tipo de capa tiene su icono distintivo
- **Estados visuales**: Diferenciación clara entre capas disponibles y añadidas
- **Organización categórica**: Capas agrupadas por tipo para fácil navegación

### 🔧 Funcionalidades Técnicas
- **Compatibilidad completa**: Mantiene todas las funciones existentes
- **Etiquetado inteligente**: Las capas predefinidas se marcan como tales
- **Gestión de metadatos**: Almacena información adicional sobre el origen de la capa

## Archivos Modificados

### `admin/views/manage-layers.php`
- Añadida sección de capas predefinidas
- Implementada interfaz de tarjetas con categorías
- Añadidos estilos CSS personalizados
- Implementada lógica de detección de capas existentes

### `admin/NM_Manage_Layers.php`
- Añadido método `handle_add_predefined_base_layer()`
- Implementada lógica de prevención de duplicados
- Añadido sistema de redirección con mensajes

### `includes/class-nm-layers-manager.php`
- Añadido método `handle_add_predefined_base_layer()`
- Implementada compatibilidad con el sistema existente
- Añadidos hooks para las nuevas acciones

## Uso

1. **Acceder a Manage Layers** desde el panel de administración de NexusMap
2. **Explorar las capas predefinidas** organizadas por categorías
3. **Hacer clic en "Añadir"** para la capa deseada
4. **Confirmar la acción** en el diálogo que aparece
5. **La capa se añade automáticamente** y aparece en la lista de capas existentes

## Ventajas

- **Facilidad de uso**: No necesitas conocer URLs de servicios de mapas
- **Calidad garantizada**: Todas las capas han sido probadas y funcionan correctamente
- **Diversidad**: Amplia variedad de estilos y tipos de mapas
- **Mantenimiento**: Las capas predefinidas se mantienen actualizadas automáticamente
- **Compatibilidad**: Funciona perfectamente con el sistema existente

## Compatibilidad

Esta implementación es completamente compatible con:
- ✅ Funcionalidad existente de capas base personalizadas
- ✅ Funcionalidad existente de capas overlay
- ✅ Todos los mapas y configuraciones existentes
- ✅ Todas las versiones de WordPress soportadas
- ✅ Todos los navegadores modernos

## Notas Técnicas

- Las capas predefinidas se identifican con el campo `predefined: true`
- Se incluye un `predefined_key` para referencia única
- La verificación de duplicados se basa en nombre, URL y clave predefinida
- Los servicios utilizados son gratuitos y no requieren autenticación
