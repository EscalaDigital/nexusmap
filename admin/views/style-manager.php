<div class="wrap">
    <h1>Gestión de Estilos</h1>
    
    <form method="post" action="options.php">
        <?php settings_fields('nm_style_settings'); ?>
        
        <h2>Estilo para el Mapa</h2>
        <table class="form-table">
            <tr>
                <th scope="row">Seleccionar Tema</th>
                <td>
                    <select name="nm_selected_theme">
                        <option value="1" <?php selected($current_theme, '1'); ?>>Tema 1</option>
                        <option value="2" <?php selected($current_theme, '2'); ?>>Tema 2</option>
                    </select>
                </td>
            </tr>
        </table>

        <h2>Estilo para el Formulario</h2>
        <table class="form-table">
            <tr>
                <th scope="row">Seleccionar Tema</th>
                <td>
                    <select name="nm_selected_theme_form">
                        <option value="1" <?php selected($current_theme_form, '1'); ?>>Tema 1</option>
                        <option value="2" <?php selected($current_theme_form, '2'); ?>>Tema 2</option>
                    </select>
                </td>
            </tr>
        </table>

        <?php submit_button('Guardar Cambios'); ?>
    </form>
</div>