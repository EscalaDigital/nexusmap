<?php

class NM_Model {

    private $forms_table;
    private $entries_table;

    public function __construct() {
        global $wpdb;
        $this->forms_table = $wpdb->prefix . 'nm_forms';
        $this->entries_table = $wpdb->prefix . 'nm_entries';
    }

    public function create_forms_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $this->forms_table (
                    id mediumint(9) NOT NULL AUTO_INCREMENT,
                    form_data longtext NOT NULL,
                    form_type int(11) NOT NULL DEFAULT 0,
                    PRIMARY KEY  (id)
                ) $charset_collate;";


        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    public function create_entries_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $this->entries_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            entry_data longtext NOT NULL,
            form_type tinyint(1) NOT NULL DEFAULT '0',
            status varchar(20) NOT NULL DEFAULT 'pending',
            date_submitted datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    public static function create_conditional_fields_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'nm_conditional_fields';
    
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            select_id varchar(100) NOT NULL,
            option_id varchar(100) NOT NULL,
            fields_json longtext NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
    
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);    }

    // Methods to handle form data
 
    public function save_form($form_data, $form_type) {
        global $wpdb;
    
        $result = $wpdb->insert(
            $this->forms_table,
            array(
                'form_data' => maybe_serialize($form_data),
                'form_type' => $form_type,
            ),
            array(
                '%s',
                '%d',
            )
        );
        
        if ($result === false) {
            error_log('Database error saving form: ' . $wpdb->last_error);
            return false;
        }
        
        return $wpdb->insert_id;
    }

   public function get_form($form_type = 0) {
    global $wpdb;
    $result = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $this->forms_table WHERE form_type = %d ORDER BY id DESC LIMIT 1",
            $form_type
        )
    );

    if ($result === null) {
        error_log("Warning: No form data found for form_type $form_type.");
        return null;
    }    $form_data = maybe_unserialize($result->form_data);    // Si hay campos en el formulario, buscar campos condicionales
    if (isset($form_data['fields']) && is_array($form_data['fields'])) {
        foreach ($form_data['fields'] as &$field) {
            // Solo procesar conditional-select, ignorar el resto
            if (isset($field['type']) && $field['type'] === 'conditional-select' && isset($field['select_id'])) {
                // Para cada opción del select condicional, buscar sus campos asociados
                foreach ($field['options'] as &$option) {
                    $conditional_fields = $wpdb->get_var($wpdb->prepare(
                        "SELECT fields_json FROM {$wpdb->prefix}nm_conditional_fields 
                         WHERE select_id = %s AND option_id = %s",
                        $field['select_id'],
                        $option['id']
                    ));
                    
                    if ($conditional_fields) {
                        $conditional_fields_array = json_decode($conditional_fields, true);
                        // Procesar los campos condicionales
                        foreach ($conditional_fields_array as &$cfield) {
                            if (isset($cfield['options']) && is_string($cfield['options'])) {
                                // Si options es una cadena JSON, decodificarla
                                $cfield['options'] = json_decode($cfield['options'], true);
                            }
                            // Si las opciones son un array pero están en formato incorrecto
                            if (isset($cfield['options']) && is_array($cfield['options']) && !empty($cfield['options'])) {
                                // Asegurarse de que las opciones estén en el formato correcto
                                if (!is_array($cfield['options'][0])) {
                                    $formatted_options = [];
                                    foreach ($cfield['options'] as $opt) {
                                        $formatted_options[] = [
                                            'value' => $opt,
                                            'label' => $opt
                                        ];
                                    }
                                    $cfield['options'] = $formatted_options;
                                }
                            }
                        }
                        unset($cfield);                        $option['conditional_fields'] = $conditional_fields_array;
                    }                }
                unset($option);
            }
        }
        unset($field);
    }

    return $form_data;
}
    // Methods to handle entries
    public function save_entry( $entry_data, $user_id ) {
        global $wpdb;
        $wpdb->insert(
            $this->entries_table,
            array(
                'user_id'     => $user_id,
                'entry_data'  => maybe_serialize( $entry_data ),
                'form_type' => $entry_data['form_type'],
                'status'      => 'pending',
            ),
            
            array( '%d', '%s', '%d', '%s' )
        );
    }
    

    public function get_entries( $status = 'pending' ) {
        global $wpdb;
        $results = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $this->entries_table WHERE status = %s", $status ) );
       // console_log('Entry status updated: Entry ID ' . $entry_id . ' to status ' . $status);
        return $results;
    }

    public function get_entry_by_id( $entry_id ) {
        global $wpdb;
        $table = $this->entries_table;
        $result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $entry_id ) );
        return $result;
    }
    

    public function update_entry_status( $entry_id, $status ) {
        global $wpdb;
        $wpdb->update(
            $this->entries_table,
            array( 'status' => $status ),
            array( 'id' => $entry_id ),
            array( '%s' ),
            array( '%d' )
        );
    }

    /**
     * Actualizar los datos de una entrada
     */
    public function update_entry_data( $entry_id, $entry_data ) {
        global $wpdb;
        return $wpdb->update(
            $this->entries_table,
            array( 'entry_data' => maybe_serialize( $entry_data ) ),
            array( 'id' => $entry_id ),
            array( '%s' ),
            array( '%d' )
        );
    }

    /**
     * Eliminar una entrada
     */
    public function delete_entry( $entry_id ) {
        global $wpdb;
        return $wpdb->delete(
            $this->entries_table,
            array( 'id' => $entry_id ),
            array( '%d' )
        );
    }

    /**
     * Obtener entradas con paginación
     */
    public function get_entries_paginated( $limit = 10, $offset = 0, $status = 'approved' ) {
        global $wpdb;
        $results = $wpdb->get_results( 
            $wpdb->prepare( 
                "SELECT * FROM $this->entries_table WHERE status = %s ORDER BY date_submitted DESC LIMIT %d OFFSET %d", 
                $status, $limit, $offset 
            ) 
        );
        return $results;
    }

    /**
     * Contar el total de entradas por estado
     */
    public function count_entries( $status = 'approved' ) {
        global $wpdb;
        $count = $wpdb->get_var( 
            $wpdb->prepare( 
                "SELECT COUNT(*) FROM $this->entries_table WHERE status = %s", 
                $status 
            ) 
        );
        return intval($count);
    }
}
