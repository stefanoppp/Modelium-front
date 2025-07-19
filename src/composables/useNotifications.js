import { ref, reactive } from 'vue'

// Estado global de notificaciones
const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  const addNotification = (notification) => {
    const id = ++notificationId
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      closable: true,
      autoClose: true,
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Métodos de conveniencia
  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      autoClose: false, // Los errores no se cierran automáticamente por defecto
      ...options
    })
  }

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }

  // Métodos específicos para errores del sistema
  const showMaxModelsError = (message = 'Has alcanzado el límite máximo de 3 modelos en entrenamiento simultáneo. Espera a que termine alguno antes de crear uno nuevo.') => {
    return showError(message, {
      title: 'Límite de modelos alcanzado',
      autoClose: false
    })
  }

  const showWorkerOverloadedError = (message = 'El sistema está sobrecargado. Por favor, intenta nuevamente en unos minutos.') => {
    return showError(message, {
      title: 'Sistema sobrecargado',
      autoClose: false
    })
  }

  // Método para manejar errores de API de manera consistente
  const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
    if (error.response?.status === 429) {
      return showMaxModelsError(error.response.data?.error || error.response.data?.detail)
    } else if (error.response?.status === 503) {
      return showWorkerOverloadedError(error.response.data?.error || error.response.data?.detail)
    } else {
      const message = error.response?.data?.error || error.response?.data?.detail || error.message || defaultMessage
      return showError(message, {
        title: 'Error',
        autoClose: false
      })
    }
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showMaxModelsError,
    showWorkerOverloadedError,
    handleApiError
  }
}