# Campo Selector Geográfico - Documentación Actualizada

## 🆕 Nuevas Funcionalidades

### Validación de Usuario GeoNames

El selector geográfico ahora incluye validación de usuario para mejorar la seguridad y garantizar que solo usuarios válidos de GeoNames puedan acceder a la API.

#### Flujo de Configuración:

1. **Entrada de Usuario**: El administrador debe introducir su nombre de usuario de GeoNames
2. **Validación**: Al hacer clic en "Validar Usuario", se verifica la autenticación con la API
3. **Carga de Países**: Si el usuario es válido, se cargan todos los países disponibles desde GeoNames
4. **Configuración de Niveles**: Una vez seleccionado el país, se configuran los niveles administrativos

#### Beneficios:

- ✅ **Seguridad mejorada**: Solo usuarios registrados pueden usar la funcionalidad
- ✅ **Lista completa de países**: Ya no limitado a países predefinidos
- ✅ **Manejo de errores**: Mensajes claros para problemas de autenticación
- ✅ **Experiencia de usuario mejorada**: Interfaz paso a paso

## Configuración Paso a Paso

### 1. Registro en GeoNames

1. Visita [GeoNames.org](https://www.geonames.org/login)
2. Crea una cuenta gratuita
3. Activa tu cuenta mediante el email de confirmación
4. Anota tu nombre de usuario

### 2. Configuración del Campo

1. En el Form Builder, arrastra el elemento "Selector Geográfico"
2. Haz clic en el botón de configuración (⚙️)
3. Introduce tu nombre de usuario de GeoNames
4. Haz clic en "Validar Usuario"
5. Una vez validado, selecciona el país deseado
6. Configura los niveles administrativos según tus necesidades

### 3. Estados de Validación

#### Usuario Válido ✅
```
✓ Usuario válido. Cargando países...
✓ 249 países cargados correctamente
```

#### Errores Comunes ❌
```
❌ Usuario no encontrado. Verifica que el usuario esté registrado en GeoNames.org
❌ Tiempo de espera agotado
❌ Demasiadas solicitudes. Intenta nuevamente en unos minutos
```

## API Integration

### Endpoints Utilizados

#### 1. Validación de Usuario
- **URL**: `http://api.geonames.org/countryInfoJSON?username={usuario}`
- **Propósito**: Verificar que el usuario existe y tiene acceso a la API
- **Respuesta esperada**: Lista de países si el usuario es válido

#### 2. Carga de Países
- **URL**: `http://api.geonames.org/countryInfoJSON?username={usuario}`
- **Propósito**: Obtener lista completa de países disponibles
- **Respuesta**: Array de objetos con `countryCode` y `countryName`

#### 3. Datos Geográficos (sin cambios)
- **URL**: `http://api.geonames.org/childrenJSON?geonameId={id}&username={usuario}`
- **Propósito**: Obtener subdivisiones administrativas

### Manejo de Errores

El sistema maneja los siguientes tipos de errores:

1. **Error 401**: Usuario no válido o no encontrado
2. **Error 429**: Límite de solicitudes excedido
3. **Timeout**: Problemas de conectividad
4. **Respuesta vacía**: Sin datos disponibles

## Configuración Técnica

### PHP Template Updates

```php
<div class="nm-config-row">
    <label>Usuario GeoNames:</label>
    <div class="nm-geonames-user-container">
        <input type="text" class="nm-geonames-user" placeholder="Tu usuario de GeoNames">
        <button type="button" class="button nm-validate-user-btn">Validar Usuario</button>
    </div>
    <div class="nm-user-validation-message" style="display: none;"></div>
</div>

<div class="nm-config-row nm-country-row" style="display: none;">
    <label>País:</label>
    <select class="nm-country-selector" disabled>
        <option value="">Seleccionar país...</option>
    </select>
    <div class="nm-country-loading" style="display: none;">
        <span>Cargando países...</span>
    </div>
</div>
```

### JavaScript Functions

#### Nuevas Funciones Añadidas:

1. `validateGeonamesUser(username, $configRow)` - Valida el usuario con la API
2. `loadCountriesFromGeonames(username, $configRow)` - Carga países desde GeoNames
3. `showUserValidationMessage($configRow, message, type)` - Muestra mensajes de estado
4. `hideUserValidationMessage($configRow)` - Oculta mensajes de estado

### AJAX Handler

```php
public function save_geonames_user()
{
    check_ajax_referer('nm_admin_nonce', 'nonce');
    
    $username = isset($_POST['username']) ? sanitize_text_field($_POST['username']) : '';
    
    if (empty($username)) {
        wp_send_json_error(__('Username is required', 'nexusmap'));
        return;
    }
    
    update_option('nm_geonames_user', $username);
    wp_send_json_success(__('GeoNames user saved successfully', 'nexusmap'));
}
```

## Compatibilidad

- ✅ Compatible con formulários A/B
- ✅ Compatible con formulários únicos
- ✅ Responsive design
- ✅ Integración con cache existente
- ✅ Manejo de errores robusto

## Notas de Rendimiento

- Los países se cargan una sola vez por sesión de configuración
- El sistema usa cache para evitar solicitudes repetidas
- Timeout configurado a 10-15 segundos para evitar bloqueos
- Manejo de límites de API de GeoNames

## Troubleshooting

### Problema: "Usuario no encontrado"
**Solución**: 
1. Verifica que tu cuenta esté activada en GeoNames
2. Confirma que introduces el nombre de usuario correcto
3. Intenta acceder a tu cuenta en GeoNames.org

### Problema: "Tiempo de espera agotado"
**Solución**:
1. Verifica tu conexión a internet
2. Intenta nuevamente en unos minutos
3. Contacta al administrador si persiste

### Problema: "Demasiadas solicitudes"
**Solución**:
1. Espera unos minutos antes de intentar nuevamente
2. GeoNames tiene límites de solicitudes por minuto
3. Considera usar un usuario de pago si necesitas más solicitudes

---

*Documentación actualizada: Junio 2025*
