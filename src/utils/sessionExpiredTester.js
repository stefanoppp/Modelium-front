// Plugin para testing del sistema de sesión expirada
// Este archivo es temporal y se puede eliminar después de testing

import { useSessionExpired } from '@/composables/useSessionExpired'

export function createSessionExpiredTester() {
  const { markSessionExpired } = useSessionExpired()

  // Función para testear el modal de sesión expirada
  const testSessionExpired = (reason = 'Sesión expirada por testing') => {
    markSessionExpired(reason)
  }

  // Función para simular error 401
  const simulateAuthError = () => {
    markSessionExpired('Token de autenticación inválido (simulado)')
  }

  // Función para simular error 403
  const simulatePermissionError = () => {
    markSessionExpired('No tienes permisos para acceder a este recurso (simulado)')
  }

  // Función para simular token expirado
  const simulateTokenExpired = () => {
    markSessionExpired('Su token de acceso ha expirado (simulado)')
  }

  return {
    testSessionExpired,
    simulateAuthError,
    simulatePermissionError,
    simulateTokenExpired
  }
}

// Agregar al objeto window para testing desde console
if (typeof window !== 'undefined') {
  window.testSessionExpired = () => {
    const { testSessionExpired } = createSessionExpiredTester()
    testSessionExpired()
  }
  
  window.simulateAuthError = () => {
    const { simulateAuthError } = createSessionExpiredTester()
    simulateAuthError()
  }
}
