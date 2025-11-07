<?php

class NM_Public
{

    private $loader;
    private $model;

    public function __construct($loader)
    {
        $this->loader = $loader;
        $this->model = new NM_Model();

        // Register the shortcodes during the 'init' action
        $this->loader->add_action('init', $this, 'register_shortcodes');



        // Enqueue public assets
        $this->loader->add_action('wp_enqueue_scripts', $this, 'enqueue_public_assets');        // AJAX actions
        $this->loader->add_action('wp_ajax_nm_get_map_points', $this, 'get_map_points');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_map_points', $this, 'get_map_points');
        $this->loader->add_action('wp_ajax_nm_submit_form', $this, 'submit_form');

        // Registrar la acción AJAX para descargar el GeoJSON
        $this->loader->add_action('wp_ajax_nm_download_geojson', $this, 'download_geojson');
        $this->loader->add_action('wp_ajax_nopriv_nm_download_geojson', $this, 'download_geojson');

        // Register the AJAX action to get entry details para MOdal
        $this->loader->add_action('wp_ajax_nm_get_entry_details', $this, 'get_entry_details');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_entry_details', $this, 'get_entry_details');

        $this->loader->add_action('wp_ajax_nm_get_conditional_fields',  $this, 'get_conditional_fields');
        $this->loader->add_action('wp_ajax_nopriv_nm_get_conditional_fields', $this, 'get_conditional_fields');
    }
    /**
     * Register shortcodes
     */
    public function register_shortcodes()
    {
        add_shortcode('nm_map', array($this, 'display_main_map'));
        add_shortcode('nm_form', array($this, 'display_custom_form'));
        add_shortcode('nm_entries_list', array($this, 'display_entries_list'));
    }


    /**
     * Enqueue public assets
     */
    public function enqueue_public_assets()
    {
        global $post;

        // Enqueue styles that are needed in both cases
        wp_enqueue_style('nm-public-css', NM_PLUGIN_URL . 'public/css/public.css', array(), NM_VERSION);
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');        // Obtener el tema seleccionado de las opciones y cargarlo
        $selected_theme = get_option('nm_selected_theme', 'default');
        // Cargar el CSS del tema seleccionado después del CSS base
        if ($selected_theme === 'default') {
            wp_enqueue_style('nm-theme-css', NM_PLUGIN_URL . 'public/css/themes/theme1.css', array('nm-public-css'), NM_VERSION);
        } else {
            wp_enqueue_style('nm-theme-css', NM_PLUGIN_URL . 'public/css/themes/theme' . $selected_theme . '.css', array('nm-public-css'), NM_VERSION);
        }        // Always load entries list CSS (it's lightweight)
        wp_enqueue_style('nm-entries-list-css', NM_PLUGIN_URL . 'public/css/entries-list.css', array('nm-public-css'), NM_VERSION);

        // Check if we have post content to check for shortcodes
        $post_content = '';
        if (is_object($post) && isset($post->post_content)) {
            $post_content = $post->post_content;
        }

        // Fuerza carga de jQuery si se usa alguno de los shortcodes
        if (
            has_shortcode($post_content, 'nm_form')
            || has_shortcode($post_content, 'nm_map')
            || has_shortcode($post_content, 'nm_entries_list')
        ) {
            wp_enqueue_script('jquery');
        }


        // Load entries modal JS if entries list shortcode is used
        if (has_shortcode($post_content, 'nm_entries_list')) {
            wp_enqueue_script('nm-entries-modal-js', NM_PLUGIN_URL . 'public/js/entries-modal.js', array('jquery'), NM_VERSION, true);

            // Localize script for modal AJAX
            wp_localize_script('nm-entries-modal-js', 'nm_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_public_nonce')
            ));
        }

        // Check if the [nm_map] shortcode is used in the content
        if (has_shortcode($post_content, 'nm_map')) {
            // Enqueue Leaflet CSS and JS
            // wp_enqueue_style('nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1');
            //   wp_enqueue_script('nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true);

            wp_enqueue_style(
                'nm-leaflet-css',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css',
                array(),
                '1.7.1'
            );
            wp_enqueue_script(
                'nm-leaflet-js',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js',
                array(),
                '1.7.1',
                true
            );

            // Enqueue Leaflet Control Geocoder
            wp_enqueue_style('leaflet-geocoder-css', 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css', array(), '1.13.0');
            wp_enqueue_script('leaflet-geocoder-js', 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js', array('nm-leaflet-js'), '1.13.0', true);
            /*
            wp_enqueue_style(
                'leaflet-geocoder-css',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet-control-geocoder/2.4.0/Control.Geocoder.css',
                array(),
                '2.4.0'
            );
            wp_enqueue_script(
                'leaflet-geocoder-js',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet-control-geocoder/2.4.0/Control.Geocoder.min.js',
                array('nm-leaflet-js'),
                '2.4.0',
                true
            );
            */
            // Enqueue functions related to the map (con versión basada en filemtime para evitar caché)
            $ver_nm_funciones = @filemtime(NM_PLUGIN_DIR . 'public/js/funcionesmaps.js');
            $ver_nm_public    = @filemtime(NM_PLUGIN_DIR . 'public/js/public.js');
            if (!$ver_nm_funciones) { $ver_nm_funciones = NM_VERSION; }
            if (!$ver_nm_public)    { $ver_nm_public    = NM_VERSION; }

            // Asegurar que no quede una versión previa registrada/enqueued
            wp_dequeue_script('nm-funcionesmaps-js');
            wp_deregister_script('nm-funcionesmaps-js');
            wp_dequeue_script('nm-public-js');
            wp_deregister_script('nm-public-js');

            // Registrar con busting explícito en la URL
            $src_func = add_query_arg('v', $ver_nm_funciones, NM_PLUGIN_URL . 'public/js/funcionesmaps.js');
            $src_pub  = add_query_arg('v', $ver_nm_public,    NM_PLUGIN_URL . 'public/js/public.js');

            wp_register_script('nm-funcionesmaps-js', $src_func, array('jquery', 'nm-leaflet-js', 'leaflet-geocoder-js'), null, true);
            wp_register_script('nm-public-js',        $src_pub,  array('jquery', 'nm-leaflet-js', 'leaflet-geocoder-js', 'nm-funcionesmaps-js'), null, true);

            wp_enqueue_script('nm-funcionesmaps-js');
            wp_enqueue_script('nm-public-js');            // AGREGAR ESTA LOCALIZACIÓN PARA EL MAPA
            wp_localize_script('nm-public-js', 'nmPublic', array(
                'ajax_url'  => admin_url('admin-ajax.php'),
                'nonce'     => wp_create_nonce('nm_public_nonce'),
                'build_ver' => $ver_nm_public,
            ));

            // Clustering: cargar assets sólo si está habilitado
            if (get_option('nm_enable_clustering', false)) {
                wp_enqueue_style('leaflet-markercluster-css', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css', array('nm-leaflet-css'), '1.5.3');
                wp_enqueue_style('leaflet-markercluster-default-css', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css', array('leaflet-markercluster-css'), '1.5.3');
                wp_enqueue_script('leaflet-markercluster-js', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js', array('nm-leaflet-js'), '1.5.3', true);
            }

            // Para gráficos Chart.js
            wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js', array(), '4.4.0', true);
            // Librería jsPDF para exportar gráficos a PDF
            wp_enqueue_script('jspdf', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', array(), '2.5.1', true);
        }

        // Check if the [nm_form] shortcode is used in the content
        if (has_shortcode($post_content, 'nm_form')) {
            // Enqueue Leaflet CSS and JS
            wp_enqueue_style('nm-leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', array(), '1.7.1');
            wp_enqueue_script('nm-leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', array(), '1.7.1', true);            // Enqueue Leaflet Draw CSS and JS
            wp_enqueue_style('nm-leaflet-draw-css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css', array('nm-leaflet-css'), '1.0.4');
            wp_enqueue_script('nm-leaflet-draw-js', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js', array('nm-leaflet-js'), '1.0.4', true);

            // Obtener el tema seleccionado de las opciones
            $selected_theme_form = get_option('nm_selected_theme_form', 'default');

            // Cargar el CSS del tema seleccionado
            if ($selected_theme_form === 'default') {
                wp_enqueue_style('nm-form-css', NM_PLUGIN_URL . 'public/css/themes/form1.css', array(), NM_VERSION);
            } else {
                wp_enqueue_style('nm-form-css', NM_PLUGIN_URL . 'public/css/themes/form' . $selected_theme_form  . '.css', array(), NM_VERSION);
            }
            wp_enqueue_script('nm-form-js', NM_PLUGIN_URL . 'public/js/form.js', array('jquery', 'nm-leaflet-js', 'nm-leaflet-draw-js'), NM_VERSION, true);            // Enqueue geographic selector scripts
            wp_enqueue_style('nm-geographic-selector-css', NM_PLUGIN_URL . 'public/css/geographic-selector.css', array(), NM_VERSION);
            wp_enqueue_script('nm-geographic-selector-js', NM_PLUGIN_URL . 'public/js/geographic-selector.js', array('jquery'), NM_VERSION, true);            // Localize geographic selector script
            wp_localize_script('nm-geographic-selector-js', 'nmGeoSelector', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_public_nonce')
            )); // Localize script for AJAX handling
            wp_localize_script('nm-form-js', 'nmPublic', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('nm_public_nonce')
            ));
        }
    }

    /**
     * Display the main map shortcode
     */
    public function display_main_map($atts)
    {
        // Extract attributes and set defaults
        $atts = shortcode_atts(array(
            'width'  => '100%',
            'height' => '500px',
            'lat'    => '0',
            'lng'    => '0',
            'zoom'   => '2',
        ), $atts, 'nm_map');

        // Obtener la configuración de capas
        $layer_settings = get_option('nm_layer_settings', array());

        // Obtener configuración de gráficos
        $chart_settings = get_option('nm_chart_settings', array());

        // Obtener la estructura del formulario
        $form_data = $this->model->get_form(0); // Obtiene el formulario principal
        $form_structure = array();

        if (isset($form_data['fields']) && is_array($form_data['fields'])) {
            foreach ($form_data['fields'] as $field) {
                // Incluir headers y campos sin nombre solo si ayudan al modal (headers no tienen name)
                if (!empty($field['name'])) {
                    $item = array(
                        'name'  => $field['name'],
                        'label' => isset($field['label']) ? $field['label'] : $field['name'],
                        'type'  => isset($field['type']) ? $field['type'] : 'text',
                        'is_title' => isset($field['is_title']) && $field['is_title'] ? 1 : 0,
                    );

                    // Añadir select_id si es un select condicional (lo usa el modal)
                    if (isset($field['type']) && $field['type'] === 'conditional-select' && !empty($field['select_id'])) {
                        $item['select_id'] = $field['select_id'];
                    }

                    // Añadir config si es geographic-selector (para mostrar niveles con etiquetas propias)
                    if (isset($field['type']) && $field['type'] === 'geographic-selector' && !empty($field['config'])) {
                        $item['config'] = $field['config'];
                    }

                    $form_structure[] = $item;
                } else {
                    // Registrar headers para que el modal pueda crear secciones
                    if (isset($field['type']) && $field['type'] === 'header') {
                        $form_structure[] = array(
                            'name'  => '',
                            'label' => isset($field['label']) ? $field['label'] : 'Sección',
                            'type'  => 'header'
                        );
                    }
                }

                // Incluir también subcampos de selects condicionales para resolver labels en leyenda/modal
                if (isset($field['type']) && $field['type'] === 'conditional-select' && !empty($field['options']) && is_array($field['options'])) {
                    foreach ($field['options'] as $opt) {
                        if (!empty($opt['conditional_fields']) && is_array($opt['conditional_fields'])) {
                            foreach ($opt['conditional_fields'] as $cfield) {
                                if (!empty($cfield['name'])) {
                                    $form_structure[] = array(
                                        'name'  => $cfield['name'],
                                        'label' => isset($cfield['label']) ? $cfield['label'] : $cfield['name'],
                                        'type'  => isset($cfield['type']) ? $cfield['type'] : 'text',
                                        // metadatos útiles (opcionales)
                                        'is_conditional' => true,
                                        'parent_field'   => isset($field['name']) ? $field['name'] : '',
                                        'parent_option'  => isset($opt['id']) ? $opt['id'] : (isset($opt['value']) ? $opt['value'] : '')
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        // Convertir la estructura del formulario a JSON para pasarla al frontend
        wp_localize_script('nm-public-js', 'nmFormStructure', array(
            'fields' => $form_structure
        ));

        ob_start();
        include NM_PLUGIN_DIR . 'public/views/main-map.php';
        return ob_get_clean();
    }

    public function display_custom_form()
    {
        if (!is_user_logged_in()) {
            $default = 'Debes estar logueado para ver este formulario.';
            $raw = get_option('nm_form_login_message', $default);
            // Permitir shortcodes en el mensaje
            $content = do_shortcode($raw);
            return wp_kses_post($content);
        }

        // Limpiar cualquier output buffer previo
        //   while (ob_get_level()) { ob_end_clean();         }

        // Check if the A/B option is enabled
        $ab_option_enabled = get_option('nm_ab_option_enabled', 0);

        if ($ab_option_enabled) {
            // If A/B option is enabled, retrieve forms A and B
            $form_data_a = $this->model->get_form(1); // form_type = 1
            $form_data_b = $this->model->get_form(2); // form_type = 2

            // Include the view that allows the user to choose between two options
            ob_start();
            include NM_PLUGIN_DIR . 'public/views/form-display-ab.php';
            $output = ob_get_clean();
        } else {
            // If A/B option is not enabled, retrieve the single form
            $form_data = $this->model->get_form(0); // form_type = 0

            // Include the single form view
            ob_start();
            include NM_PLUGIN_DIR . 'public/views/form-display.php';
            $output = ob_get_clean();
        }

        return $output;
    }
    /**
     * Display entries list shortcode
     */    public function display_entries_list($atts)
    {
        // Verificar si el modelo existe
        if (!$this->model) {
            return '<div style="border: 1px solid red; padding: 10px;">Error: Modelo no encontrado</div>';
        }

        // Obtener configuración de la galería
        $gallery_settings = get_option('nm_gallery_settings', array());
        $selected_fields = isset($gallery_settings['selected_fields']) ? $gallery_settings['selected_fields'] : array();

        // Extract attributes and set defaults
        $atts = shortcode_atts(array(
            'per_page' => 10,
            'show_pagination' => 'true'
        ), $atts, 'nm_entries_list');

        $per_page = intval($atts['per_page']);
        $status = 'approved'; // Solo entradas aprobadas
        $show_pagination = ($atts['show_pagination'] === 'true');

        // Get current page
        $current_page = isset($_GET['entries_page']) ? max(1, intval($_GET['entries_page'])) : 1;
        $offset = ($current_page - 1) * $per_page;

        try {
            // Get entries
            $entries = $this->model->get_entries_paginated($per_page, $offset, $status);
            $total_entries = $this->model->count_entries($status);
            $total_pages = ceil($total_entries / $per_page);

            // Generate output
            ob_start();
?>
            <div class="nm-entries-list-container">
                <?php if (!empty($entries)): ?> <div class="nm-entries-grid"> <?php foreach ($entries as $index => $entry): ?>
                            <?php
                                                                                    // Intentar deserializar primero (formato correcto)
                                                                                    $entry_data = maybe_unserialize($entry->entry_data);

                                                                                    // Si no es array, intentar JSON decode como fallback
                                                                                    if (!is_array($entry_data)) {
                                                                                        $entry_data = json_decode($entry->entry_data, true);
                                                                                    }
                            ?>
                            <div class="nm-entry-card" data-entry-index="<?php echo esc_attr($index); ?>">
                                <?php
                                                                                    // Renderizar campos según configuración de galería
                                                                                    $this->render_gallery_card_content($entry_data, $entry, $selected_fields);
                                ?>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <?php if ($show_pagination && $total_pages > 1): ?>
                        <div class="nm-entries-pagination">
                            <?php
                            $base_url = remove_query_arg('entries_page');

                            // Previous page
                            if ($current_page > 1): ?>
                                <a href="<?php echo esc_url(add_query_arg('entries_page', $current_page - 1, $base_url)); ?>"
                                    class="nm-page-link nm-prev">← Anterior</a>
                            <?php endif;

                            // Page numbers (limitamos a mostrar solo algunas páginas)
                            $start_page = max(1, $current_page - 2);
                            $end_page = min($total_pages, $current_page + 2);

                            // Primera página si no está en el rango
                            if ($start_page > 1): ?>
                                <a href="<?php echo esc_url(add_query_arg('entries_page', 1, $base_url)); ?>"
                                    class="nm-page-link">1</a>
                                <?php if ($start_page > 2): ?>
                                    <span class="nm-page-dots">...</span>
                                <?php endif;
                            endif;

                            // Páginas en el rango
                            for ($i = $start_page; $i <= $end_page; $i++):
                                if ($i == $current_page): ?>
                                    <span class="nm-page-link nm-current"><?php echo $i; ?></span>
                                <?php else: ?>
                                    <a href="<?php echo esc_url(add_query_arg('entries_page', $i, $base_url)); ?>"
                                        class="nm-page-link"><?php echo $i; ?></a>
                                <?php endif;
                            endfor;

                            // Última página si no está en el rango
                            if ($end_page < $total_pages): ?>
                                <?php if ($end_page < $total_pages - 1): ?>
                                    <span class="nm-page-dots">...</span>
                                <?php endif; ?>
                                <a href="<?php echo esc_url(add_query_arg('entries_page', $total_pages, $base_url)); ?>"
                                    class="nm-page-link"><?php echo $total_pages; ?></a>
                            <?php endif;

                            // Next page
                            if ($current_page < $total_pages): ?>
                                <a href="<?php echo esc_url(add_query_arg('entries_page', $current_page + 1, $base_url)); ?>"
                                    class="nm-page-link nm-next">Siguiente →</a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?> <?php else: ?>
                    <div class="nm-no-entries">
                        <p>No se encontraron entradas aprobadas.</p>
                    </div>
                <?php endif; ?>
            </div>
<?php
            return ob_get_clean();
        } catch (Exception $e) {
            return '<div style="border: 1px solid red; padding: 10px;">Error: ' . esc_html($e->getMessage()) . '</div>';
        }
    }


    /**
     * Get map geometries via AJAX
     */



    /**
     * Get map points via AJAX
     */
    public function get_map_points()
    {
        // Agregar logs para debug
        error_log('NexusMap: get_map_points called');
        error_log('NexusMap: POST data: ' . print_r($_POST, true));

        // Verificar si el nonce existe antes de validarlo
        if (!isset($_POST['nonce'])) {
            error_log('NexusMap: No nonce provided');
            wp_send_json_error('No nonce provided');
            return;
        }

        // Intentar verificar el nonce con manejo de errores
        if (!wp_verify_nonce($_POST['nonce'], 'nm_public_nonce')) {
            error_log('NexusMap: Nonce verification failed');
            wp_send_json_error('Invalid nonce');
            return;
        }

        error_log('NexusMap: Nonce verified successfully');

        $entries = $this->model->get_entries('approved');
        $features = array();

        // Obtener configuración de capas
        $layer_settings = get_option('nm_layer_settings', array());
        $has_layers = !empty($layer_settings);

        foreach ($entries as $entry) {
            $entry_data = maybe_unserialize($entry->entry_data);
            if (isset($entry_data['map_data'])) {


                $raw_json = wp_unslash($entry_data['map_data']);


                try {
                    // ② Intenta decodificar: si falla lanzará JsonException
                    $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);
                } catch (\JsonException $e) {

                    // ③ Apunta en el log la razón exacta y salta al siguiente registro
                    error_log(sprintf(
                        'JSON ERROR (entry_id %d): %s',
                        $entry->id,
                        $e->getMessage()          // ej.: "Syntax error"
                    ));

                    continue;                     // no añadas esta feature a $features
                }



                if (json_last_error() === JSON_ERROR_NONE && is_array($map_data)) {
                    foreach ($map_data as $feature) {
                        if (isset($feature['geometry']['type']) && $feature['geometry']['type'] === 'Point') {
                            // Inicializar array de capas
                            if (!isset($feature['properties']['layers'])) {
                                $feature['properties']['layers'] = array();
                            }

                            // Agregar todas las propiedades del entry_data al properties
                            foreach ($entry_data as $key => $value) {
                                if ($key !== 'map_data') {
                                    $feature['properties'][$key] = $value;
                                }
                            }

                            // Agregar el entry_id
                            $feature['properties']['entry_id'] = $entry->id;
                            $feature['properties']['has_layer'] = false;

                            // Si hay configuración de capas, buscar coincidencias
                            if ($has_layers) {
                                foreach ($layer_settings as $field_name => $layer_config) {
                                    $field_key = 'nm_' . $field_name; // para subcampos condicionales, field_name ya es el nombre del subcampo

                                    // Comprobar si existe la propiedad en feature properties
                                    if (isset($feature['properties'][$field_key])) {
                                        // Si es un campo de tipo texto
                                        if ($layer_config['type'] === 'text') {
                                            $value = $feature['properties'][$field_key];
                                            if (!empty($value)) {
                                                if (!isset($feature['properties']['text_layers'])) {
                                                    $feature['properties']['text_layers'] = array();
                                                }
                                                $feature['properties']['text_layers'][] = array(
                                                    'field_name' => $field_name,
                                                    'value' => $value,
                                                    'color' => $layer_config['color'],
                                                    'label' => $layer_config['label']
                                                );
                                                $feature['properties']['has_layer'] = true;
                                            }
                                        }
                                        // Si es un campo select/radio/checkbox
                                        else {
                                            $value = is_array($feature['properties'][$field_key])
                                                ? $feature['properties'][$field_key][0]
                                                : $feature['properties'][$field_key];

                                            // Normalizar claves a string para comparación; UI ahora guarda por value
                                            $colors = array();
                                            if (isset($layer_config['colors']) && is_array($layer_config['colors'])) {
                                                foreach ($layer_config['colors'] as $k => $c) {
                                                    $colors[(string)$k] = $c;
                                                }
                                            }

                                            if (isset($colors[$value])) {
                                                $feature['properties']['layers'][] = array(
                                                    'layer_field' => $field_name,
                                                    'layer_value' => $value,
                                                    'layer_color' => $colors[$value],
                                                    'layer_type' => 'select'
                                                );
                                                $feature['properties']['has_layer'] = true;
                                            }
                                        }
                                    }
                                }
                            }

                            $features[] = $feature;
                        }
                    }
                }
            }
        }

        // Preparar respuesta con configuración de capas (añadiendo labels)
        $formatted_layer_settings = array();
        $form_data_for_labels = $this->model->get_form(0);
        foreach ($layer_settings as $field_name => $config) {
            $label = isset($config['label']) ? $config['label'] : $field_name;
            // Intentar encontrar un label más amigable desde el formulario
            if (isset($form_data_for_labels['fields']) && is_array($form_data_for_labels['fields'])) {
                foreach ($form_data_for_labels['fields'] as $f) {
                    if (!empty($f['name']) && $f['name'] === $field_name && !empty($f['label'])) {
                        $label = $f['label'];
                        break;
                    }
                    // Buscar en subcampos condicionales
                    if (isset($f['type']) && $f['type'] === 'conditional-select' && !empty($f['options'])) {
                        foreach ($f['options'] as $opt) {
                            if (!empty($opt['conditional_fields'])) {
                                foreach ($opt['conditional_fields'] as $cf) {
                                    if (!empty($cf['name']) && $cf['name'] === $field_name && !empty($cf['label'])) {
                                        $label = $cf['label'];
                                        break 3;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $formatted_layer_settings[] = array(
                'field' => $field_name,
                'label' => $label,
                'type' => $config['type'],
                'colors' => isset($config['colors']) ? array_combine(
                    array_map('strval', array_keys($config['colors'])),
                    $config['colors']
                ) : ($config['type'] === 'text' ? array($config['color']) : array())
            );
        }

        $response = array(
            'features' => $features,
            'layer_settings' => $formatted_layer_settings
        );

        wp_send_json($response);
    }    // Método para obtener detalles de la entrada
    public function get_entry_details()
    {
        check_ajax_referer('nm_public_nonce', 'nonce');

        // Obtener el índice de la entrada en lugar del ID
        $entry_index = isset($_POST['entry_index']) ? intval($_POST['entry_index']) : -1;

        if ($entry_index >= 0) {
            try {
                // Obtener todas las entradas aprobadas de la misma manera que en display_entries_list
                $per_page = 1000; // Un número alto para obtener todas las entradas
                $offset = 0;
                $status = 'approved';

                $entries = $this->model->get_entries_paginated($per_page, $offset, $status);

                // Verificar si el índice existe
                if (isset($entries[$entry_index])) {
                    $entry = $entries[$entry_index];

                    // Deserializar los datos de la entrada
                    $entry_data = maybe_unserialize($entry->entry_data);

                    // Si no es array, intentar JSON decode como fallback
                    if (!is_array($entry_data)) {
                        $entry_data = json_decode($entry->entry_data, true);
                    }

                    // Preparar respuesta base
                    $response_data = array(
                        'id' => $entry->id,
                        'date_created' => $entry->date_created,
                        'custom_fields' => array()
                    );

                    // IMPORTANTE: Incluir datos del mapa primero si existen
                    if (isset($entry_data['map_data']) && !empty($entry_data['map_data'])) {
                        $response_data['map_data'] = $entry_data['map_data'];
                    }

                    // También incluir geometry directo si existe
                    if (isset($entry_data['geometry']) && !empty($entry_data['geometry'])) {
                        $response_data['geometry'] = $entry_data['geometry'];
                    }

                    // Campos a evitar (misma lógica que el modal principal)
                    $skip_keys = array(
                        'layers',
                        'has_layer',
                        'text_layers',
                        'entry_id',
                        'id',
                        'entry_status',
                        'form_type',
                        'date_created',
                        'user_id',
                        'status',
                        'submitted_at',
                        'csrf_token',
                        'nonce',
                        'action',
                        'map_data',
                        'geometry',
                        'nm_conditional_groups'  // Agregar este campo específicamente
                    );

                    // Procesar todos los campos con prefijo nm_ (misma lógica que el modal principal)
                    if (is_array($entry_data)) {
                        foreach ($entry_data as $key => $value) {
                            // Saltar campos específicos que también evita el modal principal
                            if (in_array($key, $skip_keys)) {
                                continue;
                            }

                            // Solo procesar campos con prefijo nm_ (igual que el modal principal)
                            if (strpos($key, 'nm_') === 0) {
                                // Obtener el nombre del campo sin el prefijo
                                $field_name = substr($key, 3);

                                // Excluir específicamente "conditional_groups" si está vacío o es {}
                                if ($field_name === 'conditional_groups') {
                                    if (empty($value) || $value === '{}' || $value === '[]') {
                                        continue;
                                    }
                                }

                                // Procesar el campo (ahora incluyendo campos vacíos)
                                $processed_value = $this->process_field_value_for_display($value, $field_name, true);

                                // Incluir el campo incluso si está vacío (excepto si process_field_value_for_display retorna null explícitamente)
                                $response_data['custom_fields'][$field_name] = $processed_value;
                            }
                        }
                    }

                    // También extraer campos del map_data si existen (igual que el modal principal)
                    if (isset($entry_data['map_data'])) {
                        try {
                            $raw_json = wp_unslash($entry_data['map_data']);
                            $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);

                            if (is_array($map_data)) {
                                foreach ($map_data as $feature) {
                                    if (isset($feature['properties']) && is_array($feature['properties'])) {
                                        foreach ($feature['properties'] as $prop_key => $prop_value) {
                                            // Saltar campos que ya se evitan
                                            if (in_array($prop_key, $skip_keys)) {
                                                continue;
                                            }

                                            // Excluir específicamente "conditional_groups" si está vacío o es {}
                                            if ($prop_key === 'nm_conditional_groups' || $prop_key === 'conditional_groups') {
                                                if (empty($prop_value) || $prop_value === '{}' || $prop_value === '[]') {
                                                    continue;
                                                }
                                            }

                                            // Solo agregar si no existe ya en custom_fields
                                            if (!isset($response_data['custom_fields'][$prop_key])) {
                                                $processed_value = $this->process_field_value_for_display($prop_value, $prop_key, true);
                                                $response_data['custom_fields'][$prop_key] = $processed_value;
                                            }
                                        }
                                        break; // Solo procesar el primer feature
                                    }
                                }
                            }
                        } catch (\JsonException $e) {
                            error_log('Error decoding map_data in get_entry_details: ' . $e->getMessage());
                        }
                    }

                    wp_send_json_success($response_data);
                } else {
                    wp_send_json_error('Índice de entrada no válido.');
                }
            } catch (Exception $e) {
                error_log('Error in get_entry_details: ' . $e->getMessage());
                wp_send_json_error('Error al obtener los detalles de la entrada.');
            }
        } else {
            wp_send_json_error('Índice de entrada no válido.');
        }
    }

    /**
     * Procesa un valor de campo para su visualización en el modal (similar a la lógica del modal principal)
     */
    private function process_field_value_for_display($value, $field_name, $include_empty = false)
    {
        // Si no se deben incluir campos vacíos y el valor está vacío, retornar null
        if (!$include_empty && empty($value) && $value !== '0') {
            return null;
        }

        // Si el valor está completamente vacío, mostrar un valor por defecto
        if (empty($value) && $value !== '0') {
            return 'Sin especificar';
        }

        // Si es una URL (imagen, archivo, audio), verificar que sea válida
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            // Convertir HTTP a HTTPS para mayor seguridad
            return str_replace('http://', 'https://', $value);
        }

        // Si es un ID numérico de adjunto de WordPress, obtener la URL
        if (is_numeric($value)) {
            $attachment_url = wp_get_attachment_url(intval($value));
            if ($attachment_url) {
                return str_replace('http://', 'https://', $attachment_url);
            }
        }

        // Para fechas, intentar formatearlas
        if (strpos($field_name, 'fecha') !== false || strpos($field_name, 'date') !== false) {
            if (strtotime($value)) {
                return date('d/m/Y', strtotime($value));
            }
        }

        // Sanitizar el valor de texto
        return sanitize_text_field($value);
    }

    public function submit_form()
    {
        /* ───────── Seguridad ───────── */
        check_ajax_referer('nm_public_nonce', 'nonce');

        //Sanitizar y limpiar datos
        $sanitize_form_data = function ($data) use (&$sanitize_form_data) {
            if (is_array($data)) {
                return array_map($sanitize_form_data, $data);
            } elseif (is_string($data)) {
                // Limpiar escapes múltiples y normalizar comillas
                $data = stripslashes($data);
                $data = str_replace(array("\\'", '\\"'), array("'", '"'), $data);
                return sanitize_text_field($data);
            }
            return $data;
        };

        $form_type = isset($_POST['nm_form_type']) ? intval($_POST['nm_form_type']) : 0;
        $form_fields          = array();   // propiedades finales, en orden
        $already_processed    = array();   // names tratados para no duplicar

        /* ────── 1. Cargar la definición del formulario (orden “oficial”) ────── */
        $form_data  = $this->model->get_form($form_type);
        $field_defs = isset($form_data['fields']) && is_array($form_data['fields'])
            ? $form_data['fields']
            : array();

        /* Función de normalización: coincide con cómo generas el atributo name="" */
        $normalize = static function ($raw) {
            // 1) quita tildes, 2) reemplaza espacios por '_' , 3) quita caracteres raros
            $no_accents = remove_accents($raw);
            return preg_replace('/[^A-Za-z0-9_\-]/', '_', str_replace(' ', '_', $no_accents));
        };

        /* ────── 2. Recorrer los campos tal cual están en la definición ────── */
        foreach ($field_defs as $field) {
            if (empty($field['name'])) {
                continue;                             // headers, etc.
            }

            $orig_name   = $field['name'];            // ej: "Imagen principal"
            $html_name   = $normalize($orig_name);  // ej: "Imagen_principal"
            $store_key   = 'nm_' . $orig_name;        // mantenemos nombre original en BD

            $already_processed[] = $html_name;        // marcarlo            /* ---- FILE & IMAGE ---- */
            if (
                ($field['type'] === 'file' || $field['type'] === 'image') && isset($_FILES[$html_name])
                && $_FILES[$html_name]['error'] === UPLOAD_ERR_OK
            ) {

                // Definir tipos de archivo permitidos según el tipo de campo
                if ($field['type'] === 'image') {
                    $allowed = array(
                        'jpg|jpeg|jpe' => 'image/jpeg',
                        'png'          => 'image/png',
                        'gif'          => 'image/gif',
                        'webp'         => 'image/webp',
                    );
                } else { // file (documentos)
                    $allowed = array(
                        'pdf'  => 'application/pdf',
                        'doc'  => 'application/msword',
                        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'xls'  => 'application/vnd.ms-excel',
                        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'txt'  => 'text/plain',
                        'rtf'  => 'application/rtf',
                    );
                }

                $up = wp_handle_upload($_FILES[$html_name], array(
                    'test_form' => false,
                    'mimes'     => $allowed,
                ));
                if ($up && ! isset($up['error'])) {
                    $form_fields[$store_key] = esc_url_raw(
                        str_replace('http://', 'https://', $up['url'])
                    );
                } else {
                    $file_type_name = ($field['type'] === 'image') ? 'imagen' : 'documento';
                    $allowed_formats = ($field['type'] === 'image') ? 'JPG, PNG, GIF, WebP' : 'PDF, DOC, DOCX, XLS, XLSX, TXT, RTF';
                    wp_send_json_error('Error al subir ' . $file_type_name . ' "' . esc_html($orig_name) . '": ' . $up['error'] . '. Formatos permitidos: ' . $allowed_formats);
                    wp_die();
                }
            }            /* ---- AUDIO ---- */ elseif ($field['type'] === 'audio') {
                // También marcar el campo de archivo asociado como procesado
                $already_processed[] = $html_name . '_file';

                try {
                    $audio_data = isset($_POST[$html_name]) ? $_POST[$html_name] : '';
                    $file_field_name = $html_name . '_file';

                    error_log("Processing audio field '{$html_name}', data: '{$audio_data}'");
                    error_log("Looking for file field: '{$file_field_name}'");
                    error_log("FILES data: " . print_r($_FILES, true));
                    error_log("POST data: " . print_r($_POST, true));

                    // Simplificar: solo procesar si hay un archivo cargado
                    if (isset($_FILES[$file_field_name]) && $_FILES[$file_field_name]['error'] === UPLOAD_ERR_OK) {
                        $audio_allowed = array(
                            'mp3'  => 'audio/mpeg',
                            'wav'  => 'audio/wav',
                            'ogg'  => 'audio/ogg',
                            'flac' => 'audio/flac',
                            'm4a'  => 'audio/mp4',
                            'aac'  => 'audio/aac'
                        );

                        $audio_up = wp_handle_upload($_FILES[$file_field_name], array(
                            'test_form' => false,
                            'mimes'     => $audio_allowed,
                        ));

                        if ($audio_up && ! isset($audio_up['error'])) {
                            $form_fields[$store_key] = esc_url_raw(
                                str_replace('http://', 'https://', $audio_up['url'])
                            );
                            error_log("Audio file uploaded successfully: " . $form_fields[$store_key]);
                        } else {
                            error_log("Audio upload error: " . print_r($audio_up, true));
                            wp_send_json_error('Error al subir audio "' . esc_html($orig_name) . '": ' . ($audio_up['error'] ?? 'Error desconocido'));
                            wp_die();
                        }
                    } else {
                        // Si no hay archivo pero el campo se envía, guardarlo como valor vacío
                        error_log("No audio file uploaded for field: " . $file_field_name);
                        // No hacer nada, dejar que se procese como campo normal si tiene datos
                    }
                } catch (Exception $e) {
                    error_log("Exception in audio processing: " . $e->getMessage());
                    wp_send_json_error('Error interno al procesar audio: ' . $e->getMessage());
                    wp_die();
                }
            }

            /* ---- INPUT NORMAL ---- */ elseif (isset($_POST[$html_name])) {
                $val = $_POST[$html_name];
                $cleaned_val = $sanitize_form_data($val);
                $form_fields[$store_key] = $cleaned_val;
            }
            // si es file sin subir nada → simplemente se omite
        }

        /* ────── 3. Pasada de “rescate” ──────
               Por si el frontend añadió campos que no están en la definición      */
        $incoming_keys = array_keys(array_merge($_POST, $_FILES));

        foreach ($incoming_keys as $inkey) {

            if (
                in_array($inkey, $already_processed, true) ||
                in_array($inkey, array(
                    'action',
                    'nonce',
                    'map_data',
                    'nm_form_nonce',
                    '_wp_http_referer',
                    'nm_submit_form',
                    'nm_form_type'
                ), true)
            ) {
                continue;
            }

            $store_key = 'nm_' . $inkey;            /* file suelto */
            if (isset($_FILES[$inkey]) && $_FILES[$inkey]['error'] === UPLOAD_ERR_OK) {                // Detectar si es un archivo de audio basado en el nombre del campo o tipo MIME
                $is_audio_file = false;
                $file_mime = $_FILES[$inkey]['type'];
                $audio_mimes = array('audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac');

                // Verificar si es audio por MIME type
                if (in_array($file_mime, $audio_mimes)) {
                    $is_audio_file = true;
                }

                // Verificar si el nombre del campo termina en '_file' (indica campo de audio)
                if (strpos($inkey, '_file') !== false) {
                    $base_field = str_replace('_file', '', $inkey);
                    // Verificar si existe el campo de datos correspondiente
                    if (isset($_POST[$base_field])) {
                        $is_audio_file = true;
                    }
                }

                if ($is_audio_file) {
                    // Procesar como archivo de audio
                    $audio_allowed = array(
                        'mp3'  => 'audio/mpeg',
                        'wav'  => 'audio/wav',
                        'ogg'  => 'audio/ogg',
                        'flac' => 'audio/flac',
                        'm4a'  => 'audio/mp4',
                        'aac'  => 'audio/aac'
                    );

                    $audio_up = wp_handle_upload($_FILES[$inkey], array(
                        'test_form' => false,
                        'mimes'     => $audio_allowed,
                    ));

                    if ($audio_up && ! isset($audio_up['error'])) {
                        $form_fields[$store_key] = esc_url_raw(
                            str_replace('http://', 'https://', $audio_up['url'])
                        );
                    } else {
                        wp_send_json_error('Error al subir audio "' . esc_html($inkey) . '": ' . $audio_up['error']);
                        wp_die();
                    }
                } else {
                    // Procesar como archivo normal (imagen/documento)
                    $up = wp_handle_upload($_FILES[$inkey], array(
                        'test_form' => false,
                        'mimes'     => array(
                            'jpg|jpeg|jpe' => 'image/jpeg',
                            'png'          => 'image/png',
                            'gif'          => 'image/gif',
                            'pdf'          => 'application/pdf',
                        ),
                    ));

                    if ($up && ! isset($up['error'])) {
                        $form_fields[$store_key] = esc_url_raw(
                            str_replace('http://', 'https://', $up['url'])
                        );
                    } else {
                        wp_send_json_error('Error al subir "' . esc_html($inkey) . '": ' . $up['error']);
                        wp_die();
                    }
                }
            } elseif (isset($_POST[$inkey])) {
                $v = $_POST[$inkey];

                $form_fields[$store_key] = $sanitize_form_data($v);
            }
        }

        /* ────── 4. Procesar map_data ────── */
        if (empty($_POST['map_data'])) {
            wp_send_json_error('No se proporcionó map_data.');
            wp_die();
        }

        $map_raw = stripslashes($_POST['map_data']);
        $map_arr = json_decode($map_raw, true);

        if ($map_arr === null && json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Datos JSON inválidos para map_data.');
            wp_die();
        }

        // Lista de campos a excluir
        $excluded_fields = array(
            'nm_map_data',
            'nm_nm_form_type',
            'nm_nm_form_nonce',
            'nm__wp_http_referer'
        );

        // Limpiar propiedades existentes
        $existing_props = isset($map_arr['properties']) ? $map_arr['properties'] : array();
        foreach ($excluded_fields as $field) {
            if (isset($existing_props[$field])) {
                unset($existing_props[$field]);
            }
        }

        // Limpiar form_fields antes de fusionar
        foreach ($excluded_fields as $field) {
            if (isset($form_fields[$field])) {
                unset($form_fields[$field]);
            }
        }

        // Fusionar propiedades limpias
        $map_arr['properties'] = array_merge($existing_props, $form_fields);

        $feature = array(
            'type'       => $map_arr['type'],
            'geometry'   => $map_arr['geometry'],
            'properties' => $map_arr['properties'],
        );

        /* ────── 5. Guardar la entrada ────── */
        $entry_data = array(
            'map_data' => wp_slash(wp_json_encode(array($feature), JSON_UNESCAPED_UNICODE)),
            'form_type' => $form_type,
        );

        $this->model->save_entry($entry_data, get_current_user_id());

        wp_mail(
            get_option('admin_email'),
            'Nueva presentación de formulario',
            'Se ha enviado un nuevo formulario y está pendiente de aprobación.'
        );

        wp_send_json_success('Formulario enviado exitosamente.');
    }



    public function get_filter_settings()
    {
        $filter_settings = get_option('nm_filter_settings', array());
        $formatted_filters = array();

        if (!empty($filter_settings)) {
            $form_data = $this->model->get_form(0);

            foreach ($filter_settings as $field_key => $settings) {
                if ($settings['active']) {
                    $field_found = false;
                    
                    // Verificar si es un campo condicional
                    if (isset($settings['is_conditional']) && $settings['is_conditional']) {
                        // Es un campo condicional, buscar en los campos anidados
                        foreach ($form_data['fields'] as $field) {
                            if ($field['type'] === 'conditional-select' && $field['name'] === $settings['parent_field']) {
                                // Buscar en las opciones del conditional-select
                                foreach ($field['options'] as $option) {
                                    if (($option['id'] ?? $option['value']) === $settings['parent_option']) {
                                        // Buscar el campo específico en los campos condicionales
                                        if (isset($option['conditional_fields'])) {
                                            foreach ($option['conditional_fields'] as $conditional_field) {
                                                if ($conditional_field['name'] === $settings['field_name'] && isset($conditional_field['options'])) {
                                                    // Procesar las opciones para asegurar que sean strings
                                                    $processed_options = array();
                                                    if (is_array($conditional_field['options'])) {
                                                        foreach ($conditional_field['options'] as $opt) {
                                                            if (is_array($opt) && isset($opt['value'])) {
                                                                $processed_options[] = $opt['value'];
                                                            } else {
                                                                $processed_options[] = (string)$opt;
                                                            }
                                                        }
                                                    }
                                                    
                                                    $formatted_filters[] = array(
                                                        'field' => $field_key,
                                                        'button_text' => $settings['button_text'],
                                                        'options' => $processed_options,
                                                        'style' => $settings['style'],
                                                        'is_conditional' => true,
                                                        'parent_field' => $settings['parent_field'],
                                                        'parent_option' => $settings['parent_option'],
                                                        'field_name' => $settings['field_name']
                                                    );
                                                    $field_found = true;
                                                    break 3; // Salir de todos los loops anidados
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // Es un campo normal, buscar directamente
                        foreach ($form_data['fields'] as $field) {
                            if ($field['name'] === $field_key && isset($field['options'])) {
                                // Procesar las opciones para asegurar que sean strings
                                $processed_options = array();
                                if (is_array($field['options'])) {
                                    foreach ($field['options'] as $opt) {
                                        if (is_array($opt) && isset($opt['value'])) {
                                            $processed_options[] = $opt['value'];
                                        } else {
                                            $processed_options[] = (string)$opt;
                                        }
                                    }
                                }
                                
                                $formatted_filters[] = array(
                                    'field' => $field_key,
                                    'button_text' => $settings['button_text'],
                                    'options' => $processed_options,
                                    'style' => $settings['style'],
                                    'is_conditional' => false
                                );
                                $field_found = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return $formatted_filters;
    }



    public function download_geojson()
    {
        check_ajax_referer('nm_public_nonce', 'nonce');

        $entries = $this->model->get_entries('approved');
        $features = array();

        foreach ($entries as $entry) {
            $entry_data = maybe_unserialize($entry->entry_data);
            if (isset($entry_data['map_data'])) {
                $map_data = json_decode(stripslashes($entry_data['map_data']), true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($map_data)) {
                    foreach ($map_data as $feature) {
                        // Agregar información adicional si es necesario
                        $feature['properties']['title'] = isset($entry_data['title']) ? esc_html($entry_data['title']) : 'Sin título';
                        $features[] = $feature;
                    }
                } else {
                    error_log('Error decoding map_data for entry ID ' . $entry->id . ': ' . json_last_error_msg());
                }
            }
        }

        $geojson = array(
            'type'     => 'FeatureCollection',
            'features' => $features
        );

        wp_send_json_success($geojson);
    }


    public function get_conditional_fields()
    {

        check_ajax_referer('nm_public_nonce', 'nonce');

        global $wpdb;
        $table     = $wpdb->prefix . 'nm_conditional_fields';
        $select_id = sanitize_text_field($_POST['select_id'] ?? '');
        $option_id = sanitize_text_field($_POST['option_id'] ?? '');

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT fields_json FROM $table WHERE select_id=%s AND option_id=%s",
                $select_id,
                $option_id
            ),
            ARRAY_A
        );

        if (! $row) {
            wp_send_json_success('');
        }

        $fields = json_decode($row['fields_json'], true);
        if (! $fields) {
            wp_send_json_success('');
        }

        ob_start();
        foreach ($fields as $subfield) {
            nm_render_conditional_field($subfield);   // misma función del paso 1
        }
        wp_send_json_success(ob_get_clean());
    }

    /**
     * Guarda una grabación de audio desde datos base64
     * 
     * @param string $base64_data Los datos de audio en base64
     * @param string $field_name El nombre del campo para generar el nombre de archivo
     * @return array Array con 'success', 'url' o 'error'
     */
    private function save_audio_recording($base64_data, $field_name)
    {
        try {
            // Verificar que tenemos datos válidos
            if (empty($base64_data) || !preg_match('/^data:audio\/([a-zA-Z0-9]+);base64,(.+)$/', $base64_data, $matches)) {
                return array('success' => false, 'error' => 'Datos de audio inválidos');
            }

            $audio_type = $matches[1]; // wav, mp3, etc.
            $encoded_data = $matches[2];

            // Decodificar base64
            $audio_data = base64_decode($encoded_data);
            if ($audio_data === false) {
                return array('success' => false, 'error' => 'Error al decodificar datos de audio');
            }

            // Generar nombre de archivo único
            $upload_dir = wp_upload_dir();
            $filename = 'audio_' . $field_name . '_' . time() . '.' . $audio_type;
            $file_path = $upload_dir['path'] . '/' . $filename;
            $file_url = $upload_dir['url'] . '/' . $filename;

            // Escribir archivo
            $bytes_written = file_put_contents($file_path, $audio_data);
            if ($bytes_written === false) {
                return array('success' => false, 'error' => 'No se pudo escribir el archivo de audio');
            }

            // Verificar que el archivo se creó correctamente
            if (!file_exists($file_path) || filesize($file_path) === 0) {
                return array('success' => false, 'error' => 'El archivo de audio no se guardó correctamente');
            }

            // Convertir a HTTPS si es necesario
            $secure_url = str_replace('http://', 'https://', $file_url);

            return array('success' => true, 'url' => esc_url_raw($secure_url));
        } catch (Exception $e) {
            error_log('Error saving audio recording: ' . $e->getMessage());
            return array('success' => false, 'error' => 'Error interno al guardar grabación');
        }
    }
    /**
     * Helper function to get field value from entry data
     */    private function get_entry_field_value($entry_data, $field_name, $default = '')
    {
        // Primero buscar directamente en entry_data
        if (isset($entry_data[$field_name])) {
            return $entry_data[$field_name];
        }

        // Si no está directamente, buscar en map_data (formato GeoJSON)
        if (isset($entry_data['map_data'])) {
            $raw_json = wp_unslash($entry_data['map_data']);

            try {
                $map_data = json_decode($raw_json, true, 512, JSON_THROW_ON_ERROR);

                if (is_array($map_data)) {
                    foreach ($map_data as $feature) {
                        if (isset($feature['properties']) && isset($feature['properties'][$field_name])) {
                            return $feature['properties'][$field_name];
                        }
                    }
                }
            } catch (\JsonException $e) {
                error_log('Error decoding map_data in get_entry_field_value: ' . $e->getMessage());
            }
        }

        // Look for field by name in nested structure (compatibilidad)
        if (isset($entry_data['fields'])) {
            foreach ($entry_data['fields'] as $field) {
                if (isset($field['name']) && $field['name'] === $field_name && isset($field['value'])) {
                    return $field['value'];
                }
            }
        }

        return $default;
    }

    /**
     * Helper function to get image URL from entry data
     */
    private function get_entry_image_url($entry_data)
    {
        // Look for image field
        $image_fields = ['image', 'foto', 'imagen', 'picture'];

        foreach ($image_fields as $field_name) {
            $image_value = $this->get_entry_field_value($entry_data, $field_name);
            if (!empty($image_value)) {
                // If it's already a URL, return it
                if (filter_var($image_value, FILTER_VALIDATE_URL)) {
                    return $image_value;
                }
                // If it's an attachment ID, get the URL
                if (is_numeric($image_value)) {
                    $url = wp_get_attachment_url(intval($image_value));
                    if ($url) {
                        return $url;
                    }
                }
            }
        }

        // Return null if no image found (will be handled in the template)
        return null;
    }
    /**
     * Render gallery card content based on selected fields     */    private function render_gallery_card_content($entry_data, $entry, $selected_fields)
    {
        // Verificar si hay algún campo seleccionado
        $has_any_field = false;
        foreach ($selected_fields as $field_value) {
            if (!empty($field_value)) {
                $has_any_field = true;
                break;
            }
        }

        // Si no hay campos configurados, mostrar mensaje
        if (!$has_any_field) {
            echo '<div class="nm-entry-content">';
            echo '<div class="nm-no-config-message">';
            echo '<p><strong>⚙️ Configuración necesaria</strong></p>';
            echo '<p>Para ver el contenido de las entradas, configura los campos en <strong>NexusMap > Galería</strong></p>';
            echo '</div>';
            echo '</div>';
            return;
        }

        // Renderizar imagen si está seleccionada
        if (!empty($selected_fields['image'])) {
            $this->render_gallery_image_field($entry_data, $selected_fields['image']);
        }

        // Contenido de la tarjeta
        echo '<div class="nm-entry-content">';

        // Renderizar título si está seleccionado
        if (!empty($selected_fields['text'])) {
            $this->render_gallery_text_field($entry_data, $selected_fields['text']);
        }

        // Renderizar texto largo si está seleccionado
        if (!empty($selected_fields['textarea'])) {
            $this->render_gallery_textarea_field($entry_data, $selected_fields['textarea']);
        }

        // Renderizar audio si está seleccionado
        if (!empty($selected_fields['audio'])) {
            $this->render_gallery_audio_field($entry_data, $selected_fields['audio']);
        }

        // Renderizar archivo si está seleccionado
        if (!empty($selected_fields['file'])) {
            $this->render_gallery_file_field($entry_data, $selected_fields['file']);
        }
        // Renderizar fecha si está seleccionada
        if (!empty($selected_fields['date'])) {
            $this->render_gallery_date_field($entry_data, $selected_fields['date']);
        }

        echo '</div>';
    }

    /**
     * Render image field for gallery card
     */
    private function render_gallery_image_field($entry_data, $field_name)
    {
        $image_value = $this->get_entry_field_value($entry_data, $field_name);
        $image_url = null;

        if (!empty($image_value)) {
            // If it's already a URL, use it
            if (filter_var($image_value, FILTER_VALIDATE_URL)) {
                $image_url = $image_value;
            }
            // If it's an attachment ID, get the URL
            elseif (is_numeric($image_value)) {
                $url = wp_get_attachment_url(intval($image_value));
                if ($url) {
                    $image_url = $url;
                }
            }
        }

        echo '<div class="nm-entry-image ' . ($image_url ? '' : 'no-image') . '">';
        if ($image_url) {
            echo '<img src="' . esc_url($image_url) . '" alt="Imagen">';
        } else {
            echo '<div class="nm-placeholder-icon">📷</div>';
        }
        echo '</div>';
    }

    /**
     * Render text field for gallery card
     */
    private function render_gallery_text_field($entry_data, $field_name)
    {
        $text_value = $this->get_entry_field_value($entry_data, $field_name, 'Sin título');
        echo '<h3 class="nm-entry-title">' . esc_html($text_value) . '</h3>';
    }

    /**
     * Render textarea field for gallery card
     */
    private function render_gallery_textarea_field($entry_data, $field_name)
    {
        $textarea_value = $this->get_entry_field_value($entry_data, $field_name);
        if (!empty($textarea_value)) {
            $truncated_text = strlen($textarea_value) > 120 ? substr($textarea_value, 0, 120) . '...' : $textarea_value;
            echo '<div class="nm-entry-description">' . esc_html($truncated_text) . '</div>';
        }
    }

    /**
     * Render audio field for gallery card
     */
    private function render_gallery_audio_field($entry_data, $field_name)
    {
        $audio_value = $this->get_entry_field_value($entry_data, $field_name);
        if (!empty($audio_value) && filter_var($audio_value, FILTER_VALIDATE_URL)) {
            echo '<div class="nm-entry-audio">';
            echo '<audio controls preload="none" style="width: 100%; max-width: 300px;">';
            echo '<source src="' . esc_url($audio_value) . '" type="audio/mpeg">';
            echo 'Tu navegador no soporta el elemento de audio.';
            echo '</audio>';
            echo '</div>';
        }
    }

    /**
     * Render file field for gallery card
     */
    private function render_gallery_file_field($entry_data, $field_name)
    {
        $file_value = $this->get_entry_field_value($entry_data, $field_name);
        if (!empty($file_value) && filter_var($file_value, FILTER_VALIDATE_URL)) {
            $filename = basename(parse_url($file_value, PHP_URL_PATH));
            echo '<div class="nm-entry-file">';
            echo '<a href="' . esc_url($file_value) . '" target="_blank" class="nm-download-btn">';
            echo '📥 Descargar ' . esc_html($filename);
            echo '</a>';
            echo '</div>';
        }
    }

    /**
     * Render date field for gallery card
     */
    private function render_gallery_date_field($entry_data, $field_name)
    {
        $date_value = $this->get_entry_field_value($entry_data, $field_name);
        if (!empty($date_value)) {
            // Try to format the date
            $formatted_date = $date_value;
            if (strtotime($date_value)) {
                $formatted_date = date('d/m/Y', strtotime($date_value));
            }
            echo '<div class="nm-entry-date">📅 Fecha: ' . esc_html($formatted_date) . '</div>';
        }
    }

    /**
     * Get available fields from entry data
     */
    private function get_available_fields_from_entry($entry_data)
    {
        $fields = array();

        if (!is_array($entry_data)) {
            return $fields;
        }

        foreach ($entry_data as $key => $value) {
            $fields[$key] = array(
                'label' => ucfirst(str_replace('_', ' ', $key)),
                'type' => $this->detect_field_type($key, $value),
                'sample' => $value
            );
        }

        return $fields;
    }

    /**
     * Detect field type based on key and value
     */
    private function detect_field_type($key, $value)
    {
        $key_lower = strtolower($key);

        // Detectar por nombre del campo
        if (in_array($key_lower, ['image', 'imagen', 'foto', 'picture', 'nm_imagen'])) {
            return 'image';
        }

        if (in_array($key_lower, ['audio', 'sonido', 'recording', 'nm_audio', 'nm_audio2'])) {
            return 'audio';
        }

        if (in_array($key_lower, ['file', 'archivo', 'document', 'documento', 'nm_documento', 'nm_file'])) {
            return 'file';
        }

        // Detectar por contenido/URL
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            if (preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $value)) {
                return 'image';
            }
            if (preg_match('/\.(mp3|wav|ogg|flac|m4a|aac)$/i', $value)) {
                return 'audio';
            }
            if (preg_match('/\.(pdf|doc|docx|xls|xlsx|txt|rtf)$/i', $value)) {
                return 'file';
            }
        }

        // Detectar por longitud y patrón
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
}
