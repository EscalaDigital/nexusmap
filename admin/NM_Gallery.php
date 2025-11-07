<?php

class NM_Gallery
{
    private $loader;
    private $model;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();
        $this->loader->add_action('admin_menu', $this, 'add_gallery_menu');
        $this->loader->add_action('wp_ajax_nm_save_gallery_settings', $this, 'save_gallery_settings');
    }

    public function add_gallery_menu()
    {
        add_submenu_page(
            'nm',                           // Parent slug (menú principal de NexusMap)
            'Galería',                      // Page title
            'Galería',                      // Menu title
            'manage_options',               // Capability
            'nm-gallery',                   // Menu slug
            array($this, 'display_gallery_page') // Callback function
        );
    }

    public function display_gallery_page()
    {
        // Verificar si existe un formulario creado
        $form_data = $this->model->get_form(0); // form_type = 0
        
        if (empty($form_data) || !isset($form_data['fields']) || empty($form_data['fields'])) {
            include_once 'views/gallery-no-form.php';
            return;
        }

        // Obtener campos disponibles del formulario
        $available_fields = $this->get_available_fields($form_data['fields']);
        
        // Obtener configuración guardada
        $saved_settings = get_option('nm_gallery_settings', $this->get_default_settings());
        
        include_once 'views/gallery.php';
    }    private function get_available_fields($fields)
    {
        $available_fields = array();
        
        foreach ($fields as $field) {
            $field_type = $field['type'];
            $field_name = $field['name'];
            $field_label = $field['label'];
            
            // Categorizar campos según los tipos permitidos
            $category = $this->categorize_field_type($field_type);
            
            if ($category) {
                // Añadir prefijo nm_ al nombre del campo para que coincida con los datos guardados
                $prefixed_name = 'nm_' . $field_name;
                
                $available_fields[$category][] = array(
                    'name' => $prefixed_name,
                    'label' => $field_label,
                    'type' => $field_type,
                    'original_type' => $field_type,
                    'original_name' => $field_name // Guardar nombre original por si acaso
                );
            }
        }
        
        return $available_fields;
    }

    private function categorize_field_type($type)
    {
        switch ($type) {
            case 'text':
            case 'header':
                return 'text';
            
            case 'image':
            case 'file':
                // Diferenciamos entre imagen y archivo general
                return $type === 'image' ? 'image' : 'file';
            
            case 'audio':
                return 'audio';
            
            case 'date':
                return 'date';
            
            case 'textarea':
                return 'textarea';
            
            default:
                return null; // No permitido para galería
        }
    }

    private function get_default_settings()
    {
        return array(
            'selected_fields' => array(
                'text' => '',
                'image' => '',
                'audio' => '',
                'file' => '',
                'date' => '',
                'textarea' => ''
            )
        );
    }

    public function save_gallery_settings()
    {
        check_ajax_referer('nm_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permiso denegado');
        }

        $selected_fields = array(
            'text' => sanitize_text_field($_POST['text_field'] ?? ''),
            'image' => sanitize_text_field($_POST['image_field'] ?? ''),
            'audio' => sanitize_text_field($_POST['audio_field'] ?? ''),
            'file' => sanitize_text_field($_POST['file_field'] ?? ''),
            'date' => sanitize_text_field($_POST['date_field'] ?? ''),
            'textarea' => sanitize_text_field($_POST['textarea_field'] ?? '')
        );

        $settings = array(
            'selected_fields' => $selected_fields
        );

        update_option('nm_gallery_settings', $settings);
        
        wp_send_json_success('Configuración guardada correctamente');
    }
}
