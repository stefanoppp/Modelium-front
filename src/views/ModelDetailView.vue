<template>
  <div class="model-detail-view">
    <NavBar />
    
    <!-- Header -->
    <div class="detail-header">
      <div class="header-background">
        <div class="grid-pattern"></div>
        <div class="floating-elements">
          <div class="floating-element" v-for="i in 8" :key="i"></div>
        </div>
      </div>
      
      <div class="container">
        <div class="header-content">
          <div class="back-button">
            <button class="tech-button back-btn" @click="goBack">
              <i class="pi pi-arrow-left"></i>
              <span>Volver a Modelos</span>
            </button>
          </div>
          
          <div class="model-header" v-if="modelStatus">
            <div class="model-title-section">
              <h1 class="model-title">{{ modelStatus.name }}</h1>
              <div class="model-status" :class="getStatusClass(modelStatus.status)">
                <i :class="getStatusIcon(modelStatus.status)"></i>
                <span>{{ getStatusLabel(modelStatus.status) }}</span>
              </div>
            </div>
            
            <p class="model-description">{{ modelStatus.description }}</p>
            
            <div class="model-meta">
              <div class="meta-item">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(modelStatus.created_at) }}</span>
              </div>
              <div class="meta-item">
                <i :class="modelStatus.is_public ? 'pi pi-globe' : 'pi pi-lock'"></i>
                <span>{{ modelStatus.is_public ? 'Público' : 'Privado' }}</span>
              </div>
              <div class="meta-item">
                <i class="pi pi-tag"></i>
                <span>{{ getTaskTypeLabel(modelStatus.task_type) }}</span>
              </div>
              <div class="meta-item">
                <i class="pi pi-user"></i>
                <span>{{ modelStatus.owner }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <div class="detail-content">
        <!-- Loading state -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Cargando detalles del modelo...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <i class="pi pi-exclamation-triangle error-icon"></i>
          <h3 class="error-title">Error al cargar el modelo</h3>
          <p class="error-message">{{ error }}</p>
          <button class="tech-button" @click="loadModelDetails">
            <i class="pi pi-refresh"></i>
            <span>Reintentar</span>
          </button>
        </div>

        <!-- Model details -->
        <div v-else-if="modelStatus" class="detail-grid">
          <!-- Estado del Modelo -->
          <div class="detail-card status-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-info-circle"></i>
                Estado del Modelo
              </h3>
            </div>
            <div class="card-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-id-card"></i>
                    ID del Modelo:
                  </span>
                  <span class="info-value">{{ modelStatus.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-bookmark"></i>
                    Nombre:
                  </span>
                  <span class="info-value">{{ modelStatus.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-circle"></i>
                    Estado:
                  </span>
                  <span class="info-value" :class="getStatusClass(modelStatus.status)">
                    {{ getStatusLabel(modelStatus.status) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-percentage"></i>
                    Progreso:
                  </span>
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: displayedProgress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ displayedProgress }}%</span>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-tag"></i>
                    Tipo de Tarea:
                  </span>
                  <span class="info-value">{{ getTaskTypeLabel(modelStatus.task_type) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-database"></i>
                    Dataset:
                  </span>
                  <span class="info-value">{{ modelStatus.dataset_name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-bullseye"></i>
                    Columna Target:
                  </span>
                  <span class="info-value">{{ modelStatus.target_column }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-user"></i>
                    Propietario:
                  </span>
                  <span class="info-value">{{ modelStatus.owner }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-eye"></i>
                    Visibilidad:
                  </span>
                  <span class="info-value">{{ modelStatus.is_public ? 'Público' : 'Privado' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">
                    <i class="pi pi-calendar"></i>
                    Creado:
                  </span>
                  <span class="info-value">{{ formatDate(modelStatus.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Métricas y Requerimientos -->
          <div class="detail-card metrics-card" v-if="modelInfo">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-chart-line"></i>
                Métricas y Requerimientos
              </h3>
            </div>
            <div class="card-content">
              <!-- Features Requeridas -->
              <div class="metrics-section">
                <h4 class="section-title">
                  <i class="pi pi-list"></i>
                  Features Requeridas
                </h4>
                <div class="features-grid">
                  <div 
                    v-for="feature in modelInfo.required_features" 
                    :key="feature"
                    class="feature-chip"
                  >
                    {{ feature }}
                  </div>
                </div>
              </div>

              <!-- Métricas del Modelo -->
              <div class="metrics-section">
                <h4 class="section-title">
                  <i class="pi pi-chart-bar"></i>
                  Métricas del Modelo
                </h4>
                <div class="model-type-badge">
                  <i class="pi pi-cog"></i>
                  <span>{{ modelInfo.metrics.model_type }}</span>
                </div>
                
                <!-- Métricas de Clasificación -->
                <div v-if="modelInfo.task_type === 'classification'" class="metrics-grid">
                  <div class="metric-item">
                    <div class="metric-label">Accuracy</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.accuracy) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: (modelInfo.metrics.accuracy * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">Precision</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.precision) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: (modelInfo.metrics.precision * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">Recall</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.recall) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: (modelInfo.metrics.recall * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">F1 Score</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.f1_score) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: (modelInfo.metrics.f1_score * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">AUC</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.auc) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: (modelInfo.metrics.auc * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">Kappa</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.kappa) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: Math.max(0, (modelInfo.metrics.kappa * 100)) + '%' }"></div>
                    </div>
                  </div>
                </div>

                <!-- Métricas de Regresión -->
                <div v-else-if="modelInfo.task_type === 'regression'" class="metrics-grid">
                  <div class="metric-item">
                    <div class="metric-label">R²</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.r2) }}</div>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: Math.max(0, (modelInfo.metrics.r2 * 100)) + '%' }"></div>
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">MAE</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.mae) }}</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">RMSE</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.rmse) }}</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">MAPE</div>
                    <div class="metric-value">{{ formatMetric(modelInfo.metrics.mape) }}</div>
                  </div>
                </div>

                <!-- Tiempo de Entrenamiento -->
                <div class="training-time">
                  <i class="pi pi-clock"></i>
                  <span>Tiempo de entrenamiento: {{ formatTime(modelInfo.metrics.training_time) }}</span>
                </div>
              </div>

              <!-- Interpretación -->
              <div class="metrics-section" v-if="modelInfo.metrics.interpretation">
                <h4 class="section-title">
                  <i class="pi pi-eye"></i>
                  Interpretación
                </h4>
                <div class="interpretation-grid">
                  <div 
                    v-for="(value, key) in modelInfo.metrics.interpretation" 
                    :key="key"
                    class="interpretation-item"
                  >
                    <div class="interpretation-label">{{ formatInterpretationLabel(key) }}</div>
                    <div class="interpretation-value">{{ value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay métricas -->
          <div v-else-if="!isLoading && modelStatus?.status === 'completed'" class="detail-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-chart-line"></i>
                Métricas y Requerimientos
              </h3>
            </div>
            <div class="card-content">
              <div class="no-metrics">
                <i class="pi pi-exclamation-triangle"></i>
                <p>No se pudieron cargar las métricas del modelo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import NavBar from '@/components/layout/NavBar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const modelStatus = ref(null)
const modelInfo = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Variables para animación de progreso
const displayedProgress = ref(0)
const progressAnimationId = ref(null)
const updateInterval = ref(null)

// Methods
const loadModelDetails = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const modelId = route.params.id
    const token = authStore.getToken?.() || localStorage.getItem('access_token')
    
    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    // Cargar estado del modelo
    const statusResponse = await fetch(`http://localhost:8000/api/models/status/${modelId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!statusResponse.ok) {
      throw new Error(`Error al cargar el estado del modelo: ${statusResponse.status}`)
    }

    modelStatus.value = await statusResponse.json()

    // Cargar información y métricas del modelo si está completado
    if (modelStatus.value.status === 'completed') {
      try {
        const infoResponse = await fetch(`http://localhost:8000/api/models/info/${modelId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (infoResponse.ok) {
          modelInfo.value = await infoResponse.json()
        }
      } catch (infoError) {
        console.warn('No se pudieron cargar las métricas del modelo:', infoError)
      }
    }
    
    // Inicializar progreso animado
    displayedProgress.value = modelStatus.value?.progress || 0
    
    // Iniciar actualización automática si está entrenando
    startAutoUpdate()
    
  } catch (err) {
    error.value = err.message || 'Error al cargar los detalles del modelo'
    console.error('Error loading model details:', err)
  } finally {
    isLoading.value = false
  }
}

// Función para animar gradualmente el progreso
const animateProgress = (targetProgress) => {
  if (progressAnimationId.value) {
    cancelAnimationFrame(progressAnimationId.value)
  }
  
  const startProgress = displayedProgress.value
  const progressDiff = targetProgress - startProgress
  const duration = 1000 // 1 segundo para la animación
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Usar easing para una animación más suave
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    displayedProgress.value = Math.round(startProgress + (progressDiff * easeOutQuart))
    
    if (progress < 1) {
      progressAnimationId.value = requestAnimationFrame(animate)
    }
  }
  
  progressAnimationId.value = requestAnimationFrame(animate)
}

// Función para cargar solo el estado del modelo (para actualizaciones)
const loadModelStatus = async () => {
  try {
    const modelId = route.params.id
    const token = authStore.getToken?.() || localStorage.getItem('access_token')
    
    if (!token) return
    
    const statusResponse = await fetch(`http://localhost:8000/api/models/status/${modelId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (statusResponse.ok) {
      const newStatus = await statusResponse.json()
      const oldProgress = modelStatus.value?.progress || 0
      const newProgress = newStatus.progress || 0
      
      modelStatus.value = newStatus
      
      // Animar el progreso si ha cambiado
      if (newProgress !== oldProgress) {
        animateProgress(newProgress)
      }
      
      // Detener actualización automática si el modelo ya no está entrenando
      if (newStatus.status !== 'training') {
        stopAutoUpdate()
      }
      
      // Si el modelo se completó, cargar las métricas
      if (newStatus.status === 'completed' && !modelInfo.value) {
        try {
          const infoResponse = await fetch(`http://localhost:8000/api/models/info/${modelId}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (infoResponse.ok) {
            modelInfo.value = await infoResponse.json()
          }
        } catch (infoError) {
          console.warn('No se pudieron cargar las métricas del modelo:', infoError)
        }
      }
    }
  } catch (err) {
    console.warn('Error actualizando estado del modelo:', err)
  }
}

// Función para iniciar la actualización automática
const startAutoUpdate = () => {
  // Solo actualizar si el modelo está entrenando
  if (modelStatus.value?.status === 'training') {
    updateInterval.value = setInterval(loadModelStatus, 2000) // Cada 2 segundos
  }
}

// Función para detener la actualización automática
const stopAutoUpdate = () => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
    updateInterval.value = null
  }
}

const goBack = () => {
  router.push('/models')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'status-completed'
    case 'training':
      return 'status-training'
    case 'failed':
      return 'status-failed'
    case 'pending':
      return 'status-pending'
    default:
      return 'status-default'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return 'pi pi-check-circle'
    case 'training':
      return 'pi pi-spin pi-spinner'
    case 'failed':
      return 'pi pi-times-circle'
    case 'pending':
      return 'pi pi-clock'
    default:
      return 'pi pi-info-circle'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed':
      return 'Completado'
    case 'training':
      return 'Entrenando'
    case 'failed':
      return 'Fallido'
    case 'pending':
      return 'Pendiente'
    default:
      return 'Desconocido'
  }
}

const getTaskTypeLabel = (taskType) => {
  switch (taskType) {
    case 'classification':
      return 'Clasificación'
    case 'regression':
      return 'Regresión'
    default:
      return taskType
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMetric = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(4)
  }
  return value
}

const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(2)} seg`
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(2)} min`
  } else {
    return `${(seconds / 3600).toFixed(2)} h`
  }
}

const formatInterpretationLabel = (key) => {
  const labels = {
    'accuracy_level': 'Nivel de Precisión',
    'model_quality': 'Calidad del Modelo',
    'reliability': 'Confiabilidad',
    'fit_quality': 'Calidad del Ajuste',
    'variance_explained': 'Varianza Explicada',
    'prediction_accuracy': 'Precisión de Predicción'
  }
  return labels[key] || key
}

// Lifecycle
onMounted(() => {
  loadModelDetails()
})

onUnmounted(() => {
  stopAutoUpdate()
  if (progressAnimationId.value) {
    cancelAnimationFrame(progressAnimationId.value)
  }
})
</script>

<style scoped>
.model-detail-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Forzar fuente Inter en todos los elementos excepto iconos */
.model-detail-view *:not(.pi):not([class*="pi-"]) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Específicamente para elementos de texto, excluyendo iconos */
.model-detail-view h1:not(.pi):not([class*="pi-"]),
.model-detail-view h2:not(.pi):not([class*="pi-"]),
.model-detail-view h3:not(.pi):not([class*="pi-"]),
.model-detail-view h4:not(.pi):not([class*="pi-"]),
.model-detail-view h5:not(.pi):not([class*="pi-"]),
.model-detail-view h6:not(.pi):not([class*="pi-"]),
.model-detail-view p:not(.pi):not([class*="pi-"]),
.model-detail-view span:not(.pi):not([class*="pi-"]),
.model-detail-view div:not(.pi):not([class*="pi-"]),
.model-detail-view button:not(.pi):not([class*="pi-"]),
.model-detail-view input:not(.pi):not([class*="pi-"]),
.model-detail-view label:not(.pi):not([class*="pi-"]) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Asegurar que los iconos usen la fuente correcta */
.model-detail-view .pi,
.model-detail-view [class*="pi-"] {
  font-family: 'primeicons' !important;
  font-style: normal !important;
  font-weight: normal !important;
  font-variant: normal !important;
  text-transform: none !important;
  line-height: 1 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

/* Estilos adicionales para iconos problemáticos */
.model-detail-view i.pi::before,
.model-detail-view i[class*="pi-"]::before {
  font-family: 'primeicons' !important;
  font-style: normal !important;
  font-weight: normal !important;
  text-decoration: none !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

/* Asegurar que los iconos tengan el tamaño correcto */
.model-detail-view .pi {
  font-size: 1em !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

.detail-header {
  background: linear-gradient(135deg, rgba(8, 8, 12, 0.98), rgba(12, 12, 18, 0.95));
  padding: 2rem 0;
  margin-top: 5rem;
  position: relative;
  overflow: hidden;
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

.floating-element:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.floating-element:nth-child(2) { top: 60%; left: 20%; animation-delay: 2s; }
.floating-element:nth-child(3) { top: 40%; left: 80%; animation-delay: 4s; }
.floating-element:nth-child(4) { top: 80%; left: 70%; animation-delay: 6s; }
.floating-element:nth-child(5) { top: 10%; left: 60%; animation-delay: 1s; }
.floating-element:nth-child(6) { top: 70%; left: 40%; animation-delay: 3s; }
.floating-element:nth-child(7) { top: 30%; left: 30%; animation-delay: 5s; }
.floating-element:nth-child(8) { top: 90%; left: 85%; animation-delay: 7s; }

.detail-header::before {
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

.header-content {
  position: relative;
  z-index: 4;
}

.back-button {
  margin-bottom: 2rem;
}

.tech-button {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.tech-button:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.model-header {
  color: #fff;
}

.model-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.model-title {
  font-size: 2.5rem;
  font-weight: 500;
  margin: 0;
  background: linear-gradient(135deg, #00d4ff, #8a2be2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.model-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-completed {
  color: #22c55e;
}

.status-training {
  color: #fbbf24;
}

.status-failed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-pending {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.model-description {
  font-size: 1.1rem;
  color: #d1d5db;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.model-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  font-size: 0.9rem;
}

.meta-item i {
  color: #00d4ff;
}

.detail-content {
  padding: 3rem 0;
}

.loading-container, .error-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #fff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 212, 255, 0.3);
  border-top: 4px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

.error-message {
  color: #9ca3af;
  margin-bottom: 2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

.detail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
}

.card-header {
  background: rgba(0, 212, 255, 0.1);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title i {
  color: #00d4ff;
}

.card-content {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #9ca3af;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
}

.info-label i {
  width: 16px;
  height: 16px;
  color: #00D4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.info-value {
  color: #fff;
  font-weight: 600;
  text-align: right;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  justify-content: flex-end;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #22c55e);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.progress-text {
  color: #00d4ff;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 40px;
  transition: all 0.3s ease;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.metrics-section {
  margin-bottom: 2rem;
}

.metrics-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
}

.section-title i {
  color: #00d4ff;
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-chip {
  background: rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.3);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-chip:hover {
  background: rgba(138, 43, 226, 0.4);
  border-color: rgba(138, 43, 226, 0.6);
  transform: translateY(-2px);
}

.model-type-badge {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.3);
}

.metric-label {
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.metric-value {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.metric-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #22c55e);
  transition: width 0.3s ease;
}

.training-time {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-top: 1rem;
}

.interpretation-grid {
  display: grid;
  gap: 1rem;
}

.interpretation-item {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.interpretation-item:hover {
  background: rgba(34, 197, 94, 0.15);
}

.interpretation-label {
  color: #22c55e;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.interpretation-value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.no-metrics {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.no-metrics i {
  font-size: 2rem;
  color: #fbbf24;
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .model-title {
    font-size: 2rem;
  }
  
  .model-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .model-meta {
    flex-direction: column;
    gap: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 1rem;
  }
}

/* Animations */
@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}
</style>