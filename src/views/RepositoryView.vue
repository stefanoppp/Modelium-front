<template>
  <div class="repository-container">
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

    <!-- Contenido principal -->
    <div class="main-content" :class="{ 'content-blurred': expandedModel !== null }" @click="handleMainContentClick">
      <!-- Overlay sutil para el efoque con áreas excluidas -->
      <div 
        v-if="expandedModel !== null" 
        class="focus-overlay"
      ></div>
      <!-- Título -->
      <div class="page-header">
        <div class="title-container">
          <h1 class="title-glitch">
            <span class="title-text">REPOSITORIO PÚBLICO</span>
            <div class="title-underline"></div>
          </h1>
        </div>
        <p class="subtitle-text">
          <span class="subtitle-prefix">&gt;</span> Explora y utiliza modelos de Machine Learning compartidos por la comunidad<span class="cursor-blink">_</span>
        </p>
      </div>

      <!-- Controles y filtros -->
      <div class="controls-section">
        <div class="controls-card">
          <!-- Barra de búsqueda -->
          <div class="search-container">
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Buscar modelos por nombre..."
                class="search-input"
                @input="filterModels"
              />
              <button 
                v-if="searchQuery" 
                @click="clearSearch" 
                class="clear-search-btn"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Filtros -->
          <div class="filters-container">
            <div class="filter-group">
              <label class="filter-label">Tipo de modelo:</label>
              <select v-model="selectedType" @change="filterModels" class="filter-select">
                <option value="">Todos</option>
                <option value="classification">Clasificación</option>
                <option value="regression">Regresión</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Ordenar por:</label>
              <select v-model="sortBy" @change="sortModels" class="filter-select">
                <option value="created_at">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="owner">Autor</option>
                <option value="popularity">Popularidad</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Orden:</label>
              <select v-model="sortOrder" @change="sortModels" class="filter-select">
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="stats-container">
            <div class="stat-item">
              <i class="pi pi-chart-bar"></i>
              <span>{{ filteredModels.length }} modelo{{ filteredModels.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="stat-item">
              <i class="pi pi-users"></i>
              <span>{{ uniqueAuthors }} autor{{ uniqueAuthors !== 1 ? 'es' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de modelos -->
      <div v-if="!isLoading && filteredModels.length > 0" class="models-grid">
        <div 
          v-for="model in filteredModels" 
          :key="model.id"
          class="model-card"
          :class="{ expanded: expandedModel === model.id }"
          :data-model-id="model.id"
          @click="toggleExpanded(model.id)"
        >
          <!-- Cabecera del modelo -->
          <div class="model-header">
            <div class="model-type-badge" :class="getTypeClass(model.task_type)">
              <i :class="getTypeIcon(model.task_type)"></i>
              {{ getTypeLabel(model.task_type) }}
            </div>
            <div class="model-stats">
              <div class="stat-badge" title="Número total de predicciones realizadas">
                <i class="pi pi-chart-line"></i>
                <span class="stat-value">{{ model.statistics.total_predictions }}</span>
                <span class="stat-label">predicciones</span>
              </div>
              <div class="stat-badge" title="Cantidad de usuarios que han usado este modelo">
                <i class="pi pi-users"></i>
                <span class="stat-value">{{ model.statistics.unique_users }}</span>
                <span class="stat-label">usuarios</span>
              </div>
            </div>
          </div>

          <!-- Información básica -->
          <div class="model-info">
            <h3 class="model-name">{{ model.name }}</h3>
            <p class="model-description">{{ model.description }}</p>
            <div class="model-meta">
              <span class="model-owner">
                <i class="pi pi-user"></i>
                {{ model.owner }}
              </span>
              <span class="model-date">
                <i class="pi pi-calendar"></i>
                {{ formatDate(model.created_at) }}
              </span>
            </div>
          </div>

          <!-- Información expandida -->
          <div v-if="expandedModel === model.id" class="model-details">
            <div class="details-section">
              <h4>Información del Dataset</h4>
              <div class="detail-item">
                <span class="detail-label">Archivo:</span>
                <span class="detail-value">{{ model.dataset_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Variable objetivo:</span>
                <span class="detail-value">{{ model.target_column }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Número de características:</span>
                <span class="detail-value">{{ model.features_count }}</span>
              </div>
            </div>

            <div class="details-section">
              <h4>Características del modelo</h4>
              <div class="features-list">
                <span 
                  v-for="feature in getModelFeatures(model)" 
                  :key="feature"
                  class="feature-tag"
                >
                  {{ feature }}
                </span>
              </div>
            </div>

            <div class="details-section">
              <h4>Métricas del modelo</h4>
              <div class="metrics-grid">
                <!-- Métricas para clasificación -->
                <div v-if="model.task_type === 'classification'" class="metric-items">
                  <div class="metric-item" v-if="model.metrics?.accuracy">
                    <div class="metric-icon">
                      <i class="pi pi-check-circle"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">Exactitud (Accuracy)</span>
                      <span class="metric-value">{{ (model.metrics.accuracy * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                  <div class="metric-item" v-if="model.metrics?.f1_score">
                    <div class="metric-icon">
                      <i class="pi pi-verified"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">F1-Score</span>
                      <span class="metric-value">{{ (model.metrics.f1_score * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                  <div class="metric-item" v-if="model.metrics?.precision">
                    <div class="metric-icon">
                      <i class="pi pi-chart-bar"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">Precisión</span>
                      <span class="metric-value">{{ (model.metrics.precision * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                  <div class="metric-item" v-if="model.metrics?.recall">
                    <div class="metric-icon">
                      <i class="pi pi-search"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">Recall</span>
                      <span class="metric-value">{{ (model.metrics.recall * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Métricas para regresión -->
                <div v-if="model.task_type === 'regression'" class="metric-items">
                  <div class="metric-item" v-if="model.metrics?.r2">
                    <div class="metric-icon">
                      <i class="pi pi-chart-line"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">R² Score</span>
                      <span class="metric-value">{{ (model.metrics.r2 * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                  <div class="metric-item" v-if="model.metrics?.mae">
                    <div class="metric-icon">
                      <i class="pi pi-minus"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">MAE</span>
                      <span class="metric-value">{{ model.metrics.mae.toFixed(3) }}</span>
                    </div>
                  </div>
                  <div class="metric-item" v-if="model.metrics?.rmse">
                    <div class="metric-icon">
                      <i class="pi pi-calculator"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">RMSE</span>
                      <span class="metric-value">{{ model.metrics.rmse.toFixed(3) }}</span>
                    </div>
                  </div>
                  <div class="metric-item" v-if="model.metrics?.mape">
                    <div class="metric-icon">
                      <i class="pi pi-percentage"></i>
                    </div>
                    <div class="metric-content">
                      <span class="metric-label">MAPE</span>
                      <span class="metric-value">{{ model.metrics.mape.toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Mensaje si no hay métricas -->
                <div v-if="!model.metrics" class="no-metrics">
                  <i class="pi pi-info-circle"></i>
                  <span>Métricas no disponibles para este modelo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="model-actions">
            <button 
              @click.stop="toggleExpanded(model.id)"
              class="expand-btn action-button"
            >
              <i :class="expandedModel === model.id ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              {{ expandedModel === model.id ? 'Contraer' : 'Ver más' }}
            </button>
            <button 
              @click.stop="navigateToPredict(model.id)"
              class="predict-btn action-button"
              style="position: relative; z-index: 10;"
            >
              <i class="pi pi-play"></i>
              Usar modelo
            </button>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando modelos públicos...</p>
      </div>

      <!-- Estado vacío -->
      <div v-if="!isLoading && models.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-inbox"></i>
        </div>
        <h3>No hay modelos públicos disponibles</h3>
        <p>Aún no hay modelos compartidos en el repositorio público</p>
      </div>

      <!-- Sin resultados de búsqueda -->
      <div v-if="!isLoading && models.length > 0 && filteredModels.length === 0" class="no-results-state">
        <div class="empty-icon">
          <i class="pi pi-search"></i>
        </div>
        <h3>No se encontraron modelos</h3>
        <p>Intenta ajustar tus filtros o términos de búsqueda</p>
        <TechButton 
          label="Limpiar filtros" 
          icon="pi pi-refresh"
          @click="clearAllFilters"
          class="clear-filters-btn"
        />
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="!isLoading && models.length > 0 && showPagination" class="pagination-container">
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
</template>

<script setup>
import { computed, onMounted, ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAuthGuard } from '@/composables/useAuthGuard'
import TechButton from '@/components/ui/TechButton.vue'
import NavBar from '@/components/layout/NavBar.vue'
import apiClient from '@/services/apiService'

const router = useRouter()
const authStore = useAuthStore()
const { safeApiCall } = useAuthGuard()

// Estado reactivo
const models = ref([])
const modelsData = ref({
  count: 0,
  public_models: [],
  num_pages: 0,
  current_page: 1,
  page_size: 15,
  has_next: false,
  has_previous: false,
  next_page: null,
  previous_page: null
})
const filteredModels = ref([])
const isLoading = ref(false)
const expandedModel = ref(null)
const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const currentPage = ref(1)

// Computed properties
const uniqueAuthors = computed(() => {
  const authors = new Set(filteredModels.value.map(model => model.owner))
  return authors.size
})

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

// Computed para mostrar la paginación (solo cuando no hay búsqueda activa)
const showPagination = computed(() => {
  return !searchQuery.value.trim() && !selectedType.value && totalPages.value > 1
})

// Funciones
const loadPublicModels = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await safeApiCall(
      () => apiClient.get(`/api/models/public/?page=${page}&page_size=15`),
      'carga de modelos públicos'
    )
    if (response && response.data) {
      modelsData.value = response.data
      models.value = response.data.public_models || []
      filteredModels.value = [...models.value]
      currentPage.value = page
      sortModels()
    }
  } catch (error) {
    console.error('Error loading public models:', error)
    // Aquí podrías agregar una notificación de error
  } finally {
    isLoading.value = false
  }
}

const goToPage = async (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    await loadPublicModels(page)
  }
}

const goToNextPage = async () => {
  if (hasNextPage.value) {
    await loadPublicModels(currentPage.value + 1)
  }
}

const goToPreviousPage = async () => {
  if (hasPreviousPage.value) {
    await loadPublicModels(currentPage.value - 1)
  }
}

const filterModels = () => {
  let filtered = [...models.value]

  // Filtro por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.owner.toLowerCase().includes(query)
    )
  }

  // Filtro por tipo
  if (selectedType.value) {
    filtered = filtered.filter(model => model.task_type === selectedType.value)
  }

  filteredModels.value = filtered
  sortModels()
}

const sortModels = () => {
  filteredModels.value.sort((a, b) => {
    let aValue, bValue

    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'owner':
        aValue = a.owner.toLowerCase()
        bValue = b.owner.toLowerCase()
        break
      case 'popularity':
        aValue = a.statistics.total_predictions + a.statistics.unique_users
        bValue = b.statistics.total_predictions + b.statistics.unique_users
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  filterModels()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  sortBy.value = 'created_at'
  sortOrder.value = 'desc'
  filterModels()
}

const toggleExpanded = async (modelId) => {
  expandedModel.value = expandedModel.value === modelId ? null : modelId
  
  // Esperar a que el DOM se actualice para animaciones suaves
  await nextTick()
  
  // Hacer scroll suave hacia la tarjeta expandida si es necesario
  if (expandedModel.value === modelId) {
    const cardElement = document.querySelector(`[data-model-id="${modelId}"]`)
    if (cardElement) {
      setTimeout(() => {
        cardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        })
      }, 200) // Pequeño delay para que la animación se vea mejor
    }
  }
}

const handleMainContentClick = (event) => {
  // Si no hay una tarjeta expandida, no hacer nada
  if (!expandedModel.value) {
    return
  }
  
  // Si el click fue en un botón de acción o dentro de una tarjeta, no cerrar
  const isActionButton = event.target.closest('.action-button')
  const isModelCard = event.target.closest('.model-card')
  
  // Si clickeamos en un botón de acción, no cerrar
  if (isActionButton) {
    return
  }
  
  // Si clickeamos dentro de la tarjeta expandida, no cerrar
  if (isModelCard) {
    const cardId = isModelCard.getAttribute('data-model-id')
    if (cardId === expandedModel.value.toString()) {
      return
    }
  }
  
  // Si llegamos aquí, es un click fuera de la tarjeta expandida, cerrar
  expandedModel.value = null
}

// Función simplificada - ya no es necesaria la reorganización manual
const reorganizeGrid = () => {
  // Esta función ahora es opcional gracias a las mejoras de CSS
  // Se mantiene para compatibilidad futura
}

const navigateToPredict = (modelId) => {
  console.log('Navegando a predicciones con modelo ID:', modelId)
  // Navegar a la vista de predicciones con el modelo público
  router.push({
    name: 'public-prediction',
    params: { modelId: modelId }
  }).catch(error => {
    console.error('Error de navegación:', error)
  })
}

// Utilidades
const getTypeClass = (type) => {
  return {
    'type-classification': type === 'classification',
    'type-regression': type === 'regression'
  }
}

const getTypeIcon = (type) => {
  return type === 'classification' ? 'pi pi-tags' : 'pi pi-chart-line'
}

const getTypeLabel = (type) => {
  return type === 'classification' ? 'Clasificación' : 'Regresión'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Función para procesar las características del modelo
const getModelFeatures = (model) => {
  if (!model.features_list) {
    return []
  }
  
  let features = []
  
  // Si features_list es un string (JSON), parsearlo
  if (typeof model.features_list === 'string') {
    try {
      features = JSON.parse(model.features_list)
    } catch (error) {
      console.warn('Error parsing features_list:', error)
      return []
    }
  }
  // Si ya es un array, usarlo directamente
  else if (Array.isArray(model.features_list)) {
    features = model.features_list
  }
  // Si es un objeto, extraer los nombres de las características
  else if (typeof model.features_list === 'object') {
    features = Object.keys(model.features_list)
  }
  else {
    return []
  }
  
  // Extraer solo los nombres de las features
  return features.map(feature => {
    // Si la feature es un objeto con propiedad 'name', extraer el nombre
    if (typeof feature === 'object' && feature.name) {
      return feature.name
    }
    // Si es un string, devolverlo directamente
    if (typeof feature === 'string') {
      return feature
    }
    // Para cualquier otro caso, convertir a string
    return String(feature)
  })
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
onMounted(async () => {
  await loadPublicModels()
  
  // Posicionar elementos del fondo galáctico después de que se monte el componente
  setTimeout(() => {
    positionGalacticElements()
  }, 100)
})

// Watchers para resetear paginación cuando se filtra
watch([searchQuery, selectedType], () => {
  // Solo resetear si estamos en una página diferente a la 1
  if (currentPage.value !== 1) {
    currentPage.value = 1
    // Recargar desde el servidor cuando se cambian los filtros
    if (!searchQuery.value.trim() && !selectedType.value) {
      loadPublicModels(1)
    }
  }
})
</script>

<style scoped>
.repository-container {
  min-height: 100vh;
  padding-bottom: 140px; /* Espacio para paginación fija */
  background: 
    linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 15%, #3a3a4e 30%, #4a4a5e 45%, #5a5a6e 60%, #6a6a7e 75%, #7a7a8e 90%, #8a8a9e 100%),
    radial-gradient(circle at 15% 25%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 85% 15%, rgba(177, 156, 217, 0.15) 0%, transparent 55%),
    radial-gradient(circle at 50% 80%, rgba(200, 181, 230, 0.1) 0%, transparent 60%),
    radial-gradient(circle at 20% 60%, rgba(138, 43, 226, 0.08) 0%, transparent 65%),
    radial-gradient(circle at 80% 40%, rgba(177, 156, 217, 0.06) 0%, transparent 70%);
  position: relative;
  overflow-x: hidden;
  color: white;
}

@media (max-width: 768px) {
  .repository-container {
    padding-bottom: 120px;
  }
}

@media (max-width: 480px) {
  .repository-container {
    padding-bottom: 110px;
  }
}

/* Fondo galáctico inmersivo */
.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: radial-gradient(ellipse at 60% 40%, #0a1a2e 0%, #0f1523 70%, #000814 100%);
  overflow: hidden;
}

.cosmic-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.12) 1px, transparent 1px);
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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%);
  top: -20%;
  left: -20%;
  animation-delay: 0s;
}

.nebula-layer:nth-child(2) {
  background: radial-gradient(circle, rgba(0, 191, 255, 0.25) 0%, transparent 70%);
  top: 20%;
  right: -20%;
  animation-delay: 10s;
}

.nebula-layer:nth-child(3) {
  background: radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%);
  bottom: -20%;
  left: 10%;
  animation-delay: 20s;
}

.nebula-layer:nth-child(4) {
  background: radial-gradient(circle, rgba(30, 144, 255, 0.15) 0%, transparent 70%);
  top: 50%;
  left: -10%;
  animation-delay: 15s;
}

.nebula-layer:nth-child(5) {
  background: radial-gradient(circle, rgba(0, 123, 255, 0.12) 0%, transparent 70%);
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
  animation: starTwinkle 4s ease-in-out infinite;
}

.star:nth-child(odd) {
  animation-delay: 1s;
}

.star:nth-child(3n) {
  animation-delay: 2s;
  background: rgba(59, 130, 246, 0.6);
}

.star:nth-child(5n) {
  animation-delay: 0.5s;
  background: rgba(0, 191, 255, 0.6);
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
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
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

.main-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  transition: filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Efecto de difuminado y oscurecido cuando hay una tarjeta expandida */
/* Aplicar el efecto solo a elementos específicos, no a toda la sección */

/* Overlay sutil para el efecto de enfoque */
.focus-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(0.2px);
  z-index: 1; /* Z-index muy bajo para no interferir con ningún elemento interactivo */
  cursor: pointer;
  opacity: 0;
  animation: fadeInOverlay 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  pointer-events: none; /* Sin eventos para que no intercepte clicks */
}

@keyframes fadeInOverlay {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(0.2px);
  }
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 4rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-title {
  font-size: 2.8rem;
  font-weight: 300;
  letter-spacing: 2px;
  background: linear-gradient(135deg, 
    #3b82f6 0%, 
    #60a5fa 30%, 
    #93c5fd 60%, 
    rgba(240, 240, 250, 0.95) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 
    0 0 20px rgba(59, 130, 246, 0.4),
    0 0 40px rgba(59, 130, 246, 0.2),
    0 0 60px rgba(59, 130, 246, 0.1);
  margin-bottom: 1rem;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

.page-title i {
  margin-right: 1rem;
  color: #3b82f6;
  text-shadow: 
    0 2px 4px rgba(59, 130, 246, 0.4),
    0 4px 8px rgba(59, 130, 246, 0.3);
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(240, 240, 250, 0.8);
  margin: 0;
}

.controls-section {
  margin-bottom: 3rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Efecto sutil en la cabecera y controles cuando hay una tarjeta expandida */
.content-blurred .page-header,
.content-blurred .controls-section {
  opacity: 0.7;
  transform: scale(0.99);
}

.controls-card {
  background: rgba(25, 25, 40, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  position: relative;
  overflow: hidden;
}

.controls-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.05) 0%, 
    transparent 50%, 
    rgba(59, 130, 246, 0.02) 100%);
  opacity: 0.6;
}

.search-container {
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
  font-size: 1.1rem;
  z-index: 3;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(25, 25, 40, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  color: rgba(240, 240, 250, 0.95);
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  background: rgba(25, 25, 40, 0.95);
}

.search-input::placeholder {
  color: rgba(240, 240, 250, 0.6);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(240, 240, 250, 0.6);
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.3s ease;
  z-index: 3;
}

.clear-search-btn:hover {
  color: #ff6b6b;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem;
  background: rgba(25, 25, 40, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: rgba(240, 240, 250, 0.95);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  background: rgba(25, 25, 40, 0.95);
}

.filter-select option {
  background: rgba(25, 25, 40, 0.95);
  color: rgba(240, 240, 250, 0.95);
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(59, 130, 246, 0.3);
  position: relative;
  z-index: 2;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(240, 240, 250, 0.8);
  font-size: 0.9rem;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-item i {
  color: #3b82f6;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  /* Usar grid-auto-rows con max-content para mejor control */
  grid-auto-rows: max-content;
  align-items: start;
  /* Añadir una transición suave al propio grid */
  transition: all 0.3s ease;
  /* Optimización de rendimiento */
  contain: layout style;
}

/* Efecto sutil en las tarjetas cuando hay una expandida */
.content-blurred .model-card:not(.expanded) {
  opacity: 0.5;
  transform: scale(0.97);
  filter: blur(0.5px) brightness(0.8) saturate(0.8);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-blurred .model-card:not(.expanded):hover {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(0.3px) brightness(0.85) saturate(0.85);
}

.model-card {
  background: rgba(25, 25, 40, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  /* Altura uniforme para todas las tarjetas */
  min-height: 280px;
  display: flex;
  flex-direction: column;
  /* Asegurar que las tarjetas se mantengan en su lugar */
  align-self: start;
  /* Añadir will-change para optimizar las animaciones */
  will-change: transform, box-shadow;
  /* Optimización de renderizado */
  contain: layout style paint;
  /* Evitar que afecte a otras tarjetas */
  isolation: isolate;
}

.model-card::before {
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

.model-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
}

.model-card:hover::before {
  opacity: 1;
}

.model-card.expanded {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  /* Hacer que la transición de expansión sea más suave */
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* Dar prioridad de z-index a la tarjeta expandida, por encima del overlay */
  z-index: 100; /* Z-index alto para estar por encima del overlay pero debajo de los botones */
  /* Mejorar el contraste de la tarjeta expandida */
  filter: brightness(1.1) saturate(1.2);
  /* Añadir un resplandor sutil */
  box-shadow: 
    0 15px 40px rgba(59, 130, 246, 0.4),
    0 0 30px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  /* Asegurar que todos los elementos internos también tengan z-index alto */
  position: relative;
}

/* Asegurar que los elementos clickeables estén por encima del overlay */
.model-card.expanded * {
  position: relative;
  z-index: 30;
}

/* Los botones de acción deben tener prioridad máxima */
.model-card.expanded .model-actions,
.model-card.expanded .expand-btn,
.model-card.expanded .predict-btn {
  z-index: 1001 !important;
  pointer-events: auto !important;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.model-type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.type-classification {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border-color: rgba(251, 146, 60, 0.3);
}

.type-regression {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
}

.model-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 0.7rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(240, 240, 250, 0.8);
  min-width: 60px;
  transition: all 0.3s ease;
}

.stat-badge:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.stat-badge i {
  font-size: 0.8rem;
  color: #3b82f6;
}

.stat-value {
  font-weight: 700;
  color: rgba(240, 240, 250, 0.95);
  font-size: 0.9rem;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(240, 240, 250, 0.6);
  text-transform: lowercase;
}

.model-info {
  margin-bottom: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.model-name {
  color: rgba(240, 240, 250, 0.95);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.model-description {
  color: rgba(240, 240, 250, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
  /* Altura fija para la descripción */
  min-height: 3.6rem; /* Aproximadamente 2-3 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.model-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(240, 240, 250, 0.6);
}

.model-owner,
.model-date {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.model-owner i,
.model-date i {
  color: #3b82f6;
  font-size: 0.8rem;
}

.model-details {
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(138, 43, 226, 0.3);
  /* Animación suave para el contenido expandido */
  animation: expandContent 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  transform-origin: top center;
  /* Evitar problemas de layout durante la animación */
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes expandContent {
  0% {
    opacity: 0;
    transform: scaleY(0.3) translateY(-20px);
    filter: blur(1px);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(0.7) translateY(-10px);
    filter: blur(0.5px);
  }
  100% {
    opacity: 1;
    transform: scaleY(1) translateY(0);
    filter: blur(0);
  }
}

/* Animación más suave para las secciones de detalles */
.details-section {
  animation: slideInUp 0.4s ease-out both;
}

.details-section:nth-child(1) { animation-delay: 0.1s; }
.details-section:nth-child(2) { animation-delay: 0.2s; }
.details-section:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-section {
  margin-bottom: 1.5rem;
}

.details-section h4 {
  color: #3b82f6;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-label {
  color: rgba(240, 240, 250, 0.7);
  font-size: 0.9rem;
}

.detail-value {
  color: rgba(240, 240, 250, 0.95);
  font-weight: 600;
  font-size: 0.9rem;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.usage-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(240, 240, 250, 0.8);
  font-size: 0.9rem;
}

.usage-stat i {
  color: #3b82f6;
}

.model-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto; /* Empuja los botones al final */
  z-index: 1000; /* Z-index muy alto para estar sobre cualquier overlay */
  position: relative;
}

.expand-btn,
.predict-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 10; /* Mayor que el overlay para asegurar clickeabilidad */
  pointer-events: auto; /* Asegurar que los botones sean clickeables */
}

.expand-btn {
  background: rgba(25, 25, 40, 0.8);
  color: rgba(240, 240, 250, 0.95);
  border: 1px solid rgba(138, 43, 226, 0.3);
}

.expand-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.predict-btn {
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  color: rgba(240, 240, 250, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.predict-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #1d4ed8, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.predict-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: rgba(240, 240, 250, 0.8);
}

.loading-spinner {
  font-size: 3rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.empty-state,
.no-results-state {
  text-align: center;
  padding: 4rem;
  color: rgba(240, 240, 250, 0.7);
}

.empty-icon {
  font-size: 4rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.empty-state h3,
.no-results-state h3 {
  color: rgba(240, 240, 250, 0.95);
  margin-bottom: 1rem;
}

.empty-state p,
.no-results-state p {
  margin-bottom: 2rem;
}

.clear-filters-btn {
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  color: rgba(240, 240, 250, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.5);
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: linear-gradient(45deg, #1d4ed8, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

/* Asegurar que todos los elementos interactivos estén por encima del overlay */
.model-card {
  position: relative;
  z-index: 10; /* Por encima del overlay (z-index 1) */
}

.action-button {
  position: relative;
  z-index: 15 !important; /* Máxima prioridad para botones de acción */
  pointer-events: auto !important;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .page-header {
    padding-top: 2rem;
    margin-bottom: 2rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .controls-card {
    padding: 1.5rem;
  }
  
  .filters-container {
    grid-template-columns: 1fr;
  }
  
  .stats-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .model-actions {
    flex-direction: column;
  }
}

/* Posicionamiento random para estrellas y partículas */
.star:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.star:nth-child(2) { top: 20%; left: 80%; animation-delay: 0.5s; }
.star:nth-child(3) { top: 30%; left: 40%; animation-delay: 1s; }
.star:nth-child(4) { top: 40%; left: 70%; animation-delay: 1.5s; }
.star:nth-child(5) { top: 50%; left: 10%; animation-delay: 2s; }
.star:nth-child(6) { top: 60%; left: 90%; animation-delay: 2.5s; }
.star:nth-child(7) { top: 70%; left: 30%; animation-delay: 3s; }
.star:nth-child(8) { top: 80%; left: 60%; animation-delay: 3.5s; }
.star:nth-child(9) { top: 90%; left: 50%; animation-delay: 4s; }
.star:nth-child(10) { top: 5%; left: 75%; animation-delay: 4.5s; }

.particle:nth-child(1) { left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { left: 20%; animation-delay: 1s; }
.particle:nth-child(3) { left: 30%; animation-delay: 2s; }
.particle:nth-child(4) { left: 40%; animation-delay: 3s; }
.particle:nth-child(5) { left: 50%; animation-delay: 4s; }
.particle:nth-child(6) { left: 60%; animation-delay: 5s; }
.particle:nth-child(7) { left: 70%; animation-delay: 6s; }
.particle:nth-child(8) { left: 80%; animation-delay: 7s; }
.particle:nth-child(9) { left: 90%; animation-delay: 8s; }
.particle:nth-child(10) { left: 15%; animation-delay: 9s; }

.star:nth-child(n+11) {
  top: calc(var(--random-y, 50) * 1%);
  left: calc(var(--random-x, 50) * 1%);
}

/* Estilos para las métricas del modelo */
.metrics-grid {
  margin-top: 1rem;
}

.metric-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(78, 205, 196, 0.3);
  transform: translateY(-1px);
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(78, 205, 196, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon i {
  color: #4ecdc4;
  font-size: 1rem;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.metric-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
}

.metric-value {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
}

.no-metrics {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  justify-content: center;
}

.no-metrics i {
  color: rgba(255, 255, 255, 0.4);
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

/* Animaciones para el fondo galáctico */
@keyframes gridFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -10px) rotate(0.5deg);
  }
  50% {
    transform: translate(-5px, 5px) rotate(-0.3deg);
  }
  75% {
    transform: translate(-10px, -5px) rotate(0.2deg);
  }
}

@keyframes nebulaFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  33% {
    transform: translate(20px, -15px) scale(1.1);
    opacity: 0.5;
  }
  66% {
    transform: translate(-15px, 10px) scale(0.9);
    opacity: 0.4;
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
    transform: translateY(0px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes energyFlow {
  0% {
    transform: translateX(-100%) scaleY(1);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
    transform: translateX(0%) scaleY(1.2);
  }
  100% {
    transform: translateX(100%) scaleY(1);
    opacity: 0;
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
