import apiClient from './apiService'

export const authService = {
  // Registro de usuario
  async register(userData) {
    try {
      const response = await apiClient.post('/users/register/', userData)
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        needsVerification: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el registro',
        details: error.response?.data,
        needsVerification: false,
      }
    }
  },

  // Verificación de token 2FA
  async verifyToken(username, token) {
    try {
      const response = await apiClient.post('/users/verify/', {
        username,
        token,
      })
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en la verificación',
        attemptsLeft: error.response?.data?.intentos_restantes,
      }
    }
  },

  // Login de usuario
  async login(credentials) {
    try {
      const response = await apiClient.post('/users/login/', credentials)

      // Almacenar tokens
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)

      // Decodificar JWT para obtener info del usuario
      const payload = JSON.parse(atob(response.data.access.split('.')[1]))

      // Obtener información adicional del usuario si es necesario
      const userInfo = {
        id: payload.user_id,
        username: credentials.username,
        exp: payload.exp,
        // Agregar más campos si los tienes en el payload del JWT
        email: payload.email || '',
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
      }

      localStorage.setItem('user', JSON.stringify(userInfo))

      return {
        success: true,
        data: {
          access: response.data.access,
          refresh: response.data.refresh,
          user: userInfo,
        },
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error
      return {
        success: false,
        error: errorMessage || 'Error en el login',
        needsVerification: errorMessage === 'Usuario no verificado',
      }
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  // Verificar si está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')

    if (!token || !user) return false

    try {
      const userInfo = JSON.parse(user)
      const currentTime = Date.now() / 1000
      return userInfo.exp > currentTime
    } catch {
      return false
    }
  },

  // Obtener usuario actual
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('access_token')
  },
}
