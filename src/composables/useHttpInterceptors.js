/**
 * Composable para manejar interceptores de HTTP y renovación automática de tokens
 */

import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'

export function useHttpInterceptors() {
  let isRefreshing = false
  let failedQueue = []

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })

    failedQueue = []
  }

  const setupInterceptors = (apiClient) => {
    // Interceptor de request para añadir token automáticamente
    apiClient.interceptors.request.use(
      (config) => {
        const token = authService.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Interceptor de response para manejar tokens expirados
    apiClient.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Solo intentar renovar token si:
        // 1. Es un error 401
        // 2. No hemos intentado renovar esta request antes
        // 3. NO estamos en la página de login (para evitar interferir con intentos de login)
        // 4. El usuario tenía un token válido anteriormente (está autenticado)
        if (
          error.response?.status === 401 && 
          !originalRequest._retry &&
          (typeof window === 'undefined' || !window.location.pathname.includes('/auth/login')) &&
          authService.getToken()
        ) {
          if (isRefreshing) {
            // Si ya se está renovando, poner la request en cola
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return apiClient(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            const authStore = useAuthStore()
            const refreshResult = await authStore.refreshToken()

            if (refreshResult) {
              const newToken = authService.getToken()
              processQueue(null, newToken)
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return apiClient(originalRequest)
            } else {
              throw new Error('No se pudo renovar el token')
            }
          } catch (refreshError) {
            processQueue(refreshError, null)

            // Si no se puede renovar, hacer logout y redirigir
            const authStore = useAuthStore()
            authStore.logout()

            // Solo redirigir si NO estamos en la página de login
            // Esto evita redirecciones cuando las credenciales de login son incorrectas
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
              window.location.href = '/auth/login?reason=session-expired'
            }

            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }

        // Si estamos en la página de login y hay un error 401, 
        // solo propagar el error sin intentar renovar (credenciales incorrectas)
        if (error.response?.status === 401 && typeof window !== 'undefined' && window.location.pathname.includes('/auth/login')) {
          return Promise.reject(error)
        }

        // Manejar errores específicos del sistema
        if (error.response?.status === 429) {
          // Error 429: Demasiadas solicitudes (límite de 3 modelos)
          console.warn('Límite de modelos alcanzado:', error.response.data)
        } else if (error.response?.status === 503) {
          // Error 503: Servicio no disponible (worker sobrecargado)
          console.warn('Worker sobrecargado:', error.response.data)
        }

        return Promise.reject(error)
      },
    )
  }

  return {
    setupInterceptors,
  }
}
