<?php
/**
 * Plantilla para el campo tipo "header" en el constructor de formularios
 * 
 * Este tipo de campo se utiliza para crear encabezados o separadores
 * dentro del formulario, ayudando a organizar y agrupar visualmente
 * los campos relacionados. No es un campo de entrada de datos,
 * sino un elemento estructural del formulario.
 * 
 * @var string $field_label El texto que se mostrará como encabezado
 */
?>
<div class="nm-form-field" data-type="header">
    <input type="text" 
           class="field-label" 
           placeholder="Header Text" 
           value="<?php echo esc_attr( $field_label ); ?>"
    >
    <span class="nm-remove-field">Remove Field</span>
    <div class="nm-field-restricted"><label style="font-size:11px;display:inline-block;margin-top:4px;"><input type="checkbox" class="field-restricted-toggle" <?php echo !empty($field['restricted']) ? 'checked' : ''; ?>> Solo usuarios privilegiados</label></div>
</div>
