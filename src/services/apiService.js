import axios from 'axios'
import { config } from '@/config'
import { useHttpInterceptors } from '@/composables/useHttpInterceptors'

const API_BASE_URL = config.api.baseURL

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Configurar interceptores automáticos
const { setupInterceptors } = useHttpInterceptors()
setupInterceptors(apiClient)

// Variable para almacenar el handler de sesión expirada
let sessionExpiredHandler = null

// Función para configurar el handler de sesión expirada
export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler
}

// Función para marcar sesión como expirada (fallback)
const markSessionAsExpired = (reason) => {
  console.warn('Sesión expirada:', reason)
  // Limpiar tokens del localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')

  // Redirigir al login si estamos en el navegador
  if (typeof window !== 'undefined' && window.location) {
    window.location.href = '/login'
  }
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
