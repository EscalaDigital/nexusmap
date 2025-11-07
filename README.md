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

1. Descargue el plugin desde el [repositorio de GitHub](https://github.com/EscalaDigital/nexusmap).
2. Suba la carpeta `nexusmap` comprimida en .zip al directorio `/wp-content/plugins/`.
3. Active el plugin desde el panel de WordPress.

## Uso

### Shortcodes Disponibles

#### 🗺️ Insertar mapa - `[nm_map]`

Muestra el mapa interactivo principal con todas las funcionalidades.

**Sintaxis:**
```
[nm_map width="100%" height="500px" lat="0" lng="0" zoom="2"]
```

**Parámetros:**
- `width`: Ancho del mapa (por defecto: "100%")
- `height`: Alto del mapa (por defecto: "500px")
- `lat`: Latitud inicial del centro del mapa (por defecto: "0")
- `lng`: Longitud inicial del centro del mapa (por defecto: "0")
- `zoom`: Nivel de zoom inicial (1-18, por defecto: "2")

**Ejemplos:**
```php
// Mapa básico
[nm_map]

// Mapa centrado en Madrid
[nm_map lat="40.4168" lng="-3.7038" zoom="10" height="600px"]

// Mapa de tamaño fijo
[nm_map width="800px" height="400px"]
```

#### 📝 Insertar formulario - `[nm_form]`

Muestra el formulario para que los usuarios envíen datos geográficos.

```php
[nm_form]
```

**Características:**
- **Autenticación requerida**: Solo usuarios logueados pueden ver el formulario
- **Modo A/B Testing**: Soporta dos formularios alternativos si está configurado
- **Validación automática**: Validación de campos en tiempo real
- **Subida de archivos**: Soporte para imágenes, audio y documentos

#### 📊 Lista de entradas - `[nm_entries_list]`

Muestra una galería con las entradas enviadas y aprobadas.

```php
[nm_entries_list per_page="10" show_pagination="true"]
```

**Parámetros:**
- `per_page`: Número de entradas por página (por defecto: 10)
- `show_pagination`: Mostrar controles de paginación (por defecto: "true")

**Ejemplos:**
```php
// Lista básica
[nm_entries_list]

// 20 entradas por página
[nm_entries_list per_page="20"]

// Sin paginación
[nm_entries_list show_pagination="false"]
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
