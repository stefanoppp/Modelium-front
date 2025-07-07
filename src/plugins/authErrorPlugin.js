import { useSessionExpired } from '@/composables/useSessionExpired'

// Plugin para manejar errores de autenticación globalmente
export function createAuthErrorPlugin() {
  const { isAuthError, markSessionExpired } = useSessionExpired()

  // Función para manejar errores de forma global
  const handleGlobalError = (error) => {
    if (isAuthError(error)) {
      // Determinar el mensaje basado en el tipo de error
      let message = 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.'
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error.toLowerCase()
        if (errorMsg.includes('token_not_valid') || errorMsg.includes('token inválido')) {
          message = 'Su token de acceso no es válido. Por favor, vuelva a iniciar sesión.'
        } else if (errorMsg.includes('token_expired') || errorMsg.includes('token expirado')) {
          message = 'Su token de acceso ha expirado. Por favor, vuelva a iniciar sesión.'
        } else if (errorMsg.includes('not_authenticated') || errorMsg.includes('no autenticado')) {
          message = 'Debe estar autenticado para acceder a esta función.'
        }
      }
      
      markSessionExpired(message)
      return true // Indica que se manejó el error
    }
    return false // No era un error de autenticación
  }

  // Función para wrap promises y manejar errores automáticamente
  const wrapPromise = (promise) => {
    return promise.catch((error) => {
      const handled = handleGlobalError(error)
      if (!handled) {
        // Si no fue un error de autenticación, re-lanzar el error
        throw error
      }
      // Si fue un error de autenticación, no re-lanzar para evitar que se propague
      return Promise.reject(error)
    })
  }

  return {
    handleGlobalError,
    wrapPromise
  }
}

// Composable para usar en componentes
export function useAuthErrorHandler() {
  const { handleGlobalError, wrapPromise } = createAuthErrorPlugin()

  return {
    handleGlobalError,
    wrapPromise
  }
}
