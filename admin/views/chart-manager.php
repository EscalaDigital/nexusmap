<?php

/**
 * HTML con el formulario que permitirá gestionar los gráficos.
 */

// $saved_charts proviene de get_option('nm_chart_settings')
// $numeric_fields y $category_fields provienen del modelo en tu render_charts_page()
?>

<div class="wrap">
    <h1>Gestor de Gráficos</h1>

    <form id="nm-chart-settings" method="post">
        <div id="chart-container">
            <?php if (!empty($saved_charts)): ?>
                <?php foreach ($saved_charts as $index => $chart): ?>
                    <div class="chart-box">
                        <h3>Gráfico <?php echo intval($index + 1); ?></h3>

                        <!-- Título del gráfico -->
                        <input
                            type="text"
                            name="charts[<?php echo $index; ?>][title]"
                            value="<?php echo esc_attr($chart['title']); ?>"
                            placeholder="Título del gráfico"
                            required />

                        <!-- Campo numérico 1 -->
                        <select name="charts[{index}][numeric_field1]">
                            <option value="">Ninguno (contar ocurrencias)</option>
                            <?php foreach ($numeric_fields as $field): ?>
                                <option value="<?php echo esc_attr($field['name']); ?>">
                                    Sumar <?php echo esc_html($field['label']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>

                        <!-- Campo numérico 2 (opcional) -->
                        <select name="charts[<?php echo $index; ?>][numeric_field2]">
                            <option value="">Seleccione campo numérico 2 (opcional)</option>
                            <?php foreach ($numeric_fields as $field): ?>
                                <option value="<?php echo esc_attr($field['name']); ?>"
                                    <?php selected($chart['numeric_field2'], $field['name']); ?>>
                                    <?php echo esc_html($field['label']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>

                        <!-- Campo de categoría (para las barras, por ejemplo) -->
                        <select name="charts[<?php echo $index; ?>][category_field]" required>
                            <option value="">Seleccione campo de categoría (Eje X #1)</option>
                            <?php foreach ($category_fields as $field): ?>
                                <option value="<?php echo esc_attr($field['name']); ?>"
                                    <?php selected($chart['category_field'], $field['name']); ?>>
                                    <?php echo esc_html($field['label']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>

                        <!-- Nuevo: Campo de categoría 2 (opcional), Eje X #2 para la línea -->
                        <select name="charts[<?php echo $index; ?>][category_field_2]">
                            <option value="">(Opcional) Seleccione segundo campo de categoría (Eje X #2)</option>
                            <?php foreach ($category_fields as $field): ?>
                                <option value="<?php echo esc_attr($field['name']); ?>"
                                    <?php
                                    // Si ya estaba guardado, recuérdalo
                                    if (isset($chart['category_field_2'])) {
                                        selected($chart['category_field_2'], $field['name']);
                                    }
                                    ?>>
                                    <?php echo esc_html($field['label']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>

                        <!-- Tipo de gráfico (global) -->
                        <select name="charts[<?php echo $index; ?>][chart_type]" required>
                            <option value="bar" <?php selected($chart['chart_type'], 'bar'); ?>>Barras</option>
                            <option value="line" <?php selected($chart['chart_type'], 'line'); ?>>Líneas</option>
                            <option value="pie" <?php selected($chart['chart_type'], 'pie'); ?>>Circular</option>
                            <option value="mixed" <?php selected($chart['chart_type'], 'mixed'); ?>>Mixto (Barras y Líneas)</option>
                            <!-- Podrías agregar un nuevo valor "two_x_axes" o similar -->
                        </select>

                        <button type="button" class="button remove-chart">Eliminar Gráfico</button>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <button type="button" id="add-chart" class="button button-secondary">Añadir Gráfico</button>
        <button type="submit" class="button button-primary">Guardar Configuración</button>
    </form>
</div>

<!-- Plantilla para nuevos gráficos (se clona al pulsar "Añadir Gráfico") -->
<script type="text/template" id="chart-template">
    <div class="chart-box">
        <h3>Nuevo Gráfico</h3>
        
        <input type="text" name="charts[{index}][title]" placeholder="Título del gráfico" required />

        <select name="charts[{index}][numeric_field1]">
    <option value="">Ninguno (contar ocurrencias)</option>
    <?php foreach ($numeric_fields as $field): ?>
        <option value="<?php echo esc_attr($field['name']); ?>">
            Sumar <?php echo esc_html($field['label']); ?>
        </option>
    <?php endforeach; ?>
</select>
        <select name="charts[{index}][numeric_field2]">
            <option value="">Seleccione campo numérico 2 (opcional)</option>
            <?php foreach ($numeric_fields as $field): ?>
                <option value="<?php echo esc_attr($field['name']); ?>">
                    <?php echo esc_html($field['label']); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <select name="charts[{index}][category_field]" required>
            <option value="">Seleccione campo de categoría (Eje X #1)</option>
            <?php foreach ($category_fields as $field): ?>
                <option value="<?php echo esc_attr($field['name']); ?>">
                    <?php echo esc_html($field['label']); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <!-- Campo de categoría 2 opcional -->
        <select name="charts[{index}][category_field_2]">
            <option value="">(Opcional) Seleccione segundo campo de categoría (Eje X #2)</option>
            <?php foreach ($category_fields as $field): ?>
                <option value="<?php echo esc_attr($field['name']); ?>">
                    <?php echo esc_html($field['label']); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <select name="charts[{index}][chart_type]" required>
            <option value="bar">Barras</option>
            <option value="line">Líneas</option>
            <option value="pie">Circular</option>
            <option value="mixed">Mixto (Barras y Líneas)</option>
        </select>

        <button type="button" class="button remove-chart">Eliminar Gráfico</button>
    </div>
</script>