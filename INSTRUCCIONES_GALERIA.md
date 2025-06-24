# Instrucciones para mostrar entradas en la galería

## Problema
Aparece el mensaje: "⚙️ Configuración necesaria - Para ver el contenido de las entradas, configura los campos en NexusMap > Galería"

## Solución Paso a Paso

### 1. Acceder a la configuración de la galería
1. En tu WordPress, ve al **panel de administración**
2. En el menú lateral, busca **NexusMap**
3. Haz clic en **Galería**

### 2. Configurar los campos
En la página de "Configuración de Galería" verás varias secciones:

#### a) Texto/Título
- **Selecciona**: `nm_titulo` 
- Esto mostrará el título "Migración, educación y renta..."

#### b) Imagen  
- **Selecciona**: `nm_imagen`
- Esto mostrará la imagen como miniatura en la tarjeta

#### c) Archivo
- **Selecciona**: `nm_documento` 
- Esto mostrará un enlace de descarga para el PDF

#### d) Otros campos (opcionales)
- Puedes seleccionar también `nm_select` si quieres mostrar "hola"
- Los campos vacíos como `nm_numero`, `nm_audio`, `nm_audio2` puedes dejarlos sin seleccionar

### 3. Guardar la configuración
- Haz clic en el botón **Guardar** o **Actualizar Configuración**
- Deberías ver un mensaje de confirmación

### 4. Verificar el resultado
- Ve a la página donde tienes el shortcode `[nm_entries_list]`
- Recarga la página
- Ahora deberías ver tu entrada con:
  - **Título**: "Migración, educación y renta..."
  - **Imagen**: La imagen PNG como miniatura
  - **Documento**: Un enlace "📥 Descargar [nombre-archivo].pdf"

## Estructura de tu entrada actual
```
✅ nm_titulo: "Migración, educación y renta. Un análisis socio-territorial..."
✅ nm_imagen: "Asamblea-Profesores-Catlicos.png" 
✅ nm_documento: "20250117_ACTA-PROVISIONAL-1-PLAZA-PERIODSTA-VILLAMARTIN.pdf"
✅ nm_select: "hola"
❌ nm_numero: (vacío)
❌ nm_audio: (vacío)  
❌ nm_audio2: (vacío)
```

## Si aún no funciona

### Verificar el estado de la entrada
1. Ve a **NexusMap > Entradas**
2. Asegúrate de que tu entrada esté marcada como **"Aprobada"**

### Limpiar caché
Si usas plugins de caché (WP Rocket, W3 Total Cache, etc.):
1. Limpia/purga la caché
2. Recarga la página

### Verificar configuración guardada
Agrega este código temporal a tu tema para verificar la configuración:
```php
<?php
$config = get_option('nm_gallery_settings', array());
echo '<pre>';
print_r($config);
echo '</pre>';
?>
```

Deberías ver algo como:
```
Array
(
    [selected_fields] => Array
        (
            [text] => nm_titulo
            [image] => nm_imagen
            [file] => nm_documento
            [audio] => 
            [date] => 
            [textarea] => 
        )
)
```

## Resultado esperado
Después de configurar correctamente, tu entrada se mostrará como una tarjeta con:
- **Imagen**: Como fondo o miniatura destacada
- **Título**: "Migración, educación y renta..."
- **Documento**: Enlace de descarga del PDF

La galería funcionará correctamente y mostrará todas las entradas aprobadas que tengas en la base de datos.
