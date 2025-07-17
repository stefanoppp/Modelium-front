import apiClient from './apiService'

export const modelService = {
  /**
   * Obtiene todos los modelos del usuario autenticado
   */
  async getMyModels() {
    try {
      const response = await apiClient.get('/models/my_models/')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error fetching my models:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar los modelos',
      }
    }
  },

  /**
   * Obtiene un modelo específico por ID
   */
  async getModelById(id) {
    try {
      const response = await apiClient.get(`/models/info/${id}/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error fetching model:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar el modelo',
      }
    }
  },

  /**
   * Crea un nuevo modelo
   */
  async createModel(modelData) {
    try {
      const response = await apiClient.post('/models/', modelData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error creating model:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear el modelo',
      }
    }
  },

  /**
   * Actualiza un modelo existente
   */
  async updateModel(id, modelData) {
    try {
      const response = await apiClient.put(`/models/${id}/`, modelData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error updating model:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar el modelo',
      }
    }
  },

  /**
   * Elimina un modelo
   */
  async deleteModel(id) {
    try {
      await apiClient.delete(`/models/${id}/`)
      return {
        success: true,
      }
    } catch (error) {
      console.error('Error deleting model:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar el modelo',
      }
    }
  },

  /**
   * Obtiene solo el conteo de modelos del usuario (más rápido)
   */
  async getMyModelsCount() {
    try {
      const response = await apiClient.get('/models/my_models/')
      return {
        success: true,
        count: response.data.count,
      }
    } catch (error) {
      console.error('Error fetching models count:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar el conteo de modelos',
      }
    }
  },

  /**
   * Obtiene estadísticas de los modelos del usuario
   */
  async getMyModelsStats() {
    try {
      const response = await apiClient.get('/models/my_models/')
      const models = response.data.models || []

      const stats = {
        total: models.length,
        training: models.filter(
          (m) => m.status === 'training' || m.status === 'pending' || m.status === 'processing',
        ).length,
        completed: models.filter((m) => m.status === 'completed' || m.status === 'ready').length,
        failed: models.filter((m) => m.status === 'failed' || m.status === 'error').length,
        classification: models.filter((m) => m.task_type === 'classification').length,
        regression: models.filter((m) => m.task_type === 'regression').length,
        public: models.filter((m) => m.is_public).length,
        private: models.filter((m) => !m.is_public).length,
      }

      return {
        success: true,
        stats,
        models: response.data.models,
      }
    } catch (error) {
      console.error('Error fetching models stats:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar las estadísticas',
      }
    }
  },
}

export default modelService
