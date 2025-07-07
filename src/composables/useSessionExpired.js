import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Estado global para la sesión expirada
const isSessionExpired = ref(false)
const sessionExpiredReason = ref('')

export function useSessionExpired() {
  const router = useRouter()

  // Función para marcar la sesión como expirada
  const markSessionExpired = (reason = 'Su sesión ha expirado') => {
    console.log('🔴 Sesión marcada como expirada:', reason)
    isSessionExpired.value = true
    sessionExpiredReason.value = reason
    
    // Limpiar localStorage inmediatamente
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    console.log('🔴 Tokens eliminados del localStorage')
  }

  // Función para manejar la respuesta después de mostrar el modal
  const handleSessionExpiredResponse = () => {
    console.log('🔄 Manejando respuesta de sesión expirada')
    // Resetear el estado
    isSessionExpired.value = false
    sessionExpiredReason.value = ''
    
    // Redirigir al login
    router.push('/auth/login')
  }

  // Función para restablecer el estado (útil para testing o casos especiales)
  const resetSessionExpiredState = () => {
    isSessionExpired.value = false
    sessionExpiredReason.value = ''
  }

  // Función para verificar si hay errores de autenticación
  const isAuthError = (error) => {
    if (!error) return false
    
    // Verificar códigos de estado HTTP
    if (error.response?.status === 401 || error.response?.status === 403) {
      return true
    }
    
    // Verificar mensajes específicos del backend
    const message = error.response?.data?.error || error.message || ''
    const authErrorMessages = [
      'token_not_valid',
      'token_expired',
      'invalid_token',
      'authentication_failed',
      'not_authenticated',
      'permission_denied',
      'token inválido',
      'token expirado',
      'no autenticado',
      'sesión expirada'
    ]
    
    return authErrorMessages.some(msg => 
      message.toLowerCase().includes(msg.toLowerCase())
    )
  }

  // Función para test manual
  const testSessionExpired = () => {
    console.log('🧪 Probando sesión expirada manualmente')
    markSessionExpired('Sesión expirada (test manual)')
  }

  return {
    // Estado reactivo
    isSessionExpired: computed(() => isSessionExpired.value),
    sessionExpiredReason: computed(() => sessionExpiredReason.value),
    
    // Métodos
    markSessionExpired,
    handleSessionExpiredResponse,
    resetSessionExpiredState,
    isAuthError,
    testSessionExpired
  }
}
