<template>
  <section class="stats-section">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-item" v-for="stat in stats" :key="stat.id">
          <div class="stat-number neon-text">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { id: 1, number: '10K+', label: 'Models Trained' },
  { id: 2, number: '500+', label: 'Active Users' },
  { id: 3, number: '99.9%', label: 'Uptime' },
  { id: 4, number: '24/7', label: 'Support' }
]
</script>

<style scoped>
.stats-section {
  padding: 4rem 0;
  background: rgba(16, 16, 30, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-item {
  padding: 2rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  display: block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 1.25rem;
  color: #94a3b8;
  font-weight: 400;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.005em;
}
</style>
