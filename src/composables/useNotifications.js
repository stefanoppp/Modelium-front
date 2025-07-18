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

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}