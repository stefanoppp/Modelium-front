import apiClient from './apiService'

export const authService = {
  // Registro de usuario
  async register(userData) {
    try {
      const response = await apiClient.post('/api/users/register/', userData)
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
      const response = await apiClient.post('/api/users/verify/', {
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

      const response = await apiClient.post('/api/users/login/', credentials)

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

  // Obtener refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  },

  // Renovar token de acceso
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible')
      }

      const response = await apiClient.post('/api/users/token/refresh/', {
        refresh: refreshToken,
      })

      if (response.data.access) {
        // Guardar nuevo access token
        localStorage.setItem('access_token', response.data.access)

        // Si viene un nuevo refresh token, guardarlo también
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh)
        }

        console.log('🔄 Token renovado exitosamente')
        return {
          success: true,
          access: response.data.access,
          refresh: response.data.refresh,
        }
      }

      throw new Error('No se recibió nuevo token')
    } catch (error) {
      console.error('❌ Error renovando token:', error)

      // Si no se puede renovar, hacer logout
      this.logout()

      return {
        success: false,
        error: error.response?.data?.error || 'Error renovando token',
      }
    }
  },

  // Extender sesión basada en actividad
  async extendSession() {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error('No hay token de acceso')
      }

      const response = await apiClient.post(
        '/api/users/session/extend/',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access)
        console.log('⏰ Sesión extendida exitosamente')
        return {
          success: true,
          access: response.data.access,
        }
      }

      return { success: true, message: 'Sesión ya activa' }
    } catch (error) {
      console.error('❌ Error extendiendo sesión:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Error extendiendo sesión',
      }
    }
  },

  // Verificar estado de sesión
  async checkSessionStatus() {
    try {
      const token = this.getToken()
      if (!token) {
        return { active: false, reason: 'No token' }
      }

      const response = await apiClient.get('/api/users/session/status/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return {
        active: response.data.session_active,
        lastActivity: response.data.last_activity,
        timeSinceActivity: response.data.time_since_activity_seconds,
        user: response.data.user,
      }
    } catch (error) {
      console.error('❌ Error verificando estado de sesión:', error)
      return {
        active: false,
        error: error.response?.data?.error || 'Error verificando sesión',
      }
    }
  },

  // Método para manejar respuestas 401 automáticamente
  async handleUnauthorized() {
    console.log('🔄 Intentando renovar token por respuesta 401...')
    const refreshResult = await this.refreshToken()

    if (refreshResult.success) {
      return true // Token renovado exitosamente
    } else {
      // No se pudo renovar, redirigir al login
      this.logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?reason=expired'
      }
      return false
    }
  },
}
