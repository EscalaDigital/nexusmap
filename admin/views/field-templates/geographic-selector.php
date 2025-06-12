<?php
// Template for Geographic Selector Field
$field_id = $field['id'] ?? uniqid('geo_');
$field_config = $field['config'] ?? [];
$country = $field_config['country'] ?? 'ES';
$levels = $field_config['levels'] ?? [];
$field_names = $field_config['field_names'] ?? [];
$geonames_user = $field_config['geonames_user'] ?? get_option('nm_geonames_user', '');
?>

<div class="nm-form-field nm-geographic-field" data-type="geographic-selector" data-field-id="<?php echo esc_attr($field_id); ?>">
    <div class="nm-field-header">
        <label><?php echo esc_html($field_label ?: 'Selector Geográfico'); ?></label>
        <div class="nm-field-controls">
            <button type="button" class="nm-configure-geo-btn" title="Configurar">⚙️</button>
            <button type="button" class="nm-remove-field-btn" title="Eliminar">✕</button>
        </div>
    </div>
    
    <!-- Configuration Panel -->
    <div class="nm-geo-config-panel" style="display: none;">
        <div class="nm-config-section">
            <h4>Configuración del Selector Geográfico</h4>
              <div class="nm-config-row">
                <label>Usuario GeoNames:</label>
                <div class="nm-geonames-user-container">
                    <input type="text" class="nm-geonames-user" value="<?php echo esc_attr($geonames_user); ?>" placeholder="Tu usuario de GeoNames">
                    <button type="button" class="button nm-validate-user-btn">Validar Usuario</button>
                </div>
                <small>Regístrate gratis en <a href="https://www.geonames.org/login" target="_blank">GeoNames.org</a> y activa los webservices en: <a href="https://www.geonames.org/manageaccount"> Activar servicios</a> El uso de geonames puede tener costes. Infórmese en la plataforma </small>
                <div class="nm-user-validation-message" style="display: none;"></div>
            </div>
            
            <div class="nm-config-row nm-country-row" style="display: none;">
                <label>País:</label>
                <select class="nm-country-selector" disabled>
                    <option value="">Seleccionar país...</option>
                    <!-- Countries will be loaded via JavaScript -->
                </select>
                <div class="nm-country-loading" style="display: none;">
                    <span>Cargando países...</span>
                </div>
            </div>
            
            <div class="nm-levels-config" style="display: none;">
                <h5>Configurar niveles administrativos:</h5>
                <div class="nm-levels-list">
                    <!-- Levels will be dynamically added here -->
                </div>
            </div>
            
            <div class="nm-config-actions">
                <button type="button" class="button button-primary nm-save-geo-config">Guardar Configuración</button>
                <button type="button" class="button nm-cancel-geo-config">Cancelar</button>
            </div>
        </div>
    </div>
    
    <!-- Preview of the selectors -->
    <div class="nm-geo-preview">
        <?php if (!empty($levels)): ?>
            <?php foreach ($levels as $index => $level): ?>
                <div class="nm-geo-level">
                    <label><?php echo esc_html($field_names[$level] ?? ucfirst($level)); ?>:</label>
                    <select disabled>
                        <option>Seleccionar <?php echo esc_html($field_names[$level] ?? $level); ?>...</option>
                    </select>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="nm-geo-placeholder">Configure el selector geográfico para ver la vista previa</p>
        <?php endif; ?>
    </div>
    
    <!-- Hidden field to store configuration -->
    <input type="hidden" class="nm-field-config" value='<?php echo esc_attr(json_encode([
        'type' => 'geographic-selector',
        'id' => $field_id,
        'name' => $field_name,
        'label' => $field_label,
        'config' => $field_config
    ])); ?>'>
</div>

<style>
.nm-geographic-field {
    border: 1px solid #ddd;
    padding: 15px;
    margin: 10px 0;
    background: #f9f9f9;
    border-radius: 4px;
}

.nm-field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.nm-field-header label {
    font-weight: bold;
    font-size: 14px;
}

.nm-field-controls button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 5px;
    padding: 5px;
    border-radius: 3px;
}

.nm-field-controls button:hover {
    background: #ddd;
}

.nm-geo-config-panel {
    background: white;
    border: 1px solid #ccc;
    padding: 15px;
    margin: 10px 0;
    border-radius: 4px;
}

.nm-config-row {
    margin-bottom: 15px;
}

.nm-config-row label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.nm-config-row input,
.nm-config-row select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.nm-config-row small {
    display: block;
    color: #666;
    margin-top: 5px;
}

.nm-geonames-user-container {
    display: flex;
    gap: 10px;
    align-items: center;
}

.nm-geonames-user-container input {
    flex: 1;
}

.nm-validate-user-btn {
    white-space: nowrap;
}

.nm-user-validation-message {
    margin-top: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
}

.nm-user-validation-message.success {
    background-color: #d1edff;
    border: 1px solid #0073aa;
    color: #0073aa;
}

.nm-user-validation-message.error {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
}

.nm-country-loading {
    margin-top: 8px;
    color: #666;
    font-style: italic;
}

.nm-country-loading:before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 8px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #0073aa;
    border-radius: 50%;
    animation: nm-spin 1s linear infinite;
}

@keyframes nm-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.nm-levels-config {
    border-top: 1px solid #eee;
    padding-top: 15px;
    margin-top: 15px;
}

.nm-level-config {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 3px;
}

.nm-level-config input[type="checkbox"] {
    margin-right: 10px;
}

.nm-level-config input[type="text"] {
    flex: 1;
    margin-left: 10px;
}

.nm-config-actions {
    margin-top: 15px;
    text-align: right;
}

.nm-config-actions button {
    margin-left: 10px;
}

.nm-geo-preview {
    margin-top: 15px;
}

.nm-geo-level {
    margin-bottom: 10px;
}

.nm-geo-level label {
    display: block;
    margin-bottom: 5px;
    font-weight: normal;
}

.nm-geo-level select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.nm-geo-placeholder {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
}
</style>
