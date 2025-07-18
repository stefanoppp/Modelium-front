<template>
  <Transition name="notification" appear>
    <div v-if="visible" :class="['notification-banner', typeClass]">
      <div class="notification-content">
        <i :class="iconClass"></i>
        <div class="notification-text">
          <h4 v-if="title" class="notification-title">{{ title }}</h4>
          <p class="notification-message">{{ message }}</p>
        </div>
        <button v-if="closable" class="notification-close" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  closable: {
    type: Boolean,
    default: true
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)

const typeClass = computed(() => {
  return `notification-${props.type}`
})

const iconClass = computed(() => {
  const icons = {
    success: 'pi pi-check-circle',
    error: 'pi pi-times-circle',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle'
  }
  return icons[props.type]
})

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

onMounted(() => {
  if (props.autoClose) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.notification-banner {
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.notification-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(20px);
  z-index: -1;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.notification-content i {
  font-size: 1.25rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(240, 240, 250, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.notification-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

/* Tipos de notificación */
.notification-success {
  background: rgba(40, 167, 69, 0.15);
  border-color: rgba(40, 167, 69, 0.4);
}

.notification-success i {
  color: #28a745;
}

.notification-error {
  background: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.4);
}

.notification-error i {
  color: #dc3545;
}

.notification-warning {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
}

.notification-warning i {
  color: #ffc107;
}

.notification-info {
  background: rgba(0, 123, 255, 0.15);
  border-color: rgba(0, 123, 255, 0.4);
}

.notification-info i {
  color: #007bff;
}

/* Animaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .notification-banner {
    padding: 0.875rem 1rem;
    margin-bottom: 0.75rem;
  }
  
  .notification-content {
    gap: 0.625rem;
  }
  
  .notification-title {
    font-size: 0.9rem;
  }
  
  .notification-message {
    font-size: 0.85rem;
  }
}
</style>