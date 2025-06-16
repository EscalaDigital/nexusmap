<?php
/**
 * Debug Geographic Selector Issues
 * Archivo temporal para depurar problemas
 */

// Activar debug
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Simular WordPress básico
if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}

echo "<h1>Debug Geographic Selector</h1>";

// Verificar archivos de template
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

echo "<h2>Verificación de Templates</h2>";
echo "<ul>";
foreach ($required_templates as $template) {
    $exists = file_exists($template_dir . $template);
    $status = $exists ? "✅ Existe" : "❌ Falta";
    echo "<li><code>{$template}</code> - {$status}</li>";
}
echo "</ul>";

// Verificar archivos JavaScript
$js_files = [
    'admin/js/admin.js',
    'admin/js/geographic-selector-config.js',
    'public/js/geographic-selector.js'
];

echo "<h2>Verificación de archivos JavaScript</h2>";
echo "<ul>";
foreach ($js_files as $js_file) {
    $exists = file_exists(__DIR__ . '/' . $js_file);
    $status = $exists ? "✅ Existe" : "❌ Falta";
    echo "<li><code>{$js_file}</code> - {$status}</li>";
}
echo "</ul>";

// Verificar archivos CSS
$css_files = [
    'public/css/geographic-selector.css',
    'admin/css/admin.css'
];

echo "<h2>Verificación de archivos CSS</h2>";
echo "<ul>";
foreach ($css_files as $css_file) {
    $exists = file_exists(__DIR__ . '/' . $css_file);
    $status = $exists ? "✅ Existe" : "❌ Falta";
    echo "<li><code>{$css_file}</code> - {$status}</li>";
}
echo "</ul>";

// Verificar estructura de directorios
echo "<h2>Estructura de Directorios</h2>";
echo "<pre>";
function listDir($dir, $level = 0) {
    if (!is_dir($dir)) return;
    
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $path = $dir . '/' . $item;
        $indent = str_repeat('  ', $level);
        
        if (is_dir($path)) {
            echo $indent . "📁 " . $item . "/\n";
            if ($level < 2) { // Limitar profundidad
                listDir($path, $level + 1);
            }
        } else {
            echo $indent . "📄 " . $item . "\n";
        }
    }
}

listDir(__DIR__);
echo "</pre>";

echo "<h2>Información del Sistema</h2>";
echo "<ul>";
echo "<li>PHP Version: " . phpversion() . "</li>";
echo "<li>Current Directory: " . __DIR__ . "</li>";
echo "<li>Script Name: " . $_SERVER['SCRIPT_NAME'] . "</li>";
echo "<li>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</li>";
echo "</ul>";

?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
h1, h2 {
    color: #0073aa;
}
ul {
    list-style-type: none;
    padding-left: 0;
}
li {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
}
code {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
}
pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
}
</style>
