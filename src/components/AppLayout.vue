<template>
  <div class="layout-wrapper">
    <AppSidebar v-model:visible="sidebarVisible" />
    <div class="layout-main">
      <AppHeader @toggle-sidebar="sidebarVisible = !sidebarVisible" />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const sidebarVisible = ref(false)
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  padding: 2rem;
}
</style>