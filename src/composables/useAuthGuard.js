import { onMounted, onUnmounted } from 'vue'
import { useAuthErrorHandler } from '@/plugins/authErrorPlugin'

// Composable para manejar errores de autenticación en vistas
export function useAuthGuard() {
  const { handleGlobalError } = useAuthErrorHandler()

  // Función para manejar errores en llamadas a API
  const handleApiError = (error, context = 'operación') => {
    console.error(`Error en ${context}:`, error)
    
    // Intentar manejar como error de autenticación
    const handled = handleGlobalError(error)
    
    if (!handled) {
      // Si no es un error de autenticación, puede ser manejado por el componente
      return false
    }
    
    return true // Se manejó como error de autenticación
  }

  // Función para wrap async/await calls
  const safeApiCall = async (apiCall, context = 'operación') => {
    try {
      return await apiCall()
    } catch (error) {
      const handled = handleApiError(error, context)
      if (!handled) {
        throw error // Re-lanzar si no fue un error de autenticación
      }
    }
  }

  // Handler global para errores no capturados
  const handleUnhandledError = (event) => {
    if (event.reason) {
      handleGlobalError(event.reason)
    }
  }

  // Configurar listeners para errores no capturados
  onMounted(() => {
    window.addEventListener('unhandledrejection', handleUnhandledError)
  })

  onUnmounted(() => {
    window.removeEventListener('unhandledrejection', handleUnhandledError)
  })

  return {
    handleApiError,
    safeApiCall
  }
}
