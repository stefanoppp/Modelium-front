import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { sessionService } from '@/services/sessionService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const sessionExpired = ref(false)

  // Getters
  const isAuthenticated = computed(() => {
    return user.value !== null && authService.isAuthenticated()
  })

  const currentUser = computed(() => user.value)

  // Actions
  const initAuth = () => {
    try {
      // Limpiar cualquier token expirado al inicializar
      const userData = authService.getCurrentUser()
      if (userData && authService.isAuthenticated()) {
        user.value = userData
        sessionExpired.value = false

        // Iniciar gestión de sesión si ya está autenticado
        startSessionManagement()
      } else {
        // Si los tokens están expirados o corruptos, limpiar todo
        authService.logout()
        user.value = null
        sessionExpired.value = false
      }
    } catch (error) {
      // En caso de error, limpiar todo
      authService.logout()
      user.value = null
      sessionExpired.value = false
    }
  }

  const markSessionExpired = () => {
    sessionExpired.value = true
    user.value = null
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.register(userData)
      if (result.success) {
        return {
          success: true,
          message: result.message,
          needsVerification: result.needsVerification || true,
        }
      } else {
        error.value = result.error
        return {
          success: false,
          error: result.error,
          needsVerification: result.needsVerification,
        }
      }
    } catch (err) {
      error.value = 'Error de conexión'
      return { success: false, error: 'Error de conexión' }
    } finally {
      isLoading.value = false
    }
  }

  const verifyToken = async (username, token) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await authService.verifyToken(username, token)
      if (result.success) {
        return { success: true, message: result.message }
      } else {
        error.value = result.error
        return {
          success: false,
          error: result.error,
          attemptsLeft: result.attemptsLeft,
        }
      }
    } catch (err) {
      error.value = 'Error de conexión'
      return { success: false, error: 'Error de conexión' }
    } finally {
      isLoading.value = false
    }
  }

  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    // Limpiar estado previo antes del login
    user.value = null

    try {
      const result = await authService.login(credentials)
      if (result.success) {
        user.value = result.data.user

        // Iniciar gestión automática de sesión después del login exitoso
        startSessionManagement()

        return { success: true }
      } else {
        error.value = result.error
        return {
          success: false,
          error: result.error,
          needsVerification: result.needsVerification,
        }
      }
    } catch (err) {
      error.value = 'Error de conexión'
      return { success: false, error: 'Error de conexión' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    // Detener gestión de sesión
    sessionService.stopSession()

    authService.logout()
    user.value = null
    error.value = null
    sessionExpired.value = false
  }

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken()
      if (result.success) {
        console.log('🔄 Token renovado desde store')
        return true
      } else {
        console.error('❌ Error renovando token desde store:', result.error)
        logout() // Si no se puede renovar, hacer logout
        return false
      }
    } catch (error) {
      console.error('❌ Error en refreshToken store:', error)
      logout()
      return false
    }
  }

  const extendSession = async () => {
    try {
      const result = await authService.extendSession()
      if (result.success) {
        console.log('⏰ Sesión extendida desde store')
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Error extendiendo sesión desde store:', error)
      return false
    }
  }

  const checkSessionStatus = async () => {
    try {
      return await authService.checkSessionStatus()
    } catch (error) {
      console.error('❌ Error verificando estado de sesión:', error)
      return { active: false, error: error.message }
    }
  }

  const startSessionManagement = () => {
    if (isAuthenticated.value) {
      console.log('🚀 Iniciando gestión automática de sesión')
      sessionService.startSession()
      sessionService.requestNotificationPermission()
    }
  }

  const stopSessionManagement = () => {
    console.log('🛑 Deteniendo gestión automática de sesión')
    sessionService.stopSession()
  }

  const clearError = () => {
    error.value = null
  }

  const getToken = () => {
    return authService.getToken()
  }

  const resetSessionExpired = () => {
    sessionExpired.value = false
  }

  return {
    // State
    user,
    isLoading,
    error,
    sessionExpired,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    initAuth,
    markSessionExpired,
    register,
    verifyToken,
    login,
    logout,
    clearError,
    getToken,
    resetSessionExpired,
    // Session management
    refreshToken,
    extendSession,
    checkSessionStatus,
    startSessionManagement,
    stopSessionManagement,
  }
})
