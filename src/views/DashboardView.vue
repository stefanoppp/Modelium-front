<template>
  <div class="dashboard-container">
    <NavBar />
    
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

    <!-- Bienvenida galáctica -->
    <div class="galactic-welcome">
      <div class="cosmic-aura"></div>
      <div class="welcome-content">
        <div class="title-container">
          <h1 class="galactic-title">
            <span class="greeting-glow">{{ greeting }}, {{ currentUser?.first_name || currentUser?.username }}</span>
          </h1>
          <div class="title-underline"></div>
        </div>
      </div>
    </div>

    <!-- Subtítulo separado -->
    <div class="subtitle-section">
      <p class="cosmic-subtitle">
        <span class="subtitle-text">Explora las infinitas posibilidades de la IA</span>
      </p>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <div class="container">
        
        <!-- Estadísticas resumidas -->
        <div class="stats-overview">
          <div class="stat-card" @click="navigateToModels">
            <div class="stat-icon">
              <i class="pi pi-cog"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ modelStats.total }}</div>
              <div class="stat-label">Modelos Totales</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon training">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ modelStats.training }}</div>
              <div class="stat-label">Entrenando</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon completed">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ modelStats.completed }}</div>
              <div class="stat-label">Completados</div>
            </div>
          </div>
        </div>

        <!-- Acciones principales -->
        <div class="main-actions">
          <div class="action-card primary" @click="navigateToCreateModel">
            <div class="action-icon">
              <i class="pi pi-plus"></i>
            </div>
            <div class="action-content">
              <h3>Crear Nuevo Modelo</h3>
              <p>Entrena un modelo personalizado con tus datos</p>
            </div>
          </div>
          
          <div class="action-card" @click="navigateToModels">
            <div class="action-icon">
              <i class="pi pi-list"></i>
            </div>
            <div class="action-content">
              <h3>Ver Mis Modelos</h3>
              <p>Gestiona y monitorea tus modelos existentes</p>
            </div>
          </div>

          <div class="action-card" @click="navigateToPredictions">
            <div class="action-icon">
              <i class="pi pi-calculator"></i>
            </div>
            <div class="action-content">
              <h3>Hacer Predicciones</h3>
              <p>Utiliza tus modelos entrenados para realizar predicciones</p>
            </div>
          </div>

          <div class="action-card" @click="navigateToCompareModels">
            <div class="action-icon">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div class="action-content">
              <h3>Comparar Modelos</h3>
              <p>Analiza y compara el rendimiento de tus modelos</p>
            </div>
          </div>
        </div>

        <!-- Modelos recientes (si los hay) -->
        <div v-if="recentModels.length > 0" class="recent-models">
          <h2 class="section-title">Actividad Reciente</h2>
          <div class="models-list">
            <div 
              v-for="model in recentModels" 
              :key="model.id"
              class="model-item"
              @click="navigateToModel(model.id)"
            >
              <div class="model-status" :class="getStatusClass(model.status)">
                <i :class="getStatusIcon(model.status)"></i>
              </div>
              <div class="model-info">
                <h4>{{ model.name }}</h4>
                <p>{{ model.description }}</p>
                <span class="model-date">{{ formatDate(model.created_at) }}</span>
              </div>
              <div class="model-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: model.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ model.progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje para usuarios sin modelos -->
        <div v-if="modelStats.total === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h3>¡Comienza tu primer modelo!</h3>
          <p>Crea tu primer modelo de IA en solo unos minutos</p>
          <TechButton 
            label="Crear Modelo" 
            icon="pi pi-plus"
            @click="navigateToCreateModel"
            class="primary-btn"
          />
        </div>

      </div>
    </div>
  </div>
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
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
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
.dashboard-container {
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

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(75, 0, 130, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 70% 30%, rgba(25, 25, 112, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 40% 70%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(72, 61, 139, 0.08) 0%, transparent 55%);
  animation: cosmicBreath 30s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes cosmicBreath {
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1) rotate(0deg);
  }
  25% { 
    opacity: 0.8;
    transform: scale(1.02) rotate(1deg);
  }
  50% { 
    opacity: 0.4;
    transform: scale(0.98) rotate(-1deg);
  }
  75% { 
    opacity: 0.7;
    transform: scale(1.01) rotate(0.5deg);
  }
}

/* Fondo galáctico */
.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
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
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(80px, 80px) rotate(360deg); }
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

/* Posicionamiento aleatorio de estrellas */
.star:nth-child(1) { top: 5%; left: 10%; animation-delay: 0s; }
.star:nth-child(2) { top: 15%; left: 85%; animation-delay: -0.3s; }
.star:nth-child(3) { top: 25%; left: 45%; animation-delay: -0.6s; }
.star:nth-child(4) { top: 35%; left: 20%; animation-delay: -0.9s; }
.star:nth-child(5) { top: 45%; left: 70%; animation-delay: -1.2s; }
.star:nth-child(6) { top: 55%; left: 35%; animation-delay: -1.5s; }
.star:nth-child(7) { top: 65%; left: 80%; animation-delay: -1.8s; }
.star:nth-child(8) { top: 75%; left: 15%; animation-delay: -2.1s; }
.star:nth-child(9) { top: 85%; left: 60%; animation-delay: -2.4s; }
.star:nth-child(10) { top: 95%; left: 40%; animation-delay: -2.7s; }
.star:nth-child(11) { top: 8%; left: 65%; animation-delay: -0.15s; }
.star:nth-child(12) { top: 18%; left: 25%; animation-delay: -0.45s; }
.star:nth-child(13) { top: 28%; left: 90%; animation-delay: -0.75s; }
.star:nth-child(14) { top: 38%; left: 5%; animation-delay: -1.05s; }
.star:nth-child(15) { top: 48%; left: 55%; animation-delay: -1.35s; }
.star:nth-child(16) { top: 58%; left: 30%; animation-delay: -1.65s; }
.star:nth-child(17) { top: 68%; left: 75%; animation-delay: -1.95s; }
.star:nth-child(18) { top: 78%; left: 12%; animation-delay: -2.25s; }
.star:nth-child(19) { top: 88%; left: 88%; animation-delay: -2.55s; }
.star:nth-child(20) { top: 98%; left: 52%; animation-delay: -2.85s; }

/* Estrellas adicionales con diferentes tamaños */
.star:nth-child(n+21):nth-child(-n+40) {
  width: 1px;
  height: 1px;
  opacity: 0.6;
}

.star:nth-child(n+41):nth-child(-n+80) {
  width: 1.5px;
  height: 1.5px;
  opacity: 0.4;
}

.star:nth-child(n+81):nth-child(-n+120) {
  width: 2.5px;
  height: 2.5px;
  opacity: 0.8;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.star:nth-child(n+121):nth-child(-n+150) {
  width: 3px;
  height: 3px;
  opacity: 0.9;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.9);
  animation-duration: 4s;
}

/* Distribución aleatoria para todas las estrellas */
.star:nth-child(21) { top: 12%; left: 78%; }
.star:nth-child(22) { top: 22%; left: 33%; }
.star:nth-child(23) { top: 32%; left: 67%; }
.star:nth-child(24) { top: 42%; left: 22%; }
.star:nth-child(25) { top: 52%; left: 83%; }
.star:nth-child(26) { top: 62%; left: 38%; }
.star:nth-child(27) { top: 72%; left: 58%; }
.star:nth-child(28) { top: 82%; left: 18%; }
.star:nth-child(29) { top: 92%; left: 73%; }
.star:nth-child(30) { top: 7%; left: 48%; }
.star:nth-child(31) { top: 17%; left: 92%; }
.star:nth-child(32) { top: 27%; left: 8%; }
.star:nth-child(33) { top: 37%; left: 62%; }
.star:nth-child(34) { top: 47%; left: 28%; }
.star:nth-child(35) { top: 57%; left: 87%; }
.star:nth-child(36) { top: 67%; left: 43%; }
.star:nth-child(37) { top: 77%; left: 77%; }
.star:nth-child(38) { top: 87%; left: 23%; }
.star:nth-child(39) { top: 97%; left: 68%; }
.star:nth-child(40) { top: 3%; left: 38%; }

/* Continúa con más estrellas... */
.star:nth-child(n+41) {
  top: calc(var(--random-top, 50) * 1%);
  left: calc(var(--random-left, 50) * 1%);
}

/* Efectos especiales para algunas estrellas */
.star:nth-child(10n) {
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: scale(1.5);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 255, 255, 1);
  }
}

.star:nth-child(7n) {
  animation: starShimmer 1.5s ease-in-out infinite;
}

@keyframes starShimmer {
  0%, 100% { 
    opacity: 0.3;
  }
  50% { 
    opacity: 1;
  }
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
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

.energy-stream:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.energy-stream:nth-child(2) {
  top: 50%;
  right: 15%;
  animation-delay: -2s;
}

.energy-stream:nth-child(3) {
  bottom: 30%;
  left: 70%;
  animation-delay: -4s;
}

.energy-stream:nth-child(4) {
  top: 10%;
  right: 40%;
  animation-delay: -6s;
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

.particle:nth-child(odd) {
  background: rgba(75, 0, 130, 0.8);
  box-shadow: 
    0 0 10px rgba(75, 0, 130, 0.6),
    0 0 20px rgba(75, 0, 130, 0.4),
    0 0 30px rgba(75, 0, 130, 0.2);
}

.particle:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { top: 20%; left: 80%; animation-delay: 2s; }
.particle:nth-child(3) { top: 60%; left: 20%; animation-delay: 4s; }
.particle:nth-child(4) { top: 40%; left: 90%; animation-delay: 6s; }
.particle:nth-child(5) { top: 80%; left: 70%; animation-delay: 8s; }
.particle:nth-child(6) { top: 30%; left: 50%; animation-delay: 10s; }
.particle:nth-child(7) { top: 70%; left: 30%; animation-delay: 12s; }
.particle:nth-child(8) { top: 50%; left: 85%; animation-delay: 14s; }

/* Sección de bienvenida galáctica */
.galactic-welcome {
  padding: 8rem 0 4rem;
  text-align: center;
  position: relative;
  z-index: 2;
  background: 
    radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.1) 0%, transparent 60%),
    radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.08) 0%, transparent 50%);
}

.cosmic-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(138, 43, 226, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  animation: auraBreath 15s ease-in-out infinite;
}

@keyframes auraBreath {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

.welcome-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
}

.title-container {
  position: relative;
  margin-bottom: 2rem;
}

.galactic-title {
  font-size: 3.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.greeting-glow {
  display: inline;
  background: linear-gradient(135deg, #00D4FF, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
  animation: titleGlow 4s ease-in-out infinite;
  white-space: nowrap;
}

@keyframes titleGlow {
  0%, 100% { 
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
    filter: brightness(1);
  }
  50% { 
    text-shadow: 0 0 40px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.4);
    filter: brightness(1.2);
  }
}

.title-underline {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.8), transparent);
  animation: underlineGlow 3s ease-in-out infinite;
}

@keyframes underlineGlow {
  0%, 100% { 
    opacity: 0.6;
    transform: translateX(-50%) scaleX(1);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scaleX(1.2);
  }
}

/* Sección del subtítulo */
.subtitle-section {
  text-align: center;
  padding: 2rem 0 3rem;
  position: relative;
  z-index: 3;
}

.cosmic-subtitle {
  font-size: 1.3rem;
  color: #b1b8d4;
  margin: 0;
  position: relative;
  text-shadow: 0 0 20px rgba(177, 184, 212, 0.3);
}

.subtitle-text {
  display: inline-block;
  animation: subtitleFloat 6s ease-in-out infinite;
}

@keyframes subtitleFloat {
  0%, 100% { 
    transform: translateY(0);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* Contenido principal */
.main-content {
  position: relative;
  z-index: 2;
  padding: 3rem 0 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Estadísticas */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #00D4FF;
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

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 400;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Acciones principales */
.main-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.action-card {
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 16px;
  padding: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.15);
}

.action-card.primary {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1));
  border-color: rgba(0, 212, 255, 0.3);
}

.action-card.primary:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15));
  box-shadow: 0 15px 40px rgba(0, 212, 255, 0.2);
}

.action-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #00D4FF;
  flex-shrink: 0;
}

.action-content h3 {
  font-size: 1.3rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: white;
}

.action-content p {
  color: #b1b8d4;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Sección de pruebas (solo desarrollo) */
.test-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 100, 100, 0.05);
  border: 1px solid rgba(255, 100, 100, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.test-card {
  text-align: center;
}

.test-header h3 {
  color: #ff6464;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.test-header p {
  color: #b1b8d4;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.test-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.test-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 200px;
}

.test-button.danger {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
  border: 1px solid rgba(255, 100, 100, 0.3);
}

.test-button.danger:hover {
  background: rgba(255, 100, 100, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 100, 100, 0.2);
}

/* Modelos recientes */
.recent-models {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: white;
  border-bottom: 1px solid rgba(120, 119, 198, 0.2);
  padding-bottom: 0.5rem;
}

.models-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.model-item {
  background: rgba(30, 30, 50, 0.6);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.model-item:hover {
  background: rgba(30, 30, 50, 0.8);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateX(5px);
}

.model-status {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
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

.model-info {
  flex: 1;
}

.model-info h4 {
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
  color: white;
}

.model-info p {
  color: #b1b8d4;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.model-date {
  color: #94a3b8;
  font-size: 0.75rem;
}

.model-progress {
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
  background: linear-gradient(90deg, #00D4FF, #8B5CF6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #94a3b8;
  min-width: 35px;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(30, 30, 50, 0.6);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 4rem;
  color: #00D4FF;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  color: white;
}

.empty-state p {
  color: #b1b8d4;
  margin-bottom: 2rem;
  font-size: 1rem;
}

/* Animaciones */
@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

@keyframes particleFloat {
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

/* Responsive */
@media (max-width: 768px) {
  .galactic-title {
    font-size: 2.5rem;
    white-space: normal;
    overflow: visible;
    text-overflow: inherit;
  }
  
  .welcome-title {
    font-size: 2.2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .main-actions {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card,
  .action-card {
    padding: 1.5rem;
  }
  
  .action-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .model-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .model-progress {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .progress-bar {
    flex: 1;
    margin-right: 0.5rem;
  }
}

@media (max-width: 480px) {
  .galactic-title {
    font-size: 2rem;
    white-space: normal;
    overflow: visible;
    text-overflow: inherit;
  }
  
  .welcome-section {
    padding: 6rem 0 3rem;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .action-content h3 {
    font-size: 1.1rem;
  }
  
  .action-content p {
    font-size: 0.8rem;
  }
}

.particle:nth-child(5) {
  top: 20%;
  left: 80%;
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

/* Bienvenida Misteriosa */
.mysterious-welcome {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
  overflow: hidden;
}

.welcome-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    transparent 50%,
    rgba(0, 212, 255, 0.03) 50%
  );
  background-size: 100% 4px;
  animation: scanlines 2s linear infinite;
}

.glitch-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.02) 50%, transparent 100%);
  animation: glitch 8s ease-in-out infinite;
}

.welcome-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.mysterious-greeting {
  margin-bottom: 4rem;
}

.mysterious-title {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  margin: 0 0 2rem 0;
  line-height: 1.2;
}

.title-line {
  display: block;
  font-size: 2.5rem;
  color: #64748b;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.title-name {
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.mysterious-subtitle {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  color: #00d4ff;
  min-height: 2em;
  height: 2em;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 20px;
  position: relative;
}

.typewriter-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.typewriter-text {
  display: inline-block;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.access-portal {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.access-portal:hover {
  transform: scale(1.05);
}

.portal-ring {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 212, 255, 0.3);
  background: radial-gradient(circle at center, rgba(0, 212, 255, 0.1), transparent);
  /* Removido: animation: portalRotate 20s linear infinite; */
}

.inner-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px solid rgba(139, 92, 246, 0.4);
  animation: portalRotate 15s linear infinite reverse;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(0, 212, 255, 0.1);
  animation: pulseRing 2s ease-in-out infinite;
}

.portal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.portal-icon {
  font-size: 2rem;
  color: #00d4ff;
  margin-bottom: 0.5rem;
  animation: iconPulse 2s ease-in-out infinite;
}

.portal-text {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Mini Stats */
.mini-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-item {
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-item:hover {
  border-color: rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 100px;
}

.quick-action:hover {
  border-color: rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.1);
}

.quick-action i {
  font-size: 1.5rem;
  color: #00d4ff;
}

.quick-action span {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Animaciones */
@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

@keyframes glitch {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px); }
  20% { transform: translateX(2px); }
  30% { transform: translateX(-1px); }
  40% { transform: translateX(1px); }
  50% { transform: translateX(0); }
}

@keyframes titleGlow {
  0% { text-shadow: 0 0 40px rgba(0, 212, 255, 0.3); }
  100% { text-shadow: 0 0 60px rgba(0, 212, 255, 0.5), 0 0 80px rgba(139, 92, 246, 0.3); }
}

@keyframes portalRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulseRing {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.7;
  }
  25% { 
    transform: translateY(-20px) translateX(10px) scale(1.1);
    opacity: 0.9;
  }
  50% { 
    transform: translateY(-35px) translateX(-15px) scale(1.2);
    opacity: 1;
  }
  75% { 
    transform: translateY(-20px) translateX(5px) scale(1.1);
    opacity: 0.9;
  }
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Responsive */
@media (max-width: 768px) {
  .mysterious-welcome {
    min-height: 70vh;
    padding: 1rem;
  }
  
  .mysterious-title .title-line {
    font-size: 1.8rem;
  }
  
  .mysterious-title .title-name {
    font-size: 2.5rem;
  }
  
  .mysterious-subtitle {
    font-size: 1rem;
    padding: 0 15px;
  }
  
  .typewriter-container {
    justify-content: center;
    width: 100%;
    max-width: 100%;
  }
  
  .typewriter-text {
    font-size: 0.9rem;
    max-width: calc(100vw - 60px);
  }
  
  .portal-ring {
    width: 150px;
    height: 150px;
  }
  
  .inner-ring {
    width: 120px;
    height: 120px;
  }
  
  .pulse-ring {
    width: 80px;
    height: 80px;
  }
  
  .portal-icon {
    font-size: 1.5rem;
  }
  
  .mini-stats {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .quick-action {
    min-width: 80px;
    padding: 1rem;
  }
}

/* Breakpoint para pantallas muy pequeñas */
@media (max-width: 480px) {
  .mysterious-subtitle {
    font-size: 0.9rem;
    padding: 0 10px;
  }
  
  .typewriter-text {
    font-size: 0.8rem;
    max-width: calc(100vw - 40px);
    word-break: break-word;
  }
  
  .typewriter-container {
    padding: 0 5px;
  }
}
</style>
