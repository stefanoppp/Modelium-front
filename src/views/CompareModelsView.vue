<template>
  <div class="compare-models-container">
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
          <i class="pi pi-chart-bar"></i>
          Comparación de Modelos
        </h1>
        <p class="page-subtitle">
          Analiza y compara el rendimiento de tus modelos de Machine Learning
        </p>
      </div>

      <!-- Selector de tipo de modelo -->
      <div class="model-type-selector">
        <div class="selector-card">
          <h3>Selecciona el tipo de modelo</h3>
          <div class="type-options">
            <div 
              v-for="type in modelTypes" 
              :key="type.value"
              class="type-option"
              :class="{ active: selectedType === type.value }"
              @click="selectModelType(type.value)"
            >
              <div class="type-icon">
                <i :class="type.icon"></i>
              </div>
              <div class="type-info">
                <h4>{{ type.label }}</h4>
                <p>{{ type.description }}</p>
                <span class="model-count">{{ getModelCountByType(type.value) }} modelos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selector de modelos -->
      <div v-if="selectedType" class="model-selector">
        <div class="selector-card">
          <h3>Selecciona modelos para comparar</h3>
          <div class="info-banner">
            <i class="pi pi-info-circle"></i>
            <span>Selecciona 1 o más modelos para ver la comparación automática</span>
          </div>
          <div class="models-grid">
            <div 
              v-for="model in availableModels" 
              :key="model.id"
              class="model-card"
              :class="{ selected: selectedModels.includes(model.id) }"
              @click="toggleModel(model.id)"
            >
              <div class="model-status" :class="getStatusClass(model.status)">
                <i :class="getStatusIcon(model.status)"></i>
              </div>
              <div class="model-info">
                <h4>{{ model.name }}</h4>
                <p>{{ model.description }}</p>
                <div class="model-details">
                  <span class="model-date">{{ formatDate(model.created_at) }}</span>
                  <span class="model-accuracy" v-if="getMetricValue(model, 'accuracy') !== null">
                    Exactitud: {{ (getMetricValue(model, 'accuracy') * 100).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedModels.length > 0" class="comparison-controls">
            <span class="selection-info">
              {{ selectedModels.length }} modelo{{ selectedModels.length !== 1 ? 's' : '' }} seleccionado{{ selectedModels.length !== 1 ? 's' : '' }}
              <span v-if="selectedModels.length >= 1" class="auto-compare-info">
                - Comparación automática activada
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Comparación de modelos -->
      <div v-if="showComparison && comparisonData.length > 0" class="comparison-section">
        
        <!-- Indicador de actualización -->
        <div v-if="isUpdatingCharts" class="updating-indicator">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Actualizando gráficos...</span>
        </div>
        
        <!-- Gráfico de barras comparativo -->
        <div class="chart-section">
          <h3>Comparación Visual</h3>
          <div class="chart-container">
            <canvas ref="comparisonChart" v-if="!isUpdatingCharts && hasChartData"></canvas>
            <div v-if="isUpdatingCharts" class="chart-loading">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Cargando gráfico...</span>
            </div>
            <div v-if="!isUpdatingCharts && !hasChartData" class="no-data-message">
              <i class="pi pi-info-circle"></i>
              <span>No hay métricas disponibles para estos modelos. Verifica que los modelos tengan métricas de evaluación.</span>
            </div>
          </div>
        </div>

        <!-- Gráfico radar (solo para clasificación) -->
        <div v-if="selectedType === 'classification'" class="chart-section">
          <h3>Análisis Radar</h3>
          <div class="chart-container">
            <canvas ref="radarChart" v-if="!isUpdatingCharts && hasChartData"></canvas>
            <div v-if="isUpdatingCharts" class="chart-loading">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Cargando gráfico radar...</span>
            </div>
            <div v-if="!isUpdatingCharts && !hasChartData" class="no-data-message">
              <i class="pi pi-info-circle"></i>
              <span>No hay métricas disponibles para el análisis radar.</span>
            </div>
          </div>
        </div>

        <!-- Tabla comparativa detallada -->
        <div class="detailed-comparison">
          <h3>Comparación Detallada</h3>
          <div class="table-container">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th v-if="selectedType === 'classification'">Exactitud</th>
                  <th v-if="selectedType === 'classification'">Precisión</th>
                  <th v-if="selectedType === 'classification'">Sensibilidad</th>
                  <th v-if="selectedType === 'classification'">Puntuación F1</th>
                  <th v-if="selectedType === 'classification'">AUC</th>
                  <th v-if="selectedType === 'classification'">Kappa</th>
                  <th v-if="selectedType === 'regression'">mae</th>
                  <th v-if="selectedType === 'regression'">rmse</th>
                  <th v-if="selectedType === 'regression'">r2</th>
                  <th v-if="selectedType === 'regression'">mape</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="model in comparisonData" :key="model.id">
                  <td class="model-name">{{ model.name }}</td>
                  <td>{{ formatDate(model.created_at) }}</td>
                  <td>
                    <span class="status-badge" :class="getStatusClass(model.status)">
                      {{ getStatusLabel(model.status) }}
                    </span>
                  </td>
                  <td v-if="selectedType === 'classification'">
                    {{ getFormattedMetricValue(model, 'accuracy') }}
                  </td>
                  <td v-if="selectedType === 'classification'">
                    {{ getFormattedMetricValue(model, 'precision') }}
                  </td>
                  <td v-if="selectedType === 'classification'">
                    {{ getFormattedMetricValue(model, 'recall') }}
                  </td>
                  <td v-if="selectedType === 'classification'">
                    {{ getFormattedMetricValue(model, 'f1_score') }}
                  </td>
                  <td v-if="selectedType === 'classification'">
                    {{ getFormattedMetricValue(model, 'auc') }}
                  </td>
                  <td v-if="selectedType === 'classification'">
                    {{ getFormattedMetricValue(model, 'kappa') }}
                  </td>
                  <td v-if="selectedType === 'regression'">
                    {{ getFormattedMetricValue(model, 'mae') }}
                  </td>
                  <td v-if="selectedType === 'regression'">
                    {{ getFormattedMetricValue(model, 'rmse') }}
                  </td>
                  <td v-if="selectedType === 'regression'">
                    {{ getFormattedMetricValue(model, 'r2') }}
                  </td>
                  <td v-if="selectedType === 'regression'">
                    {{ getFormattedMetricValue(model, 'mape') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Métricas generales -->
        <div class="metrics-overview">
          <h3>Métricas Generales</h3>
          <div class="metrics-grid">
            <div 
              v-for="model in comparisonData" 
              :key="model.id"
              class="metric-card"
            >
              <h4>{{ model.name }}</h4>
              <div class="metric-values">
                <div class="metric-item" v-if="getMetricValue(model, 'accuracy') !== null">
                  <span class="metric-label">Exactitud</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'accuracy') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'precision') !== null">
                  <span class="metric-label">Precisión</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'precision') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'recall') !== null">
                  <span class="metric-label">Sensibilidad</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'recall') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'f1_score') !== null">
                  <span class="metric-label">Puntuación F1</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'f1_score') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'auc') !== null">
                  <span class="metric-label">AUC</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'auc') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'kappa') !== null">
                  <span class="metric-label">Kappa</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'kappa') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'mae') !== null">
                  <span class="metric-label">mae</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'mae') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'rmse') !== null">
                  <span class="metric-label">rmse</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'rmse') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'r2') !== null">
                  <span class="metric-label">r2</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'r2') }}</span>
                </div>
                <div class="metric-item" v-if="getMetricValue(model, 'mape') !== null">
                  <span class="metric-label">mape</span>
                  <span class="metric-value">{{ getFormattedMetricValue(model, 'mape') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!selectedType" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <h3>Selecciona un tipo de modelo</h3>
        <p>Elige el tipo de modelo que deseas comparar para comenzar</p>
      </div>

      <div v-if="selectedType && availableModels.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-inbox"></i>
        </div>
        <h3>No hay modelos disponibles</h3>
        <p>No tienes modelos de tipo {{ selectedType }} para comparar</p>
        <TechButton 
          label="Crear Modelo" 
          icon="pi pi-plus"
          @click="navigateToCreateModel"
          class="primary-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { modelService } from '@/services/modelService'
import TechButton from '@/components/ui/TechButton.vue'
import NavBar from '@/components/layout/NavBar.vue'
import Chart from 'chart.js/auto'
import apiClient from '@/services/apiService'

const router = useRouter()
const authStore = useAuthStore()

// Estado reactivo
const models = ref([])
const selectedType = ref(null)
const selectedModels = ref([])
const showComparison = ref(false)
const comparisonData = ref([])
const isLoading = ref(false)
const isUpdatingCharts = ref(false)
const hasMetricsError = ref(false)
const metricsErrorMessage = ref('')

// Referencias para los gráficos
const comparisonChart = ref(null)
const radarChart = ref(null)

// Tipos de modelos disponibles
const modelTypes = [
  {
    value: 'classification',
    label: 'Clasificación',
    description: 'Modelos que predicen categorías o clases',
    icon: 'pi pi-tags'
  },
  {
    value: 'regression',
    label: 'Regresión',
    description: 'Modelos que predicen valores numéricos',
    icon: 'pi pi-chart-line'
  }
]

// Computed properties
const availableModels = computed(() => {
  if (!selectedType.value) return []
  return models.value.filter(model => 
    model.task_type === selectedType.value && 
    (model.status === 'completed' || model.status === 'ready')
  )
})

const hasChartData = computed(() => {
  if (!comparisonData.value.length) return false
  
  // Verificar si algún modelo tiene métricas reales
  const hasRealMetrics = comparisonData.value.some(model => {
    if (!model.metrics || typeof model.metrics !== 'object') return false
    
    if (selectedType.value === 'classification') {
      const metrics = ['accuracy', 'precision', 'recall', 'f1_score', 'auc', 'kappa']
      return metrics.some(metric => {
        const value = getMetricValue(model, metric)
        return value !== null && value !== undefined
      })
    } else if (selectedType.value === 'regression') {
      const metrics = ['r2', 'mae', 'rmse', 'mape']
      return metrics.some(metric => {
        const value = getMetricValue(model, metric)
        return value !== null && value !== undefined
      })
    }
    
    return false
  })
  
  return hasRealMetrics
})

// Funciones
const loadModels = async () => {
  isLoading.value = true
  try {
    const result = await modelService.getMyModels()
    if (result.success) {
      models.value = result.data.models || []
    }
  } catch (error) {
    console.error('Error loading models:', error)
  } finally {
    isLoading.value = false
  }
}

// Función auxiliar para extraer métricas de diferentes estructuras
const getMetricValue = (model, metricName) => {
  if (!model || !metricName) return null
  
  console.log(`Getting metric "${metricName}" for model "${model.name}"`)
  console.log('Model has metrics:', !!model.metrics)
  console.log('Model.metrics content:', model.metrics)
  
  // Función auxiliar para validar si un valor es numérico válido (incluyendo 0 y valores muy pequeños)
  const isValidNumber = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string' && value.trim() === '') return false
    const num = Number(value)
    // Usar isFinite para verificar que es un número válido (incluyendo 0 y valores muy pequeños)
    return !isNaN(num) && isFinite(num)
  }
  
  // Buscar en model.metrics (estructura de la API)
  if (model.metrics && typeof model.metrics === 'object') {
    console.log(`Looking for "${metricName}" in metrics:`, Object.keys(model.metrics))
    
    // Para regresión, usar solo nombres exactos del backend
    if (selectedType.value === 'regression') {
      const exactValue = model.metrics[metricName]
      console.log(`Checking exact value for ${metricName}:`, exactValue, typeof exactValue)
      
      if (isValidNumber(exactValue)) {
        const numericValue = Number(exactValue)
        console.log(`✅ Found ${metricName} (regression):`, exactValue, '→', numericValue, '(is zero:', numericValue === 0, ')')
        return numericValue
      } else {
        console.log(`❌ Invalid or missing value for ${metricName}:`, exactValue)
      }
    } else {
      // Para clasificación, permitir variaciones conocidas
      const variations = {
        'accuracy': ['accuracy'],
        'precision': ['precision'],
        'recall': ['recall'],
        'f1_score': ['f1_score'],
        'auc': ['auc', 'roc_auc', 'auc_score'],
        'kappa': ['kappa', 'cohen_kappa', 'kappa_score']
      }
      
      const possibleNames = variations[metricName] || [metricName]
      console.log(`Classification mode: trying variations for ${metricName}:`, possibleNames)
      
      for (const name of possibleNames) {
        if (isValidNumber(model.metrics[name])) {
          console.log(`Found variation ${name}:`, model.metrics[name])
          return Number(model.metrics[name])
        }
      }
    }
  }
  
  console.log(`No metric found for ${metricName} in model ${model.name}`)
  return null
}

// Función helper para obtener y formatear valores de métricas
const getFormattedMetricValue = (model, metricName) => {
  const value = getMetricValue(model, metricName)
  
  if (value === null || value === undefined) {
    return 'N/A'
  }
  
  if (selectedType.value === 'classification') {
    return (value * 100).toFixed(1) + '%'
  } else if (selectedType.value === 'regression') {
    return formatRegressionValue(value)
  }
  
  return String(value)
}

// Función para formatear valores de regresión
const formatRegressionValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  
  const num = Number(value)
  
  // Verificar que es un número válido
  if (isNaN(num) || !isFinite(num)) return 'N/A'
  
  // Manejar casos especiales
  if (num === 0) return '0.0000'
  
  // Para valores muy pequeños (menores a 0.0000001), usar notación científica
  if (Math.abs(num) < 0.0000001 && num !== 0) {
    return num.toExponential(4)
  }
  
  // Para valores como 0.0081, 0.00001, etc., usar suficientes decimales para mostrar el valor
  if (Math.abs(num) < 0.01) {
    // Encontrar cuántos decimales necesitamos para mostrar el valor correctamente
    const str = num.toFixed(10)
    const trimmed = str.replace(/\.?0+$/, '')
    // Asegurar al menos 4 decimales para valores pequeños
    const parts = trimmed.split('.')
    if (parts.length > 1 && parts[1].length < 4) {
      return num.toFixed(4)
    }
    return trimmed
  }
  
  // Para valores normales (entre 0.01 y 1), usar 6 decimales
  if (Math.abs(num) < 1) {
    return num.toFixed(6).replace(/\.?0+$/, '')
  }
  
  // Para valores grandes, usar 4 decimales
  return num.toFixed(4)
}

// Función para obtener métricas detalladas de un modelo desde el endpoint
const getModelMetrics = async (modelId) => {
  try {
    console.log(`Making authenticated request to: /models/info/${modelId}/`)
    const response = await apiClient.get(`/models/info/${modelId}/`)
    
    console.log(`Response status for model ${modelId}:`, response.status)
    console.log(`Raw response for model ${modelId}:`, response.data)
    console.log(`Metrics structure:`, response.data.metrics)
    return response.data
  } catch (error) {
    console.error(`Error fetching metrics for model ${modelId}:`, error)
    if (error.response) {
      console.error(`Response error:`, error.response.status, error.response.data)
    }
    return null
  }
}



const getModelCountByType = (type) => {
  return models.value.filter(model => 
    model.task_type === type && 
    (model.status === 'completed' || model.status === 'ready')
  ).length
}

const selectModelType = (type) => {
  selectedType.value = type
  selectedModels.value = []
  showComparison.value = false
  comparisonData.value = []
}

const toggleModel = (modelId) => {
  const index = selectedModels.value.indexOf(modelId)
  if (index > -1) {
    selectedModels.value.splice(index, 1)
  } else {
    selectedModels.value.push(modelId)
  }
  
  // Actualizar comparación automáticamente si hay al menos 1 modelo seleccionado
  if (selectedModels.value.length >= 1) {
    updateComparison()
  } else {
    // Ocultar comparación si no hay modelos
    showComparison.value = false
    comparisonData.value = []
  }
}

const compareModels = async () => {
  if (selectedModels.value.length < 2) return
  await updateComparison()
}

const updateComparison = async () => {
  isUpdatingCharts.value = true
  
  try {
    // Obtener datos detallados de los modelos seleccionados
    const selectedModelData = models.value.filter(model => 
      selectedModels.value.includes(model.id)
    )
    
    console.log('=== FETCHING MODEL METRICS ===')
    console.log('Selected models:', selectedModelData.map(m => ({id: m.id, name: m.name})))
    
    // Obtener métricas detalladas para cada modelo
    const modelsWithMetrics = await Promise.all(
      selectedModelData.map(async (model) => {
        console.log(`Fetching metrics for model ${model.name} (ID: ${model.id})...`)
        const metricsData = await getModelMetrics(model.id)
        
        if (metricsData) {
          // Combinar el modelo original con las métricas obtenidas
          const modelWithMetrics = {
            ...model,
            metrics: metricsData.metrics || {}
          }
          console.log(`Metrics loaded for ${model.name}:`, metricsData.metrics)
          return modelWithMetrics
        } else {
          console.log(`No metrics found for ${model.name}`)
          return {
            ...model,
            metrics: {}
          }
        }
      })
    )
    
    console.log('=== MODELS WITH METRICS ===')
    modelsWithMetrics.forEach((model, index) => {
      console.log(`Model ${index + 1} (${model.name}):`)
      console.log('  Available metrics:', Object.keys(model.metrics || {}))
      console.log('  Metrics values:', model.metrics)
      console.log('  ---')
    })
    console.log('=== END DEBUG ===')
    
    comparisonData.value = modelsWithMetrics
    showComparison.value = true
    
    // Pequeño retraso para mostrar el indicador de carga
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Crear gráficos después de que el DOM se actualice
    await nextTick()
    createCharts()
  } catch (error) {
    console.error('Error updating comparison:', error)
  } finally {
    isUpdatingCharts.value = false
  }
}

const createCharts = () => {
  if (!comparisonData.value.length) return
  
  console.log('Creating charts with data:', comparisonData.value)
  
  // Destruir gráficos existentes para evitar conflictos
  if (comparisonChart.value?.chart) {
    comparisonChart.value.chart.destroy()
    comparisonChart.value.chart = null
  }
  if (radarChart.value?.chart) {
    radarChart.value.chart.destroy()
    radarChart.value.chart = null
  }
  
  // Pequeño delay para asegurar que el DOM esté listo
  setTimeout(() => {
    // Crear gráfico de barras comparativo
    createBarChart()
    
    // Crear gráfico radar para clasificación
    if (selectedType.value === 'classification') {
      createRadarChart()
    }
  }, 100)
}

const createBarChart = () => {
  if (!comparisonChart.value) {
    console.log('Chart canvas not available')
    return
  }
  
  const ctx = comparisonChart.value.getContext('2d')
  const labels = comparisonData.value.map(model => model.name)
  let datasets = []
  
  console.log('Creating bar chart for type:', selectedType.value)
  console.log('Model names:', labels)
  
  if (selectedType.value === 'classification') {
    // Métricas para clasificación
    const metrics = [
      { key: 'accuracy', label: 'Exactitud', color: '#4ECDC4' },
      { key: 'precision', label: 'Precisión', color: '#FF6B6B' },
      { key: 'recall', label: 'Sensibilidad', color: '#45B7D1' },
      { key: 'f1_score', label: 'Puntuación F1', color: '#96CEB4' },
      { key: 'auc', label: 'AUC', color: '#FFEAA7' },
      { key: 'kappa', label: 'Kappa', color: '#FD79A8' }
    ]
    
    metrics.forEach((metric) => {
      const data = comparisonData.value.map(model => {
        const value = getMetricValue(model, metric.key)
        const percentage = value !== null ? (value * 100) : 0
        console.log(`${model.name} - ${metric.key}:`, value, '→', percentage.toFixed(2) + '%')
        return Math.round(percentage * 100) / 100 // Redondear a 2 decimales
      })
      
      // Agregar dataset si hay al menos un valor válido (incluyendo 0)
      if (data.some(value => value >= 0)) {
        datasets.push({
          label: metric.label,
          data: data,
          backgroundColor: metric.color,
          borderColor: metric.color,
          borderWidth: 1,
          borderRadius: 4,
        })
        console.log(`Added dataset for ${metric.label}:`, data)
      } else {
        console.log(`No data for ${metric.label}`)
      }
    })
    
  } else if (selectedType.value === 'regression') {
    // Para regresión, mostrar valores reales exactos del backend
    const regressionMetrics = [
      { key: 'r2', label: 'r2', color: '#4ECDC4' },
      { key: 'mae', label: 'mae', color: '#FF6B6B' },
      { key: 'rmse', label: 'rmse', color: '#45B7D1' },
      { key: 'mape', label: 'mape', color: '#96CEB4' }
    ]
    
    console.log('=== PROCESSING REGRESSION METRICS ===')
    
    regressionMetrics.forEach((metric) => {
      const data = comparisonData.value.map(model => {
        const value = getMetricValue(model, metric.key)
        console.log(`${model.name} - ${metric.key}:`, value, typeof value, 'is zero:', value === 0)
        
        // Retornar el valor real, incluido 0 y valores muy pequeños
        return value !== null && value !== undefined ? value : null
      })
      
      console.log(`Data array for ${metric.key}:`, data)
      
      // Verificar si hay al menos un valor válido (incluyendo 0)
      const hasValidData = data.some(value => value !== null && value !== undefined)
      
      if (hasValidData) {
        // Preparar datos para el gráfico (convertir null a 0 para visualización)
        const chartData = data.map(value => value !== null && value !== undefined ? value : 0)
        
        datasets.push({
          label: metric.label,
          data: chartData,
          backgroundColor: metric.color,
          borderColor: metric.color,
          borderWidth: 1,
          borderRadius: 4,
        })
        console.log(`✅ Added ${metric.label} dataset:`, chartData)
      } else {
        console.log(`❌ No valid data for ${metric.label}`)
      }
    })
    
    console.log('=== END REGRESSION PROCESSING ===')
  }
  
  console.log('Final datasets for chart:', datasets)
  
  // Crear el gráfico solo si hay datasets
  if (datasets.length > 0) {
    try {
      comparisonChart.value.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#ffffff',
                font: {
                  size: 13,
                  family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                  weight: '500'
                },
                padding: 15,
                usePointStyle: true,
                pointStyle: 'rect'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(78, 205, 196, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              titleFont: {
                size: 14,
                weight: '600'
              },
              bodyFont: {
                size: 13
              },
              padding: 12,
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || ''
                  const value = context.parsed.y
                  if (selectedType.value === 'classification') {
                    return `${label}: ${value.toFixed(1)}%`
                  } else {
                    // Para regresión, usar el mismo formateo que en la vista
                    return `${label}: ${formatRegressionValue(value)}`
                  }
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: selectedType.value === 'classification' ? 100 : undefined,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                lineWidth: 1
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: {
                  size: 11,
                  family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
                },
                callback: function(value) {
                  if (selectedType.value === 'classification') {
                    return value + '%'
                  } else {
                    // Para regresión, usar el formateo inteligente
                    return formatRegressionValue(value)
                  }
                },
                stepSize: selectedType.value === 'classification' ? 10 : undefined
              },
              title: {
                display: true,
                text: selectedType.value === 'classification' ? 'Rendimiento (%)' : 'Valor de la métrica',
                color: 'rgba(255, 255, 255, 0.8)',
                font: {
                  size: 12,
                  weight: '600'
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: {
                  size: 11,
                  family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
                },
                maxRotation: 45
              },
              title: {
                display: true,
                text: 'Modelos',
                color: 'rgba(255, 255, 255, 0.8)',
                font: {
                  size: 12,
                  weight: '600'
                }
              }
            }
          },
          animation: {
            duration: 800,
            easing: 'easeInOutQuart'
          }
        }
      })
      
      console.log('Chart created successfully')
    } catch (error) {
      console.error('Error creating chart:', error)
    }
  } else {
    console.log('No datasets available for chart')
  }
}

const createRadarChart = () => {
  if (!radarChart.value) return
  
  const ctx = radarChart.value.getContext('2d')
  
  // Verificar qué métricas están disponibles
  const availableMetrics = []
  const metricLabels = []
  
  const metrics = [
    { key: 'accuracy', label: 'Exactitud' },
    { key: 'precision', label: 'Precisión' },
    { key: 'recall', label: 'Sensibilidad' },
    { key: 'f1_score', label: 'Puntuación F1' },
    { key: 'auc', label: 'AUC' },
    { key: 'kappa', label: 'Kappa' }
  ]
  
  metrics.forEach(metric => {
    const hasData = comparisonData.value.some(model => {
      const value = getMetricValue(model, metric.key)
      return value !== null && value !== undefined
    })
    if (hasData) {
      availableMetrics.push(metric.key)
      metricLabels.push(metric.label)
    }
  })
  
  console.log('Available metrics for radar chart:', availableMetrics)
  
  // Solo crear el gráfico si hay métricas disponibles
  if (availableMetrics.length > 0) {
    // Colores profesionales para cada modelo
    const professionalColors = [
      { r: 78, g: 205, b: 196 },   // Turquesa
      { r: 255, g: 107, b: 107 },  // Coral
      { r: 69, g: 183, b: 209 },   // Azul cielo
      { r: 150, g: 206, b: 180 },  // Verde menta
      { r: 255, g: 234, b: 167 },  // Amarillo suave
      { r: 253, g: 121, b: 168 }   // Rosa
    ]

    const datasets = comparisonData.value.map((model, index) => {
      const colorIndex = index % professionalColors.length
      const color = professionalColors[colorIndex]
      
      return {
        label: model.name,
        data: availableMetrics.map(metric => {
          const value = getMetricValue(model, metric)
          return value !== null ? parseFloat((value * 100).toFixed(1)) : 0
        }),
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`,
        borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`,
        borderWidth: 3,
        pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        pointHoverBorderWidth: 3,
        pointHoverRadius: 8,
        fill: true
      }
    })
    
    console.log('Radar chart datasets:', datasets)
    
    radarChart.value.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: metricLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 3,
            tension: 0.2
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
                family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                weight: '500'
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(78, 205, 196, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: '600'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            callbacks: {
              title: function(context) {
                return context[0].label
              },
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.parsed.r
                return `${label}: ${value}%`
              },
              afterBody: function(context) {
                if (context.length > 0) {
                  const metric = context[0].label.toLowerCase()
                  const descriptions = {
                    'accuracy': 'Proporción de predicciones correctas (exactitud)',
                    'precision': 'Proporción de positivos predichos que son correctos',
                    'recall': 'Proporción de positivos reales detectados (sensibilidad)',
                    'f1-score': 'Media armónica entre precisión y sensibilidad',
                    'auc': 'Área bajo la curva ROC',
                    'kappa': 'Medida de concordancia ajustada por azar'
                  }
                  return descriptions[metric] || ''
                }
                return ''
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'point'
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: 'rgba(255, 255, 255, 0.6)',
              font: {
                size: 11,
                family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
              },
              callback: function(value) {
                return value + '%'
              },
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              lineWidth: 1
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.15)',
              lineWidth: 1
            },
            pointLabels: {
              color: '#ffffff',
              font: {
                size: 13,
                family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                weight: '600'
              },
              padding: 10
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    })
  } else {
    console.log('No metrics available for radar chart')
  }
}

// Utilidades
const getStatusClass = (status) => {
  const classes = {
    'completed': 'status-completed',
    'ready': 'status-completed',
    'training': 'status-training',
    'pending': 'status-pending',
    'failed': 'status-failed',
    'error': 'status-failed'
  }
  return classes[status] || 'status-unknown'
}

const getStatusIcon = (status) => {
  const icons = {
    'completed': 'pi pi-check-circle',
    'ready': 'pi pi-check-circle',
    'training': 'pi pi-spin pi-spinner',
    'pending': 'pi pi-clock',
    'failed': 'pi pi-times-circle',
    'error': 'pi pi-times-circle'
  }
  return icons[status] || 'pi pi-question-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    'completed': 'Completado',
    'ready': 'Listo',
    'training': 'Entrenando',
    'pending': 'Pendiente',
    'failed': 'Fallido',
    'error': 'Error'
  }
  return labels[status] || 'Desconocido'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateToCreateModel = () => {
  router.push('/create-model')
}

// Lifecycle
onMounted(async () => {
  await loadModels()
})
</script>

<style scoped>
.compare-models-container {
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
  max-width: 1200px;
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

.selector-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.selector-card h3 {
  color: #4ecdc4;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(69, 183, 209, 0.1);
  border: 1px solid rgba(69, 183, 209, 0.3);
  border-radius: 10px;
  color: #45b7d1;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.info-banner i {
  font-size: 1.1rem;
}

.type-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.type-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4ecdc4;
  transform: translateY(-2px);
}

.type-option.active {
  background: rgba(78, 205, 196, 0.15);
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
}

.type-icon {
  font-size: 2rem;
  color: #4ecdc4;
  min-width: 60px;
  text-align: center;
}

.type-info h4 {
  color: white;
  margin-bottom: 0.5rem;
}

.type-info p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.model-count {
  color: #4ecdc4;
  font-weight: 600;
  font-size: 0.9rem;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.model-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.model-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4ecdc4;
  transform: translateY(-2px);
}

.model-card.selected {
  background: rgba(78, 205, 196, 0.15);
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
  transform: translateY(-2px);
}

.model-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.status-completed {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.status-training {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.status-pending {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
}

.status-failed {
  background: rgba(255, 0, 0, 0.2);
  color: #ff0000;
}

.model-info h4 {
  color: white;
  margin-bottom: 0.5rem;
}

.model-info p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.model-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.model-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.model-accuracy {
  color: #4ecdc4;
  font-weight: 600;
}

.comparison-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.selection-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-align: center;
}

.auto-compare-info {
  color: #4ecdc4;
  font-weight: 600;
}

.comparison-section {
  margin-top: 2rem;
}

.updating-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 10px;
  color: #4ecdc4;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.updating-indicator i {
  font-size: 1.2rem;
}

.metrics-overview {
  margin-bottom: 2rem;
}

.metrics-overview h3 {
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.metric-card h4 {
  color: #4ecdc4;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.metric-values {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  color: rgba(255, 255, 255, 0.8);
}

.metric-value {
  color: #4ecdc4;
  font-weight: 600;
}

.chart-section {
  margin-bottom: 2rem;
}

.chart-section h3 {
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  height: 400px;
  position: relative;
}

.chart-container canvas {
  max-width: 100%;
  height: 100% !important;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.5rem;
  color: #4ecdc4;
  font-size: 1rem;
}

.chart-loading i {
  font-size: 1.5rem;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.no-data-message i {
  font-size: 1.5rem;
  color: #ff6b6b;
}

.detailed-comparison {
  margin-top: 2rem;
}

.detailed-comparison h3 {
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.table-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comparison-table th {
  color: #4ecdc4;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
}

.comparison-table td {
  color: rgba(255, 255, 255, 0.9);
}

.model-name {
  color: white !important;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-completed {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.status-badge.status-training {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.status-badge.status-pending {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
}

.status-badge.status-failed {
  background: rgba(255, 0, 0, 0.2);
  color: #ff0000;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 4rem;
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: white;
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 2rem;
}

.primary-btn {
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  background: linear-gradient(45deg, #45b7d1, #4ecdc4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
    margin-bottom: 0.5rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .type-options {
    grid-template-columns: 1fr;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .comparison-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .comparison-table {
    min-width: 600px;
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

/* Generar más estrellas */
.star:nth-child(11) { top: 15%; left: 5%; animation-delay: 0.3s; }
.star:nth-child(12) { top: 25%; left: 95%; animation-delay: 0.8s; }
.star:nth-child(13) { top: 35%; left: 65%; animation-delay: 1.3s; }
.star:nth-child(14) { top: 45%; left: 25%; animation-delay: 1.8s; }
.star:nth-child(15) { top: 55%; left: 85%; animation-delay: 2.3s; }
.star:nth-child(16) { top: 65%; left: 45%; animation-delay: 2.8s; }
.star:nth-child(17) { top: 75%; left: 15%; animation-delay: 3.3s; }
.star:nth-child(18) { top: 85%; left: 75%; animation-delay: 3.8s; }
.star:nth-child(19) { top: 95%; left: 35%; animation-delay: 4.3s; }
.star:nth-child(20) { top: 3%; left: 55%; animation-delay: 4.8s; }

/* Continuar con más estrellas... */
.star:nth-child(n+21) {
  top: calc(var(--random-y, 50) * 1%);
  left: calc(var(--random-x, 50) * 1%);
}
</style>
