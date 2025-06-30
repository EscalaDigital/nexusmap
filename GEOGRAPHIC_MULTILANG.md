# Selector Geográfico - Soporte Multiidioma

## Descripción
El plugin de selector geográfico ahora incluye soporte para múltiples idiomas al obtener datos de GeoNames. Esto permite que los nombres de países, regiones y ciudades se muestren en el idioma seleccionado por el administrador.

## Idiomas Soportados
- **Español (es)** - Idioma por defecto
- **Inglés (en)**
- **Francés (fr)**
- **Alemán (de)**
- **Italiano (it)**
- **Portugués (pt)**
- **Catalán (ca)**
- **Euskera (eu)**
- **Gallego (gl)**
- **Ruso (ru)**
- **Chino (zh)**
- **Japonés (ja)**
- **Árabe (ar)**

## Cómo Usar

### Configuración de un Campo Geográfico
1. En el constructor de formularios, arrastra un campo "Selector Geográfico"
2. Haz clic en el botón de configuración (⚙️)
3. Selecciona el idioma deseado en el dropdown "Idioma de los datos"
4. Ingresa tu usuario de GeoNames y valídalo
5. Selecciona el país
6. Configura los niveles administrativos necesarios
7. Guarda la configuración

### En el Frontend
- Los usuarios verán los nombres geográficos en el idioma configurado
- La funcionalidad de cascada (seleccionar país > región > ciudad) se mantiene igual
- Los datos se cachean para mejorar el rendimiento

## Cambios Técnicos Implementados

### Backend (PHP)
- Actualizado `NM_Ajax_Handlers.php` para incluir parámetro `lang` en las llamadas a GeoNames
- Modificado el proxy de GeoNames para pasar el idioma a la API
- Actualizado `get_geo_data()` para soportar idiomas

### Frontend (JavaScript)
- Añadido selector de idioma en la configuración del campo
- Actualizado el cache para incluir el idioma como clave
- Modificadas las llamadas AJAX para incluir el parámetro de idioma
- Agregado handler para cambio de idioma que recarga automáticamente los países

### Interfaz de Usuario
- Nuevo dropdown de selección de idioma en la configuración
- Estilos CSS para el nuevo elemento
- Validación automática cuando se cambia el idioma

## Notas Importantes
- El idioma seleccionado se guarda junto con la configuración del campo
- Cambiar el idioma después de configurar el campo recargará automáticamente los países
- El cache se maneja por país, usuario y idioma para optimizar las peticiones
- La funcionalidad es retrocompatible: campos existentes usarán español por defecto

## API de GeoNames
El plugin utiliza el parámetro `lang` de la API de GeoNames:
```
http://api.geonames.org/countryInfoJSON?username=USUARIO&lang=es
http://api.geonames.org/childrenJSON?username=USUARIO&geonameId=ID&lang=es
```

Los idiomas disponibles dependen de los datos disponibles en GeoNames para cada ubicación específica.
