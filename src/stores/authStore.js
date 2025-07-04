import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

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
      } else {
        // Si los tokens están expirados o corruptos, limpiar todo
        authService.logout()
        user.value = null
      }
    } catch (error) {
      // En caso de error, limpiar todo
      authService.logout()
      user.value = null
    }
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
    authService.logout()
    user.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const getToken = () => {
    return authService.getToken()
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    initAuth,
    register,
    verifyToken,
    login,
    logout,
    clearError,
    getToken,
  }
})
