<?php
// Evitar el acceso directo al archivo
if (!defined('ABSPATH')) {
    exit;
}

function nm_sanitize_tile_url($url)
{
    // Quitar espacios en blanco al inicio y al final
    $url = trim($url);
    // Validar que sea una URL válida o una ruta relativa
    if (preg_match('/^https?:\/\/[^\s\{\}]+(?:\{[^\s\{\}]*\}[^\s\{\}]*)*$/', $url) || preg_match('/^\//', $url)) {
        return $url;
    } else {
        return $url; // Devolver la URL tal como se pasa
    }
}


function nm_normalize_field_name($raw_name)
{
    // Quitar espacios en blanco al inicio y al final
    $name = trim($raw_name);

    // Convertir a minúsculas
    $name = strtolower($name);

    // Quitar acentos y diacríticos
    $name = remove_accents($name);

    // Convertir caracteres especiales a guiones bajos
    $name = preg_replace('/[^a-z0-9]+/', '_', $name);

    // Eliminar guiones bajos múltiples y al inicio/final
    $name = trim(preg_replace('/_+/', '_', $name), '_');

    return $name;
}
