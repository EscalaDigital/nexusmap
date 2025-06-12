# Campo Selector Geográfico - Documentación

## Resumen
Se ha implementado exitosamente un campo selector geográfico configurable para el plugin NexusMap que permite crear selectores en cascada conectados a la API de GeoNames.

## Funcionalidades Implementadas

### ✅ Características Principales
- **Drag & Drop**: Campo disponible en el form builder con arrastrar y soltar
- **Configuración Flexible**: Panel de configuración completo para personalizar el comportamiento
- **Selectores en Cascada**: Dropdowns que se cargan dinámicamente según la selección anterior
- **API GeoNames**: Integración completa con la API de GeoNames para datos geográficos actualizados
- **Nombres Personalizados**: Permite definir nombres de campo personalizados (ej: "comunidad_autonoma", "provincia") en lugar de "admin1", "admin2"
- **Almacenamiento Directo**: Los datos se guardan directamente como propiedades JSON sin agrupación
- **Sistema de Caché**: Optimizaciones de rendimiento con caché de datos
- **Diseño Responsive**: Estilos CSS adaptables para diferentes dispositivos

### 🔧 Configuración
1. **País Base**: Selección del país para el cual configurar los niveles administrativos
2. **Niveles Administrativos**: Configuración jerárquica personalizable (ej: España > Comunidad Autónoma > Provincia > Municipio)
3. **Nombres de Campo**: Asignación de nombres personalizados a cada nivel
4. **Usuario GeoNames**: Configuración del usuario para acceso a la API

## Archivos Creados

### Templates
- `admin/views/field-templates/geographic-selector.php` - Template del campo con panel de configuración

### JavaScript
- `admin/js/geographic-selector-config.js` - Sistema de configuración administrativa
- `public/js/geographic-selector.js` - Funcionalidad frontend para selectores en cascada

### Estilos
- `public/css/geographic-selector.css` - Estilos CSS responsive

## Archivos Modificados

### Backend
- `admin/views/form-builder.php` - Agregado campo "Selector Geográfico" a la UI
- `includes/class-nm-ajax-handler.php` - Agregado handler para guardar usuario GeoNames y corregido save_form
- `admin/class-nm-admin.php` - Agregado carga de assets CSS/JS
- `public/class-nm-public.php` - Agregado carga de assets frontend

### Templates de Formulario
- `public/views/form-display.php` - Agregado caso para geographic-selector
- `public/views/form-display-ab.php` - Agregado caso para geographic-selector

### JavaScript
- `admin/js/admin.js` - Modificado saveForm para manejar configuración geográfica

## Estructura de Datos

### Configuración del Campo
```javascript
{
    type: "geographic-selector",
    label: "Ubicación",
    name: "ubicacion",
    geoConfig: {
        country: "ES",
        levels: [
            {
                geonameId: "2593109",
                name: "Comunidad Autónoma",
                fieldName: "comunidad_autonoma"
            },
            {
                geonameId: "2593110", 
                name: "Provincia",
                fieldName: "provincia"
            },
            {
                geonameId: "2593111",
                name: "Municipio", 
                fieldName: "municipio"
            }
        ]
    }
}
```

### Datos Guardados en Formulario
```javascript
{
    "comunidad_autonoma": "Andalucía",
    "provincia": "Sevilla", 
    "municipio": "Sevilla",
    "comunidad_autonoma_id": "2593109",
    "provincia_id": "2593110",
    "municipio_id": "2593111"
}
```

## Uso del Campo

### 1. Configuración Inicial
1. Ir al Form Builder de NexusMap
2. Registrarse en [GeoNames.org](https://www.geonames.org/login) para obtener un usuario
3. Configurar el usuario GeoNames en la configuración del campo

### 2. Agregar Campo
1. Arrastrar "Selector Geográfico" desde la lista de campos disponibles
2. Soltar en el área del formulario
3. Hacer clic en el botón de configuración (⚙️)

### 3. Configurar Niveles
1. Seleccionar el país base
2. Configurar los niveles administrativos deseados
3. Asignar nombres personalizados a cada nivel
4. Guardar la configuración

### 4. Publicar Formulario
1. Guardar el formulario usando el botón correspondiente
2. El campo aparecerá en el frontend con selectores en cascada

## API Integration

### GeoNames API
- **Endpoint**: `http://api.geonames.org/childrenJSON`
- **Parámetros**: `geonameId`, `username`
- **Respuesta**: Lista de subdivisiones administrativas
- **Caché**: Los datos se cachean para mejorar el rendimiento

### Estructura de Respuesta
```javascript
{
    "geonames": [
        {
            "geonameId": 2593109,
            "name": "Andalucía",
            "countryCode": "ES",
            "adminCode1": "51"
        }
    ]
}
```

## Flujo de Funcionamiento

### 1. Configuración (Admin)
```
Usuario configura campo → Selecciona país → Define niveles → Asigna nombres → Guarda
```

### 2. Uso (Frontend)
```
Usuario selecciona nivel 1 → API carga opciones nivel 2 → Usuario selecciona nivel 2 → API carga nivel 3 → etc.
```

### 3. Envío de Formulario
```
Formulario se envía → Datos se almacenan con nombres personalizados → Se incluyen IDs de GeoNames
```

## Consideraciones Técnicas

### Rendimiento
- Sistema de caché implementado para reducir llamadas a la API
- Carga asíncrona de datos para mejorar UX
- Debounce en las peticiones para evitar spam

### Seguridad
- Sanitización de datos de entrada
- Validación de nonces en AJAX calls
- Escape de output en templates

### Compatibilidad
- Compatible con WordPress 5.0+
- Funciona con navegadores modernos
- Diseño responsive para móviles

## Próximos Pasos Opcionales

### Mejoras Posibles
1. **Geocodificación Inversa**: Permitir selección por coordenadas
2. **Múltiples Países**: Soporte para campos multi-país
3. **Validación Avanzada**: Validaciones de integridad geográfica
4. **Exportación**: Funciones para exportar datos geográficos
5. **Visualización**: Integración con mapas para preview

### Personalización
- Los estilos CSS pueden modificarse en `public/css/geographic-selector.css`
- La lógica de configuración se puede extender en `geographic-selector-config.js`
- Los templates pueden personalizarse según necesidades específicas

## Soporte
Para consultas o problemas:
1. Verificar que el usuario GeoNames esté configurado correctamente
2. Revisar la consola del navegador para errores JavaScript
3. Comprobar los logs de WordPress para errores PHP
4. Validar que la API de GeoNames esté disponible

---

**Estado**: ✅ Implementación completa y funcional
**Versión**: 1.0.0
**Fecha**: Junio 2025
