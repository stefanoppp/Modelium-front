<template>
  <div class="models-view">
    <NavBar />

    <!-- Galactic Background -->
    <div class="galactic-background">
      <!-- Rotating nebula layers -->
      <div class="nebula-layer" v-for="i in 6" :key="'nebula-' + i"></div>
      
      <!-- Dynamic star field -->
      <div class="star-field">
        <div 
          class="star" 
          v-for="i in 200" 
          :key="'star-' + i"
          :style="getStarStyle(i)"
        ></div>
      </div>
      
      <!-- Floating particles -->
      <div class="particle-field">
        <div 
          class="particle" 
          v-for="i in 30" 
          :key="'particle-' + i"
          :style="getParticleStyle(i)"
        ></div>
      </div>

      <!-- Grid overlay -->
      <div class="cyber-grid">
        <div class="grid-lines horizontal"></div>
        <div class="grid-lines vertical"></div>
      </div>
    </div>

    <!-- Header -->
    <div class="models-header">
      <div class="container">
        <!-- Title section with tech styling -->
        <div class="header-content">
          <div class="title-section">
            <div class="title-container">
              <h1 class="title-glitch">
                <span class="title-text">MIS MODELOS</span>
                <div class="title-underline"></div>
              </h1>
            </div>
            <p class="subtitle-text">
              <span class="subtitle-prefix">&gt;</span> Gestiona tus modelos de inteligencia artificial<span class="cursor-blink">_</span>
            </p>
          </div>

          <!-- Enhanced stats dashboard -->
          <div class="stats-dashboard">
            <div class="stat-card" v-for="(stat, index) in statsData" :key="index">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
              <div class="stat-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <div class="models-content">
        <!-- Search Bar -->
        <div class="search-container" v-if="!isLoading && !error && modelsData.models && modelsData.models.length > 0">
          <div class="search-bar">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Buscar en mis modelos..."
              class="search-input"
            />
            <div class="search-glow"></div>
          </div>
        </div>
        <!-- Loading state -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-hologram">
            <div class="hologram-ring" v-for="i in 3" :key="'ring-' + i"></div>
            <div class="loading-core">
              <i class="pi pi-spin pi-cog"></i>
            </div>
          </div>
          <p class="loading-text">
            <span class="loading-dots">Cargando modelos</span>
            <span class="cursor-blink">_</span>
          </p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <div class="error-hologram">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <div class="error-glitch"></div>
          </div>
          <h3 class="error-title">ERROR DE CONEXIÓN</h3>
          <p class="error-message">{{ error }}</p>
          <div class="error-actions">
            <TechButton
              label="REINTENTAR"
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
          <div class="empty-hologram">
            <div class="hologram-cube">
              <div class="cube-face front"></div>
              <div class="cube-face back"></div>
              <div class="cube-face right"></div>
              <div class="cube-face left"></div>
              <div class="cube-face top"></div>
              <div class="cube-face bottom"></div>
            </div>
          </div>
          <h3 class="empty-title">
            <span class="glitch-text">¡Es hora de crear tu primer modelo!</span>
          </h3>
          <p class="empty-message">
            Construye tu arsenal de inteligencia artificial y descubre el poder de los datos. 
            Tu primer modelo te está esperando.
          </p>
          <div class="empty-actions">
            <TechButton
              label="CREAR MI PRIMER MODELO"
              icon="pi pi-plus"
              @click="createModel"
              class="create-btn primary-glow"
            />
          </div>
        </div>

        <!-- Models grid -->
        <div v-else class="models-grid">
          <!-- No results message -->
          <div v-if="filteredModels.length === 0 && searchQuery.trim()" class="no-results-container">
            <div class="no-results-icon">
              <i class="pi pi-search"></i>
            </div>
            <h3 class="no-results-title">Sin resultados</h3>
            <p class="no-results-message">
              No se encontraron modelos que coincidan con "<strong>{{ searchQuery }}</strong>"
            </p>
            <button @click="searchQuery = ''" class="clear-search-btn">
              <i class="pi pi-times"></i>
              Limpiar búsqueda
            </button>
          </div>

          <!-- Model cards -->
          <div
            v-for="model in filteredModels"
            :key="model.id"
            class="model-card"
            :class="getModelCardClass(model)"
            @click="selectModel(model)"
          >
            <!-- Card scanner effect -->
            <div class="card-scanner"></div>
            <div class="card-glow"></div>

            <!-- Card header -->
            <div class="card-header">
              <div class="status-indicator">
                <div class="status-light" :class="getStatusClass(model.status)">
                  <div class="status-pulse"></div>
                </div>
                <span class="status-text">{{ getStatusLabel(model.status) }}</span>
              </div>
              
              <div class="model-type-chip" :class="getTypeClass(model.task_type)">
                <i :class="getTypeIcon(model.task_type)"></i>
                <span>{{ getTaskTypeLabel(model.task_type) }}</span>
              </div>
            </div>

            <!-- Card content -->
            <div class="card-content">
              <div class="content-header">
                <h3 class="model-name">
                  <span class="name-bracket">[</span>
                  {{ model.name }}
                  <span class="name-bracket">]</span>
                </h3>
                
                <div class="visibility-badge" :class="{ public: model.is_public }">
                  <i :class="model.is_public ? 'pi pi-globe' : 'pi pi-lock'"></i>
                  <span>{{ model.is_public ? 'PÚBLICO' : 'PRIVADO' }}</span>
                </div>
              </div>

              <p class="model-description">{{ model.description || 'Neural network sin descripción' }}</p>

              <!-- Enhanced model details -->
              <div class="model-metadata">
                <div class="metadata-grid">
                  <div class="metadata-item">
                    <div class="metadata-icon">
                      <i class="pi pi-database"></i>
                    </div>
                    <div class="metadata-content">
                      <span class="metadata-label">Dataset</span>
                      <span class="metadata-value">{{ model.dataset_name }}</span>
                    </div>
                  </div>
                  
                  <div class="metadata-item">
                    <div class="metadata-icon">
                      <i class="pi pi-list"></i>
                    </div>
                    <div class="metadata-content">
                      <span class="metadata-label">Features</span>
                      <span class="metadata-value">{{ model.features_count }}</span>
                    </div>
                  </div>
                  
                  <div class="metadata-item">
                    <div class="metadata-icon">
                      <i class="pi pi-bullseye"></i>
                    </div>
                    <div class="metadata-content">
                      <span class="metadata-label">Target</span>
                      <span class="metadata-value">{{ model.target_column }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Enhanced progress bar -->
              <div class="progress-section" v-if="model.status === 'training'">
                <div class="progress-header">
                  <span class="progress-label">ENTRENAMIENTO</span>
                  <span class="progress-percentage">{{ model.progress }}%</span>
                </div>
                <div class="progress-container">
                  <div class="progress-track">
                    <div 
                      class="progress-fill" 
                      :style="{ width: model.progress + '%' }"
                    >
                      <div class="progress-glow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Performance metrics preview -->
              <div class="metrics-preview" v-if="model.status === 'completed' && model.model_metrics">
                <div class="metrics-title">MÉTRICAS</div>
                <div class="metrics-grid">
                  <div class="metric-item" v-for="(value, key) in getTopMetrics(model.model_metrics)" :key="key">
                    <span class="metric-label">{{ formatMetricLabel(key) }}</span>
                    <span class="metric-value">{{ formatMetricValue(value) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card footer -->
            <div class="card-footer">
              <div class="model-timestamp">
                <i class="pi pi-clock"></i>
                <span>{{ formatDate(model.created_at) }}</span>
              </div>
              
              <div class="card-actions">
                <div class="action-hint">
                  <span>ACCEDER</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>

            <!-- Hover overlay -->
            <div class="card-overlay">
              <div class="overlay-content">
                <i class="pi pi-eye overlay-icon"></i>
                <span class="overlay-text">Ver Detalles</span>
              </div>
            </div>
          </div>
          
          <!-- Pagination Controls -->
          <div v-if="!isLoading && !error && modelsData.models && modelsData.models.length > 0 && showPagination" class="pagination-container">
            <div class="pagination-info">
              <span class="pagination-text">
                Página {{ currentPage }} de {{ totalPages }} 
                <span class="total-models">({{ modelsData.count }} modelos total)</span>
              </span>
            </div>
            
            <div class="pagination-controls">
              <!-- Primera página -->
              <button 
                @click="goToPage(1)" 
                :disabled="currentPage === 1"
                class="pagination-btn first-page"
                title="Primera página"
              >
                <i class="pi pi-angle-double-left"></i>
              </button>
              
              <!-- Página anterior -->
              <button 
                @click="goToPreviousPage" 
                :disabled="!hasPreviousPage"
                class="pagination-btn prev-page"
                title="Página anterior"
              >
                <i class="pi pi-angle-left"></i>
              </button>
              
              <!-- Números de página -->
              <div class="page-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['page-number', { active: page === currentPage }]"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>
              
              <!-- Página siguiente -->
              <button 
                @click="goToNextPage" 
                :disabled="!hasNextPage"
                class="pagination-btn next-page"
                title="Página siguiente"
              >
                <i class="pi pi-angle-right"></i>
              </button>
              
              <!-- Última página -->
              <button 
                @click="goToPage(totalPages)" 
                :disabled="currentPage === totalPages"
                class="pagination-btn last-page"
                title="Última página"
              >
                <i class="pi pi-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TechButton from '@/components/ui/TechButton.vue'
import NavBar from '@/components/layout/NavBar.vue'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const modelsData = ref({ 
  count: 0, 
  models: [],
  num_pages: 0,
  current_page: 1,
  page_size: 15,
  has_next: false,
  has_previous: false,
  next_page: null,
  previous_page: null
})
const isLoading = ref(true)
const error = ref(null)
const debugInfo = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const updateInterval = ref(null)

// Computed properties
const completedModels = computed(
  () => modelsData.value.models?.filter((model) => model.status === 'completed') || [],
)

const publicModels = computed(
  () => modelsData.value.models?.filter((model) => model.is_public) || [],
)

// Filtered models based on search query
const filteredModels = computed(() => {
  if (!searchQuery.value.trim()) {
    // Sin búsqueda: mostrar modelos de la página actual
    return modelsData.value.models || []
  }
  
  // Con búsqueda: filtrar todos los modelos disponibles en la página actual
  const query = searchQuery.value.toLowerCase().trim()
  return modelsData.value.models?.filter(model => 
    model.name.toLowerCase().includes(query) ||
    model.description?.toLowerCase().includes(query) ||
    model.dataset_name?.toLowerCase().includes(query) ||
    model.target_column?.toLowerCase().includes(query) ||
    getTaskTypeLabel(model.task_type).toLowerCase().includes(query) ||
    getStatusLabel(model.status).toLowerCase().includes(query)
  ) || []
})

// Computed para mostrar la paginación (solo cuando no hay búsqueda activa)
const showPagination = computed(() => {
  return !searchQuery.value.trim() && totalPages.value > 1
})

// Computed stats for enhanced dashboard
const statsData = computed(() => [
  {
    icon: 'pi pi-th-large',
    value: modelsData.value.count || 0,
    label: 'Modelos totales'
  },
  {
    icon: 'pi pi-check-circle',
    value: completedModels.value.length,
    label: 'Completados'
  },
  {
    icon: 'pi pi-eye',
    value: publicModels.value.length,
    label: 'Publicos'
  },
  {
    icon: 'pi pi-cog',
    value: modelsData.value.models?.filter(m => m.status === 'training').length || 0,
    label: 'Entrenando'
  }
])

// Pagination computed properties
const totalPages = computed(() => modelsData.value.num_pages || 0)
const hasNextPage = computed(() => modelsData.value.has_next || false)
const hasPreviousPage = computed(() => modelsData.value.has_previous || false)

// Páginas visibles en la paginación
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    // Si hay 7 páginas o menos, mostrar todas
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Lógica más compleja para muchas páginas
    if (current <= 4) {
      // Cerca del inicio
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      // Cerca del final
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      // En el medio
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

// Methods for dynamic styling
const getStarStyle = (index) => {
  const delay = (index * 0.1) % 4
  const duration = 3 + (index % 3)
  const size = Math.random() * 3 + 1
  
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's',
    width: size + 'px',
    height: size + 'px'
  }
}

const getParticleStyle = (index) => {
  const delay = (index * 0.2) % 6
  const duration = 8 + (index % 4)
  
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's'
  }
}

const getModelCardClass = (model) => {
  const classes = []
  if (model.status === 'completed') classes.push('completed')
  if (model.status === 'training') classes.push('training')
  if (model.status === 'failed') classes.push('failed')
  if (model.is_public) classes.push('public')
  
  // Agregar clase del tipo de modelo
  if (model.task_type === 'classification') classes.push('classification')
  if (model.task_type === 'regression') classes.push('regression')
  
  return classes.join(' ')
}

const getTypeClass = (taskType) => {
  return taskType === 'classification' ? 'classification' : 'regression'
}

const getTypeIcon = (taskType) => {
  return taskType === 'classification' ? 'pi pi-chart-pie' : 'pi pi-chart-line'
}

const getTopMetrics = (metrics) => {
  if (!metrics) return {}
  
  // Extract top 2-3 most important metrics
  const topKeys = Object.keys(metrics).slice(0, 3)
  const topMetrics = {}
  
  topKeys.forEach(key => {
    if (typeof metrics[key] === 'number') {
      topMetrics[key] = metrics[key]
    }
  })
  
  return topMetrics
}

const formatMetricLabel = (key) => {
  const labels = {
    accuracy: 'ACC',
    precision: 'PREC',
    recall: 'REC',
    f1_score: 'F1',
    r2: 'R²',
    mae: 'MAE',
    rmse: 'RMSE'
  }
  return labels[key] || key.toUpperCase()
}

const formatMetricValue = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(3)
  }
  return value
}

// Función para iniciar la actualización automática
const startAutoUpdate = () => {
  // Solo iniciar si hay modelos en entrenamiento
  const hasTrainingModels = modelsData.value.models?.some(model => model.status === 'training')
  if (hasTrainingModels && !updateInterval.value) {
    console.log('Iniciando actualización automática para modelos en entrenamiento')
    updateInterval.value = setInterval(() => {
      loadModels(currentPage.value, false) // false = no mostrar loading
    }, 3000) // Cada 3 segundos
  }
}

// Función para detener la actualización automática
const stopAutoUpdate = () => {
  if (updateInterval.value) {
    console.log('Deteniendo actualización automática')
    clearInterval(updateInterval.value)
    updateInterval.value = null
  }
}

// Methods
const loadModels = async (page = 1, showLoading = true) => {
  try {
    if (showLoading) {
      isLoading.value = true
    }
    error.value = null

    // Obtener token del authService
    const token = authService.getToken()
    if (!token) {
      throw new Error('No hay token de autenticación disponible')
    }

    console.log('Cargando modelos con token:', token ? 'Disponible' : 'No disponible')
    console.log('Página solicitada:', page)

    const response = await fetch(`http://localhost:8000/api/models/my_models/?page=${page}&page_size=15`, {
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
    currentPage.value = page
    console.log('Modelos cargados exitosamente:', data)
    
    // Verificar si hay modelos en entrenamiento y manejar actualización automática
    const hasTrainingModels = data.models?.some(model => model.status === 'training')
    if (hasTrainingModels) {
      startAutoUpdate()
    } else {
      stopAutoUpdate()
    }
    
  } catch (err) {
    error.value = err.message
    console.error('Error loading models:', err)
  } finally {
    if (showLoading) {
      isLoading.value = false
    }
  }
}

const goToPage = async (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    await loadModels(page)
  }
}

const goToNextPage = async () => {
  if (hasNextPage.value) {
    await loadModels(currentPage.value + 1)
  }
}

const goToPreviousPage = async () => {
  if (hasPreviousPage.value) {
    await loadModels(currentPage.value - 1)
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

// Watcher para resetear paginación cuando se busca
watch(searchQuery, () => {
  // Solo resetear si estamos en una página diferente a la 1
  if (currentPage.value !== 1) {
    currentPage.value = 1
    // Si hay una búsqueda activa, no necesitamos recargar desde el servidor
    // porque el filtrado se hace en el frontend
  }
})

// Lifecycle hooks
onUnmounted(() => {
  stopAutoUpdate()
})
</script>

<style scoped>
/* Search bar styles */
.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  color: #64748b;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 0.95rem;
  padding: 0.25rem;
}

.search-input::placeholder {
  color: #64748b;
}

/* No results styles */
.no-results-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  margin: 2rem 0;
}

.no-results-icon {
  width: 4rem;
  height: 4rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.no-results-icon i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.no-results-title {
  color: #e2e8f0;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.no-results-message {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  max-width: 400px;
}

.clear-search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Pagination Styles - REFACTORIZED FOR PERFECT CENTERING */
.pagination-container {
  /* Posicionamiento absoluto centrado */
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  
  /* Contenedor */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  /* Estilos visuales */
  padding: 0.75rem 1.2rem;
  background: rgba(22, 33, 62, 0.92);
  border: 1.5px solid #334155;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 24px 0 rgba(30,40,80,0.18);
  min-width: 220px;
  max-width: 420px;
  width: auto;
  
  /* Animación suave al aparecer */
  animation: slideUpFade 0.3s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.pagination-info {
  text-align: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

.pagination-text {
  color: #e0e6ed;
  font-size: 0.88rem;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0,0,0,0.25);
}

.total-models {
  color: #7b8bb2;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  width: auto;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  border: 1.2px solid #334155;
  background: rgba(26, 34, 56, 0.92);
  color: #e0e6ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  color: #60a5fa;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(15, 23, 42, 0.5);
  transform: none;
  box-shadow: none;
}

.page-numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin: 0 0.75rem;
  flex-wrap: nowrap;
}

.page-number {
  width: 32px;
  height: 32px;
  border: 1.2px solid #334155;
  background: rgba(26, 34, 56, 0.92);
  color: #e0e6ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.page-number:hover:not(:disabled):not(.active) {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  color: #60a5fa;
  transform: translateY(-2px);
}

.page-number.active {
  background: linear-gradient(135deg, #334155 60%, #1e293b 100%);
  border-color: #475569;
  color: #fff;
  box-shadow: 0 0 8px 0 rgba(51,65,85,0.18);
  transform: scale(1.08);
  font-weight: 600;
}

.page-number:disabled {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: default;
  font-weight: 400;
  pointer-events: none;
  transform: none;
}

/* Responsive design para mantener centrado */
@media (max-width: 768px) {
  .pagination-container {
    bottom: 20px;
    padding: 1.25rem 1.5rem;
    gap: 0.75rem;
    min-width: 280px;
    max-width: 95vw;
  }
  
  .pagination-controls {
    gap: 0.375rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn,
  .page-number {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
  }
  
  .page-numbers {
    margin: 0 0.5rem;
    order: 2;
    flex-basis: 100%;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .pagination-btn.first-page,
  .pagination-btn.prev-page {
    order: 1;
  }
  
  .pagination-btn.next-page,
  .pagination-btn.last-page {
    order: 3;
  }
}

@media (max-width: 480px) {
  .pagination-container {
    bottom: 15px;
    padding: 1rem 1.25rem;
    gap: 0.75rem;
    min-width: 260px;
    max-width: 98vw;
  }
  
  .pagination-text {
    font-size: 0.8rem;
  }
  
  .total-models {
    display: block;
    margin-left: 0;
    margin-top: 0.25rem;
    font-size: 0.75rem;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .pagination-btn,
  .page-number {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  }
  
  .page-numbers {
    order: 2;
    width: 100%;
    justify-content: center;
    margin: 0.5rem 0 0 0;
    gap: 0.25rem;
  }
  
  .pagination-btn.first-page,
  .pagination-btn.prev-page {
    order: 1;
  }
  
  .pagination-btn.next-page,
  .pagination-btn.last-page {
    order: 3;
  }
}



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
  padding-top: 70px; /* Altura del NavBar */
  padding-bottom: 140px; /* Espacio para paginación fija */
  background: 
    linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #1a2332 75%, #0f0f23 100%),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(25, 25, 112, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(138, 43, 226, 0.08) 0%, transparent 50%);
  color: white;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@media (max-width: 768px) {
  .models-view {
    padding-bottom: 120px;
  }
}

@media (max-width: 480px) {
  .models-view {
    padding-bottom: 110px;
  }
}

/* Galactic Background Effects */
.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.nebula-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse, rgba(138, 43, 226, 0.08) 0%, transparent 70%);
  animation: nebula-float 25s ease-in-out infinite;
}

.nebula-layer:nth-child(1) { animation-delay: 0s; }
.nebula-layer:nth-child(2) { animation-delay: 5s; background: radial-gradient(ellipse, rgba(72, 61, 139, 0.06) 0%, transparent 60%); }
.nebula-layer:nth-child(3) { animation-delay: 10s; background: radial-gradient(ellipse, rgba(25, 25, 112, 0.09) 0%, transparent 65%); }
.nebula-layer:nth-child(4) { animation-delay: 15s; background: radial-gradient(ellipse, rgba(75, 0, 130, 0.07) 0%, transparent 55%); }
.nebula-layer:nth-child(5) { animation-delay: 20s; background: radial-gradient(ellipse, rgba(102, 51, 153, 0.05) 0%, transparent 70%); }
.nebula-layer:nth-child(6) { animation-delay: 25s; background: radial-gradient(ellipse, rgba(138, 43, 226, 0.04) 0%, transparent 50%); }

@keyframes nebula-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  33% { transform: translateY(-15px) rotate(60deg) scale(1.05); opacity: 0.8; }
  66% { transform: translateY(10px) rotate(120deg) scale(0.95); opacity: 0.9; }
}

.star-field {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  background: linear-gradient(45deg, rgba(138, 43, 226, 0.6), rgba(147, 112, 219, 0.4));
  border-radius: 50%;
  animation: star-twinkle 6s ease-in-out infinite;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.particle-field {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(138, 43, 226, 0.4);
  border-radius: 50%;
  animation: particle-drift 12s linear infinite;
}

@keyframes particle-drift {
  0% { transform: translateY(100vh) translateX(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
}

.cyber-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.05;
}

.grid-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}

.grid-lines.horizontal {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 60px,
    rgba(138, 43, 226, 0.15) 60px,
    rgba(138, 43, 226, 0.15) 61px
  );
}

.grid-lines.vertical {
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 60px,
    rgba(138, 43, 226, 0.15) 60px,
    rgba(138, 43, 226, 0.15) 61px
  );
}

/* Header Styles */
.models-header {
  padding: 2rem 0 3rem;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4rem;
}

.title-section {
  flex: 1;
}

.title-glow {
  position: relative;
}

.models-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 25%, #9400D3 50%, #8B5CF6 75%, #EC4899 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
  letter-spacing: -0.01em;
  line-height: 1;
  position: relative;
}

.title-prefix,
.title-suffix {
  color: rgba(138, 43, 226, 0.7);
  font-weight: 300;
}

.models-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.models-description i {
  color: #8A2BE2;
}

/* Stats Dashboard - Mejor distribución */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 800px;
}

@media (max-width: 1024px) {
  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr);
    max-width: 500px;
  }
}

@media (max-width: 480px) {
  .stats-dashboard {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
}

.stat-card {
  background: 
    linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(35, 35, 70, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.08) 0%, transparent 50%);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 16px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(138, 43, 226, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(138, 43, 226, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8A2BE2, transparent);
  animation: scan-line 4s linear infinite;
}

@keyframes scan-line {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stat-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(138, 43, 226, 0.1);
  border-radius: 8px;
  color: #8A2BE2;
  font-size: 1rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-pulse {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8A2BE2, #9400D3);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; transform: scaleX(1); }
  50% { opacity: 0.8; transform: scaleX(1.05); }
}

/* Content Area */
.models-content {
  padding: 2rem 0 2rem;
  position: relative;
  z-index: 10;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.loading-hologram {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.hologram-ring {
  position: absolute;
  border: 2px solid rgba(138, 43, 226, 0.3);
  border-radius: 50%;
  animation: hologram-spin 4s linear infinite;
}

.hologram-ring:nth-child(1) {
  width: 80px;
  height: 80px;
  top: 0;
  left: 0;
  animation-duration: 4s;
}

.hologram-ring:nth-child(2) {
  width: 56px;
  height: 56px;
  top: 12px;
  left: 12px;
  animation-duration: 3s;
  animation-direction: reverse;
}

.hologram-ring:nth-child(3) {
  width: 32px;
  height: 32px;
  top: 24px;
  left: 24px;
  animation-duration: 2s;
}

@keyframes hologram-spin {
  0% { transform: rotate(0deg); border-color: rgba(138, 43, 226, 0.3); }
  50% { border-color: rgba(147, 112, 219, 0.5); }
  100% { transform: rotate(360deg); border-color: rgba(138, 43, 226, 0.3); }
}

.loading-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: #8A2BE2;
}

.loading-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: 'Courier New', monospace;
}

.loading-dots::after {
  content: '';
  animation: loading-dots 2s steps(4, end) infinite;
}

@keyframes loading-dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}

.cursor-blink {
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.error-hologram {
  position: relative;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 3rem;
  color: #ff6b6b;
  animation: error-pulse 2s ease-in-out infinite;
}

@keyframes error-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.error-glitch {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 40%, rgba(255, 107, 107, 0.1) 50%, transparent 60%);
  animation: glitch-effect 3s infinite;
}

@keyframes glitch-effect {
  0%, 90%, 100% { transform: translateX(0); }
  92% { transform: translateX(-2px); }
  94% { transform: translateX(2px); }
  96% { transform: translateX(-1px); }
  98% { transform: translateX(1px); }
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b6b;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.error-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem 0;
  max-width: 500px;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-hologram {
  margin-bottom: 2rem;
  perspective: 1000px;
}

.hologram-cube {
  width: 80px;
  height: 80px;
  position: relative;
  transform-style: preserve-3d;
  animation: cube-rotate 10s linear infinite;
}

.cube-face {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(138, 43, 226, 0.4);
  background: rgba(138, 43, 226, 0.05);
}

.cube-face.front { transform: rotateY(0deg) translateZ(40px); }
.cube-face.back { transform: rotateY(180deg) translateZ(40px); }
.cube-face.right { transform: rotateY(90deg) translateZ(40px); }
.cube-face.left { transform: rotateY(-90deg) translateZ(40px); }
.cube-face.top { transform: rotateX(90deg) translateZ(40px); }
.cube-face.bottom { transform: rotateX(-90deg) translateZ(40px); }

@keyframes cube-rotate {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.empty-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.glitch-text {
  background: linear-gradient(135deg, #972ef9 0%, #784bfe 50%,#35e3fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-glitch 6s infinite;
}

@keyframes text-glitch {
  0%, 90%, 100% { text-shadow: 0 0 15px rgba(138, 43, 226, 0.4); }
  92% { text-shadow: 2px 0 15px rgba(147, 112, 219, 0.4); }
  94% { text-shadow: -2px 0 15px rgba(72, 61, 139, 0.4); }
  96% { text-shadow: 1px 0 15px rgba(138, 43, 226, 0.4); }
  98% { text-shadow: -1px 0 15px rgba(147, 112, 219, 0.4); }
}

.empty-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 2rem 0;
  max-width: 600px;
  line-height: 1.6;
  text-align: center;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Estilos para botones especiales */
:deep(.create-btn.primary-glow) {
  background: linear-gradient(135deg, #8A2BE2, #9400D3);
  border-color: #8A2BE2;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
  transform: scale(1.05);
}

:deep(.create-btn.primary-glow:hover) {
  background: linear-gradient(135deg, #9932CC, #8A2BE2);
  box-shadow: 0 0 30px rgba(138, 43, 226, 0.6);
  transform: scale(1.08);
}

/* Models Grid - Responsive Layout: 3 > 2 > 1 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 1.5rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
}

/* Responsive Grid */
@media (max-width: 1024px) {
  .models-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .models-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .models-grid {
    gap: 1rem;
    padding: 0 0.5rem;
  }
}

/* Model Card Styles - Mejor organización del contenido */
.model-card {
  background: rgba(25, 25, 40, 0.85);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
  cursor: pointer;
  transform: translateZ(0);
  min-height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.model-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(138, 43, 226, 0.03) 0%, 
    transparent 50%, 
    rgba(138, 43, 226, 0.01) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.model-card:hover::before {
  opacity: 1;
}

.model-card:hover {
  transform: translateY(-4px);
  border-color: rgba(138, 43, 226, 0.4);
  box-shadow: 
    0 12px 24px rgba(138, 43, 226, 0.15),
    0 0 40px rgba(138, 43, 226, 0.05);
}

.card-scanner {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.6), transparent);
  animation: scanner-sweep 10s ease-in-out infinite;
  z-index: 2;
  opacity: 0;
}

.model-card:hover .card-scanner {
  opacity: 1;
}

@keyframes scanner-sweep {
  0%, 90%, 100% { left: -100%; }
  10%, 80% { opacity: 0.8; }
  45% { left: 100%; }
}

.card-glow {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(147, 112, 219, 0.15));
  border-radius: 17px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(4px);
}

.model-card:hover .card-glow {
  opacity: 1;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 3;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  animation: status-pulse 2s ease-in-out infinite;
}

.status-light.completed {
  background: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.status-light.training {
  background: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
}

.status-light.failed {
  background: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

.status-pulse {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.status-text {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
}

.model-type-chip {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid;
  backdrop-filter: blur(10px);
}

.model-type-chip.classification {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border-color: rgba(251, 146, 60, 0.3);
  box-shadow: 0 0 8px rgba(251, 146, 60, 0.15);
}

.model-type-chip.regression {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
  box-shadow: 0 0 8px rgba(20, 184, 166, 0.15);
}

/* Card Content - Mejor espaciado y organización */
.card-content {
  position: relative;
  z-index: 3;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.model-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: white;
  line-height: 1.3;
  font-family: 'Inter', sans-serif;
  word-wrap: break-word;
  flex: 1;
  min-width: 0;
}

.name-bracket {
  color: #8A2BE2;
  font-weight: 400;
}

.visibility-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.visibility-badge.public {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
}

.visibility-badge:not(.public) {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.model-description {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.4em;
}

/* Metadata Grid - Más compacta y organizada */
.model-metadata {
  margin: 0;
  flex: 1;
}

.metadata-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.metadata-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(138, 43, 226, 0.15);
}

.metadata-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(138, 43, 226, 0.1);
  border-radius: 6px;
  color: #8A2BE2;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.metadata-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.metadata-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
}

.metadata-value {
  font-size: 0.8rem;
  color: white;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

/* Progress Section */
.progress-section {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #f59e0b;
}

.progress-percentage {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  font-family: 'Courier New', monospace;
}

.progress-container {
  position: relative;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #00d4ff);
  border-radius: 4px;
  position: relative;
  transition: width 0.3s ease;
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
  animation: progress-shimmer 2s ease-in-out infinite;
}

@keyframes progress-shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Metrics Preview */
.metrics-preview {
  padding: 1rem;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.metrics-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #00d4ff;
  margin-bottom: 0.8rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  display: block;
  margin-bottom: 0.3rem;
}

.metric-value {
  font-size: 1.1rem;
  color: white;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* Card Footer - Más compacto */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 3;
}

.model-timestamp {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.model-timestamp i {
  color: #8A2BE2;
  font-size: 0.8rem;
}

.card-actions {
  display: flex;
  align-items: center;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  background: rgba(138, 43, 226, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.1);
  opacity: 0;
  transform: translateX(-10px);
}

.model-card:hover .action-hint {
  color: #8A2BE2;
  background: rgba(138, 43, 226, 0.1);
  border-color: rgba(138, 43, 226, 0.2);
  opacity: 1;
  transform: translateX(0);
}

/* Card Overlay - Más sutil y elegante */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(138, 43, 226, 0.06);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 5;
  backdrop-filter: blur(3px);
}

.model-card:hover .card-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-align: center;
  padding: 1.5rem;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.model-card:hover .overlay-content {
  transform: translateY(0);
}

.overlay-icon {
  font-size: 1.8rem;
  color: #8A2BE2;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.overlay-text {
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.9);
}

/* Model Card States */
.model-card.completed {
  border-color: rgba(34, 197, 94, 0.3);
}

.model-card.completed:hover {
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 25px 50px rgba(34, 197, 94, 0.2);
}

.model-card.training {
  border-color: rgba(245, 158, 11, 0.3);
}

.model-card.training:hover {
  border-color: rgba(245, 158, 11, 0.6);
  box-shadow: 0 25px 50px rgba(245, 158, 11, 0.2);
}

.model-card.failed {
  border-color: rgba(239, 68, 68, 0.3);
}

.model-card.failed:hover {
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 25px 50px rgba(239, 68, 68, 0.2);
}

/* Efecto sutil por tipo de modelo */
.model-card.completed.regression:hover {
  box-shadow: 0 25px 50px rgba(20, 184, 166, 0.15), 0 0 30px rgba(34, 197, 94, 0.1);
}

.model-card.completed.classification:hover {
  box-shadow: 0 25px 50px rgba(251, 146, 60, 0.15), 0 0 30px rgba(34, 197, 94, 0.1);
}

/* Responsive Design - Mejorado */
@media (max-width: 768px) {
  .models-header {
    padding: 1rem 0;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .models-title {
    font-size: 1.8rem;
  }
  
  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .model-card {
    padding: 1.25rem;
    min-height: 340px;
  }

  .content-header {
    margin-bottom: 0.5rem;
  }

  .model-name {
    font-size: 1rem;
  }

  .metadata-grid {
    gap: 0.4rem;
  }

  .metadata-item {
    padding: 0.4rem 0.6rem;
  }
}

@media (max-width: 480px) {
  .models-title {
    font-size: 1.5rem;
  }
  
  .stats-dashboard {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .container {
    padding: 0 0.75rem;
  }

  .model-card {
    padding: 1rem;
    min-height: 320px;
  }

  .model-name {
    font-size: 0.95rem;
  }

  .action-hint {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }

  .overlay-content {
    padding: 1rem;
  }

  .overlay-icon {
    font-size: 1.5rem;
  }

  .overlay-text {
    font-size: 0.8rem;
  }
}

/* Technological Title Styles */
.title-container {
  margin-bottom: 1rem;
}

.title-glitch {
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  margin: 0;
  position: relative;
}

.title-text {
  display: inline-block;
  letter-spacing: 2px;
}

.title-underline {
  height: 2px;
  background: linear-gradient(90deg, #ffffff 0%, transparent 100%);
  margin-top: 0.5rem;
  width: 60%;
}

.subtitle-text {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #e2e8f0;
  margin: 0;
  line-height: 1.6;
}

.subtitle-prefix {
  color: #ffffff;
  margin-right: 0.5rem;
}

.cursor-blink {
  animation: blink 1s infinite;
  color: #ffffff;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

</style>
