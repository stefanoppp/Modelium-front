<template>
  <div class="manage-models-view">
    <NavBar />
    
    <!-- Fondo galáctico inmersivo -->
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

    <!-- Overlay de fondo con gradiente -->
    <div class="manage-models-view::before"></div>

    <!-- Contenido principal -->
    <div class="container">
      <!-- Header con efecto shimmer -->
      <div class="manage-header">
        <div class="manage-header::after"></div>
        <div class="header-content">
          <div class="title-container">
            <h1 class="title-glitch">
              <span class="title-text">GESTIÓN DE MODELOS</span>
              <div class="title-underline"></div>
            </h1>
          </div>
          <p class="subtitle-text">
            <span class="subtitle-prefix">&gt;</span> Centro de control para administrar y eliminar tus modelos de machine learning<span class="cursor-blink">_</span>
          </p>
        </div>
      </div>

      <!-- Advertencia elegante -->
      <div class="warning-section">
        <div class="warning-card">
          <div class="warning-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="warning-content">
            <h3>Gestión Responsable</h3>
            <p>La eliminación de modelos es permanente e irreversible. Verifica cuidadosamente antes de proceder con cualquier eliminación.</p>
          </div>
        </div>
      </div>

      <!-- Panel de control elegante -->
      <div class="controls-section">
        <div class="controls-card">
          <!-- Filtros refinados -->
          <div class="filters-container">
            <div class="filter-group">
              <label class="filter-label">
                <i class="pi pi-filter"></i>
                Estado del modelo
              </label>
              <select v-model="selectedStatus" @change="filterModels" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="completed">Completados</option>
                <option value="training">Entrenando</option>
                <option value="failed">Fallidos</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <i class="pi pi-tags"></i>
                Tipo de tarea
              </label>
              <select v-model="selectedType" @change="filterModels" class="filter-select">
                <option value="">Todos los tipos</option>
                <option value="classification">Clasificación</option>
                <option value="regression">Regresión</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <i class="pi pi-search"></i>
                Búsqueda inteligente
              </label>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Buscar por nombre o descripción..."
                class="filter-input"
                @input="filterModels"
              />
            </div>
          </div>

          <!-- Panel de acciones masivas -->
          <div class="bulk-actions" v-if="selectedModels.length > 0">
            <div class="selection-info">
              <div class="selected-count">
                <i class="pi pi-check-circle"></i>
                <span>{{ selectedModels.length }} modelo{{ selectedModels.length !== 1 ? 's' : '' }} seleccionado{{ selectedModels.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>
            <div class="bulk-buttons">
              <button 
                @click="clearSelection" 
                class="tech-button clear-btn"
              >
                <i class="pi pi-times"></i>
                <span>Limpiar</span>
              </button>
              <button 
                @click="confirmBulkDelete" 
                class="tech-button delete-btn"
                :disabled="isDeleting"
              >
                <i class="pi pi-trash"></i>
                <span>{{ isDeleting ? 'Eliminando...' : 'Eliminar seleccionados' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Galería de modelos -->
      <div v-if="!isLoading && filteredModels.length > 0" class="models-section">
        
        <!-- Guía de uso elegante -->
        <div class="usage-tip" v-if="selectedModels.length === 0">
          <div class="tip-content">
            <i class="pi pi-lightbulb"></i>
            <span><strong>Consejo:</strong> Selecciona modelos haciendo clic en las tarjetas para gestionar múltiples elementos simultáneamente</span>
          </div>
        </div>

        <div class="selection-header">
          <div class="select-all">
            <input 
              type="checkbox" 
              id="selectAll"
              :checked="allModelsSelected"
              @change="toggleSelectAll"
              class="select-checkbox"
            />
            <label for="selectAll" class="select-label">
              <i class="pi pi-check-square"></i>
              Seleccionar todos
            </label>
          </div>
          <div class="models-count">
            <i class="pi pi-database"></i>
            <span>{{ filteredModels.length }} modelo{{ filteredModels.length !== 1 ? 's' : '' }} disponible{{ filteredModels.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div class="models-grid">
          <div 
            v-for="model in filteredModels" 
            :key="model.id"
            class="model-card"
            :class="{ 
              'selected': selectedModels.includes(model.id),
              'deleting': deletingModels.includes(model.id)
            }"
            @click="handleCardClick(model.id, $event)"
            :title="selectedModels.includes(model.id) ? 'Clic para deseleccionar' : 'Clic para seleccionar'"
          >
            <!-- Checkbox de selección -->
            <div class="model-checkbox">
              <input 
                type="checkbox" 
                :id="`model-${model.id}`"
                :checked="selectedModels.includes(model.id)"
                @change="toggleModelSelection(model.id)"
                @click.stop
                class="select-checkbox"
                :disabled="deletingModels.includes(model.id)"
              />
              <label :for="`model-${model.id}`" class="checkbox-label" @click.stop></label>
            </div>

            <!-- Indicador de tarjeta clickeable -->
            <div class="clickable-indicator" v-if="!deletingModels.includes(model.id)">
              <i class="pi" :class="selectedModels.includes(model.id) ? 'pi-check-circle' : 'pi-hand-pointer'"></i>
              <span>{{ selectedModels.includes(model.id) ? 'Seleccionado' : 'Clic para seleccionar' }}</span>
            </div>

            <!-- Información del modelo -->
            <div class="model-header">
              <div class="model-type-badge" :class="getTypeClass(model.task_type)">
                <i :class="getTypeIcon(model.task_type)"></i>
                {{ getTypeLabel(model.task_type) }}
              </div>
              <div class="model-status-badge" :class="getStatusClass(model.status)">
                <i :class="getStatusIcon(model.status)"></i>
                {{ getStatusLabel(model.status) }}
              </div>
            </div>

            <div class="model-info">
              <h3 class="model-name">{{ model.name }}</h3>
              <p class="model-description">{{ model.description || 'Sin descripción' }}</p>
              <div class="model-meta">
                <div class="meta-item">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDate(model.created_at) }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-database"></i>
                  <span>{{ model.dataset_name }}</span>
                </div>
                <div class="meta-item" v-if="model.is_public">
                  <i class="pi pi-globe"></i>
                  <span>Público</span>
                </div>
              </div>
            </div>

            <!-- Acciones individuales -->
            <div class="model-actions" @click.stop>
              <button 
                @click="viewModel(model.id)"
                class="action-btn view-btn"
                title="Ver detalles"
              >
                <i class="pi pi-eye"></i>
              </button>
              <button 
                @click="confirmSingleDelete(model)"
                class="action-btn delete-btn"
                :disabled="deletingModels.includes(model.id)"
                title="Eliminar modelo"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>

            <!-- Overlay de eliminación -->
            <div v-if="deletingModels.includes(model.id)" class="deleting-overlay">
              <div class="deleting-spinner">
                <i class="pi pi-spin pi-spinner"></i>
              </div>
              <span>Eliminando...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de carga elegante -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-container">
          <div class="loading-spinner">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <div class="loading-text">
            <h3>Cargando modelos</h3>
            <p>Preparando tu galería de modelos...</p>
          </div>
        </div>
      </div>

      <!-- Estado vacío elegante -->
      <div v-if="!isLoading && models.length === 0" class="empty-state">
        <div class="empty-container">
          <div class="empty-icon">
            <i class="pi pi-database"></i>
          </div>
          <div class="empty-content">
            <h3>Tu laboratorio está vacío</h3>
            <p>Comienza tu viaje en machine learning creando tu primer modelo</p>
            <button @click="navigateToCreateModel" class="tech-button create-model-btn">
              <i class="pi pi-plus"></i>
              <span>Crear Primer Modelo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sin resultados de filtros -->
      <div v-if="!isLoading && models.length > 0 && filteredModels.length === 0" class="no-results-state">
        <div class="no-results-container">
          <div class="empty-icon">
            <i class="pi pi-filter"></i>
          </div>
          <div class="no-results-content">
            <h3>Sin coincidencias</h3>
            <p>Los filtros aplicados no muestran ningún modelo</p>
            <button @click="clearFilters" class="tech-button clear-filters-btn">
              <i class="pi pi-refresh"></i>
              <span>Restablecer filtros</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="pi pi-exclamation-triangle"></i>
            Confirmar eliminación
          </h3>
        </div>
        <div class="modal-body">
          <p v-if="modelsToDelete.length === 1">
            ¿Estás seguro de que quieres eliminar el modelo <strong>"{{ modelsToDelete[0].name }}"</strong>?
          </p>
          <p v-else>
            ¿Estás seguro de que quieres eliminar <strong>{{ modelsToDelete.length }} modelos</strong>?
          </p>
          <p class="warning-text">
            Esta acción es permanente y no se puede deshacer.
          </p>
          <div v-if="modelsToDelete.length > 1" class="models-list">
            <strong>Modelos a eliminar:</strong>
            <ul>
              <li v-for="model in modelsToDelete" :key="model.id">
                {{ model.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="cancel-btn">
            <i class="pi pi-times"></i>
            Cancelar
          </button>
          <button @click="executeDelete" class="confirm-delete-btn" :disabled="isDeleting">
            <i class="pi pi-trash"></i>
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import NavBar from '@/components/layout/NavBar.vue'
import apiClient, { deleteMultipleModels } from '@/services/apiService'

const router = useRouter()
const authStore = useAuthStore()

// Estado reactivo
const models = ref([])
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
const filteredModels = ref([])
const isLoading = ref(false)
const selectedModels = ref([])
const deletingModels = ref([])
const isDeleting = ref(false)
const currentPage = ref(1)

// Filtros
const selectedStatus = ref('')
const selectedType = ref('')
const searchQuery = ref('')

// Modal de confirmación
const showDeleteModal = ref(false)
const modelsToDelete = ref([])

// Computed properties
const allModelsSelected = computed(() => {
  return filteredModels.value.length > 0 && 
         filteredModels.value.every(model => selectedModels.value.includes(model.id))
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
  return !searchQuery.value.trim() && !selectedStatus.value && !selectedType.value && totalPages.value > 1
})

// Funciones
const loadModels = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await apiClient.get(`/api/models/my_models/?page=${page}&page_size=15`)
    if (response.data) {
      modelsData.value = response.data
      models.value = response.data.models || []
      filteredModels.value = [...models.value]
      currentPage.value = page
    }
  } catch (error) {
    console.error('Error loading models:', error)
    // Aquí podrías agregar una notificación de error
  } finally {
    isLoading.value = false
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

const filterModels = () => {
  let filtered = [...models.value]

  // Filtro por estado
  if (selectedStatus.value) {
    filtered = filtered.filter(model => model.status === selectedStatus.value)
  }

  // Filtro por tipo
  if (selectedType.value) {
    filtered = filtered.filter(model => model.task_type === selectedType.value)
  }

  // Filtro por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(query) ||
      (model.description && model.description.toLowerCase().includes(query))
    )
  }

  filteredModels.value = filtered
  
  // Limpiar selección de modelos que ya no están visibles
  selectedModels.value = selectedModels.value.filter(id =>
    filtered.some(model => model.id === id)
  )
  
  // Resetear paginación cuando se aplican filtros
  if (searchQuery.value.trim() || selectedStatus.value || selectedType.value) {
    if (currentPage.value !== 1) {
      currentPage.value = 1
    }
  }
}

const clearFilters = () => {
  selectedStatus.value = ''
  selectedType.value = ''
  searchQuery.value = ''
  filterModels()
}

const toggleSelectAll = () => {
  if (allModelsSelected.value) {
    selectedModels.value = []
  } else {
    selectedModels.value = [...filteredModels.value.map(model => model.id)]
  }
}

const toggleModelSelection = (modelId) => {
  const index = selectedModels.value.indexOf(modelId)
  if (index > -1) {
    selectedModels.value.splice(index, 1)
  } else {
    selectedModels.value.push(modelId)
  }
}

const handleCardClick = (modelId, event) => {
  // Evitar selección si el modelo está siendo eliminado
  if (deletingModels.value.includes(modelId)) {
    return
  }
  
  // Alternar selección del modelo
  toggleModelSelection(modelId)
}

const clearSelection = () => {
  selectedModels.value = []
}

const confirmSingleDelete = (model) => {
  modelsToDelete.value = [model]
  showDeleteModal.value = true
}

const confirmBulkDelete = () => {
  const modelsData = selectedModels.value.map(id =>
    models.value.find(model => model.id === id)
  ).filter(Boolean)
  
  modelsToDelete.value = modelsData
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  modelsToDelete.value = []
}

const executeDelete = async () => {
  isDeleting.value = true
  
  try {
    // Agregar modelos a la lista de eliminación
    const modelIdsToDelete = modelsToDelete.value.map(model => model.id)
    deletingModels.value.push(...modelIdsToDelete)
    
    let deleteResult = null
    
    if (modelIdsToDelete.length === 1) {
      // Eliminación individual - usar endpoint específico
      const modelId = modelIdsToDelete[0]
      const response = await apiClient.delete(`/api/models/delete/${modelId}/`)
      deleteResult = response.data
    } else {
      // Eliminación múltiple - usar función optimizada con fallback
      deleteResult = await deleteMultipleModels(modelIdsToDelete)
    }
    
    // Log de información sobre limpieza de archivos (si está disponible)
    if (deleteResult?.files_cleanup) {
      const { files_deleted, files_failed, total_files } = deleteResult.files_cleanup
      console.log(`📁 Limpieza de archivos: ${files_deleted}/${total_files} eliminados exitosamente`)
      
      if (files_failed > 0) {
        console.warn(`⚠️ ${files_failed} archivos no pudieron ser eliminados`)
        // Opcional: mostrar notificación al usuario sobre archivos que no se pudieron eliminar
      }
    }
    
    // Remover modelos eliminados del estado local
    modelIdsToDelete.forEach(modelId => {
      // Remover del estado de modelos
      const modelIndex = models.value.findIndex(m => m.id === modelId)
      if (modelIndex > -1) {
        models.value.splice(modelIndex, 1)
      }
      
      // Remover de selección
      const selectedIndex = selectedModels.value.indexOf(modelId)
      if (selectedIndex > -1) {
        selectedModels.value.splice(selectedIndex, 1)
      }
    })
    
    // Log de éxito
    console.log(`✅ ${modelIdsToDelete.length} modelo(s) eliminado(s) exitosamente`)
    
    // Actualizar lista filtrada
    filterModels()
    
  } catch (error) {
    console.error('Error deleting models:', error)
    // En caso de error, mostrar mensaje al usuario
    // Aquí podrías agregar una notificación de error específica
  } finally {
    // Limpiar lista de eliminación
    const modelIdsToDelete = modelsToDelete.value.map(model => model.id)
    modelIdsToDelete.forEach(modelId => {
      const deletingIndex = deletingModels.value.indexOf(modelId)
      if (deletingIndex > -1) {
        deletingModels.value.splice(deletingIndex, 1)
      }
    })
    
    isDeleting.value = false
    closeDeleteModal()
  }
}

const viewModel = (modelId) => {
  router.push(`/models/${modelId}`)
}

const navigateToCreateModel = () => {
  router.push('/create-model')
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

const getStatusClass = (status) => {
  return {
    'status-completed': status === 'completed',
    'status-training': status === 'training',
    'status-failed': status === 'failed'
  }
}

const getStatusIcon = (status) => {
  const icons = {
    'completed': 'pi pi-check-circle',
    'training': 'pi pi-spin pi-spinner',
    'failed': 'pi pi-times-circle'
  }
  return icons[status] || 'pi pi-question-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    'completed': 'Completado',
    'training': 'Entrenando',
    'failed': 'Fallido'
  }
  return labels[status] || status
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

// Lifecycle
onMounted(async () => {
  await loadModels()
})
</script>

<style scoped>
.manage-models-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  position: relative;
  overflow-x: hidden;
  color: white;
}

.manage-models-view::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    /* Estrellas principales brillantes */
    radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
    radial-gradient(2px 2px at 40% 70%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(1px 1px at 90% 40%, rgba(255, 255, 255, 0.7) 0%, transparent 50%),
    radial-gradient(1.5px 1.5px at 60% 90%, rgba(255, 255, 255, 0.85) 0%, transparent 50%),
    radial-gradient(1px 1px at 10% 10%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
    radial-gradient(2px 2px at 80% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
    radial-gradient(1px 1px at 30% 50%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
    radial-gradient(1px 1px at 70% 80%, rgba(255, 255, 255, 0.75) 0%, transparent 50%),
    radial-gradient(2px 2px at 50% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(1px 1px at 85% 60%, rgba(255, 255, 255, 0.65) 0%, transparent 50%);
  animation: starfield-twinkle 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.manage-models-view::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    /* Luces de colores suaves */
    radial-gradient(3px 3px at 25% 15%, rgba(59, 130, 246, 0.8) 0%, transparent 50%),
    radial-gradient(2px 2px at 75% 25%, rgba(147, 51, 234, 0.7) 0%, transparent 50%),
    radial-gradient(2.5px 2.5px at 45% 55%, rgba(99, 102, 241, 0.75) 0%, transparent 50%),
    radial-gradient(3px 3px at 15% 75%, rgba(59, 130, 246, 0.6) 0%, transparent 50%),
    radial-gradient(2px 2px at 85% 45%, rgba(147, 51, 234, 0.65) 0%, transparent 50%),
    radial-gradient(4px 4px at 35% 85%, rgba(99, 102, 241, 0.5) 0%, transparent 50%),
    radial-gradient(1.5px 1.5px at 65% 15%, rgba(59, 130, 246, 0.7) 0%, transparent 50%),
    radial-gradient(3px 3px at 55% 75%, rgba(147, 51, 234, 0.6) 0%, transparent 50%),
    radial-gradient(2px 2px at 95% 35%, rgba(99, 102, 241, 0.8) 0%, transparent 50%),
    radial-gradient(2.5px 2.5px at 5% 55%, rgba(59, 130, 246, 0.55) 0%, transparent 50%);
  animation: floating-lights 6s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

/* Fondo galáctico inmersivo */
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
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
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

.container {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.manage-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 4rem;
  position: relative;
}

.manage-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffffff, transparent);
  animation: header-glow 3s ease-in-out infinite alternate;
}

@keyframes header-glow {
  0% { opacity: 0.3; width: 100px; }
  100% { opacity: 1; width: 300px; }
}

.header-content {
  position: relative;
  z-index: 2;
}

.manage-title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, #e5e7eb, #9ca3af, #6b7280);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-breathe 4s ease-in-out infinite;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.manage-title::after {
  content: '';
  position: absolute;
  top: 0;
  left: -10%;
  width: 120%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); opacity: 0; }
  50% { transform: translateX(100%); opacity: 1; }
}

.manage-title i {
  margin-right: 1rem;
  color: #f87171;
  filter: drop-shadow(0 0 15px rgba(248, 113, 113, 0.5));
}

.manage-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(96, 165, 250, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes title-breathe {
  0%, 100% { 
    background-position: 0% 50%; 
    filter: brightness(1);
  }
  50% { 
    background-position: 100% 50%; 
    filter: brightness(1.2);
  }
}

@keyframes starfield-twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

@keyframes floating-lights {
  0%, 100% {
    opacity: 0.8;
    transform: translateY(0px) scale(1);
  }
  33% {
    opacity: 1;
    transform: translateY(-2px) scale(1.1);
  }
  66% {
    opacity: 0.6;
    transform: translateY(1px) scale(0.9);
  }
}

.warning-section {
  margin-bottom: 3rem;
}

.warning-card {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.warning-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f87171, transparent);
}

.warning-icon {
  width: 60px;
  height: 60px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #f87171;
  flex-shrink: 0;
  filter: drop-shadow(0 0 10px rgba(248, 113, 113, 0.4));
}

.warning-content h3 {
  color: #fca5a5;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
}

.warning-content p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
}

.controls-section {
  margin-bottom: 3rem;
}

.controls-card {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.controls-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.filter-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label i {
  color: #60a5fa;
  font-size: 0.9rem;
}

.filter-select, .filter-input {
  padding: 0.9rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  background: rgba(59, 130, 246, 0.12);
}

.filter-select option {
  background: #1a1a2e;
  color: white;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.bulk-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  margin-top: 1rem;
}

.bulk-actions h4 {
  color: #f87171;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-actions h4 i {
  color: #f87171;
  filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.4));
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  color: #f87171;
  font-weight: 500;
}

.selection-info i {
  color: #f87171;
  filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.4));
}

.selected-count {
  color: #f87171;
  font-weight: 600;
  font-size: 0.95rem;
}

.bulk-buttons {
  display: flex;
  gap: 1rem;
}

.tech-button {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.tech-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.tech-button:hover::before {
  left: 100%;
}

.clear-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.clear-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: white;
  box-shadow: 0 0 15px rgba(96, 165, 250, 0.3);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.5);
  font-weight: 600;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  color: white;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.models-section {
  margin-bottom: 3rem;
}

.models-section h3 {
  color: #60a5fa;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.models-section h3 i {
  color: #60a5fa;
  filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.3));
}

.usage-tip {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.usage-tip i {
  color: #60a5fa;
  font-size: 1.2rem;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.3));
}

.usage-tip p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.2rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(10px);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.select-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #f87171;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.select-checkbox:checked {
  transform: scale(1.1);
}

.select-label {
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-label i {
  color: #f87171;
  font-size: 0.9rem;
}

.models-count {
  color: #f87171;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.models-count i {
  color: #f87171;
  filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.4));
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
}

.model-card {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
}

.model-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.model-card:hover::before {
  transform: translateX(100%);
}

.model-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.08);
}

.model-card.selected {
  border-color: #f87171;
  box-shadow: 0 0 25px rgba(248, 113, 113, 0.4);
  background: rgba(239, 68, 68, 0.08);
  transform: translateY(-2px);
}

.model-card.selected:hover {
  background: rgba(239, 68, 68, 0.12);
  box-shadow: 0 20px 50px rgba(248, 113, 113, 0.5);
}

.model-card.deleting {
  opacity: 0.6;
  pointer-events: none;
  cursor: not-allowed;
}

.model-checkbox {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.checkbox-label {
  display: block;
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
}

.checkbox-label:hover {
  background: rgba(78, 205, 196, 0.1);
}

.clickable-indicator {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 5;
}

.clickable-indicator i {
  font-size: 0.8rem;
}

.model-card:hover .clickable-indicator {
  opacity: 1;
}

.model-card.selected .clickable-indicator {
  color: #f87171;
  opacity: 1;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  margin-right: 2rem;
}

.model-type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.model-type-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.model-type-badge:hover::before {
  left: 100%;
}

.type-classification {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.type-regression {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.model-status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.model-status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.model-status-badge:hover::before {
  left: 100%;
}

.status-completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-training {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.status-failed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.model-info {
  flex: 1;
  margin-bottom: 1rem;
}

.model-name {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.model-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.model-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.meta-item i {
  color: #4ecdc4;
  font-size: 0.7rem;
}

.model-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: auto;
  z-index: 20;
  position: relative;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.view-btn {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.25);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
}

.action-btn.delete-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.deleting-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: white;
}

.deleting-spinner {
  font-size: 2rem;
  color: #ef4444;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  font-size: 2.5rem;
  color: #60a5fa;
  filter: drop-shadow(0 0 15px rgba(96, 165, 250, 0.4));
}

.loading-text h3 {
  color: #60a5fa;
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.loading-text p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 1rem;
}

.empty-state, .no-results-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-container, .no-results-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4.5rem;
  color: #60a5fa;
  filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.3));
  background: rgba(59, 130, 246, 0.1);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(59, 130, 246, 0.2);
}

.empty-content, .no-results-content {
  text-align: center;
}

.empty-content h3, .no-results-content h3 {
  color: #60a5fa;
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 600;
}

.empty-content p, .no-results-content p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.create-model-btn, .clear-filters-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.create-model-btn::before, .clear-filters-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.create-model-btn:hover::before, .clear-filters-btn:hover::before {
  left: 100%;
}

.create-model-btn:hover, .clear-filters-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.4);
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 550px;
  width: 90%;
  backdrop-filter: blur(25px);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #60a5fa, transparent);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  color: #ef4444;
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.modal-header h3 i {
  filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4));
}

.modal-body {
  margin-bottom: 2.5rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
  font-size: 1.1rem;
}

.models-list {
  margin-top: 1rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  max-height: 250px;
  overflow-y: auto;
}

.models-list ul {
  margin: 0.5rem 0 0 0;
  padding-left: 0;
  list-style: none;
}

.models-list li {
  margin: 0.8rem 0;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.models-list li::before {
  content: '•';
  color: #60a5fa;
  font-weight: bold;
}

.models-list li:last-child {
  border-bottom: none;
}

.modal-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.cancel-btn {
  padding: 1rem 2.5rem;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.cancel-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.cancel-btn:hover::before {
  left: 100%;
}

.cancel-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: white;
  transform: translateY(-1px);
}

.confirm-delete-btn {
  padding: 1rem 2.5rem;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.confirm-delete-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.confirm-delete-btn:hover::before {
  left: 100%;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
  color: white;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.confirm-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tip de uso */
.usage-tip {
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.tip-content i {
  color: #4ecdc4;
  font-size: 1.1rem;
}

.tip-content strong {
  color: #4ecdc4;
}

/* Posicionamiento random para estrellas y partículas */
.star:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.star:nth-child(2) { top: 20%; left: 80%; animation-delay: 0.5s; }
.star:nth-child(3) { top: 30%; left: 40%; animation-delay: 1s; }
.star:nth-child(4) { top: 40%; left: 70%; animation-delay: 1.5s; }
.star:nth-child(5) { top: 50%; left: 10%; animation-delay: 2s; }

.particle:nth-child(1) { left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { left: 20%; animation-delay: 1s; }
.particle:nth-child(3) { left: 30%; animation-delay: 2s; }
.particle:nth-child(4) { left: 40%; animation-delay: 3s; }
.particle:nth-child(5) { left: 50%; animation-delay: 4s; }

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
  
  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .modal-actions {
    flex-direction: column;
  }
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
