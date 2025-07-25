<template>
  <div class="create-model-view">
    <NavBar />
    
    <!-- Fondo galáctico -->
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
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="back-button">
            <button class="tech-button back-btn" @click="goBack">
              <i class="pi pi-arrow-left"></i>
              <span>Volver al Dashboard</span>
            </button>
          </div>
          
          <div class="page-title-section">
            <div class="title-container">
              <h1 class="title-glitch">
                <span class="title-text">CREAR NUEVO MODELO</span>
                <div class="title-underline"></div>
              </h1>
              <p class="subtitle-text">
                <span class="subtitle-prefix">>_</span> Sube tu dataset y configura tu modelo de IA personalizado<span class="cursor-blink">_</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="container">
      <div class="create-model-content">
        
        <!-- Formulario -->
        <div class="model-form-container">
          <form @submit.prevent="createModel" class="model-form">
            
            <!-- Sección 1: Información del Modelo -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">
                  <i class="pi pi-info-circle"></i>
                  Información del Modelo
                </h3>
                <p class="section-description">Detalles básicos de tu modelo</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="pi pi-tag"></i>
                    Nombre del Modelo
                  </label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    class="form-input"
                    placeholder="Ej: Predictor de ventas"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="pi pi-list"></i>
                    Tipo de Tarea
                  </label>
                  <div class="input-with-info">
                    <select v-model="form.task_type" class="form-select" required>
                      <option value="">Selecciona el tipo de tarea</option>
                      <option value="classification">Clasificación</option>
                      <option value="regression">Regresión</option>
                    </select>
                    <button 
                      type="button"
                      @click="suggestTaskType" 
                      class="suggest-button"
                      title="Sugerir tipo de tarea automáticamente"
                      :disabled="!selectedFile || !form.target_column || isSuggesting"
                    >
                      <i class="pi pi-spin pi-spinner" v-if="isSuggesting"></i>
                      <i class="pi pi-lightbulb" v-else></i>
                    </button>
                    <a 
                      href="#" 
                      @click.prevent="toggleTaskTypeInfo" 
                      class="info-link-side"
                      title="¿Cuándo usar cada tipo?"
                    >
                      <i class="pi pi-question-circle"></i>
                    </a>
                  </div>
                </div>
                
                <div class="form-group full-width">
                  <label class="form-label">
                    <i class="pi pi-file-edit"></i>
                    Descripción
                  </label>
                  <textarea 
                    v-model="form.description" 
                    class="form-textarea"
                    placeholder="Describe qué hace tu modelo y para qué lo usarás"
                    rows="3"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="pi pi-eye"></i>
                    Visibilidad
                  </label>
                  <div class="toggle-group">
                    <label class="toggle-option">
                      <input 
                        type="radio" 
                        v-model="form.is_public" 
                        :value="false"
                        name="visibility"
                      />
                      <span class="toggle-label">
                        <i class="pi pi-lock"></i>
                        Privado
                      </span>
                    </label>
                    <label class="toggle-option">
                      <input 
                        type="radio" 
                        v-model="form.is_public" 
                        :value="true"
                        name="visibility"
                      />
                      <span class="toggle-label">
                        <i class="pi pi-globe"></i>
                        Público
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección 2: Dataset -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">
                  <i class="pi pi-database"></i>
                  Dataset
                </h3>
                <p class="section-description">Sube tu archivo CSV con los datos</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">
                    <i class="pi pi-upload"></i>
                    Archivo CSV
                  </label>
                  <div class="file-upload-area" :class="{ 'drag-over': isDragOver }" 
                       @drop="handleFileDrop" 
                       @dragover.prevent="isDragOver = true" 
                       @dragleave="isDragOver = false"
                       @click="$refs.fileInput.click()">
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept=".csv"
                      @change="handleFileSelect"
                      style="display: none"
                    />
                    
                    <div v-if="!selectedFile" class="upload-placeholder">
                      <i class="pi pi-cloud-upload upload-icon"></i>
                      <p class="upload-text">
                        Arrastra tu archivo CSV aquí o haz clic para subir
                      </p>
                      <p class="upload-hint">Formatos soportados: CSV (máximo 100MB)</p>
                    </div>
                    
                    <div v-else class="file-selected">
                      <i class="pi pi-file file-icon"></i>
                      <div class="file-info">
                        <p class="file-name">{{ selectedFile.name }}</p>
                        <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                      </div>
                      <button type="button" class="remove-file" @click="removeFile">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección 3: Configuración de Columnas (se muestra solo si hay archivo) -->
            <div v-if="csvColumns.length > 0" class="form-section">
              <div class="section-header">
                <h3 class="section-title">
                  <i class="pi pi-sliders-h"></i>
                  Configuración de Columnas
                </h3>
                <p class="section-description">Selecciona las columnas objetivo e ignora las que no necesites</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="pi pi-bullseye"></i>
                    Columna Objetivo (Target)
                  </label>
                  <select v-model="form.target_column" class="form-select" required>
                    <option value="">Selecciona la columna objetivo</option>
                    <option v-for="column in csvColumns" :key="column" :value="column">
                      {{ column }}
                    </option>
                  </select>
                  <p class="field-hint">La variable que quieres predecir</p>
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="pi pi-eye-slash"></i>
                    Columnas a Ignorar
                  </label>
                  <div class="multiselect-container">
                    <div class="selected-items" v-if="form.ignored_columns.length > 0">
                      <div 
                        v-for="column in form.ignored_columns" 
                        :key="column" 
                        class="selected-item"
                      >
                        {{ column }}
                        <button type="button" @click="removeIgnoredColumn(column)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                    
                    <select 
                      v-model="tempIgnoredColumn" 
                      @change="addIgnoredColumn"
                      class="form-select"
                    >
                      <option value="">Selecciona columnas a ignorar</option>
                      <option 
                        v-for="column in availableColumns" 
                        :key="column" 
                        :value="column"
                      >
                        {{ column }}
                      </option>
                    </select>
                  </div>
                  <p class="field-hint">Columnas que no se usarán para entrenar el modelo</p>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button type="button" class="tech-button secondary" @click="goBack">
                <i class="pi pi-times"></i>
                Cancelar
              </button>
              
              <button type="submit" class="tech-button primary" :disabled="!canSubmit || isSubmitting">
                <i class="pi pi-spin pi-spinner" v-if="isSubmitting"></i>
                <i class="pi pi-check" v-else></i>
                {{ isSubmitting ? 'Creando...' : 'Crear Modelo' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Preview del dataset (si existe) -->
        <div v-if="csvPreview.length > 0" class="dataset-preview">
          <h3 class="preview-title">
            <i class="pi pi-table"></i>
            Vista Previa del Dataset
          </h3>
          
          <div class="preview-table-container">
            <table class="preview-table">
              <thead>
                <tr>
                  <th v-for="column in csvColumns" :key="column" class="preview-header">
                    {{ column }}
                    <span v-if="column === form.target_column" class="target-badge">Target</span>
                    <span v-if="form.ignored_columns.includes(column)" class="ignored-badge">Ignorado</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in csvPreview.slice(0, 5)" :key="index" class="preview-row">
                  <td v-for="column in csvColumns" :key="column" class="preview-cell">
                    {{ row[column] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p class="preview-info">
            Mostrando las primeras 5 filas de {{ csvPreview.length }} registros totales
          </p>
        </div>
      </div>
    </div>
    
    <!-- Modal informativo para tipos de tarea -->
    <div v-if="showTaskTypeInfo" class="modal-overlay" @click="toggleTaskTypeInfo">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="pi pi-info-circle"></i>
            Tipos de Tareas de Machine Learning
          </h3>
          <button 
            type="button" 
            @click="toggleTaskTypeInfo" 
            class="modal-close-btn"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="task-cards">
            <div class="task-card classification-card">
              <div class="card-header">
                <div class="card-icon">
                  <i class="pi pi-tags"></i>
                </div>
                <h4 class="card-title">Clasificación</h4>
              </div>
              
              <div class="card-content">
                <p class="card-description">
                  Úsala cuando quieras <strong>predecir categorías o etiquetas</strong>.
                </p>
                
                <div class="card-examples">
                  <h5 class="examples-title">Ejemplos prácticos:</h5>
                  <ul class="examples-list">
                    <li><span class="example-icon">📧</span> ¿Es spam o no spam?</li>
                    <li><span class="example-icon">🛍️</span> ¿Qué tipo de producto es?</li>
                    <li><span class="example-icon">💰</span> ¿El cliente comprará o no?</li>
                    <li><span class="example-icon">🏥</span> Resultados positivos o negativos</li>
                  </ul>
                </div>
                
                <div class="card-use-case">
                  <strong>Resultado:</strong> Categorías discretas (Sí/No, A/B/C)
                </div>
              </div>
            </div>
            
            <div class="task-card regression-card">
              <div class="card-header">
                <div class="card-icon">
                  <i class="pi pi-chart-line"></i>
                </div>
                <h4 class="card-title">Regresión</h4>
              </div>
              
              <div class="card-content">
                <p class="card-description">
                  Úsala cuando quieras <strong>predecir valores numéricos continuos</strong>.
                </p>
                
                <div class="card-examples">
                  <h5 class="examples-title">Ejemplos prácticos:</h5>
                  <ul class="examples-list">
                    <li><span class="example-icon">🏠</span> ¿Cuál será el precio de una casa?</li>
                    <li><span class="example-icon">📈</span> ¿Cuántas ventas tendremos?</li>
                    <li><span class="example-icon">🌡️</span> ¿Qué temperatura habrá?</li>
                    <li><span class="example-icon">⏱️</span> ¿Cuánto tiempo tardará?</li>
                  </ul>
                </div>
                
                <div class="card-use-case">
                  <strong>Resultado:</strong> Números continuos ($1,250, 45.7°C)
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="help-tip">
              <i class="pi pi-lightbulb"></i>
              <span>¿Aún tienes dudas? Piensa en qué tipo de respuesta esperas: ¿una categoría o un número?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotifications } from '@/composables/useNotifications'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showSuccess, showError, showWarning, showInfo } = useNotifications()

// Estado del formulario
const form = ref({
  name: '',
  task_type: '',
  target_column: '',
  is_public: false,
  ignored_columns: [],
  description: ''
})

// Estado del archivo
const selectedFile = ref(null)
const csvColumns = ref([])
const csvPreview = ref([])
const isDragOver = ref(false)
const tempIgnoredColumn = ref('')

// Estado de la UI
const isSubmitting = ref(false)
const showTaskTypeInfo = ref(false)
const isSuggesting = ref(false)

// Computed
const canSubmit = computed(() => {
  return form.value.name && 
         form.value.task_type && 
         form.value.target_column && 
         selectedFile.value
})

const availableColumns = computed(() => {
  return csvColumns.value.filter(column => 
    column !== form.value.target_column && 
    !form.value.ignored_columns.includes(column)
  )
})

// Métodos para manejo de archivos
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    parseCSV(file)
    showSuccess(`Archivo "${file.name}" cargado correctamente`, {
      title: 'Archivo CSV cargado',
      duration: 3000
    })
  }
}

const handleFileDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      selectedFile.value = file
      parseCSV(file)
      showSuccess(`Archivo "${file.name}" cargado correctamente`, {
        title: 'Archivo CSV cargado',
        duration: 3000
      })
    } else {
      showError('Por favor, selecciona un archivo CSV válido', {
        title: 'Formato de archivo incorrecto',
        autoClose: true,
        duration: 4000
      })
    }
  }
}

const removeFile = () => {
  const fileName = selectedFile.value?.name
  selectedFile.value = null
  csvColumns.value = []
  csvPreview.value = []
  form.value.target_column = ''
  form.value.ignored_columns = []
  
  if (fileName) {
    showInfo(`Archivo "${fileName}" eliminado`, {
      title: 'Archivo removido',
      duration: 2000
    })
  }
}

const parseCSV = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length > 0) {
      // Obtener columnas del header
      const headers = lines[0].split(',').map(col => col.trim().replace(/"/g, ''))
      csvColumns.value = headers
      
      // Crear preview con las primeras filas
      const previewData = []
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map(val => val.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        previewData.push(row)
      }
      csvPreview.value = previewData
    }
  }
  reader.readAsText(file)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Métodos para columnas ignoradas
const addIgnoredColumn = () => {
  if (tempIgnoredColumn.value && !form.value.ignored_columns.includes(tempIgnoredColumn.value)) {
    form.value.ignored_columns.push(tempIgnoredColumn.value)
    tempIgnoredColumn.value = ''
  }
}

const removeIgnoredColumn = (column) => {
  const index = form.value.ignored_columns.indexOf(column)
  if (index > -1) {
    form.value.ignored_columns.splice(index, 1)
  }
}

// Navegación
const goBack = () => {
  router.push('/dashboard')
}

// Control del panel informativo
const toggleTaskTypeInfo = () => {
  showTaskTypeInfo.value = !showTaskTypeInfo.value
}

// Sugerencia de tipo de tarea
const suggestTaskType = async () => {
  if (!selectedFile.value || !form.value.target_column) {
    showWarning('Primero debes cargar un archivo CSV y seleccionar la columna objetivo', {
      title: 'Información faltante',
      duration: 4000
    })
    return
  }
  
  isSuggesting.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('target_column', form.value.target_column)
    
    const token = authStore.getToken?.() || localStorage.getItem('access_token')
    
    const response = await fetch('http://localhost:8000/api/models/suggest-task-type/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (response.ok) {
      const result = await response.json()
      
      // Aplicar la sugerencia
      form.value.task_type = result.suggested_task_type
      
      // Mostrar información detallada
      const confidenceText = result.confidence === 'alta' ? '🎯 Alta' : 
                            result.confidence === 'media' ? '⚡ Media' : '❓ Baja'
      
      showSuccess(
        `Sugerencia aplicada: ${result.suggested_task_type === 'classification' ? 'Clasificación' : 'Regresión'}\n\n` +
        `Confianza: ${confidenceText}\n\n` +
        `Razón: ${result.reasoning}`,
        {
          title: '🤖 Sugerencia de IA',
          duration: 8000
        }
      )
      
    } else {
      const error = await response.json()
      showError(error.error || 'Error al obtener sugerencia', {
        title: 'Error en la sugerencia',
        duration: 5000
      })
    }
    
  } catch (error) {
    console.error('Error suggesting task type:', error)
    showError('Error de conexión al obtener la sugerencia', {
      title: 'Error de conexión',
      duration: 5000
    })
  } finally {
    isSuggesting.value = false
  }
}

// Envío del formulario
const createModel = async () => {
  if (!canSubmit.value) return
  
  isSubmitting.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('name', form.value.name)
    formData.append('task_type', form.value.task_type)
    formData.append('target_column', form.value.target_column)
    // Convertir booleano correctamente para Django
    formData.append('is_public', form.value.is_public ? '1' : '0')
    formData.append('ignored_columns', JSON.stringify(form.value.ignored_columns))
    formData.append('description', form.value.description)
    
    const token = authStore.getToken?.() || localStorage.getItem('access_token')
    
    const response = await fetch('http://localhost:8000/api/models/create/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (response.ok) {
        const result = await response.json()
        showSuccess(`El modelo "${form.value.name}" está siendo entrenado correctamente.`, {
          title: 'Modelo creado exitosamente',
          duration: 6000
        })
        router.push(`/models/${result.id}`)
    } else {
      const error = await response.json()
      console.error('Error creating model:', error)
      
      // Manejar errores por código de estado HTTP primero
      if (response.status === 429) {
        showError(error.error || error.detail || 'Has alcanzado el límite máximo de 3 modelos en entrenamiento simultáneo. Espera a que termine alguno antes de crear uno nuevo.', {
          title: 'Límite de modelos alcanzado',
          autoClose: false
        })
        return
      } else if (response.status === 503) {
        showError(error.error || error.detail || 'El sistema está sobrecargado. Por favor, intenta nuevamente en unos minutos.', {
          title: 'Sistema sobrecargado',
          autoClose: false
        })
        return
      }
      
      // Manejar diferentes tipos de errores por error_code
      let errorMessage = 'Error desconocido'
      
      if (error.error_code === 'DUPLICATE_PUBLIC_MODEL_NAME') {
          showError(error.error || error.detail, {
            title: 'Nombre de modelo duplicado',
            autoClose: false
          })
        } else if (error.error_code === 'DUPLICATE_PRIVATE_MODEL_NAME') {
          showError(error.error || error.detail, {
            title: 'Nombre de modelo duplicado',
            autoClose: false
          })
        } else if (error.error_code === 'MISSING_MODEL_NAME') {
          showError(error.error || error.detail, {
            title: 'Información requerida',
            autoClose: false
          })
        } else if (error.error_code === 'MISSING_CSV_FILE') {
          showError(error.error || error.detail, {
            title: 'Archivo requerido',
            autoClose: false
          })
        } else if (error.error_code === 'MISSING_TARGET_COLUMN') {
          showError(error.error || error.detail, {
            title: 'Configuración incompleta',
            autoClose: false
          })
        } else if (error.error_code === 'TARGET_COLUMN_NOT_FOUND') {
          showError(error.error || error.detail, {
            title: 'Columna no encontrada',
            autoClose: false
          })
        } else if (error.error_code === 'INVALID_IGNORED_COLUMNS') {
          showError(error.error || error.detail, {
            title: 'Columnas inválidas',
            autoClose: false
          })
        } else if (error.error_code === 'MAX_MODELS_LIMIT') {
          showError(error.error || error.detail, {
            title: 'Límite de modelos alcanzado',
            autoClose: false
          })
        } else if (error.error_code === 'WORKER_OVERLOADED') {
          showError(error.error || error.detail, {
            title: 'Sistema sobrecargado',
            autoClose: false
          })
        } else {
          const message = error.error || error.detail || (typeof error === 'string' ? error : 'Error desconocido')
          showError(message, {
            title: 'Error al crear el modelo',
            autoClose: false
          })
        }
    }
  } catch (error) {
    console.error('Error:', error)
    showError('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
  }
})
</script>

<style scoped>
.create-model-view {
  min-height: 100vh;
  background: 
    linear-gradient(135deg, #000000 0%, #0a0a0f 15%, #1a0a1a 30%, #0f0f1a 45%, #1a1a2e 60%, #2a1a3a 75%, #1a2a4a 90%, #0f1a2a 100%),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(25, 25, 112, 0.35) 0%, transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(138, 43, 226, 0.3) 0%, transparent 50%);
  position: relative;
  overflow: hidden;
  color: white;
}

/* Fondo galáctico (similar al dashboard) */
.galactic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.cosmic-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(138, 43, 226, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 43, 226, 0.08) 1px, transparent 1px);
  background-size: 80px 80px;
  animation: cosmicGridMove 40s linear infinite;
}

@keyframes cosmicGridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(80px, 80px); }
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
  border-radius: 50%;
  filter: blur(40px);
  animation: nebulaDrift 20s ease-in-out infinite;
}

.nebula-layer:nth-child(1) {
  top: 10%;
  left: 15%;
  width: 300px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(75, 0, 130, 0.3) 0%, transparent 70%);
  animation-delay: 0s;
}

.nebula-layer:nth-child(2) {
  top: 60%;
  right: 20%;
  width: 250px;
  height: 180px;
  background: radial-gradient(ellipse, rgba(25, 25, 112, 0.25) 0%, transparent 70%);
  animation-delay: -5s;
}

.nebula-layer:nth-child(3) {
  bottom: 20%;
  left: 25%;
  width: 200px;
  height: 150px;
  background: radial-gradient(ellipse, rgba(138, 43, 226, 0.2) 0%, transparent 70%);
  animation-delay: -10s;
}

.nebula-layer:nth-child(4) {
  top: 30%;
  right: 10%;
  width: 180px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(72, 61, 139, 0.15) 0%, transparent 70%);
  animation-delay: -15s;
}

.nebula-layer:nth-child(5) {
  bottom: 40%;
  left: 60%;
  width: 220px;
  height: 160px;
  background: radial-gradient(ellipse, rgba(106, 90, 205, 0.18) 0%, transparent 70%);
  animation-delay: -7s;
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -15px) scale(1.1); }
  50% { transform: translate(-10px, 10px) scale(0.9); }
  75% { transform: translate(15px, -5px) scale(1.05); }
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
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: starTwinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
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
  width: 3px;
  height: 3px;
  background: rgba(138, 43, 226, 0.8);
  border-radius: 50%;
  animation: particleFloat 20s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.6);
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0px) translateX(0px);
    opacity: 0.3;
  }
  25% { 
    transform: translateY(-20px) translateX(10px);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-10px) translateX(-15px);
    opacity: 1;
  }
  75% { 
    transform: translateY(15px) translateX(5px);
    opacity: 0.6;
  }
}

/* Header de la página */
.page-header {
  padding: 8rem 0 3rem;
  position: relative;
  z-index: 2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

.header-content {
  position: relative;
  z-index: 3;
}

.back-button {
  margin-bottom: 2rem;
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
  text-decoration: none;
}

.tech-button:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
}

.tech-button.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tech-button.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.tech-button.primary {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2));
  border-color: rgba(138, 43, 226, 0.4);
  color: #ffffff;
}

.tech-button.primary:hover {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3));
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

.tech-button.secondary {
  background: rgba(100, 100, 120, 0.1);
  border-color: rgba(100, 100, 120, 0.3);
  color: #9ca3af;
}

.tech-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #8B5CF6, #EC4899, #00D4FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.2rem;
  color: #b1b8d4;
}

/* Contenido del formulario */
.create-model-content {
  position: relative;
  z-index: 2;
  padding-bottom: 4rem;
}

.model-form-container {
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
}

/* Secciones del formulario */
.form-section {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #8B5CF6;
}

.section-description {
  color: #b1b8d4;
  font-size: 0.9rem;
}

/* Grid del formulario */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: #8B5CF6;
  width: 16px;
}

.form-input,
.form-select,
.form-textarea {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B5CF6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.form-select option {
  background: rgba(20, 20, 40, 0.95);
  color: #fff;
  padding: 0.5rem;
  border: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), 0 0 20px rgba(139, 92, 246, 0.2);
  background: rgba(0, 0, 0, 0.5);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Toggle group para visibilidad */
.toggle-group {
  display: flex;
  gap: 1rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-option input[type="radio"] {
  display: none;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
}

.toggle-option input[type="radio"]:checked + .toggle-label {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

/* Área de subida de archivos */
.file-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.file-upload-area:hover,
.file-upload-area.drag-over {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  color: #8B5CF6;
}

.upload-text {
  color: #e2e8f0;
  font-size: 1.1rem;
}

.upload-hint {
  color: #94a3b8;
  font-size: 0.9rem;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.file-icon {
  font-size: 2rem;
  color: #22c55e;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.file-size {
  color: #94a3b8;
  font-size: 0.8rem;
}

.remove-file {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-file:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Multiselect para columnas ignoradas */
.multiselect-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.selected-item {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #A855F7;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.selected-item:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(168, 85, 247, 0.3));
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.selected-item button {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #A855F7;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 0.7rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 20px;
  height: 20px;
}

.selected-item button:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  color: #EF4444;
}

/* Acciones del formulario */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Preview del dataset */
.dataset-preview {
  background: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(120, 119, 198, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-title i {
  color: #8B5CF6;
}

.preview-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.3);
}

.preview-header {
  background: rgba(139, 92, 246, 0.1);
  color: #e2e8f0;
  padding: 0.75rem;
  text-align: left;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.preview-cell {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #b1b8d4;
  font-size: 0.8rem;
}

.target-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.ignored-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.preview-info {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 1rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .toggle-group {
    flex-direction: column;
  }
  
  .preview-table-container {
    font-size: 0.7rem;
  }
}

/* Posicionamiento de estrellas */
.star:nth-child(1) { top: 5%; left: 10%; animation-delay: 0s; }
.star:nth-child(2) { top: 15%; left: 85%; animation-delay: -0.3s; }
.star:nth-child(3) { top: 25%; left: 45%; animation-delay: -0.6s; }
.star:nth-child(4) { top: 35%; left: 20%; animation-delay: -0.9s; }
.star:nth-child(5) { top: 45%; left: 70%; animation-delay: -1.2s; }
.star:nth-child(6) { top: 55%; left: 35%; animation-delay: -1.5s; }
.star:nth-child(7) { top: 65%; left: 80%; animation-delay: -1.8s; }
.star:nth-child(8) { top: 75%; left: 15%; animation-delay: -2.1s; }
.star:nth-child(9) { top: 85%; left: 60%; animation-delay: -2.4s; }
.star:nth-child(10) { top: 95%; left: 40%; animation-delay: -2.7s; }

/* Posicionamiento de partículas */
.particle:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { top: 20%; left: 80%; animation-delay: 2s; }
.particle:nth-child(3) { top: 60%; left: 20%; animation-delay: 4s; }
.particle:nth-child(4) { top: 40%; left: 90%; animation-delay: 6s; }
.particle:nth-child(5) { top: 80%; left: 70%; animation-delay: 8s; }
.particle:nth-child(6) { top: 30%; left: 50%; animation-delay: 10s; }
.particle:nth-child(7) { top: 70%; left: 30%; animation-delay: 12s; }
.particle:nth-child(8) { top: 50%; left: 85%; animation-delay: 14s; }

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

/* Estilos para el enlace informativo y panel */
.info-link {
  color: #8B5CF6;
  text-decoration: none;
  margin-left: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  opacity: 0.9;
  background: rgba(139, 92, 246, 0.1);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.info-link:hover {
  color: #ffffff;
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.info-link i {
  font-size: 1rem;
}

/* Contenedor para input con botón de información al lado */
.input-with-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.input-with-info .form-select {
  flex: 1;
}

/* Botón de información al lado del input */
.info-link-side {
  color: #8B5CF6;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  background: rgba(139, 92, 246, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  min-width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.info-link-side:hover {
  color: #ffffff;
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.info-link-side i {
  font-size: 1rem;
}

/* Botón de sugerencia de tipo de tarea */
.suggest-button {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  flex-shrink: 0;
  font-size: 1rem;
}

.suggest-button:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.suggest-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.suggest-button i {
  font-size: 1rem;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  padding: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal Container */
.modal-container {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.98) 0%, 
    rgba(51, 65, 85, 0.95) 50%, 
    rgba(30, 41, 59, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  max-width: 750px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: slideUp 0.4s ease-out;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;
}

.modal-title i {
  color: #8B5CF6;
  font-size: 1.1rem;
  background: rgba(139, 92, 246, 0.2);
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.modal-close-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

/* Modal Content */
.modal-content {
  padding: 0.75rem 1.5rem 0.75rem 1.5rem;
}

/* Task Cards */
.task-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.task-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  overflow: hidden;
  position: relative;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
}

.classification-card:hover {
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.25);
}

.regression-card:hover {
  box-shadow: 0 15px 35px rgba(34, 197, 94, 0.25);
}

/* Card Header */
.card-header {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.2) 0%, 
    rgba(168, 85, 247, 0.1) 100%);
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.regression-card .card-header {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.2) 0%, 
    rgba(16, 185, 129, 0.1) 100%);
}

.card-icon {
  background: rgba(139, 92, 246, 0.3);
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.regression-card .card-icon {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.4);
}

.card-icon i {
  color: #ffffff;
  font-size: 1.1rem;
}

.card-title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;
}

/* Card Content */
.card-content {
  padding: 0.75rem;
}

.card-description {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.card-description strong {
  color: #A855F7;
  font-weight: 700;
}

.regression-card .card-description strong {
  color: #22c55e;
}

/* Examples */
.card-examples {
  margin-bottom: 0.75rem;
}

.examples-title {
  color: #8B5CF6;
  font-weight: 700;
  font-size: 0.8rem;
  margin: 0 0 0.4rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.regression-card .examples-title {
  color: #22c55e;
}

.examples-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.examples-list li {
  color: #cbd5e1;
  font-size: 0.8rem;
  padding: 0.4rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
  font-weight: 400;
  line-height: 1.4;
}

.examples-list li:hover {
  color: #e2e8f0;
}

.example-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

/* Use Case */
.card-use-case {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.regression-card .card-use-case {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.card-use-case strong {
  color: #8B5CF6;
  font-size: 0.75rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
}

.regression-card .card-use-case strong {
  color: #22c55e;
}

.card-use-case span {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.75rem;
  line-height: 1.3;
  font-weight: 400;
}

/* Modal Footer */
.modal-footer {
  padding: 0.75rem 1.5rem 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.help-tip {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.help-tip i {
  color: #3B82F6;
  font-size: 1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}



/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.75rem;
    max-height: 90vh;
    max-width: 95%;
  }
  
  .modal-header {
    padding: 1rem 1.25rem 0.75rem 1.25rem;
  }
  
  .modal-title {
    font-size: 1.1rem;
  }
  
  .modal-content {
    padding: 0.75rem 1.25rem 1rem 1.25rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1.25rem 1rem 1.25rem;
  }
  
  .task-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .card-header {
    padding: 0.875rem;
  }
  
  .card-content {
    padding: 0.875rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: 0.8rem;
  }
  
  .examples-list li {
    font-size: 0.75rem;
  }
  
  .help-tip {
    font-size: 0.75rem;
  }
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
