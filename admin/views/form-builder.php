<div class="wrap">
    <h1>Form Builder</h1>
    <div id="nm-form-builder">
        <div id="nm-form-elements">
            <h2>Available Fields</h2>
            <hr>
            <ul>
                <li data-type="header">Header</li>
                <li data-type="text">Text Field</li>
                <li data-type="textarea">Textarea</li>
                <li data-type="checkbox">Checkbox</li>
                <li data-type="radio">Radio Group</li>
                <li data-type="select">Dropdown Menu</li>
                <li data-type="file">File Upload</li>
                <li data-type="number">Number Field</li>
                <li data-type="date">Date Picker</li>
                <li data-type="url">URL Field</li>
                <!-- Agrega más tipos de campos si es necesario -->
            </ul>
            <hr>

            <h2>Special Fields</h2>
            <hr>
            <label>
                <input type="checkbox" id="nm-ab-option" name="ab_option" <?php echo get_option('nm_ab_option_enabled', 0) ? 'checked' : ''; ?>>
                Activate A/B Option
            </label>
            <span id="nm-ab-info" title="¡Atención! Si selecciona esta opción, deberá definir dos formularios y el usuario final elegirá entre uno y otro">[i]</span>
            <div id="nm-ab-options" style="display: <?php echo get_option('nm_ab_option_enabled', 0) ? 'block' : 'none'; ?>;">
                <label>Option A Text: <input type="text" id="nm-option-a-text" name="option_a_text" value="<?php echo esc_attr(get_option('nm_option_a_text', 'Opción A')); ?>"></label>
                <label>Option B Text: <input type="text" id="nm-option-b-text" name="option_b_text" value="<?php echo esc_attr(get_option('nm_option_b_text', 'Opción B')); ?>"></label>
                <!-- Add the Save Button Here -->
                <button id="nm-save-option-texts" class="button button-primary">Guardar Nombres de Opciones</button>
            </div>
        </div>

        <?php
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);
        ?>

        <div id="nm-form-preview">

            <!-- Tabs for A/B Forms -->
            <div id="tabsforms" style="display: <?php echo $ab_option_enabled ? 'block' : 'none'; ?>;">
                <h2 class="nav-tab-wrapper">
                    <a href="#tab-a" class="nav-tab nav-tab-active"><?php echo esc_html(get_option('nm_option_a_text', 'Opción A')); ?></a>
                    <a href="#tab-b" class="nav-tab"><?php echo esc_html(get_option('nm_option_b_text', 'Opción B')); ?></a>
                </h2>

                <!-- Form A -->
                <div id="tab-a" class="tab-content">
                    <h2>Formulario Opción A</h2>

                    <form id="nm-custom-form-a" class="nm-form-droppable">
                        <p style="text-align: center;">Arrastra elementos bajo esta línea para crear tu formulario</p>
                        <hr>

                        <!-- Fixed Fields -->
                        <?php
                        $has_map_field = false;

                        if (isset($form_data_a['fields']) && is_array($form_data_a['fields'])) {
                            foreach ($form_data_a['fields'] as $field) {
                                if ($field['type'] === 'map') {
                                    $has_map_field = true;
                                }
                            }
                        }

                        if (!$has_map_field): ?>
                            <div id="mapabase" class="nm-form-field" data-type="map">
                                <label>Map Drawing</label>
                                <div id="nm-map-canvas"></div>
                            </div>
                        <?php endif; ?>

                        <!-- Dynamic Fields -->
                        <?php
                        if (!empty($form_data_a['fields'])) {
                            foreach ($form_data_a['fields'] as $field) {
                                $field_name = $field['name'] ?? '';
                                $field_label = $field['label'] ?? '';
                                $field_options = $field['options'] ?? [];

                                // Include the field template
                                include 'field-templates/' . $field['type'] . '.php';
                            }
                        } else {
                            echo '<p style="text-align: center;">Arrastra elementos bajo esta línea para crear tu formulario</p>';
                        }
                        ?>
                    </form>
                    <button id="nm-save-form-a" class="button button-primary">Guardar Formulario A</button>
                </div>

                <!-- Form B -->
                <div id="tab-b" class="tab-content" style="display: none;">
                    <h2>Formulario Opción B</h2>

                    <form id="nm-custom-form-b" class="nm-form-droppable">
                        <p style="text-align: center;">Arrastra elementos bajo esta línea para crear tu formulario</p>
                        <hr>

                        <!-- Fixed Fields -->
                        <?php
                        $has_map_field = false;

                        if (isset($form_data_b['fields']) && is_array($form_data_b['fields'])) {
                            foreach ($form_data_b['fields'] as $field) {
                                if ($field['type'] === 'map') {
                                    $has_map_field = true;
                                }
                            }
                        }

                        if (!$has_map_field): ?>
                            <div id="mapabase" class="nm-form-field" data-type="map">
                                <label>Map Drawing</label>
                                <div id="nm-map-canvas"></div>
                            </div>
                        <?php endif; ?>

                        <!-- Dynamic Fields -->
                        <?php
                        if (!empty($form_data_b['fields'])) {
                            foreach ($form_data_b['fields'] as $field) {
                                $field_name = $field['name'] ?? '';
                                $field_label = $field['label'] ?? '';
                                $field_options = $field['options'] ?? [];

                                // Include the field template
                                include 'field-templates/' . $field['type'] . '.php';
                            }
                        } else {
                            echo '<p style="text-align: center;">Arrastra elementos bajo esta línea para crear tu formulario</p>';
                        }
                        ?>
                    </form>
                    <button id="nm-save-form-b" class="button button-primary">Guardar Formulario B</button>
                </div>
            </div>

            <!-- Single Form -->
            <div id="formunique" style="display: <?php echo !$ab_option_enabled ? 'block' : 'none'; ?>;">
                <h2 style="text-align: center;">Tu Formulario</h2>

                <form id="nm-custom-form" class="nm-form-droppable">
                    <p style="text-align: center;">Arrastra elementos bajo esta línea para crear tu formulario</p>
                    <hr>

                    <!-- Fixed Fields -->
                    <?php
                    $has_map_field = false;

                    if (isset($form_data['fields']) && is_array($form_data['fields'])) {
                        foreach ($form_data['fields'] as $field) {
                            if ($field['type'] === 'map') {
                                $has_map_field = true;
                            }
                        }
                    }

                    if (!$has_map_field): ?>
                        <div id="mapabase" class="nm-form-field" data-type="map">
                            <label>Map Drawing</label>
                            <div id="nm-map-canvas"></div>
                        </div>
                    <?php endif; ?>

                    <!-- Dynamic Fields -->
                    <?php
                    if (isset($form_data['fields']) && is_array($form_data['fields'])) {
                        foreach ($form_data['fields'] as $field) {
                            $field_name = $field['name'] ?? '';
                            $field_label = $field['label'] ?? '';
                            $field_options = $field['options'] ?? [];

                            // Include the field template
                            include 'field-templates/' . $field['type'] . '.php';
                        }
                    } else {
                        echo '<p style="text-align: center;">Arrastra elementos bajo esta línea para crear tu formulario</p>';
                    }
                    ?>
                </form>
                <button id="nm-save-form" class="button button-primary">Guardar Formulario</button>
            </div>
        </div>

       

    </div>

</div>
</div>
</div>

<script>
    jQuery(document).ready(function($) {
        function initializeTabs() {
            if ($('#tabs').length) {
                $("#tabs").tabs();
            }
        }
        $('#tabsforms .nav-tab').click(function(e) {
            e.preventDefault();

            // Remover la clase 'nav-tab-active' de todas las pestañas
            $('#tabsforms .nav-tab').removeClass('nav-tab-active');

            // Añadir la clase 'nav-tab-active' a la pestaña actual
            $(this).addClass('nav-tab-active');

            // Ocultar todo el contenido de las pestañas
            $('#tabsforms .tab-content').hide();

            // Mostrar el contenido correspondiente
            var selected_tab = $(this).attr('href');
            $(selected_tab).show();
        });

        // Initialize tabs on page load if A/B option is enabled
        <?php if ($ab_option_enabled): ?>
            initializeTabs();
        <?php endif; ?>

        // Toggle visibility of A/B options when checkbox is changed
        $('#nm-ab-option').change(function() {
            if ($(this).is(':checked')) {
                $('#tabsforms').show();
                // Initialize tabs
                $('#formunique').hide();
                initializeTabs();
            } else {
                $('#tabsforms').hide();
                // Destroy tabs and show only Form A
                $('#formunique').show();
            }


        });
    });
</script>