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
      </div>
      
      <div class="container">
        <h1 class="models-title">Mis Modelos</h1>
        <p class="models-description">
          Gestiona y monitorea todos tus modelos de IA entrenados
        </p>
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
        <div v-else-if="!modelsData.models || modelsData.models.length === 0" class="empty-container">
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
const completedModels = computed(() => 
  modelsData.value.models?.filter(model => model.status === 'completed') || []
)

const publicModels = computed(() => 
  modelsData.value.models?.filter(model => model.is_public) || []
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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

const getStatusLabel = (status) => {
  const labels = {
    'completed': 'Completado',
    'training': 'Entrenando',
    'pending': 'Pendiente',
    'failed': 'Fallido'
  }
  return labels[status] || 'Desconocido'
}

const getTaskTypeLabel = (taskType) => {
  const labels = {
    'classification': 'Clasificación',
    'regression': 'Regresión',
    'clustering': 'Clustering'
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
    minute: '2-digit'
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
  await new Promise(resolve => setTimeout(resolve, 100))
  
  loadModels()
})
</script>

<style scoped>
.models-view {
  min-height: 100vh;
  background: 
    linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%),
    radial-gradient(circle at 20% 30%, rgba(120, 119, 198, 0.05) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(255, 119, 198, 0.03) 0%, transparent 60%);
  color: white;
  overflow-x: hidden;
  position: relative;
}

.models-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(255, 119, 198, 0.015) 0%, transparent 50%);
  animation: subtleGlow 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes subtleGlow {
  0%, 100% { 
    opacity: 0.4;
  }
  50% { 
    opacity: 0.8;
  }
}

.models-header {
  padding: 8rem 0 4rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(8, 8, 12, 0.98), rgba(12, 12, 18, 0.95));
  z-index: 2;
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

.floating-element:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
.floating-element:nth-child(2) { top: 55%; left: 20%; animation-delay: 2s; }
.floating-element:nth-child(3) { top: 35%; left: 80%; animation-delay: 4s; }
.floating-element:nth-child(4) { top: 75%; left: 70%; animation-delay: 6s; }
.floating-element:nth-child(5) { top: 20%; left: 60%; animation-delay: 1s; }
.floating-element:nth-child(6) { top: 65%; left: 40%; animation-delay: 3s; }
.floating-element:nth-child(7) { top: 25%; left: 30%; animation-delay: 5s; }
.floating-element:nth-child(8) { top: 85%; left: 85%; animation-delay: 7s; }
.floating-element:nth-child(9) { top: 10%; left: 50%; animation-delay: 2.5s; }
.floating-element:nth-child(10) { top: 45%; left: 15%; animation-delay: 4.5s; }

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
  0%, 100% { 
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
  font-size: 3.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #00D4FF, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 4;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.models-description {
  font-size: 1.3rem;
  color: #b1b8d4;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  z-index: 4;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
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
  padding: 1.5rem 2rem;
  background: rgba(30, 30, 50, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(120, 119, 198, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(120, 119, 198, 0.1), rgba(255, 119, 198, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item:hover::before {
  opacity: 1;
}

.stat-item:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 10px 25px rgba(0, 212, 255, 0.2);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 400;
  color: #00D4FF;
  display: block;
  margin-bottom: 0.8rem;
  position: relative;
  z-index: 2;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 2;
}

.models-content {
  padding: 3rem 0 4rem;
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
  background: linear-gradient(180deg, 
    rgba(120, 119, 198, 0.03) 0%, 
    transparent 100%);
  pointer-events: none;
}

/* Loading, Error, Empty states */
.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(30, 30, 50, 0.6);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 16px;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
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
  background: radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.05) 0%, transparent 60%);
  pointer-events: none;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(120, 119, 198, 0.3);
  border-top: 3px solid #00D4FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
  position: relative;
  z-index: 2;
}

.loading-text {
  font-size: 1.1rem;
  color: #b1b8d4;
  position: relative;
  z-index: 2;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  color: #00D4FF;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.model-card {
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.model-card:hover {
  transform: translateY(-4px);
  border-color: #00D4FF;
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
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
}

.model-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  background: rgba(120, 119, 198, 0.2);
  color: #d8b4fe;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
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

.detail-item i {
  width: 16px;
  color: #00D4FF;
}

.progress-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
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
  color: #00D4FF;
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
  background: linear-gradient(90deg, #00D4FF, #8B5CF6);
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}
</style>
