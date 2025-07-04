<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import NavBar from '@/components/layout/NavBar.vue'
</script>

<template>
  <main>
    <NavBar />
    <div class="content">
      <TheWelcome />
    </div>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
}

.content {
  padding-top: 8rem;
  padding-left: 2rem;
  padding-right: 2rem;
}
</style>
