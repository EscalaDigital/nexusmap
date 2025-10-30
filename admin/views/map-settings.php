<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Obtener el valor actual de la opción
$enable_geojson_download = get_option( 'nm_enable_geojson_download', false );
?>

<style>
.nm-admin-wrapper {
    max-width: 1200px;
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.nm-admin-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.nm-admin-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.nm-admin-header p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 16px;
}

.nm-admin-content {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.nm-admin-content:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.nm-form-table {
    background: white;
    border: none;
}

.nm-form-table th {
    color: #374151;
    font-weight: 600;
    padding: 15px 10px;
}

.nm-form-table td {
    padding: 15px 10px;
}

.nm-form-table input,
.nm-form-table select,
.nm-form-table textarea {
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background: white;
    width: 100%;
    max-width: 400px;
}

.nm-form-table input:focus,
.nm-form-table select:focus,
.nm-form-table textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.nm-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 30px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.nm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    color: white;
}

@media (max-width: 768px) {
    .nm-admin-header {
        padding: 20px;
    }
    
    .nm-admin-content {
        padding: 20px;
    }
}
</style>

<div class="wrap nm-admin-wrapper">
    <div class="nm-admin-header">
        <h1><?php esc_html_e( 'Configuración del Mapa', 'nexusmap' ); ?></h1>
        <p>Configura las opciones principales del mapa y sus funcionalidades</p>
    </div>

    <div class="nm-admin-content">
        <form method="post" action="options.php">
            <?php
            settings_fields( 'nm_map_settings_group' );
            do_settings_sections( 'nm_map_settings' );
            ?>
            <input type="submit" name="submit" id="submit" class="nm-btn-primary" value="💾 Guardar Configuración">
        </form>
    </div>
</div>
