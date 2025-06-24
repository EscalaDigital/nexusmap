<?php
/**
 * Script para limpiar configuración incorrecta de galería
 * Ejecutar una sola vez para preparar el sistema
 */

// Configurar WordPress
if (!defined('ABSPATH')) {
    require_once('../../../wp-config.php');
}

echo "<h2>🧹 Limpiar Configuración de Galería NexusMap</h2>\n";

// Eliminar configuración existente para forzar reconfiguración
delete_option('nm_gallery_settings');

echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; color: #155724;'>";
echo "<strong>✅ Configuración de galería limpiada!</strong><br>";
echo "Ahora ve a <strong>NexusMap > Galería</strong> y vuelve a seleccionar los campos.<br>";
echo "El sistema ahora guardará automáticamente los nombres correctos (con prefijo nm_).";
echo "</div>\n";

echo "<h3>📋 Pasos siguientes:</h3>\n";
echo "<ol>\n";
echo "<li>Ve a <strong>WordPress Admin > NexusMap > Galería</strong></li>\n";
echo "<li>Selecciona los campos deseados:";
echo "<ul>";
echo "<li><strong>Texto/Título:</strong> Título (text)</li>";
echo "<li><strong>Imagen:</strong> imagen (image)</li>";
echo "<li><strong>Archivo:</strong> documento (file)</li>";
echo "</ul></li>";
echo "<li>Haz clic en <strong>Guardar Configuración</strong></li>\n";
echo "<li>Ve a tu página con el shortcode <code>[nm_entries_list]</code></li>\n";
echo "<li>¡Las tarjetas deberían mostrar correctamente el contenido!</li>\n";
echo "</ol>\n";

echo "<p><strong>Nota:</strong> Ya no necesitas usar scripts de corrección. El sistema ahora funciona correctamente desde la interfaz de administración.</p>\n";
?>
