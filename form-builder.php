<div class="wrap">
    <h1>Form Builder</h1>
    <div id="nm-form-builder">
        <div id="nm-form-elements">
            <h2>Available Fields</h2>
            <ul>
                <li data-type="text">Text Field</li>
                <li data-type="textarea">Textarea</li>
                <li data-type="checkbox">Checkbox Group</li>
                <li data-type="radio">Radio Group</li>
                <li data-type="select">Dropdown Menu</li>
                <li data-type="file">File Upload</li>
                <li data-type="number">Number Field</li>
                <li data-type="date">Date Picker</li>
                <li data-type="url">URL Field</li>
                <li data-type="range">Range Slider</li>
            </ul>
        </div>
        <div id="nm-form-preview">
            <h2>Your Form</h2>
            <form id="nm-custom-form">
                <!-- Fixed Fields -->
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
                <!-- Dynamic Fields Will Be Added Here -->
                <?php
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
