<?php
// Evitar el acceso directo al archivo
if (!defined('ABSPATH')) {
    exit;
}

    function nm_sanitize_tile_url($url) {
        // Quitar espacios en blanco al inicio y al final
        $url = trim($url);
        // Validar que sea una URL válida o una ruta relativa
        if (preg_match('/^https?:\/\/[^\s\{\}]+(?:\{[^\s\{\}]*\}[^\s\{\}]*)*$/', $url) || preg_match('/^\//', $url)) {
            return $url;
        } else {
            return $url; // Devolver la URL tal como se pasa
        }
    }    /**
     * Validar si un archivo es un GeoJSON válido
     */
    function nm_validate_geojson($file_content) {
        // Decodificar JSON
        $geojson = json_decode($file_content, true);
        
        // Verificar si es JSON válido
        if (json_last_error() !== JSON_ERROR_NONE) {
            return false;
        }
        
        // Verificar que sea un array o objeto
        if (!is_array($geojson)) {
            return false;
        }
        
        // Verificar estructura básica de GeoJSON
        if (!isset($geojson['type'])) {
            return false;
        }
        
        // Tipos válidos de GeoJSON
        $valid_types = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
        
        if (!in_array($geojson['type'], $valid_types)) {
            return false;
        }
        
        // Validaciones adicionales según el tipo
        if ($geojson['type'] === 'FeatureCollection') {
            if (!isset($geojson['features']) || !is_array($geojson['features'])) {
                return false;
            }
            
            // Validar cada feature en la colección
            foreach ($geojson['features'] as $feature) {
                if (!isset($feature['type']) || $feature['type'] !== 'Feature') {
                    return false;
                }
                if (!isset($feature['geometry']) || !isset($feature['properties'])) {
                    return false;
                }
                if (!nm_validate_geometry($feature['geometry'])) {
                    return false;
                }
            }
        } elseif ($geojson['type'] === 'Feature') {
            if (!isset($geojson['geometry']) || !isset($geojson['properties'])) {
                return false;
            }
            if (!nm_validate_geometry($geojson['geometry'])) {
                return false;
            }
        } elseif (in_array($geojson['type'], ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'])) {
            // Es una geometría directa
            if (!nm_validate_geometry($geojson)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Validar geometría GeoJSON
     */
    function nm_validate_geometry($geometry) {
        if (!isset($geometry['type']) || !isset($geometry['coordinates'])) {
            return false;
        }
        
        $valid_geometry_types = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
        
        if (!in_array($geometry['type'], $valid_geometry_types)) {
            return false;
        }
        
        // Validar que coordinates sea un array
        if (!is_array($geometry['coordinates'])) {
            return false;
        }
        
        // Validaciones específicas por tipo de geometría
        switch ($geometry['type']) {
            case 'Point':
                return nm_validate_position($geometry['coordinates']);
            case 'LineString':
                return nm_validate_linestring($geometry['coordinates']);
            case 'Polygon':
                return nm_validate_polygon($geometry['coordinates']);
            case 'MultiPoint':
                foreach ($geometry['coordinates'] as $point) {
                    if (!nm_validate_position($point)) return false;
                }
                return true;
            case 'MultiLineString':
                foreach ($geometry['coordinates'] as $linestring) {
                    if (!nm_validate_linestring($linestring)) return false;
                }
                return true;
            case 'MultiPolygon':
                foreach ($geometry['coordinates'] as $polygon) {
                    if (!nm_validate_polygon($polygon)) return false;
                }
                return true;
        }
        
        return true;
    }

    /**
     * Validar posición (punto)
     */
    function nm_validate_position($position) {
        if (!is_array($position) || count($position) < 2) {
            return false;
        }
        
        // Verificar que longitude y latitude sean números
        if (!is_numeric($position[0]) || !is_numeric($position[1])) {
            return false;
        }
        
        // Verificar rangos válidos
        $longitude = floatval($position[0]);
        $latitude = floatval($position[1]);
        
        if ($longitude < -180 || $longitude > 180) {
            return false;
        }
        
        if ($latitude < -90 || $latitude > 90) {
            return false;
        }
        
        return true;
    }

    /**
     * Validar LineString
     */
    function nm_validate_linestring($coordinates) {
        if (!is_array($coordinates) || count($coordinates) < 2) {
            return false;
        }
        
        foreach ($coordinates as $position) {
            if (!nm_validate_position($position)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Validar Polygon
     */
    function nm_validate_polygon($coordinates) {
        if (!is_array($coordinates) || count($coordinates) < 1) {
            return false;
        }
        
        foreach ($coordinates as $ring) {
            if (!is_array($ring) || count($ring) < 4) {
                return false;
            }
            
            // Verificar que el primer y último punto sean iguales
            if ($ring[0] !== $ring[count($ring) - 1]) {
                return false;
            }
            
            foreach ($ring as $position) {
                if (!nm_validate_position($position)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Crear directorio para almacenar archivos GeoJSON si no existe
     */
    function nm_create_geojson_directory() {
        $upload_dir = wp_upload_dir();
        $geojson_dir = $upload_dir['basedir'] . '/nexusmap/geojson/';
        
        if (!file_exists($geojson_dir)) {
            wp_mkdir_p($geojson_dir);
            
            // Crear archivo .htaccess para proteger el directorio
            $htaccess_content = "Options -Indexes\n";
            $htaccess_content .= "<Files ~ \"\\.(geojson|json)$\">\n";
            $htaccess_content .= "    Order allow,deny\n";
            $htaccess_content .= "    Allow from all\n";
            $htaccess_content .= "</Files>\n";
            
            file_put_contents($geojson_dir . '.htaccess', $htaccess_content);
        }
        
        return $geojson_dir;
    }

    /**
     * Manejar la carga de archivos GeoJSON
     */    function nm_handle_geojson_upload($file) {
        // Validar el archivo
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return new WP_Error('upload_error', __('Error uploading file.', 'nexusmap'));
        }
        
        // Verificar el tamaño del archivo usando los límites del sistema
        $max_upload_size = wp_max_upload_size();
        if ($file['size'] > $max_upload_size) {
            return new WP_Error('file_too_large', sprintf(
                __('File size (%s) exceeds the maximum allowed size (%s).', 'nexusmap'),
                size_format($file['size']),
                size_format($max_upload_size)
            ));
        }
        
        // Verificar el tipo de archivo
        $allowed_extensions = ['geojson', 'json'];
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($file_extension, $allowed_extensions)) {
            return new WP_Error('invalid_file_type', __('Only .geojson and .json files are allowed.', 'nexusmap'));
        }
        
        // Leer el contenido del archivo
        $file_content = file_get_contents($file['tmp_name']);
        
        if ($file_content === false) {
            return new WP_Error('read_error', __('Error reading file content.', 'nexusmap'));
        }
        
        // Validar que sea un GeoJSON válido
        if (!nm_validate_geojson($file_content)) {
            return new WP_Error('invalid_geojson', __('The file is not a valid GeoJSON.', 'nexusmap'));
        }
        
        // Crear directorio si no existe
        $geojson_dir = nm_create_geojson_directory();
        
        // Generar nombre único para el archivo
        $filename = sanitize_file_name(pathinfo($file['name'], PATHINFO_FILENAME));
        $filename = $filename . '_' . time() . '.geojson';
        $file_path = $geojson_dir . $filename;
        
        // Guardar el archivo
        if (file_put_contents($file_path, $file_content) === false) {
            return new WP_Error('save_error', __('Error saving file.', 'nexusmap'));
        }
        
        // Retornar la URL del archivo
        $upload_dir = wp_upload_dir();
        $file_url = $upload_dir['baseurl'] . '/nexusmap/geojson/' . $filename;
        
        return $file_url;
    }
