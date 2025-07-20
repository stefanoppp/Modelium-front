<template>
  <div class="dashboard-wrapper">
    <!-- Contenedor aislado para el navbar -->
    <div class="navbar-isolation">
      <NavBar />
    </div>
    
    <div class="dashboard-container">
    
    <!-- Fondo galáctico -->
    <div class="galactic-background">
      <div class="cosmic-grid"></div>
      <div class="nebula-layers">
        <div class="nebula-layer" v-for="n in 5" :key="n"></div>
      </div>
      <div class="star-field">
        <div class="star" v-for="n in 150" :key="n"></div>
      </div>
      <div class="floating-particles">
        <div class="particle" v-for="n in 20" :key="n"></div>
      </div>
      <div class="energy-streams">
        <div class="energy-stream" v-for="n in 4" :key="n"></div>
      </div>
    </div>

    <!-- Header Principal con Bienvenida -->
    <header class="dashboard-header">
      <div class="container">
        <div class="welcome-section">
          <div class="cosmic-aura"></div>
          <div class="welcome-content">
            <div class="title-container">
              <h1 class="title-glitch">
                <span class="title-text">{{ greeting }}, {{ currentUser?.first_name || currentUser?.username }}</span>
                <div class="title-underline"></div>
              </h1>
            </div>
            <p class="subtitle-text">
              <span class="subtitle-prefix">&gt;</span> Explora la creación de la IA con Modelium<span class="cursor-blink">_</span>
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="dashboard-content">
      <div class="container">
        
        <!-- Panel de Estadísticas -->
        <section class="stats-panel">
          <h2 class="section-title">
            <i class="pi pi-chart-bar"></i>
            Resumen de Modelos
          </h2>
          <div class="stats-grid">
            <div class="stat-card primary" @click="navigateToModels">
              <div class="stat-icon">
                <i class="pi pi-cog"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ modelStats.total }}</div>
                <div class="stat-label">Modelos Totales</div>
              </div>
              <div class="stat-indicator">
                <i class="pi pi-chevron-right"></i>
              </div>
            </div>

            <div class="stat-card training">
              <div class="stat-icon training">
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ modelStats.training }}</div>
                <div class="stat-label">Entrenando</div>
              </div>
            </div>

            <div class="stat-card completed">
              <div class="stat-icon completed">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ modelStats.completed }}</div>
                <div class="stat-label">Completados</div>
              </div>
            </div>

            <div class="stat-card public">
              <div class="stat-icon public">
                <i class="pi pi-globe"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ modelStats.public }}</div>
                <div class="stat-label">Públicos</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Panel de Acciones Rápidas -->
        <section class="actions-panel">
          <h2 class="section-title">
            <i class="pi pi-bolt"></i>
            Acciones Rápidas
          </h2>
          <div class="actions-grid">
            <div class="action-card primary" @click="navigateToCreateModel">
              <div class="action-icon">
                <i class="pi pi-plus"></i>
              </div>
              <div class="action-content">
                <h3>Crear Nuevo Modelo</h3>
                <p>Entrena un modelo personalizado con tus datos</p>
              </div>
            </div>

            <div class="action-card secondary" @click="navigateToModels">
              <div class="action-icon">
                <i class="pi pi-th-large"></i>
              </div>
              <div class="action-content">
                <h3>Ver Mis Modelos</h3>
                <p>Gestiona y monitorea tus modelos existentes</p>
              </div>
            </div>

            <div class="action-card tertiary" @click="navigateToPredictions">
              <div class="action-icon">
                <i class="pi pi-chart-bar"></i>
              </div>
              <div class="action-content">
                <h3>Hacer Predicciones</h3>
                <p>Utiliza tus modelos entrenados para realizar predicciones</p>
              </div>
            </div>

            <div class="action-card accent" @click="navigateToCompareModels">
              <div class="action-icon">
                <i class="pi pi-chart-pie"></i>
              </div>
              <div class="action-content">
                <h3>Comparar Modelos</h3>
                <p>Analiza y compara el rendimiento de tus modelos</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Panel de Actividad Reciente -->
        <section v-if="recentModels.length > 0" class="activity-panel">
          <h2 class="section-title">
            <i class="pi pi-history"></i>
            Actividad Reciente
          </h2>
          <div class="activity-list">
            <div 
              v-for="model in recentModels" 
              :key="model.id"
              class="activity-item"
              @click="navigateToModel(model.id)"
            >
              <div class="activity-status">
                <i :class="getStatusIcon(model.status)"></i>
              </div>
              <div class="activity-info">
                <h4>{{ model.name }}</h4>
                <p>{{ model.description || 'Sin descripción' }}</p>
                <span class="activity-date">{{ formatDate(model.created_at) }}</span>
              </div>
              <div class="activity-progress" v-if="model.status === 'training'">
                <div class="progress-bar">
                  <div class="progress-fill" :style="`width: ${model.progress || 0}%`"></div>
                </div>
                <span class="progress-text">{{ model.progress || 0 }}%</span>
              </div>
              <div class="activity-status-badge" :class="getStatusClass(model.status)">
                {{ model.status }}
              </div>
            </div>
          </div>
        </section>

        <!-- Estado Vacío -->
        <section v-if="modelStats.total === 0" class="empty-panel">
          <div class="empty-content">
            <div class="empty-icon">
              <i class="pi pi-sparkles"></i>
            </div>
            <h3>¡Comienza tu Aventura en IA!</h3>
            <p>Crea tu primer modelo de inteligencia artificial y descubre el poder del machine learning</p>
            <div class="empty-actions">
              <TechButton 
                @click="navigateToCreateModel"
                class="primary-btn"
                icon="pi pi-plus"
              >
                Crear Primer Modelo
              </TechButton>
              <TechButton 
                @click="() => router.push('/repository')"
                class="secondary-btn"
                icon="pi pi-search"
              >
                Explorar Repositorio
              </TechButton>
            </div>
          </div>
        </section>

        <!-- Panel de Gestión Avanzada -->
        <section class="management-panel">
          <h2 class="section-title">
            <i class="pi pi-cog"></i>
            Gestión Avanzada
          </h2>
          <div class="management-grid">
            <div class="management-card" @click="navigateToManageModels">
              <div class="management-icon danger">
                <i class="pi pi-trash"></i>
              </div>
              <div class="management-content">
                <h3>Gestionar Modelos</h3>
                <p>Administra y elimina modelos que ya no necesites</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
    </div> <!-- Cierre de dashboard-container -->
  </div> <!-- Cierre de dashboard-wrapper -->
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { testSessionExpiredGlobal } from '@/stores/sessionExpiredStore'
import { modelService } from '@/services/modelService'
import TechButton from '@/components/ui/TechButton.vue'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentUser = computed(() => authStore.currentUser)
const models = ref([])
const isLoadingModels = ref(false)

// Verificar si estamos en desarrollo
const isDevelopment = computed(() => import.meta.env.DEV)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (7 < hour < 14) return 'Buenos días'
  if (14< hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

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

// Modelos recientes (últimos 3)
const recentModels = computed(() => {
  if (!models.value || models.value.length === 0) return []
  
  return models.value
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)
})

// Función para cargar los modelos del usuario
const loadMyModels = async () => {
  isLoadingModels.value = true
  try {
    const result = await modelService.getMyModels()
    if (result.success) {
      models.value = result.data.models || []
    } else {
      console.error('Error loading models:', result.error)
    }
  } catch (error) {
    console.error('Error loading models:', error)
  } finally {
    isLoadingModels.value = false
  }
}

// Navegación
const navigateToModels = () => {
  router.push('/models')
}

const navigateToCreateModel = () => {
  router.push('/create-model')
}

const navigateToPredictions = () => {
  router.push('/predictions')
}

const navigateToCompareModels = () => {
  router.push('/compare-models')
}

const navigateToManageModels = () => {
  router.push('/manage-models')
}

const navigateToModel = (modelId) => {
  router.push(`/models/${modelId}`)
}

// Funciones de prueba (solo en desarrollo)
const testSessionExpired = () => {
  testSessionExpiredGlobal()
}

// Utilidades
const getStatusClass = (status) => {
  const classes = {
    'completed': 'status-completed',
    'training': 'status-training',
    'pending': 'status-pending',
    'failed': 'status-failed'
  }
  return classes[status] || 'status-unknown'
}

const getStatusIcon = (status) => {
  const icons = {
    'completed': 'pi pi-check-circle',
    'training': 'pi pi-spin pi-spinner',
    'pending': 'pi pi-clock',
    'failed': 'pi pi-times-circle'
  }
  return icons[status] || 'pi pi-question-circle'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  authStore.initAuth()
  await loadMyModels()
})
</script>

<style scoped>
/* === WRAPPER PRINCIPAL === */
.dashboard-wrapper {
  min-height: 100vh;
  position: relative;
}

/* === AISLAMIENTO DEL NAVBAR === */
.navbar-isolation {
  /* Reset completo para aislar el navbar */
  all: initial;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  height: auto;
  
  /* Propiedades específicas necesarias */
  font-family: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  
  /* Evitar herencia de transformaciones y filtros */
  transform: none;
  filter: none;
  backdrop-filter: none;
  
  /* Evitar herencia de animaciones */
  animation: none;
  transition: none;
}

/* === CONTENEDOR PRINCIPAL === */
.dashboard-container {
  padding-top: 80px; /* Espacio para el navbar fijo */
  min-height: 100vh;
  background: 
    linear-gradient(135deg, #000000 0%, #0a0a0f 15%, #1a0a1a 30%, #0f0f1a 45%, #1a1a2e 60%, #2a1a3a 75%, #1a2a4a 90%, #0f1a2a 100%),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(25, 25, 112, 0.35) 0%, transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 20% 60%, rgba(72, 61, 139, 0.25) 0%, transparent 55%),
    radial-gradient(circle at 80% 40%, rgba(106, 90, 205, 0.2) 0%, transparent 60%);
  position: relative;
  overflow: hidden;
  color: white;
}

/* === FONDO GALÁCTICO === */
.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  animation: galaxyRotate 120s linear infinite;
}

@keyframes galaxyRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cosmic-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(138, 43, 226, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 43, 226, 0.08) 1px, transparent 1px);
  background-size: 80px 80px;
  animation: cosmicGridMove 40s linear infinite;
}

@keyframes cosmicGridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(80px, 80px); }
}

.nebula-layers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.nebula-layer {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: nebulaDrift 20s ease-in-out infinite;
}

.nebula-layer:nth-child(1) {
  top: 10%;
  left: 15%;
  width: 300px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(75, 0, 130, 0.3) 0%, transparent 70%);
  animation-delay: 0s;
}

.nebula-layer:nth-child(2) {
  top: 60%;
  right: 20%;
  width: 250px;
  height: 180px;
  background: radial-gradient(ellipse, rgba(25, 25, 112, 0.25) 0%, transparent 70%);
  animation-delay: -5s;
}

.nebula-layer:nth-child(3) {
  bottom: 20%;
  left: 25%;
  width: 200px;
  height: 150px;
  background: radial-gradient(ellipse, rgba(138, 43, 226, 0.2) 0%, transparent 70%);
  animation-delay: -10s;
}

.nebula-layer:nth-child(4) {
  top: 30%;
  right: 10%;
  width: 180px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(72, 61, 139, 0.15) 0%, transparent 70%);
  animation-delay: -15s;
}

.nebula-layer:nth-child(5) {
  bottom: 40%;
  left: 60%;
  width: 220px;
  height: 160px;
  background: radial-gradient(ellipse, rgba(106, 90, 205, 0.18) 0%, transparent 70%);
  animation-delay: -7s;
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -15px) scale(1.1); }
  50% { transform: translate(-10px, 10px) scale(0.9); }
  75% { transform: translate(15px, -5px) scale(1.05); }
}

.star-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: starTwinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
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
  width: 3px;
  height: 3px;
  background: rgba(138, 43, 226, 0.8);
  border-radius: 50%;
  animation: cosmicFloat 20s ease-in-out infinite;
  box-shadow: 
    0 0 10px rgba(138, 43, 226, 0.6),
    0 0 20px rgba(138, 43, 226, 0.4),
    0 0 30px rgba(138, 43, 226, 0.2);
}

@keyframes cosmicFloat {
  0%, 100% { 
    transform: translateY(0px) translateX(0px);
    opacity: 0.3;
  }
  25% { 
    transform: translateY(-20px) translateX(10px);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-10px) translateX(-15px);
    opacity: 1;
  }
  75% { 
    transform: translateY(15px) translateX(5px);
    opacity: 0.6;
  }
}

.energy-streams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.energy-stream {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(180deg, transparent, rgba(138, 43, 226, 0.6), transparent);
  animation: energyFlow 8s ease-in-out infinite;
}

@keyframes energyFlow {
  0%, 100% { 
    opacity: 0.2;
    transform: translateY(0) scaleY(1);
  }
  50% { 
    opacity: 0.8;
    transform: translateY(-20px) scaleY(1.2);
  }
}

/* === HEADER DEL DASHBOARD === */
.dashboard-header {
  padding: 7rem 0 2rem;
  position: relative;
  z-index: 10;
  text-align: center;
  background: 
    radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.1) 0%, transparent 60%),
    radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.08) 0%, transparent 50%);
}

.welcome-section {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.cosmic-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(138, 43, 226, 0.08) 0%, transparent 70%);
  filter: blur(60px);
  opacity: 0.6;
  pointer-events: none;
}

.welcome-content {
  position: relative;
  z-index: 2;
}



/* === CONTENIDO PRINCIPAL === */
.dashboard-content {
  position: relative;
  z-index: 10;
  padding: 2rem 0 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* === SECCIONES === */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: rgba(240, 240, 250, 0.95);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(138, 43, 226, 0.3);
}

.section-title i {
  color: #8A2BE2;
  font-size: 1.3rem;
}

/* === PANEL DE ESTADÍSTICAS === */
.stats-panel {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(25, 25, 40, 0.8);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-height: 140px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(138, 43, 226, 0.05) 0%, 
    transparent 50%, 
    rgba(138, 43, 226, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(138, 43, 226, 0.5);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.2);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.primary:hover {
  border-color: #8A2BE2;
  box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(147, 112, 219, 0.2));
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #8A2BE2;
  flex-shrink: 0;
  margin-top: 10px;
}

.stat-icon.training {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.2));
  border-color: rgba(249, 115, 22, 0.3);
  color: #f97316;
}

.stat-icon.completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2));
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.stat-icon.public {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.2));
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 400;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1;
  height: 2.5rem;
  display: flex;
  align-items: flex-start;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(200, 200, 220, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  line-height: 1.2;
  margin-top: auto;
}

.stat-indicator {
  color: rgba(138, 43, 226, 0.6);
  font-size: 1.2rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-indicator {
  opacity: 1;
  transform: translateX(0);
}

/* === PANEL DE ACCIONES === */
.actions-panel {
  margin-bottom: 3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.action-card {
  background: rgba(25, 25, 40, 0.8);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(138, 43, 226, 0.05) 0%, 
    transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  border-color: rgba(138, 43, 226, 0.5);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.2);
}

.action-card:hover::before {
  opacity: 1;
}

.action-card.primary {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(147, 112, 219, 0.1));
  border-color: rgba(138, 43, 226, 0.3);
}

.action-card.primary:hover {
  box-shadow: 0 12px 35px rgba(138, 43, 226, 0.3);
  border-color: #8A2BE2;
}

.action-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(147, 112, 219, 0.2));
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #8A2BE2;
  flex-shrink: 0;
}

.action-content h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: white;
}

.action-content p {
  color: rgba(200, 200, 220, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* === PANEL DE ACTIVIDAD === */
.activity-panel {
  margin-bottom: 3rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  background: rgba(25, 25, 40, 0.6);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.activity-item:hover {
  background: rgba(25, 25, 40, 0.8);
  border-color: rgba(138, 43, 226, 0.4);
  transform: translateX(5px);
}

.activity-status {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  background: rgba(138, 43, 226, 0.2);
  color: #8A2BE2;
  border: 1px solid rgba(138, 43, 226, 0.3);
}

.activity-info {
  flex: 1;
}

.activity-info h4 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: white;
}

.activity-info p {
  color: rgba(200, 200, 220, 0.8);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.activity-date {
  color: rgba(180, 180, 200, 0.7);
  font-size: 0.75rem;
}

.activity-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
}

.progress-bar {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8A2BE2, #8B5CF6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: rgba(200, 200, 220, 0.8);
  min-width: 35px;
}

.activity-status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-completed {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-training {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.status-pending {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

/* === ESTADO VACÍO === */
.empty-panel {
  margin-bottom: 3rem;
}

.empty-content {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(25, 25, 40, 0.6);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 4rem;
  color: #8A2BE2;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-content h3 {
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: white;
}

.empty-content p {
  color: rgba(200, 200, 220, 0.8);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* === PANEL DE GESTIÓN === */
.management-panel {
  margin-bottom: 3rem;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.management-card {
  background: rgba(25, 25, 40, 0.6);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.management-card:hover {
  background: rgba(25, 25, 40, 0.8);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
}

.management-icon.danger {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2));
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ef4444;
  flex-shrink: 0;
}

.management-content h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: white;
}

.management-content p {
  color: rgba(200, 200, 220, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* === PANEL DE PRUEBAS === */
.test-panel {
  margin-bottom: 2rem;
}

.test-content {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.test-content p {
  color: rgba(200, 200, 220, 0.8);
  margin-bottom: 1.5rem;
}

.test-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 3rem 0 2rem;
  }
  

  
  .container {
    padding: 0 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 600px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .management-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-card,
  .action-card,
  .management-card {
    padding: 1.5rem;
  }
  
  .stat-icon,
  .action-icon,
  .management-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .activity-progress {
    align-self: stretch;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {

  
  .section-title {
    font-size: 1.3rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 350px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .action-content h3,
  .management-content h3 {
    font-size: 1.1rem;
  }
  
  .empty-content h3 {
    font-size: 1.5rem;
  }
  
  .empty-content p {
    font-size: 1rem;
  }
}

/* === TÍTULO TECNOLÓGICO === */
.title-container {
  position: relative;
  margin-bottom: 1rem;
}

.title-glitch {
  font-family: 'Inter', 'Helvetica Neue', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 3.2rem;
  font-weight: 400;
  margin: 0;
  text-align: center;
  position: relative;
}

.title-text {
  display: inline-block;
  background: linear-gradient(135deg, #b813ff 0%, #d86eff 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(138, 43, 226, 0.25);
  letter-spacing: 1.5px;
  user-select: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
  position: relative;
  animation: subtleGlow 3s ease-in-out infinite alternate;
}

@keyframes subtleGlow {
  0% {
    text-shadow: 0 0 20px rgba(138, 43, 226, 0.25), 0 0 30px rgba(138, 43, 226, 0.1);
  }
  100% {
    text-shadow: 0 0 25px rgba(138, 43, 226, 0.35), 0 0 40px rgba(138, 43, 226, 0.15);
  }
}

.title-underline {
  height: 2px;
  background: linear-gradient(90deg, transparent, #b813ff, #d86eff, #EC4899, transparent);
  margin: 0.5rem auto;
  width: 60%;
  opacity: 0.8;
}

.subtitle-text {
  font-family: 'Courier New', monospace;
  font-size: 1.3rem;
  color: rgba(230, 230, 245, 0.9);
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-shadow: 
    0 0 10px rgba(138, 43, 226, 0.4),
    0 1px 3px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.subtitle-prefix {
  color: #8A2BE2;
  margin-right: 0.5rem;
}

.cursor-blink {
  animation: blink 1s infinite;
  color: #8A2BE2;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@media (max-width: 768px) {
  .title-glitch {
    font-size: 2.5rem;
  }
  
  .subtitle-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .title-glitch {
    font-size: 2rem;
  }
  
  .subtitle-text {
    font-size: 1rem;
  }
}
</style>
