<template>
  <div class="predictions-view">
    <NavBar />
    
    <!-- Header -->
    <div class="predictions-header">
      <div class="header-background">
        <div class="grid-pattern"></div>
        <div class="floating-elements">
          <div class="floating-element" v-for="i in 8" :key="i"></div>
        </div>
        <!-- Estrellas -->
        <div class="stars-container">
          <div class="star" v-for="i in 100" :key="'star-' + i"></div>
        </div>
      </div>
      
      <div class="container">
        <div class="header-content">
          <div class="back-button">
            <button class="tech-button back-btn" @click="goBack">
              <i class="pi pi-arrow-left"></i>
              <span>{{ isPublicModel ? 'Volver al Repositorio' : 'Volver al Dashboard' }}</span>
            </button>
          </div>
          
          <div class="predictions-title-section">
            <h1 class="predictions-title">
              {{ isPublicModel ? 'Usar Modelo Público' : 'Predicciones' }}
            </h1>
            <p class="predictions-description">
              {{ isPublicModel 
                ? 'Realiza predicciones con este modelo público de la comunidad' 
                : 'Realiza predicciones con tus modelos entrenados de forma intuitiva' 
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <div class="predictions-content">
        <!-- Información del Modelo Público -->
        <div v-if="isPublicModel && selectedModel" class="public-model-info-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="pi pi-info-circle"></i>
              Información del Modelo Público
            </h3>
          </div>
          <div class="card-content">
            <div class="model-info-grid">
              <div class="info-item">
                <span class="info-label">Nombre del modelo:</span>
                <span class="info-value">{{ selectedModel.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Autor:</span>
                <span class="info-value">{{ selectedModel.owner }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tipo de tarea:</span>
                <span class="info-value">{{ getTaskTypeLabel(selectedModel.task_type) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Descripción:</span>
                <span class="info-value">{{ selectedModel.description }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Predicciones realizadas:</span>
                <span class="info-value">{{ selectedModel.statistics?.total_predictions || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selección de Modelo (solo para modelos propios) -->
        <div v-if="!isPublicModel" class="model-selection-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="pi pi-cog"></i>
              Seleccionar Modelo
            </h3>
          </div>
          <div class="card-content">
            <div class="model-selector">
              <label class="form-label">Modelo para Predicción:</label>
              <select 
                v-model="selectedModelId" 
                @change="onModelChange"
                class="form-select"
                :disabled="isLoadingModels"
              >
                <option value="">Selecciona un modelo...</option>
                <option 
                  v-for="model in availableModels" 
                  :key="model.id" 
                  :value="model.id"
                >
                  {{ model.name }} ({{ getTaskTypeLabel(model.task_type) }})
                </option>
              </select>
              <div v-if="isLoadingModels" class="loading-models">
                <div class="mini-spinner"></div>
                <span>Cargando modelos...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Predicción -->
        <div v-if="selectedModel" class="prediction-form-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="pi pi-calculator"></i>
              Datos para Predicción - {{ selectedModel.name }}
            </h3>
          </div>
          <div class="card-content">
            <form @submit.prevent="makePrediction" class="prediction-form">
              <div class="form-grid">
                <div 
                  v-for="(value, feature) in inputData" 
                  :key="feature"
                  class="form-group"
                >
                  <label class="form-label">{{ formatFeatureName(feature) }}</label>
                  <input
                    v-model.number="inputData[feature]"
                    type="number"
                    step="any"
                    class="form-input"
                    :placeholder="`Ingresa ${formatFeatureName(feature).toLowerCase()}`"
                    required
                  />
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="tech-button predict-btn"
                  :disabled="isPredicting"
                >
                  <i class="pi pi-play" v-if="!isPredicting"></i>
                  <i class="pi pi-spin pi-spinner" v-else></i>
                  <span>{{ isPredicting ? 'Prediciendo...' : 'Realizar Predicción' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Resultados de Predicción -->
        <div v-if="predictionResult" class="prediction-result-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="pi pi-chart-line"></i>
              Resultado de la Predicción
            </h3>
          </div>
          <div class="card-content">
            <div class="result-grid">
              <!-- Resultado de la Predicción (PRIMERO) -->
              <div class="result-section prediction-section">
                <h4 class="section-title">
                  <i class="pi pi-bullseye"></i>
                  Resultado de la Predicción
                </h4>
                <div class="prediction-details">
                  <div class="prediction-main">
                    <!-- Resultado para Clasificación -->
                    <div v-if="predictionResult.task_type === 'classification'" class="predicted-class">
                      <span class="prediction-label">Resultado de predicción:</span>
                      <span class="prediction-value main-prediction">
                        {{ formatPredictionClass(predictionResult.prediction.predicted_class) }}
                      </span>
                    </div>
                    
                    <!-- Resultado para Regresión -->
                    <div v-if="predictionResult.task_type === 'regression'" class="predicted-value">
                      <span class="prediction-label">Valor Predicho:</span>
                      <span class="prediction-value main-prediction">
                        {{ formatPredictionValue(predictionResult.prediction.predicted_value) }}
                      </span>
                    </div>
                    
                    <div v-if="predictionResult.prediction.confidence" class="confidence">
                      <span class="prediction-label">Confianza:</span>
                      <div class="confidence-container">
                        <span class="confidence-value">{{ (predictionResult.prediction.confidence * 100).toFixed(2) }}%</span>
                        <div class="confidence-bar">
                          <div 
                            class="confidence-fill" 
                            :style="{ width: (predictionResult.prediction.confidence * 100) + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="predictionResult.prediction.probabilities && predictionResult.task_type === 'classification'" class="probabilities">
                    <span class="prediction-label">Probabilidades:</span>
                    <div class="probabilities-grid">
                      <div 
                        v-for="(prob, className) in predictionResult.prediction.probabilities" 
                        :key="className"
                        class="probability-item"
                      >
                        <span class="probability-class">{{ formatPredictionClass(className) }}</span>
                        <div class="probability-container">
                          <span class="probability-value">{{ (prob * 100).toFixed(2) }}%</span>
                          <div class="probability-bar">
                            <div 
                              class="probability-fill" 
                              :style="{ width: (prob * 100) + '%' }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información del Modelo -->
              <div class="result-section">
                <h4 class="section-title">
                  <i class="pi pi-info-circle"></i>
                  Información de la predicción
                </h4>
                <div class="info-items">
                  <div class="info-item">
                    <span class="info-label">ID de Predicción:</span>
                    <span class="info-value prediction-id">{{ predictionResult.prediction_id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Modelo:</span>
                    <span class="info-value">{{ predictionResult.model_name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Propietario:</span>
                    <span class="info-value">{{ predictionResult.owner }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Tipo de Tarea:</span>
                    <span class="info-value">{{ getTaskTypeLabel(predictionResult.task_type) }}</span>
                  </div>
                  <div v-if="predictionResult.remaining_predictions !== undefined" class="info-item">
                    <span class="info-label">Predicciones Restantes:</span>
                    <span class="info-value remaining-predictions">{{ predictionResult.remaining_predictions }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Visibilidad:</span>
                    <span class="info-value">{{ predictionResult.is_public ? 'Público' : 'Privado' }}</span>
                  </div>
                </div>
              </div>

              <!-- Datos de Entrada -->
              <div class="result-section">
                <h4 class="section-title">
                  <i class="pi pi-database"></i>
                  Datos de Entrada
                </h4>
                <div class="input-data-grid">
                  <div 
                    v-for="(value, key) in predictionResult.input_data" 
                    :key="key"
                    class="input-data-item"
                  >
                    <span class="input-label">{{ formatFeatureName(key) }}</span>
                    <span class="input-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Error -->
        <div v-if="predictionError" class="error-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="pi pi-exclamation-triangle"></i>
              Error en la Predicción
            </h3>
          </div>
          <div class="card-content">
            <div class="error-content">
              <p class="error-message">{{ predictionError }}</p>
              <button class="tech-button" @click="clearError">
                <i class="pi pi-times"></i>
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAuthGuard } from '@/composables/useAuthGuard'
import NavBar from '@/components/layout/NavBar.vue'
import apiClient from '@/services/apiService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { safeApiCall } = useAuthGuard()

// Reactive data
const availableModels = ref([])
const selectedModelId = ref('')
const selectedModel = ref(null)
const inputData = ref({})
const predictionResult = ref(null)
const predictionError = ref(null)
const isLoadingModels = ref(false)
const isPredicting = ref(false)
const isPublicModel = ref(false)
const publicModelId = ref(null)

// Computed
const currentUser = computed(() => authStore.currentUser)

// Detectar si estamos en la ruta de modelo público
const checkPublicModelRoute = () => {
  if (route.name === 'public-prediction' && route.params.modelId) {
    isPublicModel.value = true
    publicModelId.value = route.params.modelId
    selectedModelId.value = route.params.modelId
  }
}

// Methods
const loadAvailableModels = async () => {
  try {
    isLoadingModels.value = true
    
    let response
    if (isPublicModel.value) {
      // Cargar modelo público específico
      response = await safeApiCall(
        () => apiClient.get('/models/public/'),
        'carga de modelos públicos'
      )
    } else {
      // Cargar modelos propios
      response = await safeApiCall(
        () => apiClient.get('/models/my_models/'),
        'carga de modelos propios'
      )
    }

    if (!response) {
      throw new Error('No se pudo cargar la respuesta')
    }

    const data = response.data
    
    if (isPublicModel.value) {
      // Filtrar el modelo público específico
      const publicModels = data.public_models || []
      const targetModel = publicModels.find(model => model.id.toString() === publicModelId.value)
      
      if (targetModel) {
        availableModels.value = [targetModel]
        // Auto-seleccionar el modelo público
        await onModelChange()
      } else {
        throw new Error('Modelo público no encontrado')
      }
    } else {
      // Solo modelos completados pueden hacer predicciones
      availableModels.value = data.models?.filter(model => model.status === 'completed') || []
    }
    
  } catch (err) {
    console.error('Error loading models:', err)
    predictionError.value = 'Error al cargar los modelos disponibles'
  } finally {
    isLoadingModels.value = false
  }
}

const onModelChange = async () => {
  console.log('Model changed to:', selectedModelId.value)
  
  // Limpiar todo primero
  inputData.value = {}
  predictionResult.value = null
  predictionError.value = null
  
  if (!selectedModelId.value) {
    selectedModel.value = null
    return
  }

  selectedModel.value = availableModels.value.find(model => model.id === selectedModelId.value)
  
  if (selectedModel.value) {
    console.log('Loading features for model:', selectedModel.value.name)
    // Cargar las features requeridas del modelo
    await loadModelFeatures()
  }
}

const loadModelFeatures = async () => {
  try {
    console.log('Loading features for model ID:', selectedModelId.value)
    
    const response = await safeApiCall(
      () => apiClient.get(`/models/info/${selectedModelId.value}/`),
      'carga de información del modelo'
    )

    if (response) {
      const modelInfo = response.data
      console.log('Model info received:', modelInfo)
      
      // Limpiar completamente inputData
      inputData.value = {}
      
      // Esperar un tick para asegurar que Vue procese el cambio
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Crear nuevo objeto con las features requeridas
      const newInputData = {}
      if (modelInfo.required_features && modelInfo.required_features.length > 0) {
        console.log('Required features:', modelInfo.required_features)
        modelInfo.required_features.forEach(feature => {
          newInputData[feature] = ''
        })
      }
      
      // Asignar el nuevo objeto para forzar reactividad
      inputData.value = newInputData
      console.log('Input data updated:', inputData.value)
    } else {
      console.error('Failed to load model info')
    }
  } catch (err) {
    console.error('Error loading model features:', err)
    inputData.value = {} // Limpiar en caso de error
  }
}

const makePrediction = async () => {
  try {
    isPredicting.value = true
    predictionError.value = null
    
    // El endpoint es el mismo para modelos propios y públicos
    // El backend detecta automáticamente si es público o propio
    const response = await safeApiCall(
      () => apiClient.post(`/models/predict/${selectedModelId.value}/`, {
        input_data: inputData.value
      }),
      'predicción del modelo'
    )

    if (response) {
      predictionResult.value = response.data
    } else {
      throw new Error('Error al realizar la predicción')
    }
    
  } catch (err) {
    console.error('Error making prediction:', err)
    predictionError.value = err.message || 'Error al realizar la predicción'
  } finally {
    isPredicting.value = false
  }
}

const goBack = () => {
  // Volver al repositorio si venimos de un modelo público, sino al dashboard
  if (isPublicModel.value) {
    router.push('/repository')
  } else {
    router.push('/dashboard')
  }
}

const clearError = () => {
  predictionError.value = null
}

const getTaskTypeLabel = (taskType) => {
  const labels = {
    'classification': 'Clasificación',
    'regression': 'Regresión',
    'clustering': 'Clustering'
  }
  return labels[taskType] || taskType
}

const formatFeatureName = (feature) => {
  // Convertir nombres de features a formato más legible
  return feature.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim()
}

const formatPredictionClass = (className) => {
  // Formatear la clase predicha
  if (className === '0') return 'Negativo'
  if (className === '1') return 'Positivo'
  return className
}

const formatPredictionValue = (value) => {
  // Formatear el valor predicho para regresión
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return value
}

// Lifecycle
onMounted(() => {
  checkPublicModelRoute()
  loadAvailableModels()
})
</script>

<style scoped>
/* Global scroll fixes */
* {
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

.predictions-view {
  min-height: 100vh;
  background: 
    linear-gradient(135deg, #000000 0%, #0a0a0f 20%, #0f0f1a 40%, #1a1a2e 60%, #16213e 80%, #0e1a2e 100%),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.2) 0%, transparent 60%),
    radial-gradient(circle at 85% 75%, rgba(25, 25, 112, 0.18) 0%, transparent 55%),
    radial-gradient(circle at 50% 50%, rgba(0, 100, 200, 0.12) 0%, transparent 70%),
    radial-gradient(circle at 30% 80%, rgba(138, 43, 226, 0.15) 0%, transparent 65%),
    radial-gradient(circle at 70% 20%, rgba(72, 61, 139, 0.1) 0%, transparent 50%);
  color: white;
  position: relative;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

.predictions-view::before {
  content: '';
  position: absolute;
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
  0%, 100% { 
    opacity: 0.4;
  }
  33% { 
    opacity: 0.8;
  }
  66% { 
    opacity: 0.6;
  }
}

.predictions-header {
  background: linear-gradient(135deg, rgba(8, 8, 12, 0.98), rgba(12, 12, 18, 0.95));
  padding: 2rem 0;
  margin-top: 5rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
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
  background: rgba(120, 119, 198, 0.9);
  box-shadow: 0 0 8px rgba(120, 119, 198, 0.7);
}

.star:nth-child(3n) {
  animation-delay: 2s;
  background: rgba(75, 0, 130, 0.7);
  box-shadow: 0 0 4px rgba(75, 0, 130, 0.5);
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

.container {
  max-width: min(1200px, 95vw);
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 3;
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  position: relative;
  z-index: 4;
}

.back-button {
  margin-bottom: 2rem;
}

.tech-button {
  background: rgba(138, 43, 226, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  color: #8A2BE2;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.tech-button:hover {
  background: rgba(138, 43, 226, 0.2);
  border-color: rgba(138, 43, 226, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

.tech-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.predictions-title {
  font-size: 4rem;
  font-weight: 200;
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 25%, #9400D3 50%, #8B5CF6 75%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 4;
  text-shadow: 0 0 40px rgba(138, 43, 226, 0.5);
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% { 
    text-shadow: 0 0 40px rgba(138, 43, 226, 0.5);
  }
  50% { 
    text-shadow: 0 0 60px rgba(138, 43, 226, 0.7), 0 0 80px rgba(138, 43, 226, 0.4);
  }
}

.predictions-description {
  font-size: 1.4rem;
  color: rgba(200, 200, 220, 0.9);
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  z-index: 4;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.7);
  font-weight: 300;
}

.predictions-content {
  padding: 3rem 0 4rem 0;
  width: 100%;
  box-sizing: border-box;
}

/* Cards */
.model-selection-card,
.prediction-form-card,
.prediction-result-card,
.error-card {
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(15px);
  overflow: visible;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 2rem;
}

.model-selection-card::before,
.prediction-form-card::before,
.prediction-result-card::before,
.error-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(75, 0, 130, 0.03));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.model-selection-card:hover::before,
.prediction-form-card:hover::before,
.prediction-result-card:hover::before {
  opacity: 1;
}

.model-selection-card:hover,
.prediction-form-card:hover,
.prediction-result-card:hover {
  transform: translateY(-5px);
  border-color: rgba(138, 43, 226, 0.5);
  box-shadow: 0 20px 40px rgba(138, 43, 226, 0.2);
}

.card-header {
  background: rgba(138, 43, 226, 0.1);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(138, 43, 226, 0.2);
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
  color: #8A2BE2;
}

.card-content {
  padding: 2rem;
  position: relative;
  z-index: 2;
  overflow: visible;
  height: auto;
  max-height: none;
}

/* Form Styles */
.form-label {
  display: block;
  color: #b1b8d4;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-select,
.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: 
    linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(30, 30, 50, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%);
  border: 1px solid rgba(138, 43, 226, 0.4);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 15px rgba(138, 43, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: rgba(138, 43, 226, 0.8);
  box-shadow: 
    0 0 20px rgba(138, 43, 226, 0.4),
    0 0 40px rgba(138, 43, 226, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  background: 
    linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.9)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 50%);
  transform: translateY(-1px);
}

.form-select:hover,
.form-input:hover {
  border-color: rgba(138, 43, 226, 0.6);
  box-shadow: 
    0 6px 20px rgba(138, 43, 226, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.form-select {
  appearance: none;
  background: 
    linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(30, 30, 50, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
    url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 16 16'%3e%3cpath d='M8 13.1l-8-8 2.1-2.1 5.9 5.9 5.9-5.9 2.1 2.1z'/%3e%3c/svg%3e");
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: left center, left center, right 1rem center;
  background-size: cover, cover, 14px;
  padding-right: 3rem;
  cursor: pointer;
}

.form-select:focus {
  background: 
    linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.9)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
    url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%238A2BE2' viewBox='0 0 16 16'%3e%3cpath d='M8 13.1l-8-8 2.1-2.1 5.9 5.9 5.9-5.9 2.1 2.1z'/%3e%3c/svg%3e");
}

.form-select:hover {
  background: 
    linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.85)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.12) 0%, transparent 50%),
    url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 16 16'%3e%3cpath d='M8 13.1l-8-8 2.1-2.1 5.9 5.9 5.9-5.9 2.1 2.1z'/%3e%3c/svg%3e");
}

.form-select option {
  background: #1a1a2e;
  color: #fff;
}

.loading-models {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #8A2BE2;
  font-size: 0.9rem;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  border-top: 2px solid #8A2BE2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.predict-btn {
  background: rgba(138, 43, 226, 0.2);
  border-color: rgba(138, 43, 226, 0.5);
  color: #8A2BE2;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.predict-btn:hover {
  background: rgba(138, 43, 226, 0.3);
  border-color: rgba(138, 43, 226, 0.7);
}

/* Results Styles */
.result-grid {
  display: grid;
  gap: 2rem;
  overflow: visible;
  height: auto;
  max-height: none;
}

.result-section {
  background: rgba(20, 20, 35, 0.6);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  overflow: visible;
  height: auto;
  max-height: none;
}

.section-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(138, 43, 226, 0.3);
}

.section-title i {
  color: #8A2BE2;
}

.info-items {
  display: grid;
  gap: 1rem;
  overflow: visible;
  height: auto;
  max-height: none;
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
}

.info-value {
  color: #fff;
  font-weight: 600;
}

.prediction-id {
  font-family: monospace;
  font-size: 0.8rem;
  background: rgba(138, 43, 226, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.remaining-predictions {
  color: #00d4ff !important;
  font-weight: 700;
  background: rgba(0, 212, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.input-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  overflow: visible;
  height: auto;
  max-height: none;
}

.input-data-item {
  background: rgba(138, 43, 226, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  color: #8A2BE2;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
}

.prediction-section {
  border-color: rgba(34, 197, 94, 0.3);
}

.prediction-details {
  display: grid;
  gap: 2rem;
  overflow: visible;
  height: auto;
  max-height: none;
}

.prediction-main {
  display: grid;
  gap: 1.5rem;
  overflow: visible;
  height: auto;
  max-height: none;
}

.predicted-class {
  text-align: center;
  padding: 2rem;
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
}

.predicted-value {
  text-align: center;
  padding: 2rem;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.prediction-label {
  display: block;
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.main-prediction {
  font-size: 2rem;
  font-weight: 700;
  color: #22c55e;
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.confidence,
.probabilities {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
}

.confidence-container,
.probability-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confidence-value,
.probability-value {
  color: #3b82f6;
  font-weight: 700;
  min-width: 60px;
}

.confidence-bar,
.probability-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.confidence-fill,
.probability-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
  transition: width 0.3s ease;
}

.probabilities-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  overflow: visible;
  height: auto;
  max-height: none;
}

.probability-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 1rem;
}

.probability-class {
  color: #fff;
  font-weight: 600;
}

/* Error Styles */
.error-card {
  border-color: rgba(239, 68, 68, 0.3);
}

.error-card .card-header {
  background: rgba(239, 68, 68, 0.1);
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

.error-card .card-title i {
  color: #ef4444;
}

.error-content {
  text-align: center;
}

.error-message {
  color: #ef4444;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem 4rem 1rem;
    max-width: 100%;
  }
  
  .predictions-title {
    font-size: 2.5rem;
  }
  
  .predictions-description {
    font-size: 1.1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .input-data-grid {
    grid-template-columns: 1fr;
  }
  
  .probability-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  /* Asegurar que no haya scroll interno en mobile */
  .card-content,
  .result-section,
  .result-grid,
  .info-items,
  .input-data-grid,
  .prediction-details,
  .prediction-main,
  .probabilities-grid {
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem 4rem 0.5rem;
  }
  
  .predictions-title {
    font-size: 2rem;
  }
  
  .predictions-description {
    font-size: 1rem;
  }
  
  /* Asegurar que no haya scroll interno en pantallas pequeñas */
  .card-content,
  .result-section,
  .result-grid,
  .info-items,
  .input-data-grid,
  .prediction-details,
  .prediction-main,
  .probabilities-grid {
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }
}

/* Estilos para la tarjeta de información del modelo público */
.public-model-info-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 20px;
  padding: 0;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.public-model-info-card:hover {
  border-color: rgba(78, 205, 196, 0.3);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
}

.model-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.model-info-grid .info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.model-info-grid .info-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(78, 205, 196, 0.2);
}

.model-info-grid .info-label {
  color: #4ecdc4;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.model-info-grid .info-value {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
}
</style>
