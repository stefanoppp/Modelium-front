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
    <div class="main-content" :class="{ 'content-blurred': expandedModel !== null }">
      <!-- Overlay sutil para el efecto de enfoque -->
      <div 
        v-if="expandedModel !== null" 
        class="focus-overlay"
        @click="toggleExpanded(expandedModel)"
      ></div>
      <!-- Título -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="pi pi-database"></i>
          Repositorio Público
        </h1>
        <p class="page-subtitle">
          Explora y utiliza modelos de Machine Learning compartidos por la comunidad
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
                  v-for="feature in model.features_list" 
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
                      <i class="pi pi-target"></i>
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
              @click="toggleExpanded(model.id)"
              class="expand-btn"
            >
              <i :class="expandedModel === model.id ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
              {{ expandedModel === model.id ? 'Contraer' : 'Ver más' }}
            </button>
            <button 
              @click="navigateToPredict(model.id)"
              class="predict-btn"
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
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
const filteredModels = ref([])
const isLoading = ref(false)
const expandedModel = ref(null)
const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// Computed properties
const uniqueAuthors = computed(() => {
  const authors = new Set(filteredModels.value.map(model => model.owner))
  return authors.size
})

// Funciones
const loadPublicModels = async () => {
  isLoading.value = true
  try {
    const response = await safeApiCall(
      () => apiClient.get('/models/public/'),
      'carga de modelos públicos'
    )
    if (response && response.data) {
      models.value = response.data.public_models || []
      filteredModels.value = [...models.value]
      sortModels()
    }
  } catch (error) {
    console.error('Error loading public models:', error)
    // Aquí podrías agregar una notificación de error
  } finally {
    isLoading.value = false
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

// Función simplificada - ya no es necesaria la reorganización manual
const reorganizeGrid = () => {
  // Esta función ahora es opcional gracias a las mejoras de CSS
  // Se mantiene para compatibilidad futura
}

const navigateToPredict = (modelId) => {
  // Navegar a la vista de predicciones con el modelo público
  router.push({
    name: 'public-prediction',
    params: { modelId: modelId }
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

// Lifecycle
onMounted(async () => {
  await loadPublicModels()
})
</script>

<style scoped>
.repository-container {
  min-height: 100vh;
  background: 
    linear-gradient(135deg, #000000 0%, #0a0a0f 15%, #1a0a1a 30%, #0f0f1a 45%, #1a1a2e 60%, #2a1a3a 75%, #1a2a4a 90%, #0f1a2a 100%),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(25, 25, 112, 0.35) 0%, transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 20% 60%, rgba(72, 61, 139, 0.25) 0%, transparent 55%),
    radial-gradient(circle at 80% 40%, rgba(106, 90, 205, 0.2) 0%, transparent 60%);
  position: relative;
  overflow-x: hidden;
  color: white;
}

.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.cosmic-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(138, 43, 226, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 43, 226, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
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
  background: radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
  animation: nebula-float 15s ease-in-out infinite;
}

.nebula-layer:nth-child(1) { animation-delay: 0s; }
.nebula-layer:nth-child(2) { animation-delay: 3s; }
.nebula-layer:nth-child(3) { animation-delay: 6s; }
.nebula-layer:nth-child(4) { animation-delay: 9s; }
.nebula-layer:nth-child(5) { animation-delay: 12s; }

@keyframes nebula-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.star-field {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: star-twinkle 3s infinite;
}

.star:nth-child(odd) {
  animation-delay: 1s;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: particle-float 10s linear infinite;
}

@keyframes particle-float {
  0% { transform: translateY(100vh) translateX(0); }
  100% { transform: translateY(-20px) translateX(100px); }
}

.energy-streams {
  position: absolute;
  width: 100%;
  height: 100%;
}

.energy-stream {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(138, 43, 226, 0.5), transparent);
  animation: energy-flow 8s linear infinite;
}

.energy-stream:nth-child(1) { left: 20%; animation-delay: 0s; }
.energy-stream:nth-child(2) { left: 40%; animation-delay: 2s; }
.energy-stream:nth-child(3) { left: 60%; animation-delay: 4s; }
.energy-stream:nth-child(4) { left: 80%; animation-delay: 6s; }

@keyframes energy-flow {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
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
  z-index: 5;
  cursor: pointer;
  opacity: 0;
  animation: fadeInOverlay 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  pointer-events: auto;
  /* Excluir las tarjetas expandidas del overlay */
  pointer-events: auto;
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
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite;
  margin-bottom: 1rem;
}

.page-title i {
  margin-right: 1rem;
  color: #4ecdc4;
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.search-container {
  margin-bottom: 2rem;
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
  color: #4ecdc4;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.clear-search-btn:hover {
  color: #ff6b6b;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  color: #4ecdc4;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
}

.filter-select option {
  background: #1a1a2e;
  color: white;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.stat-item i {
  color: #4ecdc4;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: #4ecdc4;
}

.model-card.expanded {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(78, 205, 196, 0.2);
  border-color: #4ecdc4;
  /* Hacer que la transición de expansión sea más suave */
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* Dar prioridad de z-index a la tarjeta expandida, por encima del overlay */
  z-index: 25;
  /* Mejorar el contraste de la tarjeta expandida */
  filter: brightness(1.1) saturate(1.2);
  /* Añadir un resplandor sutil */
  box-shadow: 
    0 15px 40px rgba(78, 205, 196, 0.3),
    0 0 30px rgba(78, 205, 196, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  /* Asegurar que todos los elementos internos también tengan z-index alto */
  position: relative;
}

/* Asegurar que los elementos clickeables estén por encima del overlay */
.model-card.expanded * {
  position: relative;
  z-index: 30;
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
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-classification {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.type-regression {
  background: rgba(69, 183, 209, 0.2);
  color: #45b7d1;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  min-width: 60px;
  transition: all 0.3s ease;
}

.stat-badge:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.stat-badge i {
  font-size: 0.8rem;
  color: #4ecdc4;
}

.stat-value {
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: lowercase;
}

.model-info {
  margin-bottom: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.model-name {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.model-description {
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.6);
}

.model-owner,
.model-date {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.model-owner i,
.model-date i {
  color: #4ecdc4;
  font-size: 0.8rem;
}

.model-details {
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #4ecdc4;
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.detail-value {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
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
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.usage-stat i {
  color: #4ecdc4;
}

.model-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto; /* Empuja los botones al final */
  z-index: 30; /* Z-index alto para evitar problemas con overlay */
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
  z-index: 35; /* Z-index alto para asegurar que funcionen */
}

.expand-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #4ecdc4;
}

.predict-btn {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  color: white;
}

.predict-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #45b7d1, #4ecdc4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
}

.predict-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  font-size: 3rem;
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.empty-state,
.no-results-state {
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 4rem;
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.empty-state h3,
.no-results-state h3 {
  color: white;
  margin-bottom: 1rem;
}

.empty-state p,
.no-results-state p {
  margin-bottom: 2rem;
}

.clear-filters-btn {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: linear-gradient(45deg, #ff8e8e, #ff6b6b);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
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
</style>
