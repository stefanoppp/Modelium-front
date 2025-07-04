<template>
  <div class="about">
    <NavBar />
    <div class="about-content">
      <h1>This is an about page</h1>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/layout/NavBar.vue'
</script>

<style>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
}

.about-content {
  padding-top: 8rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .about-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
