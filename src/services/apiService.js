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

// Función especializada para eliminación múltiple de modelos
export const deleteMultipleModels = async (modelIds) => {
  // Validaciones básicas
  if (!modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
    throw new Error('Se requiere un array válido de IDs de modelos')
  }
  
  if (modelIds.length > 100) {
    throw new Error('No se pueden eliminar más de 100 modelos a la vez')
  }
  
  try {
    // Intentar primero con DELETE (semánticamente correcto)
    console.log(`Intentando eliminar ${modelIds.length} modelos usando método DELETE`)
    const response = await apiClient.delete('/models/delete-multiple/', {
      data: { model_ids: modelIds }
    })
    
    // Log del método usado según headers de respuesta
    const methodUsed = response.headers['x-delete-method'] || 'DELETE'
    const operationCount = response.headers['x-operation-count'] || modelIds.length
    console.log(`✅ Eliminación exitosa usando ${methodUsed}. Modelos eliminados: ${operationCount}`)
    
    return response.data
  } catch (error) {
    // Si falla DELETE, intentar con POST como fallback
    if (error.response?.status === 405 || 
        error.response?.status === 400 || 
        error.response?.status === 413) {
      
      console.warn('⚠️ DELETE con body no soportado, usando POST como fallback')
      try {
        const response = await apiClient.post('/models/delete-multiple/', {
          model_ids: modelIds
        })
        
        const methodUsed = response.headers['x-delete-method'] || 'POST'
        const operationCount = response.headers['x-operation-count'] || modelIds.length
        console.log(`✅ Eliminación exitosa usando fallback ${methodUsed}. Modelos eliminados: ${operationCount}`)
        
        return response.data
      } catch (postError) {
        console.error('❌ Error en eliminación múltiple (POST fallback):', postError)
        throw postError
      }
    }
    
    console.error('❌ Error en eliminación múltiple (DELETE):', error)
    throw error
  }
}

export default apiClient
