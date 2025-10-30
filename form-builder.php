<?php
/**
 * Vista del Constructor de Formularios de NexusMap
 * 
 * Esta vista permite crear y editar formularios personalizados que se utilizarán
 * para recopilar información que se mostrará en el mapa. Incluye:
 * - Panel de campos disponibles para arrastrar
 * - Área de previsualización del formulario
 * - Campos fijos obligatorios (título, imagen, mapa)
 * - Sistema de guardado de la estructura del formulario
 */
?>
<div class="wrap">
    <h1>Form Builder</h1>
    <div id="nm-form-builder">
        <!-- Panel de campos disponibles -->
        <div id="nm-form-elements">
            <h2>Available Fields</h2>
            <ul>                <!-- Lista de tipos de campos arrastrables -->
                <li data-type="text">Text Field</li>
                <li data-type="textarea">Textarea</li>
                <li data-type="checkbox">Checkbox Group</li>
                <li data-type="radio">Radio Group</li>
                <li data-type="select">Dropdown Menu</li>
                <li data-type="image">Image Upload</li>
                <li data-type="file">Document Upload</li>
                <li data-type="number">Number Field</li>
                <li data-type="date">Date Picker</li>                <li data-type="url">URL Field</li>
                <li data-type="range">Range Slider</li>
                <li data-type="conditional-select">Conditional Dropdown</li>
                <li data-type="geographic-selector">Geographic Selector</li>

            </ul>
        </div>

        <!-- Área de previsualización y edición del formulario -->
        <div id="nm-form-preview">
            <h2>Your Form</h2>
            <form id="nm-custom-form">
                <!-- Campos fijos que siempre estarán presentes -->
                <div class="nm-form-field" data-type="title">
                    <label>Title</label>
                    <input type="text" name="title" required>
                </div>
                <div class="nm-form-field" data-type="image">
                    <label>Image</label>
                    <input type="file" name="image" accept="image/*">
                </div>
                <div class="nm-form-field" data-type="map">
                    <label>Map Drawing</label>
                    <div id="nm-map-canvas"></div>
                </div>

                <!-- Zona donde se insertarán los campos dinámicos -->
                <?php
                // Carga los campos guardados anteriormente si existen
                if ( isset( $form_data['fields'] ) && is_array( $form_data['fields'] ) ) {
                    foreach ( $form_data['fields'] as $field ) {
                        include 'field-templates/' . $field['type'] . '.php';
                    }
                }
                ?>
            </form>
            <button id="nm-save-form" class="button button-primary">Save Form</button>
        </div>
    </div>
</div>
