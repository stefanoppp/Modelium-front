<template>
  <!-- Modal simple sin Teleport -->
  <div
    v-if="sessionExpiredState.isExpired"
    class="session-modal-overlay"
    @click="handleBackdropClick"
    ref="modalOverlay"
  >
    <div class="session-modal-container" @click.stop>
      <!-- Header con icono -->
      <div class="modal-header">
        <div class="modal-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h2 class="modal-title">⚠️ Sesión Expirada</h2>
      </div>

      <!-- Contenido -->
      <div class="modal-content">
        <p class="modal-message">
          {{ sessionExpiredState.reason || 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.' }}
        </p>

        <div class="modal-info">
          <div class="info-item">
            <i class="pi pi-info-circle"></i>
            <div>
              <strong>¿Por qué pasó esto?</strong>
              <p>Por seguridad, las sesiones tienen un tiempo limitado para proteger tu cuenta.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="modal-actions">
        <button @click="handleLogin" class="login-button">
          🔑 Iniciar Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { sessionExpiredState, clearSessionExpiredState } from '@/stores/sessionExpiredStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const modalOverlay = ref(null)

// Watcher para monitorear el estado de sesión expirada
watchEffect(() => {
  if (sessionExpiredState.isExpired) {
    // Asegurar que el modal esté visible en el próximo tick
    nextTick(() => {
      if (modalOverlay.value) {
        // Bloquear el scroll del body
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.classList.add('modal-active')
        
        // Forzar visibilidad
        const modalElement = modalOverlay.value
        modalElement.style.display = 'flex'
        modalElement.style.visibility = 'visible'
        modalElement.style.opacity = '1'
        modalElement.style.zIndex = '2147483647'
      }
    })
  } else {
    // Restaurar el scroll del body cuando el modal se cierre
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.height = ''
    document.body.classList.remove('modal-active')
  }
})

const handleLogin = () => {
  clearSessionExpiredState()
  authStore.logout()
  router.push('/auth/login')
}

const handleBackdropClick = () => {
  // Prevenir cerrar el modal haciendo click fuera
  // El usuario debe hacer click en el botón
}
</script>

<style scoped>
/* Modal simple con máxima prioridad */
.session-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 2147483647 !important;
  padding: 1rem !important;
  animation: modalFadeIn 0.3s ease-out !important;
  outline: none !important;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.session-modal-container {
  background: linear-gradient(135deg, 
    rgba(30, 30, 50, 0.98) 0%, 
    rgba(40, 40, 60, 0.98) 100%) !important;
  border: 2px solid rgba(120, 119, 198, 0.5) !important;
  border-radius: 20px !important;
  padding: 2rem !important;
  max-width: 500px !important;
  width: 100% !important;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.8),
    0 0 50px rgba(138, 43, 226, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(25px) !important;
  color: white !important;
  animation: modalSlideIn 0.3s ease-out !important;
  position: relative !important;
  z-index: 2147483647 !important;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.3), rgba(255, 150, 100, 0.3));
  border: 3px solid rgba(255, 100, 100, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: #ff6464;
  animation: iconPulse 2s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(255, 100, 100, 0.4);
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 100, 100, 0.4);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 40px rgba(255, 100, 100, 0.6);
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.modal-content {
  margin-bottom: 2rem;
}

.modal-message {
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #e2e8f0;
}

.modal-info {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.info-item i {
  color: #3b82f6;
  font-size: 1.2rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.info-item strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #fff;
}

.info-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.login-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 1rem 2rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: white !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  min-width: 200px !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
  position: relative !important;
  z-index: 2147483647 !important;
}

.login-button:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5) !important;
}

.login-button:active {
  transform: translateY(0) !important;
}

.login-button:focus {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

/* Responsive */
@media (max-width: 640px) {
  .session-modal-container {
    padding: 1.5rem !important;
    margin: 1rem !important;
  }
  
  .modal-title {
    font-size: 1.3rem !important;
  }
  
  .modal-message {
    font-size: 1rem !important;
  }
  
  .login-button {
    width: 100% !important;
  }
}

/* Ocultar scrollbars del body cuando el modal está activo */
:global(body.modal-active) {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
