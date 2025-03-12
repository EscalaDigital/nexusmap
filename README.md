# NexusMap

Un plugin de WordPress para crear mapas colaborativos utilizando Leaflet.js. Permite a los usuarios crear formularios personalizados y recopilar datos geoespaciales.

## Características

- **Constructor de Formularios**: Interfaz drag & drop para crear formularios personalizados
- **Tipos de Campos**: 
  - Campos básicos (texto, área de texto, checkbox, radio, select, etc.)
  - Campos especiales (fecha, número, URL, archivos)
  - Campo de mapa para dibujar puntos
- **Testing A/B**: Opción para crear dos versiones de formularios diferentes
- **Gestión de Capas**:
  - Soporte para múltiples capas base
  - Capas overlay (GeoJSON y WMS)
  - Los usuarios pueden agregar sus propias capas WMS
- **Características del Mapa**:
  - Búsqueda de ubicaciones
  - Descarga de datos en formato GeoJSON 
  - Control de capas personalizable

## Instalación

1. Descargue el plugin desde el [repositorio de GitHub](https://github.com/usuario/nexusmap).
2. Suba la carpeta `nexusmap` comprimida en .zip al directorio `/wp-content/plugins/`.
3. Active el plugin desde el panel de WordPress.

## Uso

### Shortcode Básico

#### Insertar mapa

```php
[nm_map lat="0" lng="0" zoom="2" width="100%" height="400px"]
```

#### Insertar formulario

```php
[nm_form]
```

### Panel de Administración

- **Form Builder**: Cree y personalice formularios
- **Entries**: Gestione los datos enviados
- **Map Settings**: Configure opciones del mapa
- **Manage Layers**: Administre capas base y overlay

## Contribución

1. Haga un fork del repositorio.
2. Cree una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realice sus cambios y haga commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Haga push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Cree un nuevo Pull Request.

## Requisitos

- WordPress 5.0 o superior
- PHP 7.2 o superior
- Permisos de administrador para la configuración

## Licencia

GPLv2 o posterior

## Créditos

- Leaflet.js para la visualización de mapas
- jQuery UI para la funcionalidad drag & drop
