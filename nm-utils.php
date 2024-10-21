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
    }
