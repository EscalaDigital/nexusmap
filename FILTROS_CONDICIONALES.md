# Implementación de Filtros Condicionales en NexusMap

## Descripción del Problema

El sistema de filtros del plugin no estaba incluyendo:
1. Los campos de tipo `conditional-select`
2. Los campos delegados (subcampos) que están anidados dentro de las opciones de los campos conditional-select

## Solución Implementada

### 1. Backend - Clase NM_Form_Filters.php

#### Método `render_filters_page()` mejorado:
- Ahora incluye campos de tipo `'conditional-select'` en la lista de campos válidos
- Extrae y procesa los campos delegados de cada opción del conditional-select
- Crea identificadores únicos para campos condicionales usando el patrón: `{parent_field}_{parent_option}_{field_name}`
- Agrega metadatos adicionales para identificar la relación padre-hijo

#### Método `save_filter_settings()` mejorado:
- Detecta automáticamente si un filtro es condicional basándose en su nombre único
- Guarda información adicional sobre la relación padre-hijo en la configuración
- Mantiene compatibilidad con filtros regulares existentes

#### Nuevo método auxiliar `find_conditional_field()`:
- Facilita la búsqueda de campos condicionales específicos en la estructura del formulario

### 2. Frontend - Vista form-filters.php

#### Mejoras en la interfaz:
- Indicadores visuales claros para campos condicionales (🔗 📋 🎯)
- Información contextual mostrando el campo padre y la opción de la que depende
- Estilos diferenciados con bordes de color y fondos sutiles
- Advertencias informativas sobre el comportamiento condicional

### 3. Frontend - JavaScript public.js

#### Función `createFilterPanel()` mejorada:
- Detecta filtros condicionales y los marca con clases CSS específicas
- Los oculta inicialmente hasta que se active la condición padre
- Agrega metadatos HTML para facilitar la lógica condicional

#### Nueva función `updateConditionalFilters()`:
- Maneja la lógica de mostrar/ocultar filtros basándose en selecciones padre
- Limpia automáticamente filtros condicionales cuando se desactiva el padre
- Animaciones suaves de transición

#### Función `updateVisiblePoints()` mejorada:
- Lógica especial para evaluar filtros condicionales
- Verifica tanto el campo padre como el campo condicional para determinar visibilidad
- Mantiene compatibilidad con filtros regulares

#### Funciones adicionales:
- Manejo de limpieza de todos los filtros incluyendo condicionales
- Gestión de etiquetas de filtros activos con capacidad de eliminación individual
- Logs de debug para verificar carga correcta de configuración

### 4. Estilos CSS - public.css

#### Nuevos estilos para filtros condicionales:
- `.nm-conditional-filter`: Estilo base con borde izquierdo de color
- Fondos sutiles con transparencia para diferenciación visual
- Indicadores gráficos en botones (🔗 ✓)
- Tooltips explicativos al hacer hover
- Animaciones suaves para mostrar/ocultar
- Responsive design para dispositivos móviles

## Estructura de Datos

### Configuración de Filtro Regular:
```php
[
    'field' => 'campo_nombre',
    'button_text' => 'Texto del Botón',
    'options' => ['opcion1', 'opcion2'],
    'style' => ['background' => '#fff', 'color' => '#000'],
    'is_conditional' => false
]
```

### Configuración de Filtro Condicional:
```php
[
    'field' => 'campo_padre_opcion1_campo_hijo',
    'button_text' => 'Campo Hijo',
    'options' => ['valor1', 'valor2'],
    'style' => ['background' => '#fff', 'color' => '#000'],
    'is_conditional' => true,
    'parent_field' => 'campo_padre',
    'parent_option' => 'opcion1',
    'field_name' => 'campo_hijo'
]
```

## Flujo de Funcionamiento

1. **Carga inicial**: Se procesan todos los campos del formulario, incluyendo conditional-select y sus campos anidados
2. **Renderizado**: Los filtros condicionales se renderizan ocultos inicialmente
3. **Interacción del usuario**: Al seleccionar una opción en un campo padre:
   - Se muestran los filtros condicionales correspondientes
   - Se ocultan y limpian filtros de otras opciones
4. **Filtrado**: Los datos se filtran considerando tanto condiciones padre como hijo
5. **Limpieza**: Al desactivar un filtro padre, se limpian automáticamente sus hijos

## Beneficios

- ✅ **Compatibilidad total** con filtros existentes
- ✅ **Interface intuitiva** con indicadores visuales claros
- ✅ **Rendimiento optimizado** con animaciones suaves
- ✅ **Responsive** para todos los dispositivos
- ✅ **Extensible** para futuras mejoras
- ✅ **Debug integrado** para facilitar mantenimiento

## Notas Técnicas

- Los campos condicionales mantienen la nomenclatura `nm_{field_name}` en las propiedades de los marcadores
- La lógica de filtrado verifica primero la condición padre antes de evaluar el hijo
- Los estilos son modulares y no afectan componentes existentes
- El código incluye logs de debug que pueden ser removidos en producción

## Pruebas Recomendadas

1. Crear un formulario con campos conditional-select
2. Agregar campos delegados de diferentes tipos (select, radio, checkbox)
3. Verificar que aparezcan en el gestor de filtros
4. Probar la funcionalidad de mostrar/ocultar basándose en selecciones padre
5. Verificar que el filtrado funcione correctamente con datos reales
6. Probar la limpieza de filtros y la navegación entre opciones
