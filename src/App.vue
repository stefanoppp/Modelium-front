<template>
  <div id="app" class="dark-mode min-h-screen">
    <router-view />
    
    <!-- Modal de sesión expirada -->
    <SessionExpiredModalSimple />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { markSessionAsExpired } from '@/stores/sessionExpiredStore'
import { setSessionExpiredHandler } from '@/services/apiService'
import SessionExpiredModalSimple from '@/components/SessionExpiredModalSimple.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
  setSessionExpiredHandler(markSessionAsExpired)
})
</script>

<style scoped>
#app {
  font-family: 'Inter', sans-serif;
  position: relative;
}
</style>