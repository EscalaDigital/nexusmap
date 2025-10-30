<?php
// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1>Galería</h1>
    
    <div class="notice notice-warning">
        <p><strong>⚠️ No se ha encontrado ningún formulario creado</strong></p>
        <p>Para poder configurar la galería, primero necesitas crear un formulario en el <a href="<?php echo admin_url('admin.php?page=nm'); ?>">Constructor de Formularios de NexusMap</a>.</p>
        <p>Una vez que hayas creado un formulario con campos como texto, imagen, audio, archivo o fecha, podrás configurar qué campos mostrar en la galería.</p>
    </div>
    
    <div class="card">
        <div class="inside">
            <h3>¿Qué es la galería?</h3>
            <p>La galería te permite configurar qué campos del formulario se mostrarán en las tarjetas de entradas. Puedes seleccionar:</p>
            <ul>
                <li><strong>📝 Texto:</strong> Se muestra como título (solo uno permitido)</li>
                <li><strong>📷 Imagen:</strong> Se muestra como imagen destacada (solo una permitida)</li>
                <li><strong>🎵 Audio:</strong> Se muestra como reproductor (solo uno permitido)</li>
                <li><strong>📄 Archivo:</strong> Se muestra como botón de descarga (solo uno permitido)</li>
                <li><strong>📅 Fecha:</strong> Se formatea automáticamente (solo una permitida)</li>
                <li><strong>📋 Texto largo:</strong> Se trunca si es muy largo (solo uno permitido)</li>
            </ul>
        </div>
    </div>
</div>
