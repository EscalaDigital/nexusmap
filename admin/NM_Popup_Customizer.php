<?php
/**
 * Clase para gestionar la personalización del popup del mapa
 * 
 * Permite configurar:
 * - Qué campos mostrar u ocultar
 * - Orden de los campos
 * - Títulos personalizados para los campos
 * - Opciones especiales (carrusel de imágenes, etc.)
 */

class NM_Popup_Customizer
{
    private $loader;
    private $model;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();
        
        // Registrar menú y acciones
        $this->loader->add_action('admin_menu', $this, 'add_popup_customizer_menu');
        $this->loader->add_action('wp_ajax_nm_save_popup_config', $this, 'save_popup_config');
        $this->loader->add_action('wp_ajax_nm_get_popup_config', $this, 'get_popup_config');
    }

    /**
     * Añadir menú en el admin
     */
    public function add_popup_customizer_menu()
    {
        add_submenu_page(
            'nm',
            'Personalizar Popup',
            'Personalizar Popup',
            'manage_options',
            'nm-popup-customizer',
            array($this, 'render_popup_customizer_page')
        );
    }

    /**
     * Renderizar la página de personalización
     */
    public function render_popup_customizer_page()
    {
        // Verificar permisos
        if (!current_user_can('manage_options')) {
            wp_die(__('No tienes permisos para acceder a esta página.'));
        }

        // Obtener formulario activo
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);
        $form_type = 0; // Por defecto formulario único
        
        if ($ab_option_enabled) {
            // Si A/B está habilitado, detectar cuál usar (por ahora usaremos A)
            $form_type = 1;
        }

        // Obtener estructura del formulario
        $form_data = $this->model->get_form($form_type);
        $fields = isset($form_data['fields']) ? $form_data['fields'] : array();

        // Obtener configuración guardada
        $saved_config = get_option('nm_popup_config', array());

        // Preparar datos para la vista
        $fields_for_view = array();
        
        foreach ($fields as $field) {
            // Solo incluir campos que tienen nombre (excluir headers y map)
            if (isset($field['name']) && !empty($field['name']) && $field['type'] !== 'map') {
                $field_key = $field['name'];
                
                // Obtener configuración guardada o valores por defecto
                $field_config = isset($saved_config[$field_key]) ? $saved_config[$field_key] : array(
                    'visible' => true,
                    'custom_label' => '',
                    'show_label' => true,
                    'order' => 999
                );

                $fields_for_view[] = array(
                    'key' => $field_key,
                    'original_label' => isset($field['label']) ? $field['label'] : $field_key,
                    'type' => $field['type'],
                    'visible' => isset($field_config['visible']) ? $field_config['visible'] : true,
                    'custom_label' => isset($field_config['custom_label']) ? $field_config['custom_label'] : '',
                    'show_label' => isset($field_config['show_label']) ? $field_config['show_label'] : true,
                    'order' => isset($field_config['order']) ? $field_config['order'] : 999
                );
            }
        }

        // Ordenar por el orden guardado
        usort($fields_for_view, function($a, $b) {
            return $a['order'] - $b['order'];
        });

        // Obtener opciones especiales
        $special_options = get_option('nm_popup_special_options', array(
            'image_carousel' => false,
            'audio_autoplay' => false,
            'show_map_in_popup' => false,
            'hide_title' => false
        ));

        // Incluir la vista
        include NM_PLUGIN_DIR . 'admin/views/popup-customizer.php';
    }

    /**
     * Guardar configuración del popup vía AJAX
     */
    public function save_popup_config()
    {
        // Verificar nonce
        check_ajax_referer('nm_admin_nonce', 'nonce');

        // Verificar permisos
        if (!current_user_can('manage_options')) {
            wp_send_json_error('No tienes permisos para realizar esta acción.');
            return;
        }

        // Obtener datos del POST
        $fields_config = isset($_POST['fields_config']) ? json_decode(stripslashes($_POST['fields_config']), true) : array();
        $special_options = isset($_POST['special_options']) ? json_decode(stripslashes($_POST['special_options']), true) : array();

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Error al procesar los datos: ' . json_last_error_msg());
            return;
        }

        // Guardar configuración de campos
        update_option('nm_popup_config', $fields_config);

        // Guardar opciones especiales
        update_option('nm_popup_special_options', $special_options);

        wp_send_json_success(array(
            'message' => 'Configuración guardada correctamente.',
            'fields_count' => count($fields_config)
        ));
    }

    /**
     * Obtener configuración del popup vía AJAX
     */
    public function get_popup_config()
    {
        // Verificar nonce
        check_ajax_referer('nm_admin_nonce', 'nonce');

        $config = get_option('nm_popup_config', array());
        $special_options = get_option('nm_popup_special_options', array());

        wp_send_json_success(array(
            'config' => $config,
            'special_options' => $special_options
        ));
    }
}
