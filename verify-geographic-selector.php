<?php
/**
 * Verificación rápida del estado del geographic-selector
 */

// Incluir WordPress
require_once('../../../wp-load.php');

if (!current_user_can('manage_options')) {
    die('Sin permisos para ejecutar este script');
}

global $wpdb;
$forms_table = $wpdb->prefix . 'nm_forms';

echo "<h1>🔍 Verificación Geographic Selector</h1>";

// Verificar formularios
$forms = $wpdb->get_results("SELECT * FROM {$forms_table}");
echo "<h2>📊 Estado de Formularios</h2>";
echo "<p><strong>Total formularios:</strong> " . count($forms) . "</p>";

$issues_found = [];
$geographic_count = 0;

foreach ($forms as $form) {
    $form_data = maybe_unserialize($form->form_data);
    
    if (!isset($form_data['fields']) || !is_array($form_data['fields'])) {
        continue;
    }
    
    foreach ($form_data['fields'] as $index => $field) {
        if (!isset($field['type'])) {
            $issues_found[] = "Formulario {$form->id}: Campo sin tipo en índice {$index}";
            continue;
        }
        
        if ($field['type'] === 'hierarchical-select') {
            $issues_found[] = "Formulario {$form->id}: Campo corrupto 'hierarchical-select' en índice {$index}";
        }
        
        if ($field['type'] === 'geographic-selector') {
            $geographic_count++;
        }
        
        // Verificar tipos inválidos
        $valid_types = [
            'text', 'textarea', 'select', 'checkbox', 'radio', 
            'file', 'image', 'number', 'date', 'url', 'range',
            'header', 'map', 'conditional-select', 'geographic-selector'
        ];
        
        if (!in_array($field['type'], $valid_types)) {
            $issues_found[] = "Formulario {$form->id}: Tipo inválido '{$field['type']}' en índice {$index}";
        }
    }
}

echo "<p><strong>Selectores geográficos encontrados:</strong> {$geographic_count}</p>";

if (empty($issues_found)) {
    echo "<div style='background: #d1edff; padding: 15px; border-radius: 5px; color: #0073aa;'>";
    echo "<strong>✅ ¡Todo está bien!</strong><br>";
    echo "No se encontraron problemas en los formularios.";
    echo "</div>";
} else {
    echo "<div style='background: #fee; padding: 15px; border-radius: 5px; color: #d63638;'>";
    echo "<strong>⚠️ Problemas encontrados:</strong><br>";
    foreach ($issues_found as $issue) {
        echo "• " . esc_html($issue) . "<br>";
    }
    echo "</div>";
    
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin-top: 10px;'>";
    echo "<strong>🔧 Acción recomendada:</strong><br>";
    echo "Ejecuta el script de limpieza: <a href='cleanup-corrupted-data.php'>cleanup-corrupted-data.php</a>";
    echo "</div>";
}

// Verificar archivos de template
echo "<h2>📁 Verificación de Templates</h2>";
$template_dir = __DIR__ . '/admin/views/field-templates/';
$required_templates = [
    'geographic-selector.php',
    'text.php',
    'select.php',
    'checkbox.php',
    'radio.php',
    'textarea.php',
    'file.php',
    'number.php',
    'date.php',
    'url.php',
    'header.php',
    'conditional-select.php'
];

$missing_templates = [];
foreach ($required_templates as $template) {
    if (!file_exists($template_dir . $template)) {
        $missing_templates[] = $template;
    }
}

if (empty($missing_templates)) {
    echo "<p style='color: green;'>✅ Todos los templates están presentes</p>";
} else {
    echo "<p style='color: red;'>❌ Templates faltantes:</p>";
    echo "<ul>";
    foreach ($missing_templates as $template) {
        echo "<li><code>{$template}</code></li>";
    }
    echo "</ul>";
}

// Verificar configuración de usuario GeoNames
$geonames_user = get_option('nm_geonames_user', '');
echo "<h2>🌍 Configuración GeoNames</h2>";
if (empty($geonames_user)) {
    echo "<p style='color: orange;'>⚠️ No hay usuario GeoNames configurado globalmente</p>";
} else {
    echo "<p style='color: green;'>✅ Usuario GeoNames: <code>" . esc_html($geonames_user) . "</code></p>";
}

echo "<h2>📋 Siguientes Pasos</h2>";
echo "<ol>";
if (!empty($issues_found)) {
    echo "<li><strong>Ejecutar limpieza:</strong> <a href='cleanup-corrupted-data.php'>cleanup-corrupted-data.php</a></li>";
}
echo "<li><strong>Ir al constructor:</strong> <a href='" . admin_url('admin.php?page=nm') . "'>Constructor de formularios</a></li>";
echo "<li><strong>Probar geographic-selector:</strong> Arrastrar y configurar</li>";
echo "<li><strong>Verificar frontend:</strong> Probar formulario en una página</li>";
echo "</ol>";

?>

<style>
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: #f0f0f1;
}
h1, h2 {
    color: #1d2327;
}
p, li {
    line-height: 1.6;
}
code {
    background: #f6f7f7;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
}
a {
    color: #2271b1;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
ul {
    background: white;
    padding: 15px 30px;
    border-radius: 5px;
    border-left: 3px solid #ddd;
}
</style>
