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

.nm-section-box {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.nm-section-box:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.nm-section-box h2 {
    color: #2c3e50;
    font-size: 20px;
    margin: 0 0 20px 0;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f3f4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.nm-section-box h2:before {
    content: "🎨";
    font-size: 24px;
}

.nm-form-table {
    background: white;
    border: none;
    width: 100%;
}

.nm-form-table th {
    color: #374151;
    font-weight: 600;
    padding: 15px 10px;
    text-align: left;
    width: 200px;
}

.nm-form-table td {
    padding: 15px 10px;
}

.nm-form-table select {
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background: white;
    width: 100%;
    max-width: 300px;
}

.nm-form-table select:focus {
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

.theme-preview {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 10px;
    vertical-align: middle;
    border: 2px solid #e5e7eb;
}

.theme-1 { background: linear-gradient(45deg, #3b82f6, #1d4ed8); }
.theme-2 { background: linear-gradient(45deg, #10b981, #047857); }
.theme-3 { background: linear-gradient(45deg, #1e3a8a, #9333ea); }

@media (max-width: 768px) {
    .nm-admin-header {
        padding: 20px;
    }
    
    .nm-section-box {
        padding: 20px;
    }
    
    .nm-form-table th {
        width: auto;
    }
}
</style>

<div class="wrap nm-admin-wrapper">
    <div class="nm-admin-header">
        <h1>Gestión de Estilos</h1>
        <p>Personaliza la apariencia de tus mapas y formularios con temas predefinidos</p>
    </div>
    
    <form method="post" action="options.php">
        <?php settings_fields('nm_style_settings'); ?>
        
        <div class="nm-section-box">
            <h2>Estilo para el Mapa</h2>
            <table class="nm-form-table">
                <tr>
                    <th scope="row">Seleccionar Tema</th>
                    <td>
                        <select name="nm_selected_theme">
                            <option value="1" <?php selected($current_theme, '1'); ?>>
                                <span class="theme-preview theme-1"></span>🗺️ Tema 1 - Azul Profesional
                            </option>
                            <option value="2" <?php selected($current_theme, '2'); ?>>
                                <span class="theme-preview theme-2"></span>🌿 Tema 2 - Verde Natural
                            </option>
                            <option value="3" <?php selected($current_theme, '3'); ?>>
                                <span class="theme-preview theme-3"></span>🎧 Audioguía (Móvil)
                            </option>
                        </select>
                    </td>
                </tr>
            </table>
        </div>

        <div class="nm-section-box">
            <h2>Estilo para el Formulario</h2>
            <table class="nm-form-table">
                <tr>
                    <th scope="row">Seleccionar Tema</th>
                    <td>
                        <select name="nm_selected_theme_form">
                            <option value="1" <?php selected($current_theme_form, '1'); ?>>
                                <span class="theme-preview theme-1"></span>📝 Tema 1 - Formulario Azul
                            </option>
                            <option value="2" <?php selected($current_theme_form, '2'); ?>>
                                <span class="theme-preview theme-2"></span>🌱 Tema 2 - Formulario Verde
                            </option>
                        </select>
                    </td>
                </tr>
            </table>
        </div>

        <input type="submit" name="submit" class="nm-btn-primary" value="💾 Guardar Cambios">
    </form>
</div>