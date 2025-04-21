<div id="nm-custom-form-container">
    <div id="nm-form-messages" class="nm-messages"></div>
    <form id="nm-user-form" method="post" enctype="multipart/form-data">

        <!-- Dynamic Fields -->
        <?php
        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                // Renderizar cada campo según su tipo
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
                                    <?php foreach ($field['options'] as $index => $option) { 
                                        $radio_id = esc_attr($field['name'] . '_' . $index);
                                    ?>
                                        <div class="radio-option">
                                            <input type="radio" id="<?php echo $radio_id; ?>" name="<?php echo esc_attr($field['name']); ?>" value="<?php echo esc_attr($option); ?>">
                                            <label for="<?php echo $radio_id; ?>"><?php echo esc_html($option); ?></label>
                                        </div>
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
                                <?php foreach ($field['options'] as $index => $option) { 
                                    $checkbox_id = esc_attr($field['name'] . '_' . $index);
                                ?>
                                    <div class="checkbox-option">
                                        <input type="checkbox" id="<?php echo $checkbox_id; ?>" name="<?php echo esc_attr($field['name']); ?>[]" value="<?php echo esc_attr($option); ?>">
                                        <label for="<?php echo $checkbox_id; ?>"><?php echo esc_html($option); ?></label>
                                    </div>
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
        }
        ?>
        <input type="hidden" name="nm_form_type" value="0">
        <?php wp_nonce_field('nm_form_submit', 'nm_form_nonce'); ?>
        <button type="submit" name="nm_submit_form" class="button">Submit</button>
    </form>
</div>