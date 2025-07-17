<template>
  <div class="model-detail-view">
    <NavBar />
    
    <!-- Fondo galáctico inmersivo -->
    <div class="galactic-background">
      <div class="cosmic-grid"></div>
      <div class="nebula-layers">
        <div class="nebula-layer" v-for="n in 5" :key="n"></div>
      </div>
      <div class="star-field">
        <div class="star" v-for="n in 100" :key="n"></div>
      </div>
      <div class="floating-particles">
        <div class="particle" v-for="n in 15" :key="n"></div>
      </div>
      <div class="energy-streams">
        <div class="energy-stream" v-for="n in 3" :key="n"></div>
      </div>
    </div>

    <!-- Enhanced Header with breadcrumb and actions -->
    <div v-if="modelStatus && !isLoading && !error" class="detail-header">
      <div class="container">
        <div class="header-content">
          <!-- Breadcrumb Navigation -->
          <nav class="breadcrumb">
            <router-link to="/models" class="breadcrumb-link">
              <i class="pi pi-arrow-left"></i>
              Modelos
            </router-link>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ modelStatus.name }}</span>
          </nav>

          <!-- Model Title and Status -->
          <div class="model-header">
            <div class="model-title-section">
              <h1 class="model-title">{{ modelStatus.name }}</h1>
              <div class="status-badge" :class="getStatusClass(modelStatus.status)">
                <i :class="getStatusIcon(modelStatus.status)"></i>
                <span>{{ getStatusLabel(modelStatus.status) }}</span>
              </div>
            </div>
            
            <!-- Quick Info Bar -->
            <div class="quick-info">
              <div class="quick-info-item">
                <i class="pi pi-tag"></i>
                <span>{{ getTaskTypeLabel(modelStatus.task_type) }}</span>
              </div>
              <div class="quick-info-item">
                <i class="pi pi-database"></i>
                <span>{{ modelStatus.dataset_name }}</span>
              </div>
              <div class="quick-info-item">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(modelStatus.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
      <button class="tech-button" @click="loadModelDetails">Reintentar</button>
    </div>

    <!-- Model details -->
    <div v-else-if="modelStatus" class="detail-content">
      <div class="container">
        <div class="detail-grid">
          <!-- Model Overview Card -->
          <div class="detail-card overview-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-info-circle"></i>
                Información General
              </h3>
            </div>
            <div class="card-content">
              <div class="overview-grid">
                <div class="overview-item">
                  <div class="overview-label">
                    <i class="pi pi-id-card"></i>
                    ID del Modelo
                  </div>
                  <div class="overview-value">{{ modelStatus.id }}</div>
                </div>
                
                <div class="overview-item">
                  <div class="overview-label">
                    <i class="pi pi-bullseye"></i>
                    Columna Target
                  </div>
                  <div class="overview-value">{{ modelStatus.target_column }}</div>
                </div>
                
                <div class="overview-item">
                  <div class="overview-label">
                    <i class="pi pi-user"></i>
                    Propietario
                  </div>
                  <div class="overview-value">{{ modelStatus.owner }}</div>
                </div>
                
                <div class="overview-item">
                  <div class="overview-label">
                    <i class="pi pi-eye"></i>
                    Visibilidad
                  </div>
                  <div class="overview-value">
                    <span class="visibility-badge" :class="{ 'public': modelStatus.is_public, 'private': !modelStatus.is_public }">
                      <i :class="modelStatus.is_public ? 'pi pi-globe' : 'pi pi-lock'"></i>
                      {{ modelStatus.is_public ? 'Público' : 'Privado' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Progress Section -->
              <div class="progress-section" v-if="modelStatus.status === 'training'">
                <div class="progress-header">
                  <span class="progress-label">Progreso del Entrenamiento</span>
                  <span class="progress-percentage">{{ displayedProgress }}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: displayedProgress + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Features Card -->
          <div class="detail-card features-card" v-if="modelInfo">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-list"></i>
                Features Requeridas
              </h3>
              <span class="feature-count">{{ modelInfo.required_features.length }} features</span>
            </div>
            <div class="card-content">
              <div class="features-grid">
                <div v-for="feature in modelInfo.required_features" :key="feature.name || feature" class="feature-chip">
                  <i class="pi pi-tag"></i>
                  {{ typeof feature === 'object' ? feature.name : feature }}
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Metrics Card -->
          <div class="detail-card metrics-card" v-if="modelInfo">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-chart-line"></i>
                Métricas de Rendimiento
              </h3>
              <div class="model-type-badge">
                <i class="pi pi-cog"></i>
                <span>{{ modelInfo.metrics.model_type }}</span>
              </div>
            </div>
            <div class="card-content">
              <!-- Classification Metrics -->
              <div v-if="modelInfo.task_type === 'classification'" class="metrics-container">
                  <div class="metrics-grid">
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-check-circle"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">Exactitud</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.accuracy) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill accuracy" :style="{ width: modelInfo.metrics.accuracy * 100 + '%' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-bullseye"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">Precisión</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.precision) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill precision" :style="{ width: modelInfo.metrics.precision * 100 + '%' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-search"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">Sensibilidad</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.recall) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill recall" :style="{ width: modelInfo.metrics.recall * 100 + '%' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-star"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">F1-Score</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.f1_score) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill f1" :style="{ width: modelInfo.metrics.f1_score * 100 + '%' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-chart-bar"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">AUC</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.auc) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill auc" :style="{ width: modelInfo.metrics.auc * 100 + '%' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-percentage"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">Kappa</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.kappa) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill kappa" :style="{ width: Math.max(0, modelInfo.metrics.kappa * 100) + '%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Regression Metrics -->
                <div v-else-if="modelInfo.task_type === 'regression'" class="metrics-container">
                  <div class="metrics-grid">
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-chart-line"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">R²</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.r2) }}</div>
                        <div class="metric-bar">
                          <div class="metric-fill r2" :style="{ width: Math.max(0, modelInfo.metrics.r2 * 100) + '%' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-minus"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">MAE</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.mae) }}</div>
                        <div class="metric-description">Error Absoluto Medio</div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-calculator"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">RMSE</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.rmse) }}</div>
                        <div class="metric-description">Raíz del Error Cuadrático Medio</div>
                      </div>
                    </div>
                    
                    <div class="metric-card">
                      <div class="metric-icon">
                        <i class="pi pi-percentage"></i>
                      </div>
                      <div class="metric-content">
                        <div class="metric-label">MAPE</div>
                        <div class="metric-value">{{ formatMetric(modelInfo.metrics.mape) }}</div>
                        <div class="metric-description">Error Porcentual Absoluto Medio</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Training Time -->
                <div class="training-time-section">
                  <div class="training-time">
                    <div class="training-time-icon">
                      <i class="pi pi-clock"></i>
                    </div>
                    <div class="training-time-content">
                      <div class="training-time-label">Tiempo de Entrenamiento</div>
                      <div class="training-time-value">{{ formatTime(modelInfo.metrics.training_time) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <!-- Model Interpretation Card -->
          <div class="detail-card interpretation-card" v-if="modelInfo?.metrics?.interpretation">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-eye"></i>
                Interpretación del Modelo
              </h3>
            </div>
            <div class="card-content">
              <div class="interpretation-grid">
                <div v-for="(value, key) in modelInfo.metrics.interpretation" :key="key" class="interpretation-item">
                  <div class="interpretation-icon">
                    <i class="pi pi-info-circle"></i>
                  </div>
                  <div class="interpretation-content">
                    <div class="interpretation-label">{{ formatInterpretationLabel(key) }}</div>
                    <div class="interpretation-value">{{ value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Metrics Message -->
        <div v-if="!isLoading && modelStatus?.status === 'completed' && !modelInfo" class="detail-content">
          <div class="container">
            <div class="detail-card no-metrics-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="pi pi-chart-line"></i>
                  Métricas del Modelo
                </h3>
              </div>
              <div class="card-content">
                <div class="no-metrics">
                  <div class="no-metrics-icon">
                    <i class="pi pi-exclamation-triangle"></i>
                  </div>
                  <div class="no-metrics-content">
                    <h4>No se pudieron cargar las métricas</h4>
                    <p>Las métricas del modelo no están disponibles en este momento.</p>
                    <button class="tech-button" @click="loadModelDetails">
                      <i class="pi pi-refresh"></i>
                      Reintentar
                    </button>
                  </div>
                </div>
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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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
    displayedProgress.value = Math.round(startProgress + progressDiff * easeOutQuart)

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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
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
    minute: '2-digit',
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
    accuracy_level: 'Nivel de Exactitud',
    model_quality: 'Calidad del Modelo',
    reliability: 'Confiabilidad',
    fit_quality: 'Calidad del Ajuste',
    variance_explained: 'Varianza Explicada',
    prediction_accuracy: 'Exactitud de Predicción',
  }
  return labels[key] || key
}

// Posicionar elementos galácticos aleatoriamente
const positionGalacticElements = () => {
  // Posicionar estrellas aleatoriamente
  const stars = document.querySelectorAll('.star')
  stars.forEach(star => {
    const top = Math.random() * 100
    const left = Math.random() * 100
    star.style.top = `${top}%`
    star.style.left = `${left}%`
    star.style.animationDelay = `${Math.random() * 3}s`
  })
  
  // Posicionar partículas aleatoriamente
  const particles = document.querySelectorAll('.particle')
  particles.forEach(particle => {
    const top = Math.random() * 100
    const left = Math.random() * 100
    particle.style.top = `${top}%`
    particle.style.left = `${left}%`
    particle.style.animationDelay = `${Math.random() * 15}s`
  })
}

// Lifecycle
onMounted(() => {
  loadModelDetails()
  
  // Posicionar elementos del fondo galáctico después de que se monte el componente
  setTimeout(() => {
    positionGalacticElements()
  }, 100)
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
  background: #000;
  position: relative;
  overflow-x: hidden;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

/* Fondo galáctico inmersivo */
.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: radial-gradient(ellipse at 60% 40%, #1a0a2e 0%, #0f0f23 70%, #000 100%);
  overflow: hidden;
}

.cosmic-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: gridFloat 20s ease-in-out infinite;
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
  width: 100%;
  height: 100%;
  border-radius: 50%;
  filter: blur(60px);
  animation: nebulaFloat 30s ease-in-out infinite;
}

.nebula-layer:nth-child(1) {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  top: -20%;
  left: -20%;
  animation-delay: 0s;
}

.nebula-layer:nth-child(2) {
  background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
  top: 20%;
  right: -20%;
  animation-delay: 10s;
}

.nebula-layer:nth-child(3) {
  background: radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%);
  bottom: -20%;
  left: 10%;
  animation-delay: 20s;
}

.nebula-layer:nth-child(4) {
  background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
  top: 50%;
  left: -10%;
  animation-delay: 15s;
}

.nebula-layer:nth-child(5) {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
  bottom: 10%;
  right: 10%;
  animation-delay: 25s;
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
  background: white;
  border-radius: 50%;
  animation: starTwinkle 3s ease-in-out infinite;
}

.star:nth-child(odd) {
  animation-delay: 1s;
}

.star:nth-child(3n) {
  animation-delay: 2s;
  background: rgba(139, 92, 246, 0.8);
}

.star:nth-child(5n) {
  animation-delay: 0.5s;
  background: rgba(0, 212, 255, 0.8);
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
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 15s linear infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
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
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.5), transparent);
  animation: energyFlow 8s linear infinite;
}

.energy-stream:nth-child(1) {
  left: 20%;
  animation-delay: 0s;
}

.energy-stream:nth-child(2) {
  left: 50%;
  animation-delay: 3s;
  background: linear-gradient(to bottom, transparent, rgba(0, 212, 255, 0.5), transparent);
}

.energy-stream:nth-child(3) {
  left: 80%;
  animation-delay: 6s;
  background: linear-gradient(to bottom, transparent, rgba(236, 72, 153, 0.5), transparent);
}

@keyframes gridFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(20px, 20px) rotate(1deg);
  }
}

@keyframes nebulaFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -20px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 30px) scale(0.9);
  }
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(100px);
    opacity: 0;
  }
}

@keyframes energyFlow {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* Forzar fuente Inter en todos los elementos excepto iconos */
.model-detail-view *:not(.pi):not([class*='pi-']) {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

/* Específicamente para elementos de texto, excluyendo iconos */
.model-detail-view h1:not(.pi):not([class*='pi-']),
.model-detail-view h2:not(.pi):not([class*='pi-']),
.model-detail-view h3:not(.pi):not([class*='pi-']),
.model-detail-view h4:not(.pi):not([class*='pi-']),
.model-detail-view h5:not(.pi):not([class*='pi-']),
.model-detail-view h6:not(.pi):not([class*='pi-']),
.model-detail-view p:not(.pi):not([class*='pi-']),
.model-detail-view span:not(.pi):not([class*='pi-']),
.model-detail-view div:not(.pi):not([class*='pi-']),
.model-detail-view button:not(.pi):not([class*='pi-']),
.model-detail-view input:not(.pi):not([class*='pi-']),
.model-detail-view label:not(.pi):not([class*='pi-']) {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif !important;
}

/* Asegurar que los iconos usen la fuente correcta */
.model-detail-view .pi,
.model-detail-view [class*='pi-'] {
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
.model-detail-view i[class*='pi-']::before {
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
  background: linear-gradient(135deg, 
    rgba(25, 25, 40, 0.05) 0%, 
    rgba(15, 15, 30, 0.08) 50%,
    rgba(25, 25, 40, 0.03) 100%);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 0 0 30px 30px;
  padding: 3rem 0 2.5rem 0;
  margin-top: 2rem;
  position: relative;
  overflow: visible;
  z-index: 1;
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
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}
.floating-element:nth-child(2) {
  top: 60%;
  left: 20%;
  animation-delay: 2s;
}
.floating-element:nth-child(3) {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}
.floating-element:nth-child(4) {
  top: 80%;
  left: 70%;
  animation-delay: 6s;
}
.floating-element:nth-child(5) {
  top: 10%;
  left: 60%;
  animation-delay: 1s;
}
.floating-element:nth-child(6) {
  top: 70%;
  left: 40%;
  animation-delay: 3s;
}
.floating-element:nth-child(7) {
  top: 30%;
  left: 30%;
  animation-delay: 5s;
}
.floating-element:nth-child(8) {
  top: 90%;
  left: 85%;
  animation-delay: 7s;
}



.detail-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(139, 92, 246, 0.4) 20%,
    rgba(0, 212, 255, 0.6) 50%,
    rgba(139, 92, 246, 0.4) 80%,
    transparent 100%);
  z-index: 3;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
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
  margin-top: 1rem;
}

/* Breadcrumb Navigation */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e5e7eb;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.breadcrumb-link:hover {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-1px);
}

.breadcrumb-separator {
  color: #6b7280;
  font-weight: 500;
}

.breadcrumb-current {
  color: #fff;
  font-weight: 600;
}

/* Model Header */
.model-header {
  color: #fff;
}

.model-title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid;
  backdrop-filter: blur(10px);
}

/* Quick Info Bar */
.quick-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.quick-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-info-item i {
  color: #00d4ff;
  font-size: 0.85rem;
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
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
}

.model-title {
  font-size: 2.7rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #00d4ff 0%, #666bfffe 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  text-shadow: 0 0 32px rgba(139, 92, 246, 0.18);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
}

.model-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1));
  border: 1.5px solid rgba(0, 212, 255, 0.18);
  box-shadow: 0 2px 12px rgba(0, 212, 255, 0.08);
}

.status-completed {
  color: #22c55e;
  border-color: #22c55e44;
  background: rgba(34, 197, 94, 0.1);
}

.status-training {
  color: #fbbf24;
  border-color: #fbbf2444;
  background: rgba(251, 191, 36, 0.1);
}

.status-failed {
  color: #ef4444;
  border-color: #ef444444;
  background: rgba(239, 68, 68, 0.1);
}

.status-pending {
  color: #9ca3af;
  border-color: #9ca3af44;
  background: rgba(156, 163, 175, 0.1);
}

.model-description {
  font-size: 1.1rem;
  color: #e5e7eb;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
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
  color: #d1d5db;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
}

.meta-item i {
  color: #00d4ff;
}

.detail-content {
  padding: 2rem 0 3rem 0;
  position: relative;
  z-index: 1;
  min-height: 70vh;
}

/* Grid Layout optimizado para simetría perfecta - Una sola columna */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  align-items: stretch;
}

@supports (display: grid) {
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    gap: 2rem;
  }
}

.loading-container,
.error-container {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

/* Card Styles mejorados para simetría */
.detail-card {
  background: rgba(25, 25, 40, 0.95);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(25px);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  height: fit-content;
  min-height: 250px;
}

.detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.08) 0%, 
    rgba(0, 212, 255, 0.05) 50%,
    transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 1;
}

.detail-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(139, 92, 246, 0.8) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 2;
}

.detail-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 50px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(139, 92, 246, 0.6);
}

.detail-card:hover::before {
  opacity: 1;
}

.detail-card:hover::after {
  opacity: 1;
}

.detail-card > * {
  position: relative;
  z-index: 3;
}

/* Asegurar espaciado entre tarjetas */
.detail-card {
  margin-bottom: 2rem !important;
}

.detail-card:last-child {
  margin-bottom: 0 !important;
}

.card-header {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.15));
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.3px;
}

.card-title i {
  color: #00d4ff;
  font-size: 1rem;
}

.card-content {
  padding: 1.5rem;
}

/* Feature Count Badge */
.feature-count {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

/* Overview Grid */
.overview-grid {
  display: grid;
  gap: 1.25rem;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.overview-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 212, 255, 0.2);
  transform: translateY(-1px);
}

.overview-label {
  color: #9ca3af;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.overview-label i {
  color: #00d4ff;
  font-size: 0.9rem;
}

.overview-value {
  color: #fff;
  font-weight: 600;
  text-align: right;
}

/* Visibility Badge */
.visibility-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid;
}

.visibility-badge.public {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.visibility-badge.private {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
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
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
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

/* Progress Section */
.progress-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-percentage {
  color: #00d4ff;
  font-size: 1rem;
  font-weight: 700;
}

.progress-bar-container {
  width: 100%;
}

.progress-bar {
  width: 100%;
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

/* Metric Cards */
.metrics-container {
  margin-top: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.metric-icon i {
  font-size: 1.2rem;
  color: #00d4ff;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.metric-label {
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.metric-description {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.4;
}

.metric-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.metric-fill {
  height: 100%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.metric-fill.accuracy {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.metric-fill.precision {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.metric-fill.recall {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.metric-fill.f1 {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.metric-fill.auc {
  background: linear-gradient(90deg, #06b6d4, #0891b2);
}

.metric-fill.kappa {
  background: linear-gradient(90deg, #ec4899, #db2777);
}

.metric-fill.r2 {
  background: linear-gradient(90deg, #10b981, #059669);
}

/* Training Time Section */
.training-time-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.training-time {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 10px;
}

.training-time-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.training-time-icon i {
  font-size: 1.2rem;
  color: #fbbf24;
}

.training-time-content {
  flex: 1;
}

.training-time-label {
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.training-time-value {
  color: #fbbf24;
  font-size: 1.1rem;
  font-weight: 700;
}

/* Interpretation Grid */
.interpretation-grid {
  display: grid;
  gap: 1rem;
}

.interpretation-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.interpretation-item:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
}

.interpretation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.interpretation-icon i {
  font-size: 1.2rem;
  color: #22c55e;
}

.interpretation-content {
  flex: 1;
}

.interpretation-label {
  color: #22c55e;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.interpretation-value {
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

/* Features Grid */
.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-start;
}

.feature-item {
  background: rgba(255, 255, 255, 0.04);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
  color: #fff;
  transform: translateY(-1px);
}

.feature-item i {
  color: #00d4ff;
  font-size: 0.8rem;
}

.feature-chip {
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.13), rgba(139, 92, 246, 0.13));
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  line-height: 1.2;
}

.feature-chip:hover {
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.18), rgba(139, 92, 246, 0.18));
  border-color: rgba(0, 212, 255, 0.18);
  transform: translateY(-2px) scale(1.04);
}

/* No Metrics */
.no-metrics {
  text-align: center;
  padding: 2rem;
}

.no-metrics-icon {
  margin-bottom: 1rem;
}

.no-metrics-icon i {
  font-size: 3rem;
  color: #fbbf24;
}

.no-metrics-content h4 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.no-metrics-content p {
  color: #9ca3af;
  margin-bottom: 1.5rem;
}

.model-type-badge {
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.13), rgba(139, 92, 246, 0.1));
  border: 1.5px solid rgba(0, 212, 255, 0.18);
  color: #00d4ff;
  padding: 0.7rem 1.3rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
  letter-spacing: 0.2px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-item {
  background: rgba(139, 92, 246, 0.07);
  border: 1.5px solid rgba(139, 92, 246, 0.13);
  border-radius: 10px;
  padding: 1.1rem 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.06);
}

.metric-item:hover {
  background: rgba(139, 92, 246, 0.13);
  border-color: rgba(0, 212, 255, 0.18);
  transform: scale(1.03);
}

.metric-label {
  color: #8a2be2;
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 0.1px;
}

.metric-value {
  color: #fff;
  font-size: 1.22rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 8px rgba(139, 92, 246, 0.1);
}

.metric-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.2rem;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #8a2be2, #22c55e);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px #00d4ff44;
}

.training-time {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.13), rgba(139, 92, 246, 0.1));
  border: 1.5px solid rgba(251, 191, 36, 0.18);
  color: #fbbf24;
  padding: 0.7rem 1.1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-top: 1.2rem;
  font-size: 1.01rem;
}

.interpretation-grid {
  display: grid;
  gap: 1rem;
}

.interpretation-item {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.13), rgba(139, 92, 246, 0.1));
  border: 1.5px solid rgba(34, 197, 94, 0.18);
  border-radius: 8px;
  padding: 1rem 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.08);
}

.interpretation-item:hover {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.18), rgba(139, 92, 246, 0.13));
  border-color: rgba(0, 212, 255, 0.18);
  transform: scale(1.03);
}

.interpretation-label {
  color: #22c55e;
  font-weight: 700;
  font-size: 1.01rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.1px;
}

.interpretation-value {
  color: #fff;
  font-size: 1.13rem;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.1);
}

.no-metrics {
  text-align: center;
  padding: 2rem 1.5rem;
  color: #9ca3af;
  background: rgba(139, 92, 246, 0.07);
  border-radius: 12px;
  border: 1.5px solid rgba(139, 92, 246, 0.13);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.06);
}

.no-metrics i {
  font-size: 2.2rem;
  color: #fbbf24;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 8px #fbbf2444);
}

/* Responsive Design optimizado para simetría perfecta */
@media (max-width: 1200px) {
  .detail-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
  .container {
    padding: 0 1rem;
  }
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0;
  }
  .detail-card {
    min-height: 220px;
  }
}

@media (max-width: 768px) {
  .detail-content {
    padding: 1rem 0 2rem 0;
  }
  .detail-grid {
    gap: 1rem;
    max-width: 100%;
  }
  .container {
    padding: 0 0.5rem;
  }
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  .detail-card {
    min-height: 200px;
    border-radius: 16px;
  }
  .model-title {
    font-size: 2rem;
  }
  .quick-info {
    flex-direction: column;
    gap: 0.75rem;
  }
  .model-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .features-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .detail-card {
    min-height: 180px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.25rem;
  }
  .card-content {
    padding: 1rem;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .features-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .detail-card {
    min-height: 160px;
    border-radius: 12px;
  }
  .detail-grid {
    gap: 0.75rem;
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

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 30px rgba(139, 92, 246, 0.6);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-card {
  animation: fadeInUp 0.6s ease-out;
}

.detail-card:nth-child(1) { animation-delay: 0.1s; }
.detail-card:nth-child(2) { animation-delay: 0.2s; }
.detail-card:nth-child(3) { animation-delay: 0.3s; }
.detail-card:nth-child(4) { animation-delay: 0.4s; }
</style>
