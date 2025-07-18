<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification-list" tag="div">
        <NotificationBanner
          v-for="notification in notifications"
          :key="notification.id"
          :type="notification.type"
          :title="notification.title"
          :message="notification.message"
          :closable="notification.closable"
          :auto-close="notification.autoClose"
          :duration="notification.duration"
          @close="removeNotification(notification.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications'
import NotificationBanner from './NotificationBanner.vue'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.notification-container > div {
  pointer-events: auto;
}

/* Animaciones de lista */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(50%) scale(0.98);
}

.notification-list-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .notification-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
}
</style>