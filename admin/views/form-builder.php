<div class="wrap">
    <h1>Form Builder</h1>
    <div id="nm-form-builder">
        <div id="nm-form-elements">
            <h2>Available Fields</h2>
            <ul>
                <li data-type="header">Header</li>
                <li data-type="text">Text Field</li>
                <li data-type="textarea">Textarea</li>
                <li data-type="checkbox">Checkbox Group</li>
                <li data-type="radio">Radio Group</li>
                <li data-type="select">Dropdown Menu</li>
                <li data-type="file">File Upload</li>
                <li data-type="number">Number Field</li>
                <li data-type="date">Date Picker</li>
                <li data-type="url">URL Field</li>
        
            </ul>
        </div>
        <div id="nm-form-preview">
            <h2 style="text-align: center;">Your Form</h2>
            
            <form id="nm-custom-form">
                <p style="text-align: center;">Arrastra elementos bajo esta linea para crear tu formulario</p>
                <HR>
                <!-- Fixed Fields -->
                <?php
                $has_map_field = false;
                if ( isset( $form_data['fields'] ) && is_array( $form_data['fields'] ) ) {
                    foreach ( $form_data['fields'] as $field ) {
                        if ($field['type'] === 'map') {
                            $has_map_field = true;
                        }
                    }
                }
                if (!$has_map_field) {
                ?>
                <div id="mapabase" class="nm-form-field" data-type="map">
                    <label>Map Drawing</label>
                    <div id="nm-map-canvas"></div>
                </div>
                <?php
                }
                ?>
                <!-- Dynamic Fields Will Be Added Here -->
                <?php
                if ( isset( $form_data['fields'] ) && is_array( $form_data['fields'] ) ) {
                    foreach ( $form_data['fields'] as $field ) {
                        $field_name = isset($field['name']) ? $field['name'] : '';
                        $field_label = isset($field['label']) ? $field['label'] : '';
                        
                        // Incluye el archivo de plantilla y pasa los datos del campo
                        include 'field-templates/' . $field['type'] . '.php';
                    }
                }
                ?>
            </form>
            <button id="nm-save-form" class="button button-primary">Save Form</button>
        </div>
        

    </div>
</div>
