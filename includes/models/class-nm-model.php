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
            status varchar(20) NOT NULL DEFAULT 'pending',
            date_submitted datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    // Methods to handle form data
    public function save_form( $form_data ) {
        global $wpdb;
        $wpdb->insert(
            $this->forms_table,
            array( 'form_data' => maybe_serialize( $form_data ) ),
            array( '%s' )
        );
    }

    public function get_form() {
        global $wpdb;
        $result = $wpdb->get_row("SELECT * FROM $this->forms_table ORDER BY id DESC LIMIT 1");
    
        if ($result !== null) {
            return maybe_unserialize($result->form_data);
        } else {
            // Manejar el caso nulo, por ejemplo, devolver un valor por defecto o lanzar una excepción
            error_log("Warning: No form data found.");
            return null; // o un valor por defecto si aplica
        }
    }
    // Methods to handle entries
    public function save_entry( $entry_data, $user_id ) {
        global $wpdb;
        $wpdb->insert(
            $this->entries_table,
            array(
                'user_id'     => $user_id,
                'entry_data'  => maybe_serialize( $entry_data ),
                'status'      => 'pending',
            ),
            
            array( '%d', '%s', '%s' )
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
}
