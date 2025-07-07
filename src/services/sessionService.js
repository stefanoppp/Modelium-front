/**
 * Servicio para gestión de sesiones y extensión automática
 * Maneja la detección de actividad del usuario y renovación de tokens
 */

import { authService } from './authService'
import { useAuthStore } from '@/stores/authStore'

class SessionService {
  constructor() {
    this.activityTimer = null
    this.heartbeatInterval = null
    this.lastActivity = Date.now()
    this.isActive = false
    this.warningShown = false

    // Configuración
    this.ACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutos en millisegundos
    this.HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutos en millisegundos
    this.WARNING_TIME = 2 * 60 * 1000 // Mostrar advertencia 2 minutos antes

    // Eventos de actividad a monitorear
    this.activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    this.setupEventListeners()
  }

  /**
   * Configura los event listeners para detectar actividad del usuario
   */
  setupEventListeners() {
    this.activityEvents.forEach((event) => {
      document.addEventListener(event, this.recordActivity.bind(this), true)
    })

    // Listener para detectar cuando la ventana pierde/gana foco
    window.addEventListener('focus', this.onWindowFocus.bind(this))
    window.addEventListener('blur', this.onWindowBlur.bind(this))

    // Listener para visibilidad de la página
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this))
  }

  /**
   * Registra actividad del usuario
   */
  recordActivity() {
    this.lastActivity = Date.now()

    if (!this.isActive) {
      this.isActive = true
      console.log('🟢 Usuario activo detectado')
    }

    // Reset warning
    this.warningShown = false

    // Reiniciar timer de inactividad
    this.resetActivityTimer()
  }

  /**
   * Inicia el servicio de gestión de sesiones
   */
  startSession() {
    if (this.isSessionActive()) {
      console.log('🚀 Iniciando gestión de sesión automática')
      this.recordActivity()
      this.startHeartbeat()
      this.resetActivityTimer()
    }
  }

  /**
   * Detiene el servicio de gestión de sesiones
   */
  stopSession() {
    console.log('🛑 Deteniendo gestión de sesión')
    this.isActive = false

    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
      this.activityTimer = null
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Reinicia el timer de actividad
   */
  resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }

    this.activityTimer = setTimeout(() => {
      this.handleInactivity()
    }, this.ACTIVITY_TIMEOUT)
  }

  /**
   * Maneja la inactividad del usuario
   */
  async handleInactivity() {
    console.log('⚠️ Usuario inactivo por 15 minutos')
    this.isActive = false

    // Mostrar notificación de logout por inactividad
    this.showInactivityWarning()

    // Logout automático
    setTimeout(() => {
      this.logoutDueToInactivity()
    }, 30000) // 30 segundos adicionales para el usuario
  }

  /**
   * Muestra advertencia de inactividad
   */
  showInactivityWarning() {
    if (this.warningShown) return

    this.warningShown = true

    // Crear y mostrar notificación
    if (window.Notification && Notification.permission === 'granted') {
      new Notification('Sesión por expirar', {
        body: 'Tu sesión expirará en 30 segundos por inactividad. Mueve el mouse para mantenerla activa.',
        icon: '/favicon.ico',
      })
    }

    // También mostrar una alerta visual en la página
    this.showVisualWarning()
  }

  /**
   * Muestra advertencia visual en la página
   */
  showVisualWarning() {
    const warningDiv = document.createElement('div')
    warningDiv.id = 'session-warning'
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 107, 107, 0.95);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        max-width: 300px;
        border-left: 4px solid #ff4757;
      ">
        <div style="font-weight: 600; margin-bottom: 5px;">⚠️ Sesión por expirar</div>
        <div>Tu sesión expirará en 30 segundos. Mueve el mouse para mantenerla activa.</div>
      </div>
    `

    document.body.appendChild(warningDiv)

    // Quitar la advertencia después de 30 segundos
    setTimeout(() => {
      const warning = document.getElementById('session-warning')
      if (warning) {
        warning.remove()
      }
    }, 30000)
  }

  /**
   * Realiza logout por inactividad
   */
  async logoutDueToInactivity() {
    if (this.isActive) return // Usuario se reactivó

    console.log('🔴 Logout automático por inactividad')

    const authStore = useAuthStore()
    await authStore.logout()

    // Mostrar mensaje de logout
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login?reason=inactivity'
    }
  }

  /**
   * Inicia el heartbeat para mantener la sesión activa
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.isActive && this.isSessionActive()) {
        await this.sendHeartbeat()
      }
    }, this.HEARTBEAT_INTERVAL)
  }

  /**
   * Envía heartbeat al servidor
   */
  async sendHeartbeat() {
    try {
      const token = authService.getToken()
      if (!token) return

      const response = await fetch('http://localhost:8000/api/auth/session/heartbeat/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('💓 Heartbeat enviado exitosamente')
      } else if (response.status === 401) {
        // Token expirado, intentar refresh
        await this.tryRefreshToken()
      }
    } catch (error) {
      console.warn('❌ Error enviando heartbeat:', error)
    }
  }

  /**
   * Intenta renovar el token de acceso
   */
  async tryRefreshToken() {
    try {
      const authStore = useAuthStore()
      const refreshed = await authStore.refreshToken()

      if (refreshed) {
        console.log('🔄 Token renovado exitosamente')
        return true
      } else {
        console.log('❌ No se pudo renovar el token')
        return false
      }
    } catch (error) {
      console.error('❌ Error renovando token:', error)
      return false
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  isSessionActive() {
    const authStore = useAuthStore()
    return authStore.isAuthenticated && authService.getToken()
  }

  /**
   * Maneja cuando la ventana gana foco
   */
  onWindowFocus() {
    if (this.isSessionActive()) {
      this.recordActivity()
    }
  }

  /**
   * Maneja cuando la ventana pierde foco
   */
  onWindowBlur() {
    // No hacer nada especial, el timer seguirá corriendo
  }

  /**
   * Maneja cambios de visibilidad de la página
   */
  onVisibilityChange() {
    if (!document.hidden && this.isSessionActive()) {
      this.recordActivity()
    }
  }

  /**
   * Limpia todos los listeners y timers
   */
  cleanup() {
    // Remover event listeners
    this.activityEvents.forEach((event) => {
      document.removeEventListener(event, this.recordActivity.bind(this), true)
    })

    window.removeEventListener('focus', this.onWindowFocus.bind(this))
    window.removeEventListener('blur', this.onWindowBlur.bind(this))
    document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this))

    // Limpiar timers
    this.stopSession()
  }

  /**
   * Solicita permisos de notificación
   */
  async requestNotificationPermission() {
    if (window.Notification && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      console.log('🔔 Permiso de notificaciones:', permission)
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  /**
   * Obtiene estadísticas de sesión
   */
  getSessionStats() {
    return {
      isActive: this.isActive,
      lastActivity: new Date(this.lastActivity),
      timeSinceLastActivity: Date.now() - this.lastActivity,
      timeUntilTimeout: Math.max(0, this.ACTIVITY_TIMEOUT - (Date.now() - this.lastActivity)),
    }
  }
}

// Instancia única del servicio
export const sessionService = new SessionService()
