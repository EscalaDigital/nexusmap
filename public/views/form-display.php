<div id="nm-custom-form-container">
    <div id="nm-form-messages" class="nm-messages"></div>
    <form id="nm-user-form" method="post" enctype="multipart/form-data">

        <!-- Dynamic Fields -->
        <?php
        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                // Normalizar el nombre del campo
                $field_name = empty($field['name']) ? '' : nm_normalize_field_name($field['name']);
                $field_id = 'nm_field_' . $field_name;
                
                // Renderizar cada campo según su tipo
                switch ($field['type']) {
                    case 'map':
                        ?>
                        <div class="nm-form-field" data-type="map">
                            <label>Map Drawing</label>
                            <div id="nm-map-canvas" style="height: 400px;"></div>
                            <!-- Campo oculto para datos del mapa -->
                            <input type="hidden" name="map_data" id="map_data">
                        </div>
                        <?php
                        break;
                    case 'header':
                        ?>
                        <div class="nm-form-field" data-type="header">
                            <h3><?php echo esc_html($field['label']); ?></h3>
                        </div>
                        <?php
                        break;

                    case 'text':
                    case 'number':
                    case 'url':
                    case 'date':
                    case 'range':
                        ?>
                        <div class="nm-form-field" data-type="<?php echo esc_attr($field['type']); ?>">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            <input type="<?php echo esc_attr($field['type']); ?>" 
                                   id="<?php echo esc_attr($field_id); ?>"
                                   name="<?php echo esc_attr($field_name); ?>">
                        </div>
                        <?php
                        break;

                    case 'textarea':
                        ?>
                        <div class="nm-form-field" data-type="textarea">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            <textarea id="<?php echo esc_attr($field_id); ?>" 
                                    name="<?php echo esc_attr($field_name); ?>"></textarea>
                        </div>
                        <?php
                        break;

                    case 'image':
                    case 'file':
                        ?>
                        <div class="nm-form-field" data-type="<?php echo esc_attr($field['type']); ?>">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            <input type="file" 
                                   id="<?php echo esc_attr($field_id); ?>"
                                   name="<?php echo esc_attr($field_name); ?>"
                                   <?php echo $field['type'] === 'image' ? 'accept="image/*"' : ''; ?>>
                        </div>
                        <?php
                        break;

                    case 'radio':
                        ?>
                        <div class="nm-form-field" data-type="radio">
                            <label><?php echo esc_html($field['label']); ?></label>
                            <div class="radio-group">
                                <?php 
                                if (isset($field['options']) && is_array($field['options'])) {
                                    foreach ($field['options'] as $index => $option) {
                                        $option_id = esc_attr($field_id . '_' . $index);
                                        $option_value = nm_normalize_field_name($option);
                                        ?>
                                        <div class="radio-option">
                                            <input type="radio" 
                                                   id="<?php echo $option_id; ?>"
                                                   name="<?php echo esc_attr($field_name); ?>"
                                                   value="<?php echo esc_attr($option_value); ?>">
                                            <label for="<?php echo $option_id; ?>"><?php echo esc_html($option); ?></label>
                                        </div>
                                        <?php
                                    }
                                } else {
                                    echo '<p>No options available for this field.</p>';
                                }
                                ?>
                            </div>
                        </div>
                        <?php
                        break;

                    case 'select':
                        ?>
                        <div class="nm-form-field" data-type="select">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            <?php 
                            if (isset($field['options']) && is_array($field['options'])) {
                                ?>
                                <select id="<?php echo esc_attr($field_id); ?>" 
                                        name="<?php echo esc_attr($field_name); ?>">
                                    <?php 
                                    foreach ($field['options'] as $option) {
                                        $option_value = nm_normalize_field_name($option);
                                        ?>
                                        <option value="<?php echo esc_attr($option_value); ?>">
                                            <?php echo esc_html($option); ?>
                                        </option>
                                        <?php
                                    }
                                    ?>
                                </select>
                                <?php
                            } else {
                                echo '<p>No options available for this field.</p>';
                            }
                            ?>
                        </div>
                        <?php
                        break;

                    case 'checkbox':
                        ?>
                        <div class="nm-form-field" data-type="checkbox">
                            <label><?php echo esc_html($field['label']); ?></label>
                            <div class="checkbox-group">
                                <?php 
                                foreach ($field['options'] as $index => $option) {
                                    $option_id = esc_attr($field_id . '_' . $index);
                                    $option_value = nm_normalize_field_name($option);
                                    ?>
                                    <div class="checkbox-option">
                                        <input type="checkbox" 
                                               id="<?php echo $option_id; ?>"
                                               name="<?php echo esc_attr($field_name); ?>[]"
                                               value="<?php echo esc_attr($option_value); ?>">
                                        <label for="<?php echo $option_id; ?>"><?php echo esc_html($option); ?></label>
                                    </div>
                                    <?php
                                }
                                ?>
                            </div>
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
        <input type="hidden" name="nm_form_type" value="<?php echo esc_attr($form_type ?? 0); ?>">
        <?php wp_nonce_field('nm_form_submit', 'nm_form_nonce'); ?>
        <button type="submit" name="nm_submit_form" class="button">Submit</button>
    </form>
</div>