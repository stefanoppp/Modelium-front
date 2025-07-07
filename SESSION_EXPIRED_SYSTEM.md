# Sistema de Manejo de Sesión Expirada - Modelium

## Descripción

Este sistema detecta automáticamente cuando la sesión del usuario ha expirado y muestra un modal informativo que inhabilita la aplicación hasta que el usuario vuelva a iniciar sesión.

## Componentes del Sistema

### 1. Composable `useSessionExpired.js`
- **Ubicación**: `src/composables/useSessionExpired.js`
- **Función**: Maneja el estado global de sesión expirada
- **Características**:
  - Estado reactivo para detectar sesión expirada
  - Función para marcar sesión como expirada
  - Función para detectar errores de autenticación
  - Función para manejar la respuesta del usuario

### 2. Componente `SessionExpiredModal.vue`
- **Ubicación**: `src/components/SessionExpiredModal.vue`
- **Función**: Modal que se muestra cuando la sesión expira
- **Características**:
  - Bloquea toda la interfaz (z-index máximo)
  - Mensaje explicativo para el usuario
  - Botón para volver al login
  - No se puede cerrar sin hacer login

### 3. Interceptor de API `apiService.js`
- **Ubicación**: `src/services/apiService.js`
- **Función**: Intercepta respuestas HTTP para detectar errores de autenticación
- **Características**:
  - Intercepta errores 401 y 403
  - Intenta refrescar el token automáticamente
  - Marca sesión como expirada si el refresh falla

### 4. Composable `useAuthGuard.js`
- **Ubicación**: `src/composables/useAuthGuard.js`
- **Función**: Proporciona funciones para manejar errores de autenticación en componentes
- **Características**:
  - Función `safeApiCall` para envolver llamadas a API
  - Manejo automático de errores de autenticación
  - Listener para promesas rechazadas

## Uso en Componentes

### Importar y usar el composable:

```javascript
import { useAuthGuard } from '@/composables/useAuthGuard'

const { safeApiCall } = useAuthGuard()

// Usar en lugar de llamadas directas a API
const loadData = async () => {
  try {
    const response = await safeApiCall(
      () => apiClient.get('/models/public/'),
      'carga de datos'
    )
    // Manejar respuesta
  } catch (error) {
    // Solo llegar aquí si NO es error de autenticación
  }
}
```

### Alternativa con manejo manual:

```javascript
import { useAuthGuard } from '@/composables/useAuthGuard'

const { handleApiError } = useAuthGuard()

const loadData = async () => {
  try {
    const response = await apiClient.get('/models/public/')
    // Manejar respuesta
  } catch (error) {
    const handled = handleApiError(error, 'carga de datos')
    if (!handled) {
      // Manejar error no relacionado con autenticación
    }
  }
}
```

## Configuración

### En `App.vue`:
```vue
<template>
  <div id="app">
    <router-view />
    <SessionExpiredModal />
  </div>
</template>

<script setup>
import { useSessionExpired } from '@/composables/useSessionExpired'
import { setSessionExpiredComposable } from '@/services/apiService'
import SessionExpiredModal from '@/components/SessionExpiredModal.vue'

const sessionExpiredComposable = useSessionExpired()

onMounted(() => {
  setSessionExpiredComposable(sessionExpiredComposable)
})
</script>
```

## Tipos de Errores Detectados

### Códigos de Estado HTTP:
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Sin permisos

### Mensajes de Error:
- `token_not_valid`
- `token_expired`
- `invalid_token`
- `authentication_failed`
- `not_authenticated`
- `permission_denied`
- `token inválido`
- `token expirado`
- `no autenticado`
- `sesión expirada`

## Testing

### Funciones de Testing Disponibles:

En la consola del navegador:
```javascript
// Testear el modal básico
window.testSessionExpired()

// Simular error 401
window.simulateAuthError()
```

### Desde código:
```javascript
import { useSessionExpired } from '@/composables/useSessionExpired'

const { markSessionExpired } = useSessionExpired()

// Testear con mensaje personalizado
markSessionExpired('Token de prueba expirado')
```

## Flujo de Funcionamiento

1. **Llamada a API**: Usuario hace una acción que requiere autenticación
2. **Interceptor**: El interceptor de axios detecta error 401/403
3. **Refresh Token**: Se intenta refrescar el token automáticamente
4. **Fallo**: Si el refresh falla, se marca la sesión como expirada
5. **Modal**: Se muestra el modal de sesión expirada
6. **Bloqueo**: La aplicación queda bloqueada hasta que el usuario haga login
7. **Redirección**: Al hacer clic en "Volver a Iniciar Sesión", se redirige al login

## Ventajas del Sistema

- **Automático**: No requiere intervención manual en cada componente
- **Centralizado**: Toda la lógica está en un lugar
- **Consistente**: Comportamiento uniforme en toda la aplicación
- **Seguro**: Bloquea la aplicación hasta que el usuario se autentique
- **Informativo**: Explica al usuario qué pasó y qué debe hacer

## Mantenimiento

Para agregar nuevos tipos de errores de autenticación:

1. Editar la función `isAuthError` en `useSessionExpired.js`
2. Agregar los nuevos códigos de estado o mensajes al array `authErrorMessages`

Para personalizar el mensaje del modal:

1. Editar el componente `SessionExpiredModal.vue`
2. Modificar el texto y estilos según sea necesario
