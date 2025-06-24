# Script de verificación de logs para NexusMap Gallery (PowerShell)
# Ejecutar con: .\check_logs.ps1

Write-Host "🔍 Verificando logs de debug de NexusMap Gallery" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$debugLogPath = "C:\xampp\htdocs\nexusmap\wp-content\debug.log"

if (Test-Path $debugLogPath) {
    Write-Host "✅ Archivo debug.log encontrado" -ForegroundColor Green
    
    # Leer las últimas líneas del archivo
    $logContent = Get-Content $debugLogPath -Tail 200
    
    # Filtrar líneas relacionadas con NexusMap
    Write-Host ""
    Write-Host "📋 Últimas entradas relacionadas con NexusMap:" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------" -ForegroundColor Yellow
    
    $nmLogs = $logContent | Where-Object { 
        $_ -match "entry|gallery|field|map_data|GET FIELD VALUE|GALLERY CONFIGURATION|DEBUG ENTRY|RENDER GALLERY" 
    } | Select-Object -Last 20
    
    if ($nmLogs) {
        $nmLogs | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "ℹ️ No se encontraron logs recientes de NexusMap" -ForegroundColor Blue
    }
    
    # Buscar errores específicos
    Write-Host ""
    Write-Host "📋 Errores recientes:" -ForegroundColor Yellow
    Write-Host "---------------------" -ForegroundColor Yellow
    
    $errorLogs = $logContent | Where-Object { 
        $_ -match "error|warning|fatal|Error|Warning|Fatal" 
    } | Select-Object -Last 10
    
    if ($errorLogs) {
        $errorLogs | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    } else {
        Write-Host "✅ No se encontraron errores recientes" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ No se encontró el archivo debug.log" -ForegroundColor Red
    Write-Host "   Ubicación esperada: $debugLogPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Para habilitar logs de debug en WordPress:" -ForegroundColor Yellow
    Write-Host "   1. Editar wp-config.php" -ForegroundColor Yellow
    Write-Host "   2. Agregar: define('WP_DEBUG', true);" -ForegroundColor Yellow
    Write-Host "   3. Agregar: define('WP_DEBUG_LOG', true);" -ForegroundColor Yellow
    Write-Host "   4. Agregar: define('WP_DEBUG_DISPLAY', false);" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Siguiente paso: Visitar la página con el shortcode [nm_entries_list] para generar logs frescos" -ForegroundColor Cyan
Write-Host "📁 Luego ejecutar de nuevo este script para ver los nuevos logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 También puedes ejecutar debug_gallery.php accediendo a:" -ForegroundColor Cyan
Write-Host "   http://localhost/nexusmap/wp-content/plugins/nexusmap/debug_gallery.php" -ForegroundColor Cyan
