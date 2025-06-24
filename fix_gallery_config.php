<?php
// Script para actualizar configuración de galería con nombres correctos
// Ejecutar accediendo a: http://localhost/nexusmap/wp-content/plugins/nexusmap/fix_gallery_config.php

// Configurar WordPress
if (!defined('ABSPATH')) {
    require_once('../../../wp-config.php');
}

echo "<h2>🔧 Arreglar Configuración de Galería NexusMap</h2>\n";

// Obtener configuración actual
$current_settings = get_option('nm_gallery_settings', array());
echo "<h3>Configuración actual:</h3>\n";
echo "<pre>";
print_r($current_settings);
echo "</pre>\n";

// Actualizar con nombres correctos (con prefijo nm_)
$new_settings = array(
    'selected_fields' => array(
        'text' => 'nm_titulo',
        'image' => 'nm_imagen',
        'audio' => '',
        'file' => 'nm_documento',
        'date' => '',
        'textarea' => ''
    )
);

// Guardar nueva configuración
$result = update_option('nm_gallery_settings', $new_settings);

echo "<h3>Nueva configuración guardada:</h3>\n";
echo "<pre>";
print_r($new_settings);
echo "</pre>\n";

if ($result) {
    echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; color: #155724;'>";
    echo "<strong>✅ Configuración actualizada correctamente!</strong><br>";
    echo "Los nombres de campo ahora coinciden con los datos guardados en la base de datos.";
    echo "</div>\n";
} else {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; color: #721c24;'>";
    echo "<strong>❌ Error al actualizar la configuración</strong>";
    echo "</div>\n";
}

echo "<h3>🚀 Siguiente paso:</h3>\n";
echo "<p>Ahora ve a la página con el shortcode <code>[nm_entries_list]</code> y las tarjetas deberían mostrar correctamente:</p>\n";
echo "<ul>\n";
echo "<li><strong>Título:</strong> " . htmlspecialchars($new_settings['selected_fields']['text']) . "</li>\n";
echo "<li><strong>Imagen:</strong> " . htmlspecialchars($new_settings['selected_fields']['image']) . "</li>\n";
echo "<li><strong>Archivo:</strong> " . htmlspecialchars($new_settings['selected_fields']['file']) . "</li>\n";
echo "</ul>\n";

echo "<p><strong>Si siguen apareciendo vacías:</strong></p>\n";
echo "<ol>\n";
echo "<li>Ejecuta de nuevo <code>debug_gallery.php</code> para verificar la extracción</li>\n";
echo "<li>Revisa los logs de WordPress en <code>/wp-content/debug.log</code></li>\n";
echo "<li>Verifica que no hay errores de CSS o JavaScript en el navegador (F12)</li>\n";
echo "</ol>\n";
?>
