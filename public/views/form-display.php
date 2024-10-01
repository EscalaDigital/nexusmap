<div id="nm-custom-form-container">
    <form id="nm-user-form">
    
        <!-- Dynamic Fields -->
        <?php
        if ( isset( $form_data['fields'] ) && is_array( $form_data['fields'] ) ) {
            foreach ( $form_data['fields'] as $field ) {
                // Renderizar cada campo según su tipo
                switch ( $field['type'] ) {
                    case 'text':
                        ?>
                        <div class="nm-form-field" data-type="text">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="text" name="<?php echo esc_attr( $field['name'] ); ?>">
                        </div>
                        <?php
                        break;
                    case 'textarea':
                        ?>
                        <div class="nm-form-field" data-type="textarea">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <textarea name="<?php echo esc_attr( $field['name'] ); ?>"></textarea>
                        </div>
                        <?php
                        break;
                    case 'number':
                        ?>
                        <div class="nm-form-field" data-type="number">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="number" name="<?php echo esc_attr( $field['name'] ); ?>">
                        </div>
                        <?php
                        break;
                    case 'image':
                        ?>
                        <div class="nm-form-field" data-type="image">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="file" name="<?php echo esc_attr( $field['name'] ); ?>" accept="image/*">
                        </div>
                        <?php
                        break;
                    case 'radio':
                        ?>
                        <div class="nm-form-field" data-type="radio">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <div class="radio-group">
                                <?php foreach ( $field['options'] as $option ) { ?>
                                    <input type="radio" name="<?php echo esc_attr( $field['name'] ); ?>" value="<?php echo esc_attr( $option ); ?>"> <?php echo esc_html( $option ); ?><br>
                                <?php } ?>
                            </div>
                        </div>
                        <?php
                        break;
                    case 'select':
                        ?>
                        <div class="nm-form-field" data-type="select">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <select name="<?php echo esc_attr( $field['name'] ); ?>">
                                <?php foreach ( $field['options'] as $option ) { ?>
                                    <option value="<?php echo esc_attr( $option ); ?>"><?php echo esc_html( $option ); ?></option>
                                <?php } ?>
                            </select>
                        </div>
                        <?php
                        break;
                    case 'file':
                        ?>
                        <div class="nm-form-field" data-type="file">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="file" name="<?php echo esc_attr( $field['name'] ); ?>">
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
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <div class="checkbox-group">
                                <?php foreach ( $field['options'] as $option ) { ?>
                                    <input type="checkbox" name="<?php echo esc_attr( $field['name'] ); ?>[]" value="<?php echo esc_attr( $option ); ?>"> <?php echo esc_html( $option ); ?><br>
                                <?php } ?>
                            </div>
                        </div>
                        <?php
                        break;
                    case 'date':
                        ?>
                        <div class="nm-form-field" data-type="date">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="date" name="<?php echo esc_attr( $field['name'] ); ?>">
                        </div>
                        <?php
                        break;
                    case 'url':
                        ?>
                        <div class="nm-form-field" data-type="url">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="url" name="<?php echo esc_attr( $field['name'] ); ?>">
                        </div>
                        <?php
                        break;
                    case 'range':
                        ?>
                        <div class="nm-form-field" data-type="range">
                            <label><?php echo esc_html( $field['label'] ); ?></label>
                            <input type="range" name="<?php echo esc_attr( $field['name'] ); ?>">
                        </div>
                        <?php
                        break;
                    default:
                        echo '<p>Unknown field type: ' . esc_html( $field['type'] ) . '</p>';
                        break;
                }
            }
        }
        ?>
        <button type="submit" class="button">Submit</button>
    </form>
</div>