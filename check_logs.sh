#!/bin/bash

echo "🔍 Verificando logs de debug de NexusMap Gallery"
echo "================================================="

# Verificar si existe el archivo de debug.log de WordPress
if [ -f "/c/xampp/htdocs/nexusmap/wp-content/debug.log" ]; then
    echo "✅ Archivo debug.log encontrado"
    
    # Mostrar las últimas 50 líneas relacionadas con NexusMap
    echo ""
    echo "📋 Últimas entradas de debug relacionadas con NexusMap:"
    echo "-------------------------------------------------------"
    tail -n 100 /c/xampp/htdocs/nexusmap/wp-content/debug.log | grep -i "entry\|gallery\|field\|map_data" | tail -n 20
    
    echo ""
    echo "📋 Búsqueda específica de errores:"
    echo "----------------------------------"
    tail -n 200 /c/xampp/htdocs/nexusmap/wp-content/debug.log | grep -i "error\|warning\|fatal" | tail -n 10
    
else
    echo "❌ No se encontró el archivo debug.log"
    echo "   Ubicación esperada: /c/xampp/htdocs/nexusmap/wp-content/debug.log"
    echo ""
    echo "💡 Para habilitar logs de debug en WordPress:"
    echo "   1. Editar wp-config.php"
    echo "   2. Agregar: define('WP_DEBUG', true);"
    echo "   3. Agregar: define('WP_DEBUG_LOG', true);"
    echo "   4. Agregar: define('WP_DEBUG_DISPLAY', false);"
fi

echo ""
echo "🚀 Siguiente paso: Visitar la página con el shortcode [nm_entries_list] para generar logs frescos"
echo "📁 Luego ejecutar de nuevo este script para ver los nuevos logs"
