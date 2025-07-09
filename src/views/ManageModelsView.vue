<template>
  <div class="manage-models-container">
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
    <div class="main-content">
      <!-- Título -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="pi pi-cog"></i>
          Gestionar Modelos
        </h1>
        <p class="page-subtitle">
          Administra, elimina y organiza tus modelos de machine learning
        </p>
      </div>

      <!-- Warning -->
      <div class="warning-section">
        <div class="warning-card">
          <div class="warning-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="warning-content">
            <h3>¡Atención!</h3>
            <p>La eliminación de modelos es permanente y no se puede deshacer. Asegúrate de no necesitar estos modelos antes de eliminarlos.</p>
          </div>
        </div>
      </div>

      <!-- Controles -->
      <div class="controls-section">
        <div class="controls-card">
          <!-- Filtros -->
          <div class="filters-container">
            <div class="filter-group">
              <label class="filter-label">Filtrar por estado:</label>
              <select v-model="selectedStatus" @change="filterModels" class="filter-select">
                <option value="">Todos</option>
                <option value="completed">Completados</option>
                <option value="training">Entrenando</option>
                <option value="failed">Fallidos</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Filtrar por tipo:</label>
              <select v-model="selectedType" @change="filterModels" class="filter-select">
                <option value="">Todos</option>
                <option value="classification">Clasificación</option>
                <option value="regression">Regresión</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Buscar por nombre:</label>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Nombre del modelo..."
                class="filter-input"
                @input="filterModels"
              />
            </div>
          </div>

          <!-- Acciones masivas -->
          <div class="bulk-actions" v-if="selectedModels.length > 0">
            <div class="selected-count">
              <span>{{ selectedModels.length }} modelo{{ selectedModels.length !== 1 ? 's' : '' }} seleccionado{{ selectedModels.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="bulk-buttons">
              <button 
                @click="clearSelection" 
                class="clear-btn"
              >
                <i class="pi pi-times"></i>
                Limpiar selección
              </button>
              <button 
                @click="confirmBulkDelete" 
                class="delete-btn"
                :disabled="isDeleting"
              >
                <i class="pi pi-trash"></i>
                {{ isDeleting ? 'Eliminando...' : 'Eliminar seleccionados' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de modelos -->
      <div v-if="!isLoading && filteredModels.length > 0" class="models-section">
        
        <!-- Instrucción de uso -->
        <div class="usage-tip" v-if="selectedModels.length === 0">
          <div class="tip-content">
            <i class="pi pi-info-circle"></i>
            <span>💡 <strong>Tip:</strong> Haz clic en cualquier tarjeta para seleccionar modelos y eliminarlos en lote</span>
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
            <label for="selectAll" class="select-label">Seleccionar todos</label>
          </div>
          <div class="models-count">
            {{ filteredModels.length }} modelo{{ filteredModels.length !== 1 ? 's' : '' }} mostrado{{ filteredModels.length !== 1 ? 's' : '' }}
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

      <!-- Estado de carga -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando modelos...</p>
      </div>

      <!-- Estado vacío -->
      <div v-if="!isLoading && models.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-inbox"></i>
        </div>
        <h3>No tienes modelos aún</h3>
        <p>Crea tu primer modelo para comenzar a gestionarlos</p>
        <button @click="navigateToCreateModel" class="create-model-btn">
          <i class="pi pi-plus"></i>
          Crear Modelo
        </button>
      </div>

      <!-- Sin resultados de filtros -->
      <div v-if="!isLoading && models.length > 0 && filteredModels.length === 0" class="no-results-state">
        <div class="empty-icon">
          <i class="pi pi-search"></i>
        </div>
        <h3>No se encontraron modelos</h3>
        <p>Ajusta los filtros para ver más resultados</p>
        <button @click="clearFilters" class="clear-filters-btn">
          <i class="pi pi-refresh"></i>
          Limpiar filtros
        </button>
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
const filteredModels = ref([])
const isLoading = ref(false)
const selectedModels = ref([])
const deletingModels = ref([])
const isDeleting = ref(false)

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

// Funciones
const loadModels = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/models/my_models/')
    if (response.data) {
      models.value = response.data.models || []
      filteredModels.value = [...models.value]
    }
  } catch (error) {
    console.error('Error loading models:', error)
    // Aquí podrías agregar una notificación de error
  } finally {
    isLoading.value = false
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
      const response = await apiClient.delete(`/models/delete/${modelId}/`)
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
.manage-models-container {
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

/* Reutilizar estilos del fondo galáctico del RepositoryView */
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
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 4rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ef4444, #dc2626, #b91c1c, #991b1b);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite;
  margin-bottom: 1rem;
}

.page-title i {
  margin-right: 1rem;
  color: #ef4444;
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

.warning-section {
  margin-bottom: 3rem;
}

.warning-card {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  backdrop-filter: blur(10px);
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
  font-size: 1.5rem;
  color: #ef4444;
  flex-shrink: 0;
}

.warning-content h3 {
  color: #ef4444;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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

.filter-select, .filter-input {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
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
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  margin-top: 1rem;
}

.selected-count {
  color: #ef4444;
  font-weight: 600;
}

.bulk-buttons {
  display: flex;
  gap: 1rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.models-section {
  margin-bottom: 3rem;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #4ecdc4;
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
}

.models-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.model-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
}

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(78, 205, 196, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.model-card.selected {
  border-color: #4ecdc4;
  box-shadow: 0 15px 40px rgba(78, 205, 196, 0.3);
  background: rgba(78, 205, 196, 0.1);
  transform: translateY(-2px);
}

.model-card.selected:hover {
  background: rgba(78, 205, 196, 0.15);
  box-shadow: 0 20px 50px rgba(78, 205, 196, 0.4);
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
  color: #4ecdc4;
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
  padding: 0.4rem 0.8rem;
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

.model-status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-completed {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-training {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.status-failed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
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
}

.view-btn {
  background: rgba(78, 205, 196, 0.3);
  color: #4ecdc4;
  border: 1px solid rgba(78, 205, 196, 0.4);
}

.view-btn:hover {
  background: rgba(78, 205, 196, 0.5);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.3);
}

.action-btn.delete-btn {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.action-btn.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.5);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
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
  padding: 4rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  font-size: 3rem;
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.empty-state, .no-results-state {
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 4rem;
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.empty-state h3, .no-results-state h3 {
  color: white;
  margin-bottom: 1rem;
}

.empty-state p, .no-results-state p {
  margin-bottom: 2rem;
}

.create-model-btn, .clear-filters-btn {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.create-model-btn:hover, .clear-filters-btn:hover {
  background: linear-gradient(45deg, #45b7d1, #4ecdc4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
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
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: #ef4444;
  margin: 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-body {
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  margin-top: 1rem;
}

.models-list {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.models-list ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.models-list li {
  margin: 0.3rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-delete-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
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
</style>
