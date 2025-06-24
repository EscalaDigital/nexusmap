<?php

class NM_Entries_Display_Settings {

    private $loader;
    private $model;    public function __construct($loader) {
        $this->loader = $loader;
        $this->model = new NM_Model();
        
        // Hook para agregar el menú
        $this->loader->add_action('admin_menu', $this, 'add_admin_menu');
        
        // Hook para AJAX
        $this->loader->add_action('wp_ajax_nm_preview_entries_display', $this, 'preview_entries_display');
        $this->loader->add_action('wp_ajax_nm_save_display_settings', $this, 'save_display_settings');
    }    /**
     * Agregar menú de administración
     */
    public function add_admin_menu() {
        add_submenu_page(
            'nm',  // Slug del menú principal
            'Configuración de Visualización',
            'Visualización de Entradas',
            'manage_options',
            'nm-entries-display',
            array($this, 'display_settings_page')
        );
    }

    /**
     * Página de configuración
     */
    public function display_settings_page() {
        // Obtener configuración actual
        $current_settings = get_option('nm_entries_display_settings', $this->get_default_settings());
        
        // Obtener campos disponibles desde la base de datos
        $available_fields = $this->get_available_fields();
        
        ?>
        <div class="wrap">
            <h1>Configuración de Visualización de Entradas</h1>
            <p>Configura qué campos se muestran en las tarjetas del shortcode <code>[nm_entries_list]</code></p>
            
            <div id="nm-display-settings-container">
                <div class="nm-settings-left">
                    <form id="nm-display-settings-form">
                        <?php wp_nonce_field('nm_display_settings', 'nm_display_nonce'); ?>
                        
                        <table class="form-table">
                            <tbody>
                                <tr>
                                    <th scope="row">
                                        <label>Campos a mostrar</label>
                                    </th>
                                    <td>
                                        <div id="nm-fields-list">
                                            <?php foreach ($available_fields as $field_key => $field_info): ?>
                                                <div class="nm-field-option">
                                                    <label>
                                                        <input type="checkbox" 
                                                               name="display_fields[]" 
                                                               value="<?php echo esc_attr($field_key); ?>"
                                                               <?php checked(in_array($field_key, $current_settings['display_fields'])); ?>
                                                               data-field-type="<?php echo esc_attr($field_info['type']); ?>">
                                                        <?php echo esc_html($field_info['label']); ?>
                                                        <span class="field-type">(<?php echo esc_html($field_info['type']); ?>)</span>
                                                    </label>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <th scope="row">
                                        <label for="title_field">Campo para título</label>
                                    </th>
                                    <td>
                                        <select name="title_field" id="title_field">
                                            <?php foreach ($available_fields as $field_key => $field_info): ?>
                                                <?php if ($field_info['type'] === 'text' || $field_info['type'] === 'textarea'): ?>
                                                    <option value="<?php echo esc_attr($field_key); ?>" 
                                                            <?php selected($current_settings['title_field'], $field_key); ?>>
                                                        <?php echo esc_html($field_info['label']); ?>
                                                    </option>
                                                <?php endif; ?>
                                            <?php endforeach; ?>
                                        </select>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <th scope="row">
                                        <label for="image_field">Campo para imagen</label>
                                    </th>
                                    <td>
                                        <select name="image_field" id="image_field">
                                            <option value="">Sin imagen</option>
                                            <?php foreach ($available_fields as $field_key => $field_info): ?>
                                                <?php if (in_array($field_info['type'], ['image', 'file'])): ?>
                                                    <option value="<?php echo esc_attr($field_key); ?>" 
                                                            <?php selected($current_settings['image_field'], $field_key); ?>>
                                                        <?php echo esc_html($field_info['label']); ?>
                                                    </option>
                                                <?php endif; ?>
                                            <?php endforeach; ?>
                                        </select>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <th scope="row">
                                        <label for="entries_per_page">Entradas por página</label>
                                    </th>
                                    <td>
                                        <input type="number" 
                                               name="entries_per_page" 
                                               id="entries_per_page" 
                                               value="<?php echo esc_attr($current_settings['entries_per_page']); ?>" 
                                               min="1" max="50" class="small-text">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <p class="submit">
                            <button type="button" id="nm-preview-btn" class="button">Vista Previa</button>
                            <button type="submit" class="button-primary">Guardar Configuración</button>
                        </p>
                    </form>
                </div>
                
                <div class="nm-settings-right">
                    <div id="nm-preview-container">
                        <h3>Vista Previa</h3>
                        <div id="nm-preview-content">
                            <p>Haz clic en "Vista Previa" para ver cómo se verán las tarjetas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            #nm-display-settings-container {
                display: flex;
                gap: 30px;
            }
            .nm-settings-left {
                flex: 1;
                max-width: 600px;
            }
            .nm-settings-right {
                flex: 1;
                background: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .nm-field-option {
                margin-bottom: 10px;
                padding: 8px;
                background: #f7f7f7;
                border-radius: 3px;
            }
            .field-type {
                color: #666;
                font-size: 12px;
            }
            #nm-preview-content {
                min-height: 300px;
                border: 1px solid #ddd;
                padding: 15px;
                background: white;
                border-radius: 3px;
            }
            .nm-preview-card {
                border: 1px solid #e1e5e9;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 15px;
                max-width: 280px;
            }
            .nm-preview-image {
                height: 120px;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .nm-preview-content {
                padding: 12px;
            }
            .nm-preview-title {
                font-weight: 600;
                margin-bottom: 8px;
            }
            .nm-preview-field {
                margin-bottom: 5px;
                font-size: 13px;
            }
        </style>
        
        <script>
            jQuery(document).ready(function($) {
                $('#nm-preview-btn, input[type="checkbox"], select').on('change click', function() {
                    updatePreview();
                });
                
                $('#nm-display-settings-form').on('submit', function(e) {
                    e.preventDefault();
                    saveSettings();
                });
                
                function updatePreview() {
                    var formData = $('#nm-display-settings-form').serialize();
                    formData += '&action=nm_preview_entries_display';
                    
                    $.post(ajaxurl, formData, function(response) {
                        if (response.success) {
                            $('#nm-preview-content').html(response.data.html);
                        }
                    });
                }
                
                function saveSettings() {
                    var formData = $('#nm-display-settings-form').serialize();
                    formData += '&action=nm_save_display_settings';
                    
                    $.post(ajaxurl, formData, function(response) {
                        if (response.success) {
                            alert('Configuración guardada correctamente');
                        } else {
                            alert('Error al guardar: ' + response.data);
                        }
                    });
                }
            });
        </script>
        <?php
    }

    /**
     * Obtener campos disponibles de las entradas
     */
    private function get_available_fields() {
        global $wpdb;
        $entries_table = $wpdb->prefix . 'nm_entries';
        
        // Obtener una muestra de entradas para analizar campos
        $sample_entries = $wpdb->get_results(
            "SELECT entry_data FROM $entries_table WHERE entry_data != '' LIMIT 10"
        );
        
        $fields = array();
        
        foreach ($sample_entries as $entry) {
            $data = json_decode($entry->entry_data, true);
            if (is_array($data)) {
                foreach ($data as $key => $value) {
                    if (!isset($fields[$key])) {
                        $fields[$key] = array(
                            'label' => ucfirst(str_replace('_', ' ', $key)),
                            'type' => $this->detect_field_type($key, $value),
                            'sample' => $value
                        );
                    }
                }
            }
        }
        
        return $fields;
    }

    /**
     * Detectar tipo de campo
     */
    private function detect_field_type($key, $value) {
        $key_lower = strtolower($key);
        
        if (in_array($key_lower, ['image', 'imagen', 'foto', 'picture'])) {
            return 'image';
        }
        
        if (in_array($key_lower, ['audio', 'sonido', 'recording'])) {
            return 'audio';
        }
        
        if (in_array($key_lower, ['file', 'archivo', 'document'])) {
            return 'file';
        }
        
        if (filter_var($value, FILTER_VALIDATE_URL) && preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $value)) {
            return 'image';
        }
        
        if (filter_var($value, FILTER_VALIDATE_URL) && preg_match('/\.(mp3|wav|ogg)$/i', $value)) {
            return 'audio';
        }
        
        if (strlen($value) > 100) {
            return 'textarea';
        }
        
        if (is_numeric($value)) {
            return 'number';
        }
        
        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            return 'date';
        }
        
        return 'text';
    }

    /**
     * Configuración por defecto
     */
    private function get_default_settings() {
        return array(
            'display_fields' => array('title'),
            'title_field' => 'title',
            'image_field' => 'image',
            'entries_per_page' => 10
        );
    }

    /**
     * Vista previa AJAX
     */
    public function preview_entries_display() {
        check_ajax_referer('nm_display_settings', 'nm_display_nonce');
        
        $display_fields = isset($_POST['display_fields']) ? $_POST['display_fields'] : array();
        $title_field = sanitize_text_field($_POST['title_field']);
        $image_field = sanitize_text_field($_POST['image_field']);
        
        // Obtener una entrada de ejemplo
        global $wpdb;
        $entries_table = $wpdb->prefix . 'nm_entries';
        $sample_entry = $wpdb->get_row(
            "SELECT * FROM $entries_table WHERE entry_data != '' AND status = 'approved' LIMIT 1"
        );
        
        if (!$sample_entry) {
            wp_send_json_error('No hay entradas de ejemplo disponibles');
        }
        
        $entry_data = json_decode($sample_entry->entry_data, true);
        
        ob_start();
        ?>
        <div class="nm-preview-card">
            <?php if ($image_field && isset($entry_data[$image_field])): ?>
                <div class="nm-preview-image">
                    <?php if (filter_var($entry_data[$image_field], FILTER_VALIDATE_URL)): ?>
                        <img src="<?php echo esc_url($entry_data[$image_field]); ?>" style="max-width: 100%; height: 120px; object-fit: cover;">
                    <?php else: ?>
                        <span>📷 Imagen</span>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
            
            <div class="nm-preview-content">
                <?php if ($title_field && isset($entry_data[$title_field])): ?>
                    <div class="nm-preview-title">
                        <?php echo esc_html($entry_data[$title_field]); ?>
                    </div>
                <?php endif; ?>
                
                <?php foreach ($display_fields as $field): ?>
                    <?php if ($field !== $title_field && $field !== $image_field && isset($entry_data[$field])): ?>
                        <div class="nm-preview-field">
                            <strong><?php echo esc_html(ucfirst(str_replace('_', ' ', $field))); ?>:</strong>
                            <?php 
                            $value = $entry_data[$field];
                            if (strlen($value) > 50) {
                                echo esc_html(substr($value, 0, 50)) . '...';
                            } else {
                                echo esc_html($value);
                            }
                            ?>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
                
                <div class="nm-preview-field">
                    <small>Enviado: <?php echo date('d/m/Y', strtotime($sample_entry->date_submitted)); ?></small>
                </div>
            </div>
        </div>
        <?php
        
        $html = ob_get_clean();
        
        wp_send_json_success(array('html' => $html));
    }

    /**
     * Guardar configuración AJAX
     */
    public function save_display_settings() {
        check_ajax_referer('nm_display_settings', 'nm_display_nonce');
        
        $settings = array(
            'display_fields' => isset($_POST['display_fields']) ? $_POST['display_fields'] : array(),
            'title_field' => sanitize_text_field($_POST['title_field']),
            'image_field' => sanitize_text_field($_POST['image_field']),
            'entries_per_page' => intval($_POST['entries_per_page'])
        );
        
        update_option('nm_entries_display_settings', $settings);
        
        wp_send_json_success('Configuración guardada');
    }
}
