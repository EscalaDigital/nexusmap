# 🎨 Personalizador de Popup - NexusMap

## 📋 Descripción

Nueva funcionalidad que permite personalizar completamente cómo se visualizan los datos en el popup del mapa cuando los usuarios hacen clic en los marcadores.

## ✨ Características Implementadas

### 1. **Gestión de Campos**
- ✅ Mostrar u ocultar campos individualmente
- ✅ Reordenar campos con drag-and-drop
- ✅ Personalizar títulos de campos
- ✅ Opción para ocultar el título de un campo (mostrar solo el valor)

### 2. **Opciones Especiales**
- ✅ **Carrusel de Imágenes**: Agrupa múltiples imágenes en un carrusel interactivo
- ✅ **Reproducción Automática de Audio**: Audio se reproduce al abrir el popup
- ✅ **Mapa en Popup**: Opción para incluir un mini mapa (preparado para futura implementación)

### 3. **Interfaz de Usuario**
- ✅ Vista previa en tiempo real
- ✅ Drag-and-drop intuitivo
- ✅ Interfaz responsive
- ✅ Notificaciones de guardado

## 📁 Archivos Creados

### Backend (Admin)
- `admin/NM_Popup_Customizer.php` - Clase principal del personalizador
- `admin/views/popup-customizer.php` - Vista de la interfaz de personalización
- `admin/css/popup-customizer.css` - Estilos del admin
- `admin/js/popup-customizer.js` - Lógica JavaScript del admin

### Frontend
- Modificaciones en `public/js/funcionesmaps.js` - Aplicación de configuración en el popup
- Modificaciones en `public/css/public.css` - Estilos del carrusel
- Modificaciones en `public/class-nm-public.php` - Paso de configuración al frontend

### Integración
- Modificaciones en `admin/class-nm-admin.php` - Registro del nuevo menú

## 🔧 Cómo Usar

### Acceder al Personalizador

1. Ve al panel de administración de WordPress
2. Menú lateral: **NexusMap** → **Personalizar Popup**

### Configurar Campos

1. **Reordenar**: Arrastra los campos por el icono ⋮⋮
2. **Visibilidad**: Activa/desactiva el toggle de "Visible"
3. **Título Personalizado**: Escribe un nuevo título en el campo de texto
4. **Mostrar/Ocultar Título**: Usa el toggle "Mostrar Título"

### Opciones Especiales

#### Carrusel de Imágenes
- Activa la opción "Activar Carrusel de Imágenes"
- Todas las imágenes se agruparán en un carrusel con navegación
- Controles: flechas, dots y teclado (← →)

#### Audio Autoplay
- Activa "Reproducción Automática de Audio"
- El primer archivo de audio se reproducirá al abrir el popup
- Nota: Los navegadores pueden bloquear el autoplay

### Guardar Configuración

1. Haz clic en **"Guardar Configuración"**
2. Verás una notificación de éxito
3. Los cambios se aplicarán inmediatamente en el mapa público

## 🎯 Flujo de Datos

```
┌─────────────────────────┐
│   Admin: Configuración  │
│  (popup-customizer.php) │
└───────────┬─────────────┘
            │
            │ AJAX Save
            ▼
┌─────────────────────────┐
│  wp_options:            │
│  - nm_popup_config      │
│  - nm_popup_special_    │
│    options              │
└───────────┬─────────────┘
            │
            │ wp_localize_script
            ▼
┌─────────────────────────┐
│   Frontend: JavaScript  │
│  - nmPopupConfig        │
│  - nmPopupSpecialOptions│
└───────────┬─────────────┘
            │
            │ showModal()
            ▼
┌─────────────────────────┐
│   Popup Personalizado   │
│  - Campos ordenados     │
│  - Carrusel activo      │
│  - Audio autoplay       │
└─────────────────────────┘
```

## 🔍 Estructura de Configuración

### nm_popup_config
```php
array(
    'campo_nombre' => array(
        'visible' => true,          // bool: mostrar u ocultar
        'custom_label' => '',       // string: título personalizado
        'show_label' => true,       // bool: mostrar título
        'order' => 0               // int: orden de visualización
    ),
    // ... más campos
)
```

### nm_popup_special_options
```php
array(
    'image_carousel' => false,      // bool: activar carrusel
    'audio_autoplay' => false,      // bool: reproducción automática
    'show_map_in_popup' => false   // bool: mostrar mini mapa
)
```

## 🎨 Clases CSS Principales

### Carrusel
- `.nm-image-carousel` - Contenedor principal
- `.nm-carousel-wrapper` - Wrapper con aspect ratio
- `.nm-carousel-slide` - Cada slide individual
- `.nm-carousel-prev/next` - Botones de navegación
- `.nm-carousel-dots` - Indicadores de posición

### Admin
- `.nm-popup-customizer` - Contenedor principal
- `.nm-field-item` - Item de campo draggable
- `.nm-toggle` - Switch de activación
- `.nm-preview-panel` - Panel de vista previa

## ⚙️ Funciones JavaScript Principales

### Admin (`popup-customizer.js`)
- `initializeFieldsList()` - Inicializa la lista de campos
- `enableDragAndDrop()` - Habilita funcionalidad drag-and-drop
- `updatePreview()` - Actualiza vista previa en tiempo real
- `saveConfiguration()` - Guarda configuración vía AJAX

### Frontend (`funcionesmaps.js`)
- `showModal()` - Construye y muestra el popup (modificada)
- `initImageCarousel()` - Inicializa el carrusel de imágenes
- `renderField()` - Renderiza un campo individual (modificada)

## 🔐 Seguridad

- ✅ Verificación de nonce en todas las peticiones AJAX
- ✅ Verificación de capacidades (`manage_options`)
- ✅ Sanitización de datos con `esc_attr()`, `esc_html()`
- ✅ JSON encoding seguro

## 🐛 Consideraciones Importantes

### No Afecta al Mapa
- ❌ NO modifica la carga de datos
- ❌ NO afecta a los marcadores
- ❌ NO cambia las coordenadas
- ✅ Solo cambia la VISUALIZACIÓN del popup

### Compatibilidad
- ✅ Compatible con formularios A/B
- ✅ Compatible con campos condicionales
- ✅ Compatible con geographic-selector
- ✅ Compatible con todos los tipos de campo
- ✅ Compatible con temas existentes (theme1, theme2, theme3)

### Limitaciones
- El orden solo afecta a campos normales (no a headers ni geographic-selector)
- Los campos condicionales mantienen su agrupación
- El título del popup se detecta automáticamente (no personalizable desde aquí)

## 🚀 Próximas Mejoras Posibles

1. **Mini Mapa en Popup**: Implementar la visualización de un mapa pequeño
2. **Templates de Popup**: Diferentes layouts predefinidos
3. **Personalización de Colores**: Esquemas de color personalizados
4. **Export/Import**: Exportar/importar configuraciones
5. **Preview Interactivo**: Click en campos de preview para editarlos

## 📞 Soporte

Para cualquier duda o problema:
1. Verificar que todos los archivos fueron creados correctamente
2. Revisar la consola del navegador en busca de errores
3. Verificar que `nm_popup_config` existe en la tabla `wp_options`
4. Asegurar que jQuery y jQuery UI Sortable estén cargados

## 📝 Changelog

### Versión 1.0.0 (2025-12-02)
- ✨ Implementación inicial del personalizador de popup
- ✨ Drag-and-drop para reordenar campos
- ✨ Carrusel de imágenes
- ✨ Audio autoplay
- ✨ Vista previa en tiempo real
- ✨ Interfaz responsive

---

**Desarrollado para NexusMap** | Diciembre 2025
