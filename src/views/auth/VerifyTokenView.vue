<template>
  <div class="auth-container">
    <!-- Fondo tecnológico animado -->
    <div class="auth-background">
      <div class="grid-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element" v-for="i in 6" :key="i"></div>
      </div>
      <div class="verification-waves">
        <div class="wave" v-for="i in 3" :key="`wave-${i}`"></div>
      </div>
    </div>

    <!-- Logo/Brand -->
    <div class="brand-header">
      <router-link to="/" class="brand-link">
        <div class="brand-logo">
          <span class="brand-text">Modelium</span>
          <span class="brand-subtitle">AI Platform</span>
        </div>
      </router-link>
    </div>

    <!-- Contenedor principal del formulario -->
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="verification-icon">
            <i class="pi pi-shield"></i>
          </div>
          <h1 class="auth-title">
            <span class="title-main">Verificar</span>
            <span class="title-accent">tu Cuenta</span>
          </h1>
          <p class="auth-subtitle">Ingresa el código de verificación enviado a tu correo</p>
          <div class="username-display">
            <i class="pi pi-user"></i>
            <span>{{ username }}</span>
          </div>
        </div>

        <form @submit.prevent="handleVerify" class="auth-form">
          <div class="form-group">
            <label for="token" class="form-label">
              <i class="pi pi-key"></i>
              Código de Verificación
            </label>
            <div class="input-wrapper">
              <InputText
                id="token"
                v-model="form.token"
                :invalid="!!errors.token"
                placeholder="000000"
                maxlength="6"
                class="auth-input token-input"
                @input="formatToken"
              />
            </div>
            <small v-if="errors.token" class="error-text">
              <i class="pi pi-exclamation-circle"></i>
              {{ errors.token }}
            </small>
          </div>

          <div v-if="authError" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <div class="error-content">
              <div>{{ authError }}</div>
              <div v-if="attemptsLeft !== null" class="attempts-left">
                <i class="pi pi-clock"></i>
                Intentos restantes: {{ attemptsLeft }}
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="success-message">
            <i class="pi pi-check-circle"></i>
            <span>{{ successMessage }}</span>
          </div>

          <TechButton
            type="submit"
            label="Verificar Cuenta"
            icon="pi pi-verified"
            :loading="isLoading"
            class="auth-button"
            size="large"
          />

          <div class="resend-section">
            <p class="resend-text">¿No recibiste el código?</p>
            <TechButton
              type="button"
              :label="resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar Código'"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :disabled="resendCooldown > 0"
              @click="resendCode"
              size="small"
            />
          </div>
        </form>

        <div class="auth-footer">
          <div class="footer-content">
            <p class="footer-text">¿Correo incorrecto?</p>
            <router-link to="/auth/register" class="auth-link">
              <TechButton
                label="Regístrate de nuevo"
                icon="pi pi-user-plus"
                severity="secondary"
                outlined
                size="small"
              />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import InputText from 'primevue/inputtext'
import TechButton from '@/components/ui/TechButton.vue'

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
  // Solo permitir números
  const value = event.target.value.replace(/\D/g, '')
  form.token = value
}

const validateForm = () => {
  errors.value = {}

  if (!form.token) {
    errors.value.token = 'El código de verificación es obligatorio'
  } else if (form.token.length !== 6) {
    errors.value.token = 'El código de verificación debe tener 6 dígitos'
  }

  return Object.keys(errors.value).length === 0
}

const handleVerify = async () => {
  if (!validateForm()) return

  isLoading.value = true
  authError.value = ''
  successMessage.value = ''
  attemptsLeft.value = null

  const result = await authStore.verifyToken(username.value, form.token)

  if (result.success) {
    successMessage.value = '¡Cuenta verificada exitosamente! Iniciando sesión...'

    // Auto-login después de verificación exitosa
    setTimeout(async () => {
      const password = sessionStorage.getItem('temp_password')
      if (password) {
        const loginResult = await authStore.login({
          username: username.value,
          password: password,
        })

        sessionStorage.removeItem('temp_password')

        if (loginResult.success) {
          router.push({ path: '/dashboard', query: { welcome: 'true' } })
        } else {
          // Si el auto-login falla, redirigir a login manual
          router.push('/auth/login')
        }
      } else {
        // No hay password temporal, redirigir a login
        router.push('/auth/login')
      }
    }, 1500)
  } else {
    authError.value = result.error
    attemptsLeft.value = result.attemptsLeft
    form.token = '' // Limpiar token incorrecto
  }

  isLoading.value = false
}

const resendCode = () => {
  // Implementar lógica de reenvío
  // Por ahora, solo simular cooldown
  resendCooldown.value = 60

  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
    }
  }, 1000)

  // Aquí podrías hacer una llamada al backend para reenviar el código
  console.log('Reenviando código de verificación para:', username.value)
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Fondo tecnológico específico para verificación */
.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 20%, #16213e 60%, #0f3460 100%);
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.4;
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
  width: 4px;
  height: 4px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: float 10s ease-in-out infinite;
  box-shadow: 0 0 12px var(--accent-color);
}

.floating-element:nth-child(1) {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}
.floating-element:nth-child(2) {
  top: 60%;
  left: 85%;
  animation-delay: 2s;
}
.floating-element:nth-child(3) {
  top: 40%;
  left: 10%;
  animation-delay: 4s;
}
.floating-element:nth-child(4) {
  top: 80%;
  left: 70%;
  animation-delay: 1s;
}
.floating-element:nth-child(5) {
  top: 30%;
  left: 90%;
  animation-delay: 3s;
}
.floating-element:nth-child(6) {
  top: 70%;
  left: 25%;
  animation-delay: 5s;
}

.verification-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wave {
  position: absolute;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  animation: waveExpand 4s ease-out infinite;
}

.wave:nth-child(1) {
  width: 100px;
  height: 100px;
  margin: -50px;
  animation-delay: 0s;
}

.wave:nth-child(2) {
  width: 200px;
  height: 200px;
  margin: -100px;
  animation-delay: 1.5s;
}

.wave:nth-child(3) {
  width: 300px;
  height: 300px;
  margin: -150px;
  animation-delay: 3s;
}

/* Brand Header */
.brand-header {
  position: relative;
  z-index: 3;
  padding: 1.5rem 2rem;
}

.brand-link {
  text-decoration: none;
  display: inline-block;
}

.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.brand-text {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.2rem;
}

.brand-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Wrapper principal */
.auth-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  min-height: 0;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--primary-500),
    var(--accent-color),
    transparent
  );
  opacity: 0.8;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.verification-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  background: rgba(0, 212, 255, 0.1);
  border: 2px solid var(--primary-500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary-500);
  animation: iconGlow 3s ease-in-out infinite;
}

.auth-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.title-main {
  color: white;
}

.title-accent {
  background: linear-gradient(135deg, var(--primary-500), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.9em;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  font-weight: 400;
  line-height: 1.4;
}

.username-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 0.75rem;
  padding: 0.8rem 1.2rem;
  color: var(--primary-500);
  font-weight: 600;
  font-size: 1rem;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: var(--primary-500);
  font-size: 0.95rem;
  justify-content: center;
}

.input-wrapper {
  position: relative;
}

.auth-input {
  width: 100%;
  background: rgba(42, 42, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 0.75rem;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
}

.token-input {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.8rem;
  padding: 1.2rem;
  border: 2px solid rgba(0, 212, 255, 0.4);
}

.token-input:focus {
  border-color: var(--primary-500);
  box-shadow:
    0 0 0 4px rgba(0, 212, 255, 0.15),
    0 0 30px rgba(0, 212, 255, 0.3);
  background: rgba(42, 42, 60, 0.9);
}

.token-input::placeholder {
  color: #475569;
  letter-spacing: 0.5rem;
}

.error-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: #ef4444;
  margin-top: 0.6rem;
  font-size: 0.9rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  color: #ef4444;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  font-size: 0.95rem;
}

.error-content {
  flex: 1;
}

.attempts-left {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 600;
  color: #f97316;
}

.success-message {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.95rem;
}

.auth-button {
  width: 100%;
  margin-bottom: 2rem;
}

.resend-section {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  background: rgba(42, 42, 60, 0.3);
}

.resend-text {
  color: #94a3b8;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}

.auth-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-text {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}

.auth-link {
  text-decoration: none;
}

/* Animaciones */
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(30px, 30px);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

@keyframes waveExpand {
  0% {
    opacity: 0.8;
    transform: scale(0.1);
  }
  70% {
    opacity: 0.2;
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes iconGlow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    border-color: var(--primary-500);
  }
  50% {
    box-shadow:
      0 0 30px rgba(0, 212, 255, 0.6),
      0 0 40px rgba(124, 58, 237, 0.3);
    border-color: var(--accent-color);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .brand-header {
    padding: 1.2rem 1.5rem;
  }

  .brand-text {
    font-size: 1.5rem;
  }

  .auth-wrapper {
    padding: 1rem;
  }

  .auth-card {
    padding: 2rem;
    max-width: 100%;
    border-radius: 1.2rem;
  }

  .auth-title {
    font-size: 1.8rem;
  }

  .token-input {
    font-size: 1.5rem;
    letter-spacing: 0.6rem;
  }

  .verification-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
    margin: 0.5rem;
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .token-input {
    font-size: 1.3rem;
    letter-spacing: 0.4rem;
    padding: 1rem;
  }

  .resend-section {
    padding: 1.2rem;
  }
}
</style>
