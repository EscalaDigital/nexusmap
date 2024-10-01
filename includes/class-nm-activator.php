<?php

class NM_Activator {

    public static function activate() {
        // Create necessary database tables
        $model = new NM_Model();
        $model->create_forms_table();
        $model->create_entries_table();

        flush_rewrite_rules();
    }
}
