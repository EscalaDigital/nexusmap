<div id="nm-custom-form-container">
    <div id="nm-form-messages" class="nm-messages"></div>
    <form id="nm-user-form" method="post" enctype="multipart/form-data">

        <!-- Dynamic Fields -->
        <?php
        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            $nm_is_privileged = current_user_can('manage_options') || current_user_can('edit_others_posts');
            foreach ($form_data['fields'] as $field) {
                if (!empty($field['restricted']) && !$nm_is_privileged) {
                    continue; // ocultar campos restringidos para usuarios sin privilegios
                }
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
                        break;                    case 'image':
                    ?>
                        <div class="nm-form-field" data-type="image">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            <input type="file"
                                id="<?php echo esc_attr($field_id); ?>"
                                name="<?php echo esc_attr($field_name); ?>"
                                accept=".jpg,.jpeg,.png,.gif,.webp">
                        </div>
                    <?php
                        break;

                    case 'file':
                    ?>
                        <div class="nm-form-field" data-type="file">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            <input type="file"
                                id="<?php echo esc_attr($field_id); ?>"
                                name="<?php echo esc_attr($field_name); ?>"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf">
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
                                ?>
                                        <div class="radio-option">
                                            <input type="radio"
                                                id="<?php echo $option_id; ?>"
                                                name="<?php echo esc_attr($field_name); ?>"
                                                value="<?php echo esc_attr($option); ?>">
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
                                    ?>
                                        <option value="<?php echo esc_attr($option); ?>">
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
                                ?>
                                    <div class="checkbox-option">
                                        <input type="checkbox"
                                            id="<?php echo $option_id; ?>"
                                            name="<?php echo esc_attr($field_name); ?>[]"
                                            value="<?php echo esc_attr($option); ?>">
                                        <label for="<?php echo $option_id; ?>"><?php echo esc_html($option); ?></label>
                                    </div>
                                <?php
                                }
                                ?>
                            </div>
                        </div>
                    <?php
                        break;

                    case 'conditional-select': ?>
                        <div class="nm-form-field" data-type="conditional-select">
                            <label for="nm_field_<?php echo esc_attr($field['name']); ?>">
                                <?php echo esc_html($field['label']); ?>
                            </label>

                            <select id="nm_field_<?php echo esc_attr($field['name']); ?>"
                                name="<?php echo esc_attr($field['name']); ?>"
                                class="nm-conditional-select"
                                data-select-id="<?php echo esc_attr($field['select_id']); ?>">
                                <option value="">— Seleccione —</option>
                                <?php foreach ($field['options'] as $opt) : ?>
                                    <option value="<?php echo esc_attr($opt['value']); ?>"
                                        data-option-id="<?php echo esc_attr($opt['id']); ?>">
                                        <?php echo esc_html($opt['value']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>                            <!-- aquí llegarán los sub-campos -->
                            <div class="conditional-target"
                                data-select-id="<?php echo esc_attr($field['select_id']); ?>"></div>                        </div>
        <?php break;

                    case 'geographic-selector':
                        $field_config = $field['config'] ?? [];
                        if (!empty($field_config)):
                            // Generar el JSON de configuración de forma segura
                            ob_start();
                            echo json_encode($field_config, JSON_HEX_QUOT | JSON_HEX_APOS);
                            $config_json = ob_get_clean();
                            
                            // También crear un ID único para almacenar la config por separado
                            $config_id = 'nm_geo_config_' . md5($field_id . time());
                    ?>
                        <?php $fixed_values_attr = isset($field_config['fixed_values']) ? esc_attr(json_encode($field_config['fixed_values'], JSON_HEX_QUOT | JSON_HEX_APOS)) : ''; ?>
                        <div class="nm-form-field nm-geographic-selector" 
                             data-type="geographic-selector" 
                             data-config='<?php echo esc_attr($config_json); ?>'
                             data-config-id="<?php echo esc_attr($config_id); ?>"
                             <?php if($fixed_values_attr){ ?>data-fixed-values="<?php echo $fixed_values_attr; ?>"<?php } ?>
                             id="<?php echo esc_attr($field_id); ?>">
                            <label><?php echo esc_html($field['label']); ?></label>
                            <!-- Los selectores se generarán dinámicamente via JavaScript -->
                            <div class="nm-geo-selectors-container">
                                <!-- Aquí se insertarán los campos select en cascada -->
                            </div>
                        </div>
                        
                        <!-- Script para configuración alternativa en caso de problemas con data-config -->
                        <script type="text/javascript">
                            if (typeof window.nmGeoConfigs === 'undefined') {
                                window.nmGeoConfigs = {};
                            }
                            window.nmGeoConfigs['<?php echo esc_js($config_id); ?>'] = <?php echo $config_json; ?>;
                        </script>                    <?php 
                        endif;
                        break;                    case 'audio':
                    ?>
                        <div class="nm-form-field" data-type="audio">
                            <label for="<?php echo esc_attr($field_id); ?>"><?php echo esc_html($field['label']); ?></label>
                            
                            <div class="nm-audio-field">
                                <div class="nm-audio-upload">
                                    <label for="<?php echo esc_attr($field_id . '_upload'); ?>">
                                        📁 Upload Audio File
                                    </label>
                                    <input type="file" 
                                           id="<?php echo esc_attr($field_id . '_upload'); ?>"
                                           name="<?php echo esc_attr($field_name . '_file'); ?>"
                                           accept=".mp3,.wav,.ogg,.flac,.m4a,.aac"
                                           class="nm-audio-upload-input">
                                    <div class="nm-audio-preview" style="display: none;">
                                        <audio controls style="width: 100%;"></audio>
                                        <button type="button" class="nm-remove-audio">Remove</button>
                                    </div>
                                </div>

                                <input type="hidden" name="<?php echo esc_attr($field_name); ?>" class="nm-audio-data" value="">
                                
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