import { reactive } from 'vue'
import { showSessionExpiredModal, hideSessionExpiredModal } from '@/utils/sessionModalManager'

// Estado global reactivo para la sesión expirada
export const sessionExpiredState = reactive({
  isExpired: false,
  reason: '',
  timestamp: null
})

// Funciones globales para manejar el estado
export const markSessionAsExpired = (reason = 'Su sesión ha expirado') => {
  // Prevenir múltiples llamadas
  if (sessionExpiredState.isExpired) {
    return
  }
  
  // Limpiar localStorage inmediatamente
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  
  // Actualizar estado global
  sessionExpiredState.isExpired = true
  sessionExpiredState.reason = reason
  sessionExpiredState.timestamp = Date.now()
  
  // Mostrar modal usando el manager como fallback
  setTimeout(() => {
    // Verificar si el modal Vue no está funcionando
    const existingModal = document.querySelector('.session-modal-overlay')
    if (!existingModal) {
      showSessionExpiredModal(reason)
    }
  }, 500) // Dar tiempo al modal Vue para renderizar
}

export const clearSessionExpiredState = () => {
  sessionExpiredState.isExpired = false
  sessionExpiredState.reason = ''
  sessionExpiredState.timestamp = null
  
  // También ocultar el modal de fallback si existe
  hideSessionExpiredModal()
}

// Función para testing (solo en desarrollo)
export const testSessionExpiredGlobal = () => {
  markSessionAsExpired('Sesión expirada (test)')
}
