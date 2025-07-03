<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title neon-text">Bienvenido a tu Panel</h1>
        <p class="dashboard-subtitle">
          {{ greeting }}, {{ currentUser?.first_name || currentUser?.username }}!
        </p>
        <p class="user-email">{{ currentUser?.email }}</p>
      </div>
      
      <div class="user-actions">
        <TechButton 
          label="Cerrar Sesión" 
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
          @click="handleLogout"
        />
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- Mensaje de bienvenida para nuevos usuarios -->
      <div v-if="showWelcomeMessage" class="welcome-banner">
        <div class="welcome-content">
          <i class="pi pi-check-circle welcome-icon"></i>
          <div>
            <h3>¡Bienvenido a Modelium!</h3>
            <p>Tu cuenta ha sido verificada exitosamente. ¡Ahora estás listo para comenzar a construir modelos de IA!</p>
          </div>
        </div>
      </div>
      
      <div class="stats-cards">
        <Card class="stat-card tech-glow">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-cog stat-icon"></i>
              <div>
                <h3 class="stat-number">0</h3>
                <p class="stat-label">My Models</p>
              </div>
            </div>
          </template>
        </Card>
        
        <Card class="stat-card tech-glow">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-chart-line stat-icon"></i>
              <div>
                <h3 class="stat-number">0</h3>
                <p class="stat-label">Training</p>
              </div>
            </div>
          </template>
        </Card>
        
        <Card class="stat-card tech-glow">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-check-circle stat-icon"></i>
              <div>
                <h3 class="stat-number">0</h3>
                <p class="stat-label">Completed</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
      
      <div class="quick-actions">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="actions-grid">
          <Card class="action-card tech-glow">
            <template #content>
              <div class="action-content">
                <i class="pi pi-plus action-icon"></i>
                <h3>Crear Nuevo Modelo</h3>
                <p>Comienza a entrenar un nuevo modelo de IA con tus datos</p>
                <TechButton 
                  label="Comenzar" 
                  icon="pi pi-arrow-right"
                  class="action-button"
                />
              </div>
            </template>
          </Card>
          
          <Card class="action-card tech-glow">
            <template #content>
              <div class="action-content">
                <i class="pi pi-upload action-icon"></i>
                <h3>Subir Dataset</h3>
                <p>Sube tus datos para el entrenamiento de modelos</p>
                <TechButton 
                  label="Subir" 
                  icon="pi pi-cloud-upload"
                  severity="secondary"
                  class="action-button"
                />
              </div>
            </template>
          </Card>
          
          <Card class="action-card tech-glow">
            <template #content>
              <div class="action-content">
                <i class="pi pi-book action-icon"></i>
                <h3>Documentación</h3>
                <p>Aprende cómo usar nuestra plataforma de IA</p>
                <TechButton 
                  label="Leer Docs" 
                  icon="pi pi-external-link"
                  severity="secondary"
                  outlined
                  class="action-button"
                />
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Card from 'primevue/card'
import TechButton from '@/components/ui/TechButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showWelcomeMessage = ref(false)
const currentUser = computed(() => authStore.currentUser)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

onMounted(() => {
  authStore.initAuth()
  
  // Mostrar mensaje de bienvenida si viene del registro
  if (route.query.welcome === 'true') {
    showWelcomeMessage.value = true
    setTimeout(() => {
      showWelcomeMessage.value = false
    }, 5000)
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.dashboard-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
}

.dashboard-subtitle {
  color: #94a3b8;
  font-size: 1.25rem;
  margin: 0.5rem 0 0 0;
}

.user-email {
  color: var(--primary-500);
  font-size: 1rem;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
  animation: slideIn 0.5s ease-out;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-icon {
  font-size: 2.5rem;
  color: #22c55e;
  flex-shrink: 0;
}

.welcome-content h3 {
  color: #22c55e;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.welcome-content p {
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--primary-500);
  width: 60px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-500);
  margin: 0;
}

.stat-label {
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-500);
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.action-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-content {
  text-align: center;
  padding: 2rem;
}

.action-icon {
  font-size: 3rem;
  color: var(--primary-500);
  margin-bottom: 1rem;
}

.action-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-500);
  margin-bottom: 1rem;
}

.action-content p {
  color: #94a3b8;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-button {
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
