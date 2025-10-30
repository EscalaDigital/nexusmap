<?php
// Evitar el acceso directo al archivo
if (!defined('ABSPATH')) {
    exit;
}

function nm_sanitize_tile_url($url)
{
    // Quitar espacios en blanco al inicio y al final
    $url = trim($url);
    // Validar que sea una URL válida o una ruta relativa
    if (preg_match('/^https?:\/\/[^\s\{\}]+(?:\{[^\s\{\}]*\}[^\s\{\}]*)*$/', $url) || preg_match('/^\//', $url)) {
        return $url;
    } else {
        return $url; // Devolver la URL tal como se pasa
    }
}


function nm_normalize_field_name($raw_name)
{
    // Quitar espacios en blanco al inicio y al final
    $name = trim($raw_name);

    // Convertir a minúsculas
    $name = strtolower($name);

    // Quitar acentos y diacríticos
    $name = remove_accents($name);

    // Convertir caracteres especiales a guiones bajos
    $name = preg_replace('/[^a-z0-9]+/', '_', $name);

    // Eliminar guiones bajos múltiples y al inicio/final
    $name = trim(preg_replace('/_+/', '_', $name), '_');

    return $name;
}


/**
 * Pinta un campo del formulario público a partir del array $field.
 */
/**
 * Pinta un sub-campo permitido dentro de un select condicional.
 * Solo admite: text, textarea, checkbox, radio, select, number, date, url
 */
function nm_render_conditional_field( $field ) {

    $allowed = array(
        'text', 'textarea', 'checkbox', 'radio',
        'select', 'number', 'date', 'url'
    );

    if ( ! in_array( $field['type'], $allowed, true ) ) {
        return;                         // cualquier otro tipo se ignora
    }

    $field_name = empty( $field['name'] )
        ? ''
        : nm_normalize_field_name( $field['name'] );

    $field_id = 'nm_field_' . $field_name;

    /* ---------- campos simples ---------- */
    if ( in_array( $field['type'], array( 'text', 'number', 'url', 'date' ), true ) ) : ?>
        <div class="nm-form-field" data-type="<?php echo esc_attr( $field['type'] ); ?>">
            <label for="<?php echo esc_attr( $field_id ); ?>">
                <?php echo esc_html( $field['label'] ); ?>
            </label>
            <input type="<?php echo esc_attr( $field['type'] ); ?>"
                   id="<?php echo esc_attr( $field_id ); ?>"
                   name="<?php echo esc_attr( $field_name ); ?>">
        </div>

    <?php elseif ( $field['type'] === 'range' ) : /* (por si más adelante) */ ?>

    <?php elseif ( $field['type'] === 'textarea' ) : ?>
        <div class="nm-form-field" data-type="textarea">
            <label for="<?php echo esc_attr( $field_id ); ?>">
                <?php echo esc_html( $field['label'] ); ?>
            </label>
            <textarea id="<?php echo esc_attr( $field_id ); ?>"
                      name="<?php echo esc_attr( $field_name ); ?>"></textarea>
        </div>

    <?php elseif ( $field['type'] === 'checkbox' ) : ?>
        <div class="nm-form-field" data-type="checkbox">
            <label><?php echo esc_html( $field['label'] ); ?></label>
            <div class="checkbox-group">
                <?php foreach ( $field['options'] as $i => $opt ) :
                    $opt_id = $field_id . '_' . $i; ?>
                    <div class="checkbox-option">
                        <input type="checkbox"
                               id="<?php echo esc_attr( $opt_id ); ?>"
                               name="<?php echo esc_attr( $field_name ); ?>[]"
                               value="<?php echo esc_attr( $opt ); ?>">
                        <label for="<?php echo esc_attr( $opt_id ); ?>">
                            <?php echo esc_html( $opt ); ?>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

    <?php elseif ( $field['type'] === 'radio' ) : ?>
        <div class="nm-form-field" data-type="radio">
            <label><?php echo esc_html( $field['label'] ); ?></label>
            <div class="radio-group">
                <?php foreach ( $field['options'] as $i => $opt ) :
                    $opt_id = $field_id . '_' . $i; ?>
                    <div class="radio-option">
                        <input type="radio"
                               id="<?php echo esc_attr( $opt_id ); ?>"
                               name="<?php echo esc_attr( $field_name ); ?>"
                               value="<?php echo esc_attr( $opt ); ?>">
                        <label for="<?php echo esc_attr( $opt_id ); ?>">
                            <?php echo esc_html( $opt ); ?>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

    <?php elseif ( $field['type'] === 'select' ) : ?>
        <div class="nm-form-field" data-type="select">
            <label for="<?php echo esc_attr( $field_id ); ?>">
                <?php echo esc_html( $field['label'] ); ?>
            </label>
            <select id="<?php echo esc_attr( $field_id ); ?>"
                    name="<?php echo esc_attr( $field_name ); ?>">
                <?php foreach ( $field['options'] as $opt ) : ?>
                    <option value="<?php echo esc_attr( $opt ); ?>">
                        <?php echo esc_html( $opt ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
    <?php endif;
}

/**
 * Get GeoNames username from WordPress options
 * Centralized function to get the GeoNames user to ensure consistency
 *
 * @return string The GeoNames username or empty string if not set
 */
function nm_get_geonames_user() {
    return get_option('nm_geonames_user', '');
}
