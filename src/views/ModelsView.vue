<template>
  <div class="models-view">
    <NavBar />

    <!-- Header -->
    <div class="models-header">
      <div class="header-background">
        <div class="grid-pattern"></div>
        <div class="floating-elements">
          <div class="floating-element" v-for="i in 10" :key="i"></div>
        </div>
        <!-- Estrellas -->
        <div class="stars-container">
          <div class="star" v-for="i in 150" :key="'star-' + i"></div>
        </div>
      </div>

      <div class="container">
        <h1 class="models-title">Mis Modelos</h1>
        <p class="models-description">Gestiona y monitorea todos tus modelos de IA entrenados</p>
        <div class="models-stats">
          <div class="stat-item">
            <span class="stat-number">{{ modelsData.count || 0 }}</span>
            <span class="stat-label">Modelos Totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ completedModels.length }}</span>
            <span class="stat-label">Completados</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ publicModels.length }}</span>
            <span class="stat-label">Públicos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <div class="models-content">
        <!-- Loading state -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Cargando modelos...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <i class="pi pi-exclamation-triangle error-icon"></i>
          <h3 class="error-title">Error al cargar modelos</h3>
          <p class="error-message">{{ error }}</p>
          <div class="error-actions">
            <TechButton
              label="Reintentar"
              icon="pi pi-refresh"
              @click="loadModels"
              class="retry-btn"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!modelsData.models || modelsData.models.length === 0"
          class="empty-container"
        >
          <i class="pi pi-inbox empty-icon"></i>
          <h3 class="empty-title">No tienes modelos aún</h3>
          <p class="empty-message">¡Comienza creando tu primer modelo de IA!</p>
          <TechButton
            label="Crear Modelo"
            icon="pi pi-plus"
            @click="createModel"
            class="create-btn"
          />
        </div>

        <!-- Models grid -->
        <div v-else class="models-grid">
          <div
            v-for="model in modelsData.models"
            :key="model.id"
            class="model-card"
            @click="selectModel(model)"
          >
            <!-- Card header -->
            <div class="card-header">
              <div class="model-status" :class="getStatusClass(model.status)">
                <i :class="getStatusIcon(model.status)"></i>
                <span>{{ getStatusLabel(model.status) }}</span>
              </div>
              <div class="model-visibility">
                <i :class="model.is_public ? 'pi pi-globe' : 'pi pi-lock'"></i>
                <span>{{ model.is_public ? 'Público' : 'Privado' }}</span>
              </div>
            </div>

            <!-- Card content -->
            <div class="card-content">
              <div class="content-top">
                <h3 class="model-name">{{ model.name }}</h3>
                <p class="model-description">{{ model.description }}</p>

                <!-- Model type badge -->
                <div class="model-type-badge">
                  <i class="pi pi-tag"></i>
                  <span>{{ getTaskTypeLabel(model.task_type) }}</span>
                </div>

                <!-- Model details -->
                <div class="model-details">
                  <div class="detail-item">
                    <i class="pi pi-database"></i>
                    <span>Dataset: {{ model.dataset_name }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-chart-bar"></i>
                    <span>Features: {{ model.features_count }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-bullseye"></i>
                    <span>Target: {{ model.target_column }}</span>
                  </div>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="progress-container">
                <div class="progress-info">
                  <span class="progress-label">Progreso</span>
                  <span class="progress-value">{{ model.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: model.progress + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Card footer -->
            <div class="card-footer">
              <span class="model-date">{{ formatDate(model.created_at) }}</span>
              <i class="pi pi-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TechButton from '@/components/ui/TechButton.vue'
import NavBar from '@/components/layout/NavBar.vue'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const modelsData = ref({ count: 0, models: [] })
const isLoading = ref(true)
const error = ref(null)
const debugInfo = ref(null)

// Computed properties
const completedModels = computed(
  () => modelsData.value.models?.filter((model) => model.status === 'completed') || [],
)

const publicModels = computed(
  () => modelsData.value.models?.filter((model) => model.is_public) || [],
)

// Methods
const loadModels = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Obtener token del authService
    const token = authService.getToken()
    if (!token) {
      throw new Error('No hay token de autenticación disponible')
    }

    console.log('Cargando modelos con token:', token ? 'Disponible' : 'No disponible')

    const response = await fetch('http://localhost:8000/api/models/my_models/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Error response:', errorData)
      throw new Error(`Error al cargar los modelos: ${response.status}`)
    }

    const data = await response.json()
    modelsData.value = data
    console.log('Modelos cargados exitosamente:', data)
  } catch (err) {
    error.value = err.message
    console.error('Error loading models:', err)
  } finally {
    isLoading.value = false
  }
}

const selectModel = (model) => {
  console.log('Modelo seleccionado:', model)
  console.log('Navegando a:', `/models/${model.id}`)
  router.push({ name: 'model-detail', params: { id: model.id } })
}

const createModel = () => {
  // Navegar a la vista de creación de modelos
  router.push('/create-model')
}

const getStatusClass = (status) => {
  const classes = {
    completed: 'status-completed',
    training: 'status-training',
    pending: 'status-pending',
    failed: 'status-failed',
  }
  return classes[status] || 'status-unknown'
}

const getStatusIcon = (status) => {
  const icons = {
    completed: 'pi pi-check-circle',
    training: 'pi pi-spin pi-spinner',
    pending: 'pi pi-clock',
    failed: 'pi pi-times-circle',
  }
  return icons[status] || 'pi pi-question-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: 'Completado',
    training: 'Entrenando',
    pending: 'Pendiente',
    failed: 'Fallido',
  }
  return labels[status] || 'Desconocido'
}

const getTaskTypeLabel = (taskType) => {
  const labels = {
    classification: 'Clasificación',
    regression: 'Regresión',
    clustering: 'Clustering',
  }
  return labels[taskType] || taskType
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(async () => {
  // Verificar autenticación
  const token = authService.getToken()
  if (!token || !authStore.isAuthenticated) {
    console.warn('Usuario no autenticado, redirigiendo al login')
    router.push('/auth/login')
    return
  }

  // Esperar un poco para asegurar que el token esté disponible
  await new Promise((resolve) => setTimeout(resolve, 100))

  loadModels()
})
</script>

<style scoped>
/* Global scroll fixes */
* {
  scroll-behavior: smooth;
}

body,
html {
  overflow-x: hidden;
}

.models-view {
  min-height: 100vh;
  background:
    linear-gradient(
      135deg,
      #000000 0%,
      #0a0a0f 20%,
      #0f0f1a 40%,
      #1a1a2e 60%,
      #16213e 80%,
      #0e1a2e 100%
    ),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.2) 0%, transparent 60%),
    radial-gradient(circle at 85% 75%, rgba(25, 25, 112, 0.18) 0%, transparent 55%),
    radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 70%),
    radial-gradient(circle at 30% 80%, rgba(72, 61, 139, 0.12) 0%, transparent 65%),
    radial-gradient(circle at 70% 20%, rgba(102, 51, 153, 0.1) 0%, transparent 50%);
  color: white;
  position: relative;
  overflow-x: hidden;
}

.models-view::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(75, 0, 130, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(25, 25, 112, 0.06) 0%, transparent 45%),
    radial-gradient(circle at 70% 80%, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 30% 70%, rgba(72, 61, 139, 0.04) 0%, transparent 55%);
  animation: galaxyBreath 25s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes galaxyBreath {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  33% {
    opacity: 0.8;
    transform: scale(1.02);
  }
  66% {
    opacity: 0.6;
    transform: scale(0.98);
  }
}

.models-header {
  padding: 8rem 0 4rem;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.98) 0%,
      rgba(5, 5, 15, 0.96) 50%,
      rgba(10, 10, 20, 0.94) 100%
    ),
    radial-gradient(circle at 25% 25%, rgba(75, 0, 130, 0.18) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(25, 25, 112, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.12) 0%, transparent 60%);
  z-index: 2;
  border-bottom: 1px solid rgba(75, 0, 130, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: gridMove 20s linear infinite;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-element {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.floating-element:nth-child(1) {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}
.floating-element:nth-child(2) {
  top: 55%;
  left: 20%;
  animation-delay: 2s;
}
.floating-element:nth-child(3) {
  top: 35%;
  left: 80%;
  animation-delay: 4s;
}
.floating-element:nth-child(4) {
  top: 75%;
  left: 70%;
  animation-delay: 6s;
}
.floating-element:nth-child(5) {
  top: 20%;
  left: 60%;
  animation-delay: 1s;
}
.floating-element:nth-child(6) {
  top: 65%;
  left: 40%;
  animation-delay: 3s;
}
.floating-element:nth-child(7) {
  top: 25%;
  left: 30%;
  animation-delay: 5s;
}
.floating-element:nth-child(8) {
  top: 85%;
  left: 85%;
  animation-delay: 7s;
}
.floating-element:nth-child(9) {
  top: 10%;
  left: 50%;
  animation-delay: 2.5s;
}
.floating-element:nth-child(10) {
  top: 45%;
  left: 15%;
  animation-delay: 4.5s;
}

/* Estrellas */
.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(138, 43, 226, 0.8);
  border-radius: 50%;
  animation: starTwinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(138, 43, 226, 0.6);
}

.star:nth-child(odd) {
  animation-delay: 1s;
  background: rgba(147, 51, 234, 0.9);
  box-shadow: 0 0 8px rgba(147, 51, 234, 0.7);
}

.star:nth-child(3n) {
  animation-delay: 2s;
  background: rgba(124, 58, 237, 0.7);
  box-shadow: 0 0 4px rgba(124, 58, 237, 0.5);
}

.star:nth-child(5n) {
  animation-delay: 0.5s;
  background: rgba(99, 102, 241, 0.8);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
}

.star:nth-child(7n) {
  width: 3px;
  height: 3px;
  background: rgba(168, 85, 247, 0.9);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.8);
}

@keyframes starTwinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Distribución aleatoria de estrellas */
.star:nth-child(1) {
  top: 5%;
  left: 10%;
}
.star:nth-child(2) {
  top: 15%;
  left: 25%;
}
.star:nth-child(3) {
  top: 8%;
  left: 60%;
}
.star:nth-child(4) {
  top: 20%;
  left: 80%;
}
.star:nth-child(5) {
  top: 35%;
  left: 5%;
}
.star:nth-child(6) {
  top: 25%;
  left: 40%;
}
.star:nth-child(7) {
  top: 45%;
  left: 70%;
}
.star:nth-child(8) {
  top: 55%;
  left: 15%;
}
.star:nth-child(9) {
  top: 65%;
  left: 90%;
}
.star:nth-child(10) {
  top: 75%;
  left: 35%;
}
.star:nth-child(11) {
  top: 85%;
  left: 55%;
}
.star:nth-child(12) {
  top: 95%;
  left: 20%;
}
.star:nth-child(13) {
  top: 12%;
  left: 45%;
}
.star:nth-child(14) {
  top: 32%;
  left: 85%;
}
.star:nth-child(15) {
  top: 42%;
  left: 12%;
}
.star:nth-child(16) {
  top: 52%;
  left: 88%;
}
.star:nth-child(17) {
  top: 62%;
  left: 8%;
}
.star:nth-child(18) {
  top: 72%;
  left: 95%;
}
.star:nth-child(19) {
  top: 82%;
  left: 28%;
}
.star:nth-child(20) {
  top: 92%;
  left: 75%;
}
.star:nth-child(21) {
  top: 18%;
  left: 65%;
}
.star:nth-child(22) {
  top: 28%;
  left: 22%;
}
.star:nth-child(23) {
  top: 38%;
  left: 78%;
}
.star:nth-child(24) {
  top: 48%;
  left: 32%;
}
.star:nth-child(25) {
  top: 58%;
  left: 68%;
}
.star:nth-child(26) {
  top: 68%;
  left: 18%;
}
.star:nth-child(27) {
  top: 78%;
  left: 82%;
}
.star:nth-child(28) {
  top: 88%;
  left: 42%;
}
.star:nth-child(29) {
  top: 98%;
  left: 8%;
}
.star:nth-child(30) {
  top: 2%;
  left: 52%;
}

/* Continuar con más estrellas distribuidas aleatoriamente */
.star:nth-child(n + 31) {
  top: calc(var(--random-y, 50) * 1%);
  left: calc(var(--random-x, 50) * 1%);
}

/* Más distribuciones específicas para llenar el cielo */
.star:nth-child(31) {
  top: 3%;
  left: 77%;
}
.star:nth-child(32) {
  top: 13%;
  left: 33%;
}
.star:nth-child(33) {
  top: 23%;
  left: 92%;
}
.star:nth-child(34) {
  top: 33%;
  left: 47%;
}
.star:nth-child(35) {
  top: 43%;
  left: 7%;
}
.star:nth-child(36) {
  top: 53%;
  left: 62%;
}
.star:nth-child(37) {
  top: 63%;
  left: 27%;
}
.star:nth-child(38) {
  top: 73%;
  left: 87%;
}
.star:nth-child(39) {
  top: 83%;
  left: 13%;
}
.star:nth-child(40) {
  top: 93%;
  left: 67%;
}
.star:nth-child(41) {
  top: 6%;
  left: 37%;
}
.star:nth-child(42) {
  top: 16%;
  left: 72%;
}
.star:nth-child(43) {
  top: 26%;
  left: 17%;
}
.star:nth-child(44) {
  top: 36%;
  left: 97%;
}
.star:nth-child(45) {
  top: 46%;
  left: 41%;
}
.star:nth-child(46) {
  top: 56%;
  left: 6%;
}
.star:nth-child(47) {
  top: 66%;
  left: 76%;
}
.star:nth-child(48) {
  top: 76%;
  left: 31%;
}
.star:nth-child(49) {
  top: 86%;
  left: 91%;
}
.star:nth-child(50) {
  top: 96%;
  left: 46%;
}

.models-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
}

@keyframes headerFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-5px) scale(1.01);
    opacity: 1;
  }
}

@keyframes starsFloat {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(-50px) translateY(-25px);
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
}

.models-title {
  font-size: 4rem;
  font-weight: 200;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    #4b0082 0%,
    #8a2be2 25%,
    #9400d3 50%,
    #8b5cf6 75%,
    #ec4899 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 4;
  text-shadow: 0 0 40px rgba(138, 43, 226, 0.5);
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%,
  100% {
    text-shadow: 0 0 40px rgba(138, 43, 226, 0.5);
  }
  50% {
    text-shadow:
      0 0 60px rgba(138, 43, 226, 0.7),
      0 0 80px rgba(138, 43, 226, 0.4);
  }
}

.models-description {
  font-size: 1.4rem;
  color: rgba(200, 200, 220, 0.9);
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  z-index: 4;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.7);
  font-weight: 300;
  letter-spacing: 0.5px;
  animation: descriptionFloat 4s ease-in-out infinite;
}

@keyframes descriptionFloat {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-2px);
    opacity: 1;
  }
}

.models-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 4;
}

.stat-item {
  text-align: center;
  padding: 2rem 2.5rem;
  background:
    linear-gradient(135deg, rgba(75, 0, 130, 0.15) 0%, rgba(25, 25, 112, 0.12) 100%),
    rgba(10, 10, 20, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(138, 43, 226, 0.3);
  backdrop-filter: blur(15px);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.2) 0%, transparent 70%),
    linear-gradient(135deg, rgba(75, 0, 130, 0.15), rgba(25, 25, 112, 0.1));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.stat-item:hover::before {
  opacity: 1;
}

.stat-item:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(138, 43, 226, 0.6);
  box-shadow: 0 15px 35px rgba(138, 43, 226, 0.3);
}

.stat-number {
  font-size: 3rem;
  font-weight: 600;
  color: #8a2be2;
  display: block;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 25px rgba(138, 43, 226, 0.6);
  animation: numberPulse 2s ease-in-out infinite;
}

@keyframes numberPulse {
  0%,
  100% {
    transform: scale(1);
    text-shadow: 0 0 25px rgba(138, 43, 226, 0.6);
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 0 35px rgba(138, 43, 226, 0.8);
  }
}

.stat-label {
  font-size: 1rem;
  color: rgba(200, 200, 220, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 2;
  font-weight: 500;
}

.models-content {
  padding: 3rem 0 6rem;
  position: relative;
  z-index: 2;
}

.models-content::before {
  content: '';
  position: absolute;
  top: -2rem;
  left: 0;
  right: 0;
  height: 4rem;
  background: linear-gradient(180deg, rgba(120, 119, 198, 0.03) 0%, transparent 100%);
  pointer-events: none;
}

/* Loading, Error, Empty states */
.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 4rem 2rem;
  background:
    linear-gradient(135deg, rgba(75, 0, 130, 0.1) 0%, rgba(25, 25, 112, 0.08) 100%),
    rgba(10, 10, 20, 0.9);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 20px;
  margin: 2rem 0;
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.loading-container::before,
.error-container::before,
.empty-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(75, 0, 130, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(138, 43, 226, 0.3);
  border-top: 4px solid #8a2be2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
}

.loading-text {
  font-size: 1.1rem;
  color: #b1b8d4;
  position: relative;
  z-index: 2;
}

.error-icon,
.empty-icon {
  font-size: 3.5rem;
  color: #8a2be2;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 20px rgba(138, 43, 226, 0.6);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(138, 43, 226, 0.6);
  }
  50% {
    transform: scale(1.1);
    text-shadow: 0 0 30px rgba(138, 43, 226, 0.8);
  }
}

.error-title,
.empty-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.error-message,
.empty-message {
  color: #b1b8d4;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

/* Models grid - mantener colores originales de las tarjetas */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Responsive adjustments for model cards */
@media (max-width: 768px) {
  .models-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .model-card {
    height: auto;
    min-height: 480px;
  }
}

.model-card {
  background:
    linear-gradient(135deg, rgba(75, 0, 130, 0.1) 0%, rgba(25, 25, 112, 0.08) 100%),
    rgba(10, 10, 20, 0.9);
  border: 1px solid rgba(138, 43, 226, 0.25);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  position: relative;
  height: 520px; /* Altura fija para todas las tarjetas */
  display: flex;
  flex-direction: column;
}

.model-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.model-card:hover::before {
  opacity: 1;
}

.model-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(138, 43, 226, 0.5);
  box-shadow: 0 15px 40px rgba(138, 43, 226, 0.3);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.model-visibility {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #b1b8d4;
}

.status-completed {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-training {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.status-pending {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.status-failed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.content-top {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.model-name {
  font-size: 1.3rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.model-description {
  color: #b1b8d4;
  margin-bottom: 1rem;
  line-height: 1.5;
  max-height: 4.5em; /* Limitar a 3 líneas */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.model-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(120, 119, 198, 0.2);
  color: #d8b4fe;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  width: fit-content;
  max-width: 100%;
  border: 1px solid rgba(120, 119, 198, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(120, 119, 198, 0.1);
  transition: all 0.3s ease;
}

.model-card:hover .model-type-badge {
  background: rgba(120, 119, 198, 0.3);
  border-color: rgba(120, 119, 198, 0.5);
  box-shadow: 0 4px 12px rgba(120, 119, 198, 0.2);
  transform: translateY(-1px);
}

.model-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #b1b8d4;
}

.detail-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.detail-item i {
  width: 16px;
  color: #00d4ff;
}

.progress-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-top: auto; /* Empuja el progreso hacia abajo */
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.progress-label {
  color: #94a3b8;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-value {
  color: #00d4ff;
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #94a3b8;
}

.model-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Partículas flotantes galácticas */
.models-view::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 30%, rgba(138, 43, 226, 0.15) 1px, transparent 1px),
    radial-gradient(circle at 20% 80%, rgba(75, 0, 130, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 90% 70%, rgba(25, 25, 112, 0.12) 1px, transparent 1px),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 60% 90%, rgba(138, 43, 226, 0.1) 1px, transparent 1px);
  background-size:
    100px 100px,
    150px 150px,
    200px 200px,
    120px 120px,
    180px 180px,
    160px 160px;
  background-position:
    0 0,
    50px 50px,
    100px 100px,
    25px 75px,
    75px 25px,
    125px 125px;
  animation: galaxyFloat 30s linear infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes galaxyFloat {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(-50px) translateY(-30px);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .container {
    padding: 0 1.5rem;
  }

  .models-stats {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .models-header {
    padding: 6rem 0 3rem;
  }

  .models-title {
    font-size: 2.5rem;
  }

  .models-description {
    font-size: 1.1rem;
  }

  .models-stats {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .stat-item {
    padding: 1rem 1.5rem;
    min-width: 200px;
  }

  .models-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .model-visibility {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }

  .models-title {
    font-size: 2rem;
  }

  .models-description {
    font-size: 1rem;
  }

  .stat-item {
    padding: 0.8rem 1rem;
    min-width: 160px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem;
  }

  .card-footer {
    padding: 1rem;
  }
}

/* Animations */
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}
</style>
