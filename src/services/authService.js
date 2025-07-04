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
      // Limpiar tokens existentes antes del login para evitar conflictos
      this.logout()
      
      const response = await apiClient.post('/users/login/', credentials)

      // Verificar que la respuesta contiene los tokens necesarios
      if (!response.data.access || !response.data.refresh) {
        throw new Error('Respuesta de login inválida')
      }

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
      // Limpiar cualquier token corrupto o expirado en caso de error
      this.logout()
      
      const errorMessage = error.response?.data?.error || error.message
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

    if (!token || !user) {
      // Si no hay token o usuario, limpiar todo y retornar false
      this.logout()
      return false
    }

    try {
      const userInfo = JSON.parse(user)
      
      // Verificar que el userInfo tiene la estructura esperada
      if (!userInfo || !userInfo.exp || typeof userInfo.exp !== 'number') {
        this.logout()
        return false
      }
      
      const currentTime = Date.now() / 1000
      
      // Si el token expiró, limpiar todo y retornar false
      if (userInfo.exp <= currentTime) {
        this.logout()
        return false
      }

      // Verificar que el token JWT es válido
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        this.logout()
        return false
      }

      // Intentar decodificar el payload del token
      try {
        const payload = JSON.parse(atob(tokenParts[1]))
        if (!payload || !payload.exp || payload.exp <= currentTime) {
          this.logout()
          return false
        }
      } catch (tokenError) {
        this.logout()
        return false
      }
      
      return true
    } catch (error) {
      // Si hay error al parsear, limpiar todo y retornar false
      this.logout()
      return false
    }
  },

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      if (!user) return null
      
      const userInfo = JSON.parse(user)
      const currentTime = Date.now() / 1000
      
      // Verificar si el token no ha expirado
      if (userInfo.exp <= currentTime) {
        this.logout()
        return null
      }
      
      return userInfo
    } catch (error) {
      this.logout()
      return null
    }
  },

  // Obtener token
  getToken() {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    
    // Verificar si el token no ha expirado antes de devolverlo
    if (!this.isAuthenticated()) {
      return null
    }
    
    return token
  },
}
