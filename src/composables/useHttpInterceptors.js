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

        if (error.response?.status === 401 && !originalRequest._retry) {
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

            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login?reason=session-expired'
            }

            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }

        return Promise.reject(error)
      },
    )
  }

  return {
    setupInterceptors,
  }
}
