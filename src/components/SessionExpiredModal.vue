<template>
  <div
    v-if="sessionExpiredState.isExpired"
    class="session-expired-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
    style="z-index: 99999 !important;"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200 dark:border-gray-700 transform scale-105"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
        ⚠️ Sesión Expirada
      </h2>

      <!-- Message -->
      <p class="text-gray-700 dark:text-gray-300 text-center mb-6 leading-relaxed">
        {{ sessionExpiredState.reason || 'Su sesión ha expirado. Por favor, vuelva a iniciar sesión.' }}
      </p>

      <!-- Additional Info -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <i class="pi pi-info-circle text-blue-600 dark:text-blue-400 mt-0.5 mr-3"></i>
          <div class="text-sm text-blue-700 dark:text-blue-300">
            <p class="font-medium mb-1">¿Por qué pasó esto?</p>
            <p>Por seguridad, las sesiones tienen un tiempo limitado. Esto protege tu cuenta de accesos no autorizados.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center space-x-3">
        <button
          @click="handleLogin"
          class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
        >
          🔑 Iniciar Sesión
        </button>
      </div>

      <!-- Debug info (solo en desarrollo) -->
      <div v-if="isDevelopment" class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
        <p><strong>Modal visible:</strong> {{ sessionExpiredState.isExpired }}</p>
        <p><strong>Razón:</strong> {{ sessionExpiredState.reason }}</p>
        <p><strong>Timestamp:</strong> {{ sessionExpiredState.timestamp }}</p>
        <p><strong>Tokens:</strong> {{ hasTokens ? 'Presentes' : 'Eliminados' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sessionExpiredState, clearSessionExpiredState } from '@/stores/sessionExpiredStore'

const router = useRouter()

// Verificar si estamos en desarrollo
const isDevelopment = computed(() => import.meta.env.DEV)

// Verificar si hay tokens (para debug)
const hasTokens = computed(() => {
  return !!(localStorage.getItem('access_token') || localStorage.getItem('refresh_token'))
})

// Manejar el click en el botón de login
const handleLogin = () => {
  console.log('🔑 Usuario clickeó en Iniciar Sesión')
  
  // Limpiar el estado de sesión expirada
  clearSessionExpiredState()
  
  // Redirigir al login
  router.push('/auth/login')
}

// Watch para debug
watch(() => sessionExpiredState.isExpired, (newValue) => {
  console.log('🔍 SessionExpiredModal: isExpired cambió a', newValue)
}, { immediate: true })

watch(() => sessionExpiredState.reason, (newValue) => {
  console.log('🔍 SessionExpiredModal: reason cambió a', newValue)
}, { immediate: true })

// Log para debugging
console.log('🔍 SessionExpiredModal montado:', {
  isExpired: sessionExpiredState.isExpired,
  reason: sessionExpiredState.reason,
  timestamp: sessionExpiredState.timestamp
})
</script>

<style scoped>
/* Asegurar que el modal esté siempre encima de todo */
.session-expired-modal {
  position: fixed !important;
  z-index: 99999 !important;
  pointer-events: auto !important;
}

/* Animación suave para la aparición del modal */
.session-expired-modal {
  animation: fadeInModal 0.3s ease-out;
}

@keyframes fadeInModal {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Asegurar que el contenido del modal esté por encima */
.session-expired-modal > div {
  z-index: 100000 !important;
  position: relative !important;
}
</style>
