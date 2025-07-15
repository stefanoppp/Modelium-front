<template>
  <div class="page-wrapper">
    <NavBar />
    
    <!-- Background galáctico -->
    <div class="galaxy-background">
      <div class="stars-container">
        <div class="star" v-for="i in 150" :key="'star-' + i"></div>
      </div>
      <div class="floating-elements">
        <div class="floating-element" v-for="n in 12" :key="n"></div>
      </div>
      <div class="grid-pattern"></div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <div class="card-header">
          <div class="verification-icon">
            <i class="pi pi-shield"></i>
          </div>
          <h2 class="auth-title">Verificar tu Cuenta</h2>
          <p class="auth-subtitle">Ingresa el código de verificación enviado a tu correo</p>
          
          <div class="username-display">
            <i class="pi pi-user"></i>
            <span>{{ username }}</span>
          </div>
        </div>
        
        <form @submit.prevent="handleVerify" class="auth-form">
          <div class="form-group">
            <label for="token" class="form-label">Código de Verificación</label>
            <input
              id="token"
              v-model="form.token"
              type="text"
              class="form-input verification-input"
              placeholder="000000"
              maxlength="6"
              required
              @input="formatToken"
            />
          </div>

          <div v-if="authError" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <div class="error-content">
              <div>{{ authError }}</div>
              <div v-if="attemptsLeft !== null" class="attempts-left">
                Intentos restantes: {{ attemptsLeft }}
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="success-message">
            <i class="pi pi-check-circle"></i>
            <span>{{ successMessage }}</span>
          </div>

          <button type="submit" class="auth-button" :disabled="isLoading">
            {{ isLoading ? 'Verificando...' : 'Verificar Cuenta' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  token: '',
})

const errors = ref({})
const authError = ref('')
const successMessage = ref('')
const attemptsLeft = ref(null)
const isLoading = ref(false)
const username = ref('')
const resendCooldown = ref(0)
let cooldownInterval = null

onMounted(() => {
  username.value = route.query.username || ''
  if (!username.value) {
    router.push('/auth/login')
  }
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})

const formatToken = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 6) {
    value = value.substring(0, 6)
  }
  form.token = value
}

const handleVerify = async () => {
  console.log('🔍 Iniciando verificación de token...')
  console.log('Username:', username.value)
  console.log('Token:', form.token)
  
  authError.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const result = await authStore.verifyToken(username.value, form.token)
    console.log('📊 Resultado de verificación:', result)

    if (result.success) {
      successMessage.value = 'Cuenta verificada exitosamente. Redirigiendo...'
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      authError.value = result.error || 'Error al verificar el código'
      attemptsLeft.value = result.attemptsLeft || null
      console.log('❌ Error en verificación:', result.error)
      console.log('🔢 Intentos restantes:', result.attemptsLeft)
      
      if (result.attemptsLeft === 0) {
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }
  } catch (error) {
    console.log('💥 Error capturado:', error)
    authError.value = error.message || 'Error al verificar el código'
    attemptsLeft.value = error.attemptsLeft || null
    
    if (error.attemptsLeft === 0) {
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    }
  } finally {
    isLoading.value = false
    console.log('✅ Verificación completada')
  }
}

const resendCode = async () => {
  try {
    await authStore.resendVerificationCode(username.value)
    successMessage.value = 'Código reenviado exitosamente'
    
    // Iniciar cooldown de 60 segundos
    resendCooldown.value = 60
    cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownInterval)
      }
    }, 1000)
  } catch (error) {
    authError.value = error.message || 'Error al reenviar el código'
  }
}

// Generar posiciones aleatorias para las estrellas
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const stars = document.querySelectorAll('.star')
    stars.forEach(star => {
      star.style.left = Math.random() * 100 + '%'
      star.style.top = Math.random() * 100 + '%'
      star.style.animationDelay = Math.random() * 3 + 's'
    })

    const floatingElements = document.querySelectorAll('.floating-element')
    floatingElements.forEach(element => {
      element.style.left = Math.random() * 100 + '%'
      element.style.top = Math.random() * 100 + '%'
      element.style.animationDelay = Math.random() * 15 + 's'
    })
  }, 100)
}
</script>

<style scoped>
/* Page wrapper - contenedor principal sin scroll interno */
.page-wrapper {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background: 
    linear-gradient(135deg, #000000 0%, #0a0a0f 20%, #0f0f1a 40%, #1a1a2e 60%, #16213e 80%, #0e1a2e 100%),
    radial-gradient(circle at 15% 25%, rgba(75, 0, 130, 0.2) 0%, transparent 60%),
    radial-gradient(circle at 85% 75%, rgba(25, 25, 112, 0.18) 0%, transparent 55%),
    radial-gradient(circle at 50% 50%, rgba(0, 100, 200, 0.12) 0%, transparent 70%),
    radial-gradient(circle at 30% 80%, rgba(138, 43, 226, 0.15) 0%, transparent 65%),
    radial-gradient(circle at 70% 20%, rgba(72, 61, 139, 0.1) 0%, transparent 50%);
  color: white;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Auth container */
.auth-container {
  padding: 6rem 1rem 4rem 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

@media (min-height: 900px) {
  .auth-container {
    padding: 10rem 1rem 6rem 1rem;
  }
}

/* Galaxy background */
.galaxy-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.galaxy-background::before {
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
}

@keyframes galaxyBreath {
  0%, 100% { opacity: 0.4; }
  33% { opacity: 0.8; }
  66% { opacity: 0.6; }
}

/* Stars */
.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(138, 43, 226, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(138, 43, 226, 0.5);
  animation: starTwinkle 3s ease-in-out infinite;
}

.star:nth-child(even) {
  background: rgba(147, 112, 219, 0.7);
  animation-delay: -1.5s;
}

.star:nth-child(3n) {
  background: rgba(123, 104, 238, 0.6);
  animation-delay: -0.7s;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Floating elements */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, rgba(138, 43, 226, 0.3), rgba(147, 112, 219, 0.2));
  border-radius: 50%;
  animation: float 15s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  33% { transform: translateY(-20px) rotate(120deg); opacity: 0.8; }
  66% { transform: translateY(10px) rotate(240deg); opacity: 0.5; }
}

/* Grid pattern */
.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(138, 43, 226, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 43, 226, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridPulse 8s ease-in-out infinite;
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

/* Auth card */
.auth-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  border: 1px solid rgba(138, 43, 226, 0.2);
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(138, 43, 226, 0.05) 0%, 
    rgba(147, 112, 219, 0.03) 50%, 
    rgba(123, 104, 238, 0.05) 100%);
  border-radius: 24px;
  z-index: -1;
}

/* Card header */
.card-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.verification-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #8a2be2, #9370db);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
}

.verification-icon i {
  font-size: 2rem;
  color: white;
}

.auth-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 25%, #9400D3 50%, #8B5CF6 75%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.auth-subtitle {
  color: rgba(220, 220, 235, 0.9);
  font-size: 1.1rem;
  font-weight: 300;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.username-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(15, 15, 25, 0.9);
  border: 1px solid rgba(138, 43, 226, 0.5);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin: 1.5rem auto 0 auto;
  max-width: 300px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 4px 20px rgba(138, 43, 226, 0.1),
    inset 0 1px 0 rgba(138, 43, 226, 0.1);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
  outline: none;
}

.username-display i {
  color: #a855f7;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.username-display span {
  color: rgba(240, 240, 250, 0.95);
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

/* Eliminar cualquier efecto de selección o focus en el username */
.username-display,
.username-display *,
.username-display:hover,
.username-display:focus,
.username-display:active {
  outline: none !important;
  border-color: rgba(138, 43, 226, 0.5) !important;
  box-shadow: 0 4px 20px rgba(138, 43, 226, 0.1) !important;
  inset: 0 1px 0 rgba(138, 43, 226, 0.1) !important;
}

/* Form styles */
.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: rgba(220, 220, 235, 0.95);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  user-select: none;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(15, 15, 25, 0.9);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  color: rgba(240, 240, 250, 0.95);
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.form-input::placeholder {
  color: rgba(200, 200, 220, 0.5);
}

.form-input:focus {
  outline: none;
  border-color: #8a2be2;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
  background: rgba(20, 20, 30, 0.95);
  color: rgba(250, 250, 255, 0.98);
}

.verification-input {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5rem;
  font-family: 'Courier New', monospace;
}

/* Buttons */
.auth-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8a2be2, #9370db);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
  position: relative;
  overflow: hidden;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(138, 43, 226, 0.4);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.resend-button {
  background: rgba(15, 15, 25, 0.8);
  border: 1px solid rgba(138, 43, 226, 0.6);
  color: rgba(220, 220, 235, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  user-select: none;
}

.resend-button:hover:not(:disabled) {
  background: rgba(138, 43, 226, 0.15);
  border-color: #8a2be2;
  color: rgba(240, 240, 250, 0.95);
  transform: translateY(-1px);
}

.resend-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: rgba(180, 180, 200, 0.6);
}

/* Messages */
.error-message {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.error-message i {
  color: #dc3545;
  font-size: 1.1rem;
  margin-top: 0.1rem;
}

.error-content {
  color: rgba(240, 240, 250, 0.95);
  font-size: 0.9rem;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.attempts-left {
  color: rgba(255, 200, 100, 0.9);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.success-message {
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-message i {
  color: #28a745;
  font-size: 1.1rem;
}

.success-message span {
  color: rgba(240, 240, 250, 0.95);
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Footer */
.auth-footer {
  text-align: center;
  padding-top: 1.5rem;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.3), transparent);
  margin-bottom: 1.5rem;
}

.footer-content {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-text {
  color: rgba(200, 200, 220, 0.8);
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  user-select: none;
}

.footer-brand {
  text-align: center;
}

.brand-link {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 25%, #9400D3 50%, #8B5CF6 75%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
  display: inline-block;
  letter-spacing: 0.5px;
}

.brand-link:hover {
  transform: translateY(-1px);
  text-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
}

.brand-tagline {
  display: block;
  color: rgba(200, 200, 220, 0.7);
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    padding: 2rem 1rem;
  }
  
  .auth-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .auth-title {
    font-size: 2rem;
  }
  
  .verification-icon {
    width: 60px;
    height: 60px;
  }
  
  .verification-icon i {
    font-size: 1.5rem;
  }
}

@media (max-height: 700px) {
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
  
  .verification-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }
  
  .card-header {
    margin-bottom: 1.5rem;
  }
}
</style>
