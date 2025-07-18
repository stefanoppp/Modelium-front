<template>
  <div class="predictions-view">
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
            <div class="title-container">
              <h1 class="title-glitch">
                <span class="title-text">{{ isPublicModel ? 'USAR MODELO PÚBLICO' : 'PREDICCIONES' }}</span>
                <div class="title-underline"></div>
              </h1>
              <p class="subtitle-text">
                <span class="subtitle-prefix">>_</span> {{
                  isPublicModel
                    ? 'Realiza predicciones con este modelo público de la comunidad'
                    : 'Realiza predicciones con tus modelos entrenados de forma intuitiva'
                }}<span class="cursor-blink">_</span>
              </p>
            </div>
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
                <span class="info-value">{{
                  selectedModel.statistics?.total_predictions || 0
                }}</span>
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
                <option v-for="model in availableModels" :key="model.id" :value="model.id">
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
                <div v-for="(value, feature) in inputData" :key="feature" class="form-group">
                  <label class="form-label">
                    {{ formatFeatureName(feature) }}
                    <span class="variable-type-badge" :class="getVariableTypeClass(feature)">
                      {{ getVariableTypeLabel(feature) }}
                    </span>
                  </label>

                  <!-- Input para texto -->
                  <div v-if="getVariableType(feature) === 'text'" class="input-wrapper">
                    <input
                      v-model="inputData[feature]"
                      type="text"
                      class="form-input"
                      :placeholder="`Ingresa ${formatFeatureName(feature).toLowerCase()}`"
                      required
                      @input="validateTextInput(feature, $event)"
                    />
                    <div class="input-hint">
                      <i class="pi pi-info-circle"></i>
                      <span>Texto libre (letras, números, espacios)</span>
                    </div>
                  </div>

                  <!-- Input para números -->
                  <div v-else-if="getVariableType(feature) === 'numeric'" class="input-wrapper">
                    <input
                      v-model.number="inputData[feature]"
                      type="number"
                      step="any"
                      class="form-input"
                      :placeholder="`Ingresa ${formatFeatureName(feature).toLowerCase()}`"
                      required
                      @input="validateNumericInput(feature, $event)"
                    />
                    <div class="input-hint">
                      <i class="pi pi-calculator"></i>
                      <span>Valor numérico (entero o decimal)</span>
                    </div>
                  </div>

                  <!-- Input para fechas -->
                  <div v-else-if="getVariableType(feature) === 'date'" class="input-wrapper">
                    <input
                      v-model="inputData[feature]"
                      type="date"
                      class="form-input"
                      required
                      @input="validateDateInput(feature, $event)"
                    />
                    <div class="input-hint">
                      <i class="pi pi-calendar"></i>
                      <span>Fecha en formato DD/MM/YYYY</span>
                    </div>
                  </div>

                  <!-- Input para fecha y hora -->
                  <div v-else-if="getVariableType(feature) === 'datetime'" class="input-wrapper">
                    <input
                      v-model="inputData[feature]"
                      type="datetime-local"
                      class="form-input"
                      required
                      @input="validateDateTimeInput(feature, $event)"
                    />
                    <div class="input-hint">
                      <i class="pi pi-clock"></i>
                      <span>Fecha y hora completa</span>
                    </div>
                  </div>

                  <!-- Input por defecto (numérico) -->
                  <div v-else class="input-wrapper">
                    <input
                      v-model.number="inputData[feature]"
                      type="number"
                      step="any"
                      class="form-input"
                      :placeholder="`Ingresa ${formatFeatureName(feature).toLowerCase()}`"
                      required
                    />
                    <div class="input-hint">
                      <i class="pi pi-calculator"></i>
                      <span>Valor numérico</span>
                    </div>
                  </div>

                  <!-- Mensaje de validación -->
                  <div v-if="validationErrors[feature]" class="validation-error">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>{{ validationErrors[feature] }}</span>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="tech-button predict-btn" :disabled="isPredicting">
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
                  Valor obtenido
                </h4>
                <div class="prediction-details">
                  <div class="prediction-main">
                    <!-- Resultado para Clasificación -->
                    <div
                      v-if="predictionResult.task_type === 'classification'"
                      class="predicted-class"
                    >
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
                        <span class="confidence-value"
                          >{{ (predictionResult.prediction.confidence * 100).toFixed(2) }}%</span
                        >
                        <div class="confidence-bar">
                          <div
                            class="confidence-fill"
                            :style="{ width: predictionResult.prediction.confidence * 100 + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="
                      predictionResult.prediction.probabilities &&
                      predictionResult.task_type === 'classification'
                    "
                    class="probabilities"
                  >
                    <span class="prediction-label">Probabilidades:</span>
                    <div class="probabilities-grid">
                      <div
                        v-for="(prob, className) in predictionResult.prediction.probabilities"
                        :key="className"
                        class="probability-item"
                      >
                        <span class="probability-class">{{
                          formatPredictionClass(className)
                        }}</span>
                        <div class="probability-container">
                          <span class="probability-value">{{ (prob * 100).toFixed(2) }}%</span>
                          <div class="probability-bar">
                            <div
                              class="probability-fill"
                              :style="{ width: prob * 100 + '%' }"
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
                    <span class="info-value prediction-id">{{
                      predictionResult.prediction_id
                    }}</span>
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
                    <span class="info-value">{{
                      getTaskTypeLabel(predictionResult.task_type)
                    }}</span>
                  </div>
                  <div
                    v-if="predictionResult.remaining_predictions !== undefined"
                    class="info-item"
                  >
                    <span class="info-label">Predicciones Restantes:</span>
                    <span class="info-value remaining-predictions">{{
                      predictionResult.remaining_predictions
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Visibilidad:</span>
                    <span class="info-value">{{
                      predictionResult.is_public ? 'Público' : 'Privado'
                    }}</span>
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
import { ref, onMounted, computed, nextTick } from 'vue'
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
const modelFeatures = ref([])
const validationErrors = ref({})

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
        'carga de modelos públicos',
      )
    } else {
      // Cargar modelos propios
      response = await safeApiCall(
        () => apiClient.get('/models/my_models/'),
        'carga de modelos propios',
      )
    }

    if (!response) {
      throw new Error('No se pudo cargar la respuesta')
    }

    const data = response.data

    if (isPublicModel.value) {
      // Filtrar el modelo público específico
      const publicModels = data.public_models || []
      const targetModel = publicModels.find((model) => model.id.toString() === publicModelId.value)

      if (targetModel) {
        availableModels.value = [targetModel]
        // Auto-seleccionar el modelo público
        await onModelChange()
      } else {
        throw new Error('Modelo público no encontrado')
      }
    } else {
      // Solo modelos completados pueden hacer predicciones
      availableModels.value = data.models?.filter((model) => model.status === 'completed') || []
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
  validationErrors.value = {}
  modelFeatures.value = []

  if (!selectedModelId.value) {
    selectedModel.value = null
    return
  }

  selectedModel.value = availableModels.value.find((model) => model.id === selectedModelId.value)

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
      'carga de información del modelo',
    )

    if (response) {
      const modelInfo = response.data
      console.log('Model info received:', modelInfo)

      // Limpiar completamente inputData y validationErrors
      inputData.value = {}
      validationErrors.value = {}

      // Esperar un tick para asegurar que Vue procese el cambio
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Crear nuevo objeto con las features requeridas
      const newInputData = {}
      if (modelInfo.required_features && modelInfo.required_features.length > 0) {
        console.log('Required features:', modelInfo.required_features)

        // Guardar información sobre las features
        modelFeatures.value = modelInfo.required_features.map((feature) => {
          const featureName = typeof feature === 'object' ? feature.name : feature
          return {
            name: featureName,
            type: detectVariableType(featureName),
            // Si el backend proporciona información sobre tipos, usarla
            actualType: modelInfo.feature_types?.[featureName] || detectVariableType(featureName),
          }
        })

        modelInfo.required_features.forEach((feature) => {
          const featureName = typeof feature === 'object' ? feature.name : feature
          newInputData[featureName] = ''
        })
      }

      // Asignar el nuevo objeto para forzar reactividad
      inputData.value = newInputData
      console.log('Input data updated:', inputData.value)
      console.log('Model features:', modelFeatures.value)
    } else {
      console.error('Failed to load model info')
    }
  } catch (err) {
    console.error('Error loading model features:', err)
    inputData.value = {} // Limpiar en caso de error
    modelFeatures.value = []
    validationErrors.value = {}
  }
}

const makePrediction = async () => {
  try {
    isPredicting.value = true
    predictionError.value = null

    // Validar que no haya errores de validación
    if (hasValidationErrors()) {
      predictionError.value = 'Por favor, corrige los errores en el formulario antes de continuar'
      return
    }

    // Validar que todos los campos estén llenos
    const emptyFields = Object.entries(inputData.value).filter(
      ([key, value]) => value === '' || value === null || value === undefined,
    )

    if (emptyFields.length > 0) {
      predictionError.value = 'Por favor, completa todos los campos requeridos'
      return
    }

    // Preparar los datos para el envío
    const processedData = {}
    Object.entries(inputData.value).forEach(([key, value]) => {
      const type = getVariableType(key)

      if (type === 'numeric') {
        processedData[key] = Number(value)
      } else if (type === 'date' || type === 'datetime') {
        processedData[key] = value
      } else {
        processedData[key] = String(value)
      }
    })

    // El endpoint es el mismo para modelos propios y públicos
    // El backend detecta automáticamente si es público o propio
    const response = await safeApiCall(
      () =>
        apiClient.post(`/models/predict/${selectedModelId.value}/`, {
          input_data: processedData,
        }),
      'predicción del modelo',
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
    classification: 'Clasificación',
    regression: 'Regresión',
    clustering: 'Clustering',
  }
  return labels[taskType] || taskType
}

const formatFeatureName = (feature) => {
  // Convertir nombres de features a formato más legible
  return feature
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
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

// Métodos para detección de tipos de variables
const detectVariableType = (featureName) => {
  const name = featureName.toLowerCase()

  // Detectar fechas
  if (
    name.includes('date') ||
    name.includes('fecha') ||
    name.includes('time') ||
    name.includes('hora')
  ) {
    if (name.includes('time') || name.includes('hora') || name.includes('datetime')) {
      return 'datetime'
    }
    return 'date'
  }

  // Detectar texto
  if (
    name.includes('name') ||
    name.includes('nombre') ||
    name.includes('text') ||
    name.includes('texto') ||
    name.includes('description') ||
    name.includes('descripcion') ||
    name.includes('comment') ||
    name.includes('comentario') ||
    name.includes('category') ||
    name.includes('categoria') ||
    name.includes('type') ||
    name.includes('tipo')
  ) {
    return 'text'
  }

  // Por defecto, numérico
  return 'numeric'
}

const getVariableType = (featureName) => {
  const feature = modelFeatures.value.find((f) => f.name === featureName)
  return feature?.actualType || feature?.type || 'numeric'
}

const getVariableTypeLabel = (featureName) => {
  const type = getVariableType(featureName)
  const labels = {
    text: 'Texto',
    numeric: 'Numérico',
    date: 'Fecha',
    datetime: 'Fecha y Hora',
  }
  return labels[type] || 'Numérico'
}

const getVariableTypeClass = (featureName) => {
  const type = getVariableType(featureName)
  return `type-${type}`
}

// Métodos de validación
const validateTextInput = (featureName, event) => {
  const value = event.target.value
  validationErrors.value[featureName] = null

  if (value && value.length > 500) {
    validationErrors.value[featureName] = 'El texto no puede exceder los 500 caracteres'
  }
}

const validateNumericInput = (featureName, event) => {
  const value = event.target.value
  validationErrors.value[featureName] = null

  if (value && isNaN(Number(value))) {
    validationErrors.value[featureName] = 'Debe ser un valor numérico válido'
  }
}

const validateDateInput = (featureName, event) => {
  const value = event.target.value
  validationErrors.value[featureName] = null

  if (value && !isValidDate(value)) {
    validationErrors.value[featureName] = 'Debe ser una fecha válida'
  }
}

const validateDateTimeInput = (featureName, event) => {
  const value = event.target.value
  validationErrors.value[featureName] = null

  if (value && !isValidDateTime(value)) {
    validationErrors.value[featureName] = 'Debe ser una fecha y hora válida'
  }
}

const isValidDate = (dateString) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

const isValidDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  return date instanceof Date && !isNaN(date)
}

const hasValidationErrors = () => {
  return Object.values(validationErrors.value).some((error) => error !== null)
}

// Posicionar elementos galácticos
const positionGalacticElements = () => {
  // Posicionar estrellas aleatoriamente
  const stars = document.querySelectorAll('.star-field .star')
  stars.forEach((star) => {
    const top = Math.random() * 100
    const left = Math.random() * 100
    star.style.top = `${top}%`
    star.style.left = `${left}%`
    star.style.animationDelay = `${Math.random() * 3}s`
  })

  // Posicionar partículas aleatoriamente
  const particles = document.querySelectorAll('.particle')
  particles.forEach((particle, index) => {
    const top = Math.random() * 100
    const left = Math.random() * 100
    particle.style.top = `${top}%`
    particle.style.left = `${left}%`
    particle.style.animationDelay = `${index * 2}s`
  })
}

// Lifecycle
onMounted(() => {
  checkPublicModelRoute()
  loadAvailableModels()
  
  // Posicionar elementos galácticos después de que el DOM esté listo
  nextTick(() => {
    positionGalacticElements()
  }, 100)
})
</script>

<style scoped>
/* Global scroll fixes */
* {
  box-sizing: border-box;
}

html,
body {
  overflow-x: hidden;
  max-width: 100vw;
}

.predictions-view {
  min-height: 100vh;
  background: #000;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: white;
  width: 100%;
  box-sizing: border-box;
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
  animation: starTwinkle 3s ease-in-out infinite;
}

.star:nth-child(odd) {
  animation-delay: 1s;
}

.star:nth-child(3n) {
  animation-delay: 2s;
  background: rgba(59, 130, 246, 0.9);
}

.star:nth-child(5n) {
  animation-delay: 0.5s;
  background: rgba(0, 191, 255, 0.8);
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
  background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.6), transparent);
  animation: energyFlow 8s linear infinite;
}

.energy-stream:nth-child(1) {
  left: 20%;
  animation-delay: 0s;
}

.energy-stream:nth-child(2) {
  left: 50%;
  animation-delay: 3s;
  background: linear-gradient(to bottom, transparent, rgba(0, 191, 255, 0.5), transparent);
}

.energy-stream:nth-child(3) {
  left: 80%;
  animation-delay: 6s;
  background: linear-gradient(to bottom, transparent, rgba(96, 165, 250, 0.5), transparent);
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

.predictions-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(30, 64, 175, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
    radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 30% 70%, rgba(96, 165, 250, 0.04) 0%, transparent 55%);
  animation: galaxyBreath 25s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes galaxyBreath {
  0%,
  100% {
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
  background: linear-gradient(135deg, 
    rgba(25, 25, 40, 0.05) 0%, 
    rgba(15, 15, 30, 0.08) 50%,
    rgba(25, 25, 40, 0.03) 100%);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: 0 0 30px 30px;
  padding: 3rem 0 2.5rem 0;
  margin-top: 2rem;
  position: relative;
  overflow: visible;
  z-index: 1;
  width: 100%;
  max-width: 100%;
}

.predictions-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.5) 20%,
    rgba(0, 191, 255, 0.7) 50%,
    rgba(59, 130, 246, 0.5) 80%,
    transparent 100%);
  z-index: 3;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
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
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
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
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
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
  font-size: 2.7rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #00d4ff 0%, #3b82f6 60%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  text-shadow: 0 0 32px rgba(59, 130, 246, 0.18);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));
  text-align: center;
  position: relative;
  z-index: 4;
}

@keyframes titleGlow {
  0%,
  100% {
    text-shadow: 0 0 40px rgba(59, 130, 246, 0.5);
  }
  50% {
    text-shadow:
      0 0 60px rgba(59, 130, 246, 0.7),
      0 0 80px rgba(59, 130, 246, 0.4);
  }
}

.predictions-description {
  font-size: 1.1rem;
  color: #e5e7eb;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  text-align: center;
  position: relative;
  z-index: 4;
}

.predictions-content {
  padding: 2rem 0 3rem 0;
  position: relative;
  z-index: 1;
  min-height: 70vh;
  width: 100%;
  box-sizing: border-box;
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

/* Cards */
.model-selection-card,
.prediction-form-card,
.prediction-result-card,
.error-card {
  background: rgba(25, 25, 40, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(25px);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(59, 130, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  height: fit-content;
  min-height: 250px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 2rem;
}



.model-selection-card:hover,
.prediction-form-card:hover,
.prediction-result-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 50px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(59, 130, 246, 0.6);
}

.card-header {
  background: rgba(59, 130, 246, 0.1);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
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
  color: #3b82f6;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #b1b8d4;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.form-label .variable-type-badge {
  margin-left: 0;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.form-select,
.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background:
    linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(30, 30, 50, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 15px rgba(59, 130, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow:
    0 0 20px rgba(59, 130, 246, 0.4),
    0 0 40px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  background:
    linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.9)),
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
  transform: translateY(-1px);
}

.form-select:hover,
.form-input:hover {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow:
    0 6px 20px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.form-select {
  appearance: none;
  background:
    linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(30, 30, 50, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  background-repeat: no-repeat, no-repeat;
  background-position:
    left center,
    left center;
  background-size: cover, cover;
  padding-right: 1rem;
  cursor: pointer;
}

.form-select:focus {
  background:
    linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.9)),
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
}

.form-select:hover {
  background:
    linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.85)),
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 50%);
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
  color: #3b82f6;
  font-size: 0.9rem;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 100%;
}

/* Estilos para campos largos */
.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Permite que el contenido se contraiga */
}

.form-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #b1b8d4;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.form-label .variable-type-badge {
  margin-left: 0;
  margin-top: 0.25rem;
  flex-shrink: 0;
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.6));
  border: 2px solid rgba(59, 130, 246, 0.8);
  color: #ffffff;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.predict-btn:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(59, 130, 246, 0.7));
  border-color: rgba(59, 130, 246, 1);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
}

.section-title i {
  color: #3b82f6;
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
  background: rgba(59, 130, 246, 0.1);
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
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
}

.prediction-section {
  border-color: rgba(255, 255, 255, 0.811);
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
  background: rgba(65, 1, 107, 0.1);
  border: 2px solid rgba(0, 31, 157, 0.3);
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
  color: #fefefed5;
  text-shadow: 0 0 20px rgba(224, 100, 255, 0.25);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
    gap: 1.25rem;
  }

  .form-label {
    font-size: 0.85rem;
  }

  .variable-type-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
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

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-label {
    font-size: 0.8rem;
  }

  .variable-type-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
  }

  .form-input {
    font-size: 0.9rem;
    padding: 0.65rem 0.85rem;
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

/* Variable Type Badge Styles */
.variable-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 0;
  margin-top: 0.25rem;
  border: 1px solid;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.variable-type-badge.numeric {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border-color: rgba(52, 152, 219, 0.4);
}

.variable-type-badge.text {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.4);
}

.variable-type-badge.date {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
  border-color: rgba(155, 89, 182, 0.4);
}

.variable-type-badge.datetime {
  background: rgba(230, 126, 34, 0.2);
  color: #e67e22;
  border-color: rgba(230, 126, 34, 0.4);
}

/* Input Wrapper and Hint Styles */
.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  padding: 0.25rem 0;
}

.input-hint i {
  font-size: 0.8rem;
  color: rgba(59, 130, 246, 0.7);
}

/* Validation Error Styles */
.validation-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.5rem 0;
  border-radius: 0.25rem;
  animation: errorFadeIn 0.3s ease-out;
}

.validation-error i {
  font-size: 0.9rem;
  color: #e74c3c;
}

@keyframes errorFadeIn {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form Input Enhancements */
.form-input {
  background: rgba(20, 20, 35, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.form-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(20, 20, 35, 0.8);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Removido: estilos :invalid que causaban el borde rojo */

/* Estilos para título tecnológico */
.title-container {
  text-align: center;
  margin-bottom: 2rem;
}

.title-glitch {
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 0;
  position: relative;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.title-text {
  display: inline-block;
  position: relative;
}

.title-underline {
  height: 2px;
  background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
  margin: 0.5rem auto;
  width: 60%;
  opacity: 0.7;
}

.subtitle-text {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #e2e8f0;
  margin: 1rem 0 0 0;
  letter-spacing: 1px;
}

.subtitle-prefix {
  color: #8B5CF6;
  font-weight: bold;
}

.cursor-blink {
  animation: blink 1s infinite;
  color: #8B5CF6;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
