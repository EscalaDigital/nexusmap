<?php
/**
 * Script de limpieza para datos corruptos en formularios
 * Ejecuta este archivo una vez para limpiar datos problemáticos
 */

// Incluir WordPress
require_once('../../../wp-load.php');

if (!current_user_can('manage_options')) {
    die('Sin permisos para ejecutar este script');
}

global $wpdb;
$forms_table = $wpdb->prefix . 'nm_forms';

echo "<h1>Limpieza de Datos Corruptos - Geographic Selector</h1>";

// Obtener todos los formularios
$forms = $wpdb->get_results("SELECT * FROM {$forms_table}");

echo "<h2>Formularios encontrados: " . count($forms) . "</h2>";

$fixed_count = 0;
$backup_made = false;

foreach ($forms as $form) {
    echo "<h3>Procesando Formulario ID: {$form->id} (Tipo: {$form->form_type})</h3>";
    
    $form_data = maybe_unserialize($form->form_data);
    
    if (!isset($form_data['fields']) || !is_array($form_data['fields'])) {
        echo "<p>❌ No tiene campos o estructura inválida</p>";
        continue;
    }
    
    $has_errors = false;
    $fixed_fields = [];
    
    foreach ($form_data['fields'] as $index => $field) {
        echo "<p>Campo {$index}: Tipo = " . ($field['type'] ?? 'NO_TYPE') . "</p>";
        
        // Detectar campos problemáticos
        if (!isset($field['type']) || empty($field['type'])) {
            echo "<p style='color: red;'>⚠️ Campo sin tipo en índice {$index}</p>";
            $has_errors = true;
            continue; // Saltar este campo
        }
        
        if ($field['type'] === 'hierarchical-select') {
            echo "<p style='color: red;'>⚠️ Encontrado campo corrupto 'hierarchical-select' en índice {$index}</p>";
            
            // Intentar determinar si debería ser geographic-selector
            if (isset($field['config']) || isset($field['geonames_user']) || isset($field['country'])) {
                $field['type'] = 'geographic-selector';
                echo "<p style='color: green;'>✅ Convertido a 'geographic-selector'</p>";
                $has_errors = true;
            } else {
                echo "<p style='color: orange;'>⚠️ Eliminando campo corrupto sin datos útiles</p>";
                continue; // No añadir este campo
            }
        }
        
        // Validar campos geographic-selector
        if ($field['type'] === 'geographic-selector') {
            if (empty($field['name'])) {
                $field['name'] = 'geographic_selector_' . uniqid();
                $has_errors = true;
            }
            if (empty($field['label'])) {
                $field['label'] = 'Selector Geográfico';
                $has_errors = true;
            }
            if (!isset($field['config'])) {
                $field['config'] = [
                    'geonames_user' => '',
                    'country' => 'ES',
                    'levels' => [],
                    'field_names' => []
                ];
                $has_errors = true;
            }
        }
        
        $fixed_fields[] = $field;
    }
    
    if ($has_errors) {
        if (!$backup_made) {
            // Hacer backup una sola vez
            $backup_table = $forms_table . '_backup_' . date('Y_m_d_H_i_s');
            $wpdb->query("CREATE TABLE {$backup_table} AS SELECT * FROM {$forms_table}");
            echo "<p style='background: yellow; padding: 10px;'><strong>✅ Backup creado en tabla: {$backup_table}</strong></p>";
            $backup_made = true;
        }
        
        $form_data['fields'] = $fixed_fields;
        
        $result = $wpdb->update(
            $forms_table,
            ['form_data' => maybe_serialize($form_data)],
            ['id' => $form->id],
            ['%s'],
            ['%d']
        );
        
        if ($result !== false) {
            echo "<p style='color: green;'>✅ Formulario {$form->id} corregido</p>";
            $fixed_count++;
        } else {
            echo "<p style='color: red;'>❌ Error al corregir formulario {$form->id}: " . $wpdb->last_error . "</p>";
        }
    } else {
        echo "<p>✅ Formulario {$form->id} está OK</p>";
    }
    
    echo "<hr>";
}

echo "<h2>Resumen</h2>";
echo "<p><strong>Formularios corregidos:</strong> {$fixed_count}</p>";

if ($backup_made) {
    echo "<p style='background: yellow; padding: 10px;'>";
    echo "<strong>IMPORTANTE:</strong> Se ha creado un backup de tus datos. ";
    echo "Si algo va mal, puedes restaurar ejecutando:<br>";
    echo "<code>DROP TABLE {$forms_table}; ALTER TABLE {$backup_table} RENAME TO {$forms_table};</code>";
    echo "</p>";
}

echo "<h3>Próximos pasos:</h3>";
echo "<ol>";
echo "<li>Recarga la página del constructor de formularios</li>";
echo "<li>Verifica que no aparezcan más errores de templates</li>";
echo "<li>Prueba añadir un nuevo selector geográfico</li>";
echo "<li>Si todo funciona, puedes eliminar este archivo</li>";
echo "</ol>";

?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    background: #f5f5f5;
}
h1, h2, h3 {
    color: #0073aa;
}
p {
    background: white;
    padding: 8px;
    margin: 5px 0;
    border-radius: 3px;
}
hr {
    margin: 20px 0;
    border: none;
    border-top: 1px solid #ddd;
}
code {
    background: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
}
</style>
