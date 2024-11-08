<?php
// Get the option names
$option_a_text = get_option('nm_option_a_text', 'Option A');
$option_b_text = get_option('nm_option_b_text', 'Option B');

// Check if a form type has been selected
$form_type = isset($_GET['form_type']) ? intval($_GET['form_type']) : null;

// Determine which form to display
if ($form_type === 1) {
    // Show Form A
    $form_data = $form_data_a;
    $form_label = $option_a_text;
} elseif ($form_type === 2) {
    // Show Form B
    $form_data = $form_data_b;
    $form_label = $option_b_text;
}

if ($form_type === null || !in_array($form_type, [1, 2])) {
    // Mostrar opciones para seleccionar
    ?>


   <div class="selection-container">
    <h2 class="selection-title">Please select an option:</h2>
 
        <a href="<?php echo esc_url(add_query_arg('form_type', 1)); ?>" class="selection-button"><?php echo esc_html($option_a_text); ?></a>
        <hr>
        <a href="<?php echo esc_url(add_query_arg('form_type', 2)); ?>" class="selection-button"><?php echo esc_html($option_b_text); ?></a>
  
</div>

    <?php
} else {
    // Display the selected form using your original code
    ?>
    <h2><?php echo esc_html($form_label); ?></h2>
    <div id="nm-custom-form-container">
        <form id="nm-user-form" method="post" enctype="multipart/form-data">
            <!-- Dynamic Fields -->
            <?php
            if (isset($form_data['fields']) && is_array($form_data['fields'])) {
                foreach ($form_data['fields'] as $field) {
                    // Render each field based on its type
                    switch ($field['type']) {
                        case 'header':
            ?>
                            <div class="nm-form-field" data-type="header">
                                <h3><?php echo esc_html($field['label']); ?></h3>
                            </div>
                        <?php
                            break;
                        case 'text':
                        ?>
                            <div class="nm-form-field" data-type="text">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="text" name="<?php echo esc_attr($field['name']); ?>">
                            </div>
                        <?php
                            break;
                        case 'textarea':
                        ?>
                            <div class="nm-form-field" data-type="textarea">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <textarea name="<?php echo esc_attr($field['name']); ?>"></textarea>
                            </div>
                        <?php
                            break;
                        case 'number':
                        ?>
                            <div class="nm-form-field" data-type="number">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="number" name="<?php echo esc_attr($field['name']); ?>">
                            </div>
                        <?php
                            break;
                        case 'image':
                        ?>
                            <div class="nm-form-field" data-type="image">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="file" name="<?php echo esc_attr($field['name']); ?>" accept="image/*">
                            </div>
                        <?php
                            break;
                        case 'radio':
                        ?>
                            <div class="nm-form-field" data-type="radio">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <div class="radio-group">
                                    <?php if (isset($field['options']) && is_array($field['options'])) { ?>
                                        <?php foreach ($field['options'] as $option) { ?>
                                            <input type="radio" name="<?php echo esc_attr($field['name']); ?>" value="<?php echo esc_attr($option); ?>"> <?php echo esc_html($option); ?><br>
                                        <?php } ?>
                                    <?php } else { ?>
                                        <p>No options available for this field.</p>
                                    <?php } ?>
                                </div>
                            </div>
                        <?php
                            break;
                        case 'select':
                        ?>
                            <div class="nm-form-field" data-type="select">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <?php if (isset($field['options']) && is_array($field['options'])) { ?>
                                    <select name="<?php echo esc_attr($field['name']); ?>">
                                        <?php foreach ($field['options'] as $option) { ?>
                                            <option value="<?php echo esc_attr($option); ?>"><?php echo esc_html($option); ?></option>
                                        <?php } ?>
                                    </select>
                                <?php } else { ?>
                                    <p>No options available for this field.</p>
                                <?php } ?>
                            </div>
                        <?php
                            break;
                        case 'file':
                        ?>
                            <div class="nm-form-field" data-type="file">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="file" name="<?php echo esc_attr($field['name']); ?>">
                            </div>
                        <?php
                            break;
                        case 'map':
                        ?>
                            <div class="nm-form-field" data-type="map">
                                <label>Map Drawing</label>
                                <div id="nm-map-canvas" style="height: 400px;"></div>
                            </div>
                        <?php
                            break;
                        case 'checkbox':
                        ?>
                            <div class="nm-form-field" data-type="checkbox">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <div class="checkbox-group">
                                    <?php foreach ($field['options'] as $option) { ?>
                                        <input type="checkbox" name="<?php echo esc_attr($field['name']); ?>[]" value="<?php echo esc_attr($option); ?>"> <?php echo esc_html($option); ?><br>
                                    <?php } ?>
                                </div>
                            </div>
                        <?php
                            break;
                        case 'date':
                        ?>
                            <div class="nm-form-field" data-type="date">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="date" name="<?php echo esc_attr($field['name']); ?>">
                            </div>
                        <?php
                            break;
                        case 'url':
                        ?>
                            <div class="nm-form-field" data-type="url">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="url" name="<?php echo esc_attr($field['name']); ?>">
                            </div>
                        <?php
                            break;
                        case 'range':
                        ?>
                            <div class="nm-form-field" data-type="range">
                                <label><?php echo esc_html($field['label']); ?></label>
                                <input type="range" name="<?php echo esc_attr($field['name']); ?>">
                            </div>
                        <?php
                            break;
                        default:
                            echo '<p>Unknown field type: ' . esc_html($field['type']) . '</p>';
                            break;
                    }
                }
            } else {
                echo '<p>No fields found in this form.</p>';
            }
            ?>
            <input type="hidden" name="nm_form_type" value="<?php echo esc_attr($form_type); ?>">
            <?php wp_nonce_field('nm_form_submit', 'nm_form_nonce'); ?>
            <button type="submit" name="nm_submit_form" class="button">Submit</button>
        </form>
    </div>
    <?php
}
?>
