<template>
  <div class="dashboard-container">
    <NavBar />
    <!-- Background animado tecnológico -->
    <div class="tech-background">
      <div class="background-grid"></div>
      <div class="floating-particles">
        <div class="particle" v-for="n in 20" :key="n"></div>
      </div>
      <div class="neural-network">
        <svg class="network-svg" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #00d4ff; stop-opacity: 0.8" />
              <stop offset="100%" style="stop-color: #8b5cf6; stop-opacity: 0.6" />
            </linearGradient>
          </defs>
          <!-- Nodos y conexiones de red neuronal -->
          <g class="network-connections">
            <line
              v-for="(connection, index) in networkConnections"
              :key="index"
              :x1="connection.x1"
              :y1="connection.y1"
              :x2="connection.x2"
              :y2="connection.y2"
              class="connection-line"
              :style="{ animationDelay: `${index * 0.1}s` }"
            />
          </g>
          <g class="network-nodes">
            <circle
              v-for="(node, index) in networkNodes"
              :key="index"
              :cx="node.x"
              :cy="node.y"
              :r="node.r"
              class="network-node"
              :style="{ animationDelay: `${index * 0.2}s` }"
            />
          </g>
        </svg>
      </div>
    </div>

    <!-- Header con branding -->
    <div class="dashboard-header">
      <div class="header-brand">
        <div class="brand-logo">
          <span class="brand-name">Modelium</span>
          <span class="brand-tagline">AI Development Platform</span>
        </div>
      </div>

      <div class="header-content">
        <h1 class="dashboard-title">
          <span class="title-main">{{ greeting }}</span>
          <span class="title-username">{{ currentUser?.first_name || currentUser?.username }}</span>
        </h1>
        <p class="dashboard-subtitle">
          Bienvenido a tu centro de comando de Inteligencia Artificial
        </p>
      </div>

      <div class="user-actions">
        <div class="user-info">
          <div class="user-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{ currentUser?.first_name || currentUser?.username }}</span>
            <span class="user-email">{{ currentUser?.email }}</span>
          </div>
        </div>
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
          <div class="welcome-icon-container">
            <i class="pi pi-check-circle welcome-icon"></i>
          </div>
          <div class="welcome-text">
            <h3>¡Bienvenido a Modelium!</h3>
            <p>
              Tu cuenta ha sido verificada exitosamente. Ahora estás listo para construir el futuro
              de la IA.
            </p>
          </div>
        </div>
      </div>

      <!-- Estadísticas de modelos -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Centro de Control de Modelos</h2>
          <p class="section-subtitle">Monitorea el estado de tus modelos de IA en tiempo real</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card clickable-card" @click="navigateToModels">
            <div class="stat-icon-container">
              <i class="pi pi-cog stat-icon"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">
                <span v-if="isLoadingModels" class="loading-indicator">...</span>
                <span v-else>{{ modelStats.total }}</span>
              </h3>
              <p class="stat-label">Modelos Totales</p>
              <div class="stat-progress">
                <div class="progress-bar" :style="{ width: '100%' }"></div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-container">
              <i class="pi pi-chart-line stat-icon"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">
                <span v-if="isLoadingModels" class="loading-indicator">...</span>
                <span v-else>{{ modelStats.training }}</span>
              </h3>
              <p class="stat-label">En Entrenamiento</p>
              <div class="stat-progress">
                <div
                  class="progress-bar training"
                  :style="{
                    width: `${(modelStats.training / Math.max(modelStats.total, 1)) * 100}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-container">
              <i class="pi pi-check-circle stat-icon"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">
                <span v-if="isLoadingModels" class="loading-indicator">...</span>
                <span v-else>{{ modelStats.completed }}</span>
              </h3>
              <p class="stat-label">Completados</p>
              <div class="stat-progress">
                <div
                  class="progress-bar completed"
                  :style="{
                    width: `${(modelStats.completed / Math.max(modelStats.total, 1)) * 100}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-container">
              <i class="pi pi-globe stat-icon"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">
                <span v-if="isLoadingModels" class="loading-indicator">...</span>
                <span v-else>{{ modelStats.public }}</span>
              </h3>
              <p class="stat-label">Públicos</p>
              <div class="stat-progress">
                <div
                  class="progress-bar public"
                  :style="{
                    width: `${(modelStats.public / Math.max(modelStats.total, 1)) * 100}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="actions-section">
        <div class="section-header">
          <h2 class="section-title">Acelera tu Desarrollo</h2>
          <p class="section-subtitle">
            Herramientas poderosas para crear modelos de IA de clase mundial
          </p>
        </div>

        <div class="actions-grid">
          <div class="action-card primary">
            <div class="action-background">
              <i class="pi pi-plus action-bg-icon"></i>
            </div>
            <div class="action-content">
              <div class="action-icon-container">
                <i class="pi pi-plus action-icon"></i>
              </div>
              <h3 class="action-title">Crear Nuevo Modelo</h3>
              <p class="action-description">
                Inicia el entrenamiento de un modelo de IA personalizado con tus datos
              </p>
              <TechButton label="Comenzar" icon="pi pi-arrow-right" class="action-button" />
            </div>
          </div>

          <div class="action-card secondary">
            <div class="action-background">
              <i class="pi pi-upload action-bg-icon"></i>
            </div>
            <div class="action-content">
              <div class="action-icon-container">
                <i class="pi pi-upload action-icon"></i>
              </div>
              <h3 class="action-title">Subir Dataset</h3>
              <p class="action-description">
                Carga tus datos para entrenar modelos más precisos y efectivos
              </p>
              <TechButton
                label="Subir Datos"
                icon="pi pi-cloud-upload"
                severity="secondary"
                class="action-button"
              />
            </div>
          </div>

          <div class="action-card tertiary">
            <div class="action-background">
              <i class="pi pi-chart-bar action-bg-icon"></i>
            </div>
            <div class="action-content">
              <div class="action-icon-container">
                <i class="pi pi-chart-bar action-icon"></i>
              </div>
              <h3 class="action-title">Analizar Modelos</h3>
              <p class="action-description">
                Explora el rendimiento y métricas de tus modelos entrenados
              </p>
              <TechButton
                label="Ver Análisis"
                icon="pi pi-eye"
                severity="secondary"
                outlined
                class="action-button"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { modelService } from '@/services/modelService'
import Card from 'primevue/card'
import TechButton from '@/components/ui/TechButton.vue'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showWelcomeMessage = ref(false)
const currentUser = computed(() => authStore.currentUser)
const models = ref([])
const isLoadingModels = ref(false)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

// Datos para la red neuronal del fondo
const networkNodes = ref([
  { x: 100, y: 150, r: 6 },
  { x: 100, y: 250, r: 4 },
  { x: 100, y: 350, r: 5 },
  { x: 100, y: 450, r: 4 },
  { x: 300, y: 100, r: 5 },
  { x: 300, y: 200, r: 7 },
  { x: 300, y: 300, r: 6 },
  { x: 300, y: 400, r: 5 },
  { x: 300, y: 500, r: 4 },
  { x: 500, y: 150, r: 6 },
  { x: 500, y: 250, r: 5 },
  { x: 500, y: 350, r: 7 },
  { x: 500, y: 450, r: 5 },
  { x: 700, y: 200, r: 6 },
  { x: 700, y: 300, r: 5 },
  { x: 700, y: 400, r: 4 },
  { x: 900, y: 250, r: 6 },
  { x: 900, y: 350, r: 5 },
  { x: 1100, y: 300, r: 7 },
])

const networkConnections = ref([
  { x1: 100, y1: 150, x2: 300, y2: 100 },
  { x1: 100, y1: 150, x2: 300, y2: 200 },
  { x1: 100, y1: 250, x2: 300, y2: 200 },
  { x1: 100, y1: 250, x2: 300, y2: 300 },
  { x1: 100, y1: 350, x2: 300, y2: 300 },
  { x1: 100, y1: 350, x2: 300, y2: 400 },
  { x1: 100, y1: 450, x2: 300, y2: 400 },
  { x1: 100, y1: 450, x2: 300, y2: 500 },
  { x1: 300, y1: 100, x2: 500, y2: 150 },
  { x1: 300, y1: 200, x2: 500, y2: 150 },
  { x1: 300, y1: 200, x2: 500, y2: 250 },
  { x1: 300, y1: 300, x2: 500, y2: 250 },
  { x1: 300, y1: 300, x2: 500, y2: 350 },
  { x1: 300, y1: 400, x2: 500, y2: 350 },
  { x1: 300, y1: 400, x2: 500, y2: 450 },
  { x1: 300, y1: 500, x2: 500, y2: 450 },
  { x1: 500, y1: 150, x2: 700, y2: 200 },
  { x1: 500, y1: 250, x2: 700, y2: 200 },
  { x1: 500, y1: 250, x2: 700, y2: 300 },
  { x1: 500, y1: 350, x2: 700, y2: 300 },
  { x1: 500, y1: 350, x2: 700, y2: 400 },
  { x1: 500, y1: 450, x2: 700, y2: 400 },
  { x1: 700, y1: 200, x2: 900, y2: 250 },
  { x1: 700, y1: 300, x2: 900, y2: 250 },
  { x1: 700, y1: 300, x2: 900, y2: 350 },
  { x1: 700, y1: 400, x2: 900, y2: 350 },
  { x1: 900, y1: 250, x2: 1100, y2: 300 },
  { x1: 900, y1: 350, x2: 1100, y2: 300 },
])

// Estadísticas calculadas de los modelos
const modelStats = computed(() => {
  if (!models.value || models.value.length === 0) {
    return {
      total: 0,
      training: 0,
      completed: 0,
      public: 0,
    }
  }

  return {
    total: models.value.length,
    training: models.value.filter(
      (model) =>
        model.status === 'training' || model.status === 'pending' || model.status === 'processing',
    ).length,
    completed: models.value.filter(
      (model) => model.status === 'completed' || model.status === 'ready',
    ).length,
    public: models.value.filter((model) => model.is_public === true).length,
  }
})

// Función para cargar los modelos del usuario
const loadMyModels = async () => {
  isLoadingModels.value = true
  try {
    const result = await modelService.getMyModels()
    if (result.success) {
      // La respuesta de la API tiene esta estructura: { count: 4, models: [...] }
      models.value = result.data.models || []
    } else {
      console.error('Error loading models:', result.error)
      // Podrías mostrar un mensaje de error aquí si quieres
    }
  } catch (error) {
    console.error('Error loading models:', error)
  } finally {
    isLoadingModels.value = false
  }
}

onMounted(async () => {
  authStore.initAuth()

  // Cargar modelos del usuario
  await loadMyModels()

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

const navigateToModels = () => {
  router.push('/models')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow-x: hidden;
}

/* Background tecnológico */
.tech-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridPulse 4s ease-in-out infinite;
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #00d4ff;
  border-radius: 50%;
  animation: float 12s ease-in-out infinite;
  box-shadow: 0 0 4px #00d4ff;
}

.particle:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: -2s;
}
.particle:nth-child(2) {
  top: 20%;
  left: 80%;
  animation-delay: -4s;
}
.particle:nth-child(3) {
  top: 60%;
  left: 20%;
  animation-delay: -1s;
}
.particle:nth-child(4) {
  top: 40%;
  left: 90%;
  animation-delay: -6s;
}
.particle:nth-child(5) {
  top: 80%;
  left: 70%;
  animation-delay: -3s;
}
.particle:nth-child(6) {
  top: 30%;
  left: 40%;
  animation-delay: -5s;
}
.particle:nth-child(7) {
  top: 70%;
  left: 60%;
  animation-delay: -7s;
}
.particle:nth-child(8) {
  top: 15%;
  left: 30%;
  animation-delay: -1.5s;
}
.particle:nth-child(9) {
  top: 85%;
  left: 15%;
  animation-delay: -4.5s;
}
.particle:nth-child(10) {
  top: 45%;
  left: 75%;
  animation-delay: -2.5s;
}
.particle:nth-child(11) {
  top: 25%;
  left: 55%;
  animation-delay: -6.5s;
}
.particle:nth-child(12) {
  top: 75%;
  left: 35%;
  animation-delay: -3.5s;
}
.particle:nth-child(13) {
  top: 35%;
  left: 85%;
  animation-delay: -5.5s;
}
.particle:nth-child(14) {
  top: 65%;
  left: 5%;
  animation-delay: -1.8s;
}
.particle:nth-child(15) {
  top: 55%;
  left: 45%;
  animation-delay: -7.2s;
}
.particle:nth-child(16) {
  top: 5%;
  left: 65%;
  animation-delay: -2.8s;
}
.particle:nth-child(17) {
  top: 95%;
  left: 25%;
  animation-delay: -4.2s;
}
.particle:nth-child(18) {
  top: 50%;
  left: 95%;
  animation-delay: -6.8s;
}
.particle:nth-child(19) {
  top: 90%;
  left: 50%;
  animation-delay: -3.2s;
}
.particle:nth-child(20) {
  top: 12%;
  left: 48%;
  animation-delay: -5.8s;
}

.neural-network {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.network-svg {
  width: 100%;
  height: 100%;
}

.connection-line {
  stroke: #00d4ff;
  stroke-width: 1;
  opacity: 0.3;
  animation: connectionPulse 3s ease-in-out infinite;
}

.network-node {
  fill: url(#nodeGradient);
  opacity: 0.6;
  animation: nodePulse 2s ease-in-out infinite;
}

/* Animaciones */
@keyframes gridPulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes float {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-15px) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-30px) scale(1.2);
    opacity: 1;
  }
  75% {
    transform: translateY(-15px) scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
}

@keyframes connectionPulse {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes nodePulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

/* Header */
.dashboard-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(26, 26, 46, 0.3);
  border-radius: 20px;
  margin-top: 7rem; /* Ajustado para NavBar */
  border: 1px solid rgba(0, 212, 255, 0.1);
  margin: 2rem;
  margin-top: 7rem; /* Espaciado específico para el NavBar */
}

.header-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.brand-logo {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
}

.brand-tagline {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.header-content {
  text-align: center;
}

.dashboard-title {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.title-main {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.title-username {
  font-size: 1.8rem;
  font-weight: 600;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.dashboard-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 1rem 0 0 0;
  font-weight: 400;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(42, 42, 58, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-email {
  color: #64748b;
  font-size: 0.8rem;
}

/* Content */
.dashboard-content {
  padding: 0 2rem 2rem;
  position: relative;
  z-index: 10;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  backdrop-filter: blur(10px);
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.welcome-icon-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-icon {
  font-size: 2rem;
  color: white;
}

.welcome-text h3 {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.6;
}

/* Sections */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.section-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
}

/* Stats Section */
.stats-section {
  margin-bottom: 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 10px 40px rgba(0, 212, 255, 0.2);
}

.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-8px);
  border-color: rgba(0, 212, 255, 0.6);
  box-shadow: 0 15px 50px rgba(0, 212, 255, 0.3);
}

.stat-icon-container {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00d4ff, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.stat-icon {
  font-size: 1.5rem;
  color: white;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #00d4ff;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.stat-label {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.stat-progress {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #8b5cf6);
  border-radius: 2px;
  transition: width 0.6s ease;
}

.progress-bar.training {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.progress-bar.completed {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-bar.public {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.loading-indicator {
  color: #00d4ff;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Actions Section */
.actions-section {
  margin-bottom: 4rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.action-card {
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  padding: 0;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

.action-card:hover {
  transform: translateY(-8px);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 15px 50px rgba(0, 212, 255, 0.2);
}

.action-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 2rem;
  opacity: 0.05;
}

.action-bg-icon {
  font-size: 8rem;
  color: #00d4ff;
}

.action-content {
  position: relative;
  z-index: 2;
  padding: 2.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.action-icon-container {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: linear-gradient(135deg, #00d4ff, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.action-icon {
  font-size: 2rem;
  color: white;
}

.action-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1rem 0;
}

.action-description {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  flex-grow: 1;
}

.action-button {
  align-self: flex-start;
}

.action-card.primary {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(26, 26, 46, 0.8));
}

.action-card.secondary {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(26, 26, 46, 0.8));
}

.action-card.tertiary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(26, 26, 46, 0.8));
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }

  .user-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .title-main {
    font-size: 2rem;
  }

  .title-username {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
