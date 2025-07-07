import axios from 'axios'
import { config } from '@/config'
import { markSessionAsExpired } from '@/stores/sessionExpiredStore'

const API_BASE_URL = config.api.baseURL

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token JWT a las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar responses y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Verificar si es un error de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Si no es un retry, intentar refrescar el token
      if (!originalRequest._retry) {
        originalRequest._retry = true

        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
              refresh: refreshToken,
            })

            const newAccessToken = response.data.access
            localStorage.setItem('access_token', newAccessToken)

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return apiClient(originalRequest)
          } catch (refreshError) {
            // Refresh token también expiró, marcar sesión como expirada
            callSessionExpiredHandler('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.')
            return Promise.reject(refreshError)
          }
        } else {
          // No hay refresh token, marcar sesión como expirada
          callSessionExpiredHandler('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.')
          return Promise.reject(error)
        }
      } else {
        // Ya se intentó refrescar, marcar sesión como expirada
        callSessionExpiredHandler('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.')
        return Promise.reject(error)
      }
    }

    // Para otros errores, verificar si son errores de autenticación por mensaje
    const errorMessage = error.response?.data?.error || error.message || ''
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

    if (authErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg.toLowerCase()))) {
      callSessionExpiredHandler('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.')
    }

    return Promise.reject(error)
  },
)

// Variable para almacenar el handler de sesión expirada
let sessionExpiredHandler = null

// Función para configurar el handler de sesión expirada
export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler
}

// Función para llamar al handler de sesión expirada
const callSessionExpiredHandler = (reason) => {
  if (sessionExpiredHandler) {
    sessionExpiredHandler(reason)
  } else {
    markSessionAsExpired(reason)
  }
}

export default apiClient
