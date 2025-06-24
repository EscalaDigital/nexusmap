# Debug: Estructura de Datos de NexusMap

## Problema Solucionado
Las tarjetas mostraban "Sin título" e imagen genérica porque el código no estaba extrayendo correctamente los datos del formato GeoJSON.

## Estructura de Datos Identificada

### Datos Guardados en `entry_data`:
```php
array(
    'map_data' => '[{"type":"Feature","geometry":{"type":"Point","coordinates":[-428.203125,-41.409776]},"properties":{"nm_titulo":"Migración, educación y renta...","nm_select":"hola","nm_numero":"","nm_audio":"","nm_audio2":"","nm_conditional_groups":"{}","nm_documento":"https://localhost/nexusmap/wp-content/uploads/2025/06/20250117_ACTA-PROVISIONAL-1-PLAZA-PERIODSTA-VILLAMARTIN.pdf","nm_imagen":"https://localhost/nexusmap/wp-content/uploads/2025/06/Asamblea-Profesores-Catlicos.png"}}]',
    'form_type' => 0
)
```

### Datos Reales en GeoJSON Properties:
Los datos del formulario están dentro de `map_data` → JSON decodificado → `[0]['properties']`:

```php
array(
    'nm_titulo' => 'Migración, educación y renta. Un análisis socio-territorial...',
    'nm_select' => 'hola',
    'nm_numero' => '',
    'nm_audio' => '',
    'nm_audio2' => '',
    'nm_conditional_groups' => '{}',
    'nm_documento' => 'https://localhost/nexusmap/wp-content/uploads/2025/06/20250117_ACTA-PROVISIONAL-1-PLAZA-PERIODSTA-VILLAMARTIN.pdf',
    'nm_imagen' => 'https://localhost/nexusmap/wp-content/uploads/2025/06/Asamblea-Profesores-Catlicos.png'
)
```

## Corrección Aplicada

### Antes (❌):
La función `get_entry_field_value()` solo buscaba directamente en `$entry_data[$field_name]`, pero los datos están anidados en el JSON de `map_data`.

### Después (✅):
La función ahora:
1. Busca directamente en `entry_data` (compatibilidad)
2. **Si no encuentra**, extrae y decodifica `map_data`
3. Busca en `features[0]['properties'][$field_name]`
4. Maneja errores JSON con try/catch

### Código Corregido:
```php
private function get_entry_field_value($entry_data, $field_name, $default = '') {
    // Primero buscar directamente en entry_data
    if (isset($entry_data[$field_name])) {
        return $entry_data[$field_name];
    }
    
    // Si no está directamente, buscar en map_data (formato GeoJSON)
    if (isset($entry_data['map_data'])) {
        $raw_json = wp_unslash($entry_data['map_data']);
        
        try {
            $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);
            
            if (is_array($map_data)) {
                foreach ($map_data as $feature) {
                    if (isset($feature['properties']) && isset($feature['properties'][$field_name])) {
                        return $feature['properties'][$field_name];
                    }
                }
            }
        } catch (\JsonException $e) {
            error_log('Error decoding map_data in get_entry_field_value: ' . $e->getMessage());
        }
    }
    
    return $default;
}
```

## Resultado Esperado

Con la configuración de galería:
- **Texto/Título**: `nm_titulo`
- **Imagen**: `nm_imagen`
- **Archivo**: `nm_documento`

La tarjeta ahora mostrará:
- **Título**: "Migración, educación y renta. Un análisis socio-territorial sobre la aparición electoral de la extrema derecha en el espacio metropolitano de Andalucía (2018-2019)"
- **Imagen**: La imagen `Asamblea-Profesores-Catlicos.png`
- **Documento**: Enlace de descarga "📥 Descargar 20250117_ACTA-PROVISIONAL-1-PLAZA-PERIODSTA-VILLAMARTIN.pdf"

## Prueba de Verificación

Para verificar que los datos se extraen correctamente, puedes añadir temporalmente esto al código:

```php
// Debug temporal - agregar antes de render_gallery_card_content()
error_log('Entry data structure: ' . print_r($entry_data, true));
$test_titulo = $this->get_entry_field_value($entry_data, 'nm_titulo');
$test_imagen = $this->get_entry_field_value($entry_data, 'nm_imagen');
error_log("Extracted titulo: $test_titulo");
error_log("Extracted imagen: $test_imagen");
```

Los logs deberían mostrar los valores correctos extraídos del GeoJSON.
