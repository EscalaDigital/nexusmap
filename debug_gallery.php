<?php
/**
 * Script de Debug Directo para NexusMap Gallery
 * Ejecutar desde terminal: php debug_gallery.php
 * O colocar en el root de WordPress y acceder vía web
 */

// Configurar WordPress (si se ejecuta desde web)
if (!defined('ABSPATH')) {
    // Ajustar ruta según tu instalación
    require_once('../../../wp-config.php');
}

// Incluir modelo
require_once('includes/models/class-nm-model.php');

echo "<h2>🔍 Debug Directo - Galería NexusMap</h2>\n";

// 1. Verificar configuración de galería
echo "<h3>1. Configuración de Galería</h3>\n";
$gallery_settings = get_option('nm_gallery_settings', array());
echo "<pre>";
echo "Gallery settings: " . print_r($gallery_settings, true);
echo "</pre>\n";

$selected_fields = isset($gallery_settings['selected_fields']) ? $gallery_settings['selected_fields'] : array();
echo "<pre>";
echo "Selected fields: " . print_r($selected_fields, true);
echo "</pre>\n";

// 2. Verificar entradas en la base de datos
echo "<h3>2. Entradas en Base de Datos</h3>\n";
$model = new NM_Model();
$entries = $model->get_entries_paginated(5, 0, 'approved');

echo "<p>Total entradas aprobadas: " . count($entries) . "</p>\n";

foreach ($entries as $index => $entry) {
    echo "<h4>Entrada #" . ($index + 1) . " (ID: {$entry->id})</h4>\n";
    
    echo "<strong>Raw entry_data:</strong><br>\n";
    echo "<textarea style='width:100%; height:100px;'>" . htmlspecialchars($entry->entry_data) . "</textarea>\n";
    
    // Deserializar datos
    $entry_data = maybe_unserialize($entry->entry_data);
    if (!is_array($entry_data)) {
        $entry_data = json_decode($entry->entry_data, true);
    }
    
    echo "<strong>Processed entry_data:</strong><br>\n";
    echo "<pre>" . print_r($entry_data, true) . "</pre>\n";
    
    // Si hay map_data, decodificar
    if (isset($entry_data['map_data'])) {
        echo "<strong>map_data content:</strong><br>\n";
        $raw_json = wp_unslash($entry_data['map_data']);
        echo "<textarea style='width:100%; height:80px;'>" . htmlspecialchars($raw_json) . "</textarea>\n";
        
        try {
            $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);
            echo "<strong>Decoded map_data:</strong><br>\n";
            echo "<pre>" . print_r($map_data, true) . "</pre>\n";
            
            // Verificar properties si existen
            if (is_array($map_data)) {
                foreach ($map_data as $feature_index => $feature) {
                    if (isset($feature['properties'])) {
                        echo "<strong>Feature {$feature_index} properties:</strong><br>\n";
                        echo "<pre>" . print_r($feature['properties'], true) . "</pre>\n";
                    }
                }
            }
        } catch (\JsonException $e) {
            echo "<strong>❌ Error decodificando map_data:</strong> " . $e->getMessage() . "<br>\n";
        }
    }
    
    // Probar extracción de campos específicos
    if (!empty($selected_fields)) {
        echo "<strong>Testing field extraction:</strong><br>\n";
        
        foreach ($selected_fields as $type => $field_name) {
            if (!empty($field_name)) {
                echo "- {$type} field '{$field_name}': ";
                
                // Simular la función get_entry_field_value
                $value = test_field_extraction($entry_data, $field_name);
                echo $value ? "✅ " . htmlspecialchars($value) : "❌ No encontrado";
                echo "<br>\n";
            }
        }
    }
    
    echo "<hr>\n";
}

// 3. Verificar formulario actual
echo "<h3>3. Formulario Actual</h3>\n";
$form_data = $model->get_form(0);
if ($form_data && isset($form_data['fields'])) {
    echo "<strong>Campos del formulario:</strong><br>\n";
    foreach ($form_data['fields'] as $field) {
        echo "- {$field['type']}: {$field['name']} ({$field['label']})<br>\n";
    }
} else {
    echo "❌ No se encontró formulario configurado<br>\n";
}

/**
 * Función de test para simular get_entry_field_value
 */
function test_field_extraction($entry_data, $field_name, $default = '') {
    // Buscar directamente
    if (isset($entry_data[$field_name])) {
        return $entry_data[$field_name];
    }
    
    // Buscar en map_data
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
            // Error en JSON
        }
    }
    
    // Buscar en estructura anidada
    if (isset($entry_data['fields'])) {
        foreach ($entry_data['fields'] as $field) {
            if (isset($field['name']) && $field['name'] === $field_name && isset($field['value'])) {
                return $field['value'];
            }
        }
    }
    
    return $default;
}

echo "<h3>4. Instrucciones</h3>\n";
echo "<p>📋 <strong>Qué hacer con estos resultados:</strong></p>\n";
echo "<ol>\n";
echo "<li>Revisar si la configuración de galería tiene campos seleccionados</li>\n";
echo "<li>Verificar si las entradas tienen datos en 'map_data' y si se pueden decodificar</li>\n";
echo "<li>Comprobar si los nombres de campo coinciden entre configuración y datos reales</li>\n";
echo "<li>Si todo parece correcto, el problema podría estar en el CSS/frontend</li>\n";
echo "</ol>\n";
?>
