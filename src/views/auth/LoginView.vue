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
          <h2 class="auth-title">Iniciar Sesión</h2>
          <p class="auth-subtitle">Accede a tu cuenta de Modelium</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group" :class="{ error: error }">
            <label for="username" class="form-label">Usuario</label>
            <input 
              v-model="form.username" 
              id="username" 
              type="text" 
              class="form-input"
              :class="{ error: error }"
              placeholder="Ingresa tu usuario"
              required 
            />
          </div>
          
          <div class="form-group" :class="{ error: error }">
            <label for="password" class="form-label">Contraseña</label>
            <input 
              v-model="form.password" 
              id="password" 
              type="password" 
              class="form-input"
              :class="{ error: error }"
              placeholder="Ingresa tu contraseña"
              required 
            />
          </div>
          
          <div v-if="error" class="error-message">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>
        
          <button type="submit" :disabled="isLoading" class="auth-button">
            <i class="pi pi-sign-in" v-if="!isLoading"></i>
            <i class="pi pi-spin pi-spinner" v-else></i>
            <span>{{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <div class="footer-divider"></div>
          <div class="footer-content">
            <span class="footer-text">¿No tienes cuenta?</span>
            <router-link to="/auth/register" class="footer-link">
              <span class="link-text">Regístrate</span>
              <div class="link-glow"></div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const error = ref('')
const isLoading = ref(false)

// Limpiar error cuando el usuario empiece a escribir
watch([() => form.username, () => form.password], () => {
  if (error.value) {
    error.value = ''
  }
})

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await authStore.login({
      username: form.username,
      password: form.password,
    })
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      // Mostrar mensajes de error más específicos y claros
      if (result.error) {
        const errorMsg = result.error.toLowerCase()
        if (errorMsg.includes('no encontrado') || errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
          error.value = 'El usuario no existe. Verifica que hayas escrito correctamente tu nombre de usuario.'
        } else if (errorMsg.includes('contraseña') || errorMsg.includes('password') || errorMsg.includes('incorrecta') || errorMsg.includes('incorrect')) {
          error.value = 'La contraseña es incorrecta. Verifica que hayas escrito correctamente tu contraseña.'
        } else if (errorMsg.includes('verificado') || errorMsg.includes('verified') || result.needsVerification) {
          error.value = 'Tu cuenta no está verificada. Revisa tu correo electrónico para completar la verificación.'
        } else if (errorMsg.includes('conexión') || errorMsg.includes('connection') || errorMsg.includes('network')) {
          error.value = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
        } else if (errorMsg.includes('credenciales') || errorMsg.includes('credentials') || errorMsg.includes('invalid')) {
          error.value = 'Las credenciales son incorrectas. Verifica tu usuario y contraseña.'
        } else {
          // Si el error no coincide con ningún patrón conocido, mostrar el mensaje original
          error.value = result.error
        }
      } else {
        error.value = 'Las credenciales son incorrectas. Verifica tu usuario y contraseña e intenta nuevamente.'
      }
    }
  } catch (err) {
    console.error('Error en login:', err)
    // Manejar errores de red o del cliente
    if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
      error.value = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
    } else {
      error.value = 'Ocurrió un error inesperado. Por favor, intenta nuevamente en unos momentos.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Global styles */
* {
  box-sizing: border-box;
}

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
}

/* Auth container - sin position fixed ni height restrictions */
.auth-container {
  padding: 6rem 1rem 4rem 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Para pantallas muy altas, asegurar que siempre haya margen */
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

/* Posiciones aleatorias para las estrellas */
.star:nth-child(1) { top: 10%; left: 20%; }
.star:nth-child(2) { top: 25%; left: 70%; }
.star:nth-child(3) { top: 35%; left: 15%; }
.star:nth-child(4) { top: 50%; left: 85%; }
.star:nth-child(5) { top: 65%; left: 45%; }
.star:nth-child(6) { top: 80%; left: 25%; }
.star:nth-child(7) { top: 15%; left: 60%; }
.star:nth-child(8) { top: 40%; left: 90%; }
.star:nth-child(9) { top: 75%; left: 80%; }
.star:nth-child(10) { top: 20%; left: 35%; }
.star:nth-child(11) { top: 55%; left: 5%; }
.star:nth-child(12) { top: 90%; left: 55%; }
.star:nth-child(13) { top: 30%; left: 75%; }
.star:nth-child(14) { top: 70%; left: 10%; }
.star:nth-child(15) { top: 5%; left: 50%; }
.star:nth-child(16) { top: 45%; left: 30%; }
.star:nth-child(17) { top: 60%; left: 95%; }
.star:nth-child(18) { top: 85%; left: 40%; }
.star:nth-child(19) { top: 12%; left: 80%; }
.star:nth-child(20) { top: 38%; left: 65%; }

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
.floating-element:nth-child(9) { top: 50%; left: 15%; animation-delay: 1.5s; }
.floating-element:nth-child(10) { top: 25%; left: 75%; animation-delay: 3.5s; }
.floating-element:nth-child(11) { top: 75%; left: 55%; animation-delay: 5.5s; }
.floating-element:nth-child(12) { top: 15%; left: 45%; animation-delay: 7.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Grid pattern */
.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Auth card */
.auth-card {
  background: rgba(30, 30, 50, 0.9);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 0.15rem 0.15rem 0.1rem 0.15rem;
  max-width: 200px;
  width: 100%;
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 10;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(138, 43, 226, 0.1);
  transition: all 0.3s ease;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(75, 0, 130, 0.03));
  border-radius: 20px;
  pointer-events: none;
}

/* Efecto hover eliminado para mejorar la experiencia del usuario */

.card-header {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 2;
}

.auth-title {
  font-size: 2.1rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #b145ff 0%, #da38a9 50%,#b145ff  100%);
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
  color: rgba(200, 200, 220, 0.8);
  font-size: 1.1rem;
  font-weight: 300;
  margin: 0;
}

/* Form styles */
.auth-form {
  position: relative;
  z-index: 2;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: rgba(200, 200, 220, 0.9);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  background: 
    linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(30, 30, 50, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%);
  border: 1px solid rgba(138, 43, 226, 0.4);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 15px rgba(138, 43, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

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

.form-input::placeholder {
  color: rgba(200, 200, 220, 0.5);
}

/* Estado de error para los campos */
.form-input.error {
  border-color: rgba(239, 68, 68, 0.6);
  background: 
    linear-gradient(135deg, rgba(35, 20, 20, 0.9), rgba(40, 25, 25, 0.8)),
    radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 50%);
  box-shadow: 
    0 0 15px rgba(239, 68, 68, 0.3),
    0 0 30px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.form-input.error:focus {
  border-color: rgba(239, 68, 68, 0.8);
  box-shadow: 
    0 0 20px rgba(239, 68, 68, 0.4),
    0 0 40px rgba(239, 68, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.form-group.error .form-label {
  color: rgba(239, 68, 68, 0.8);
}

.error-message {
  background: 
    linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%),
    radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 50%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: #fecaca;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  box-shadow: 
    0 4px 15px rgba(239, 68, 68, 0.2),
    0 0 20px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  animation: errorSlideIn 0.4s ease-out;
  position: relative;
  overflow: hidden;
}

.error-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(239, 68, 68, 0.1) 50%, 
    transparent 100%);
  animation: errorScan 2s ease-in-out infinite;
  pointer-events: none;
}

.error-message i {
  color: #ef4444;
  font-size: 1.1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.4));
}

@keyframes errorSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes errorScan {
  0%, 100% { 
    opacity: 0;
    transform: translateX(-100%);
  }
  50% { 
    opacity: 1;
    transform: translateX(100%);
  }
}

.auth-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.8), rgba(75, 0, 130, 0.6));
  border: 1px solid rgba(138, 43, 226, 0.5);
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 
    0 4px 15px rgba(138, 43, 226, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.auth-button:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.9), rgba(75, 0, 130, 0.7));
  border-color: rgba(138, 43, 226, 0.7);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(138, 43, 226, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Footer */
.auth-footer {
  position: relative;
  z-index: 2;
  margin-top: 2rem;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.3), transparent);
  margin: 2rem 0;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.footer-text {
  color: rgba(200, 200, 220, 0.7);
  font-size: 0.9rem;
}

.footer-link {
  position: relative;
  text-decoration: none;
  color: #8A2BE2;
  font-weight: 600;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #9400D3;
}

.link-glow {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8A2BE2, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.footer-link:hover .link-glow {
  opacity: 1;
}

.footer-brand {
  text-align: center;
}

.brand-name {
  display: block;
  color: #8A2BE2;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.brand-name:hover {
  color: #9400D3;
}

.brand-tagline {
  color: rgba(200, 200, 220, 0.6);
  font-size: 0.8rem;
  font-style: italic;
}

/* Responsive */
@media (min-width: 1200px) {
  .auth-container {
    padding: 8rem 2rem 6rem 2rem;
  }
  
  .auth-card {
    max-width: 500px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .auth-card {
    padding: 0.1rem 0.1rem 0.05rem 0.1rem;
    max-width: 180px;
    margin: 1rem;
  }
  
  .auth-title {
    font-size: 1.6rem;
  }
  
  .auth-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 0.05rem 0.05rem 0.02rem 0.05rem;
    max-width: 160px;
    margin: 0.5rem;
  }
  
  .auth-title {
    font-size: 1.4rem;
  }

  .form-input {
    padding: 0.7rem;
    font-size: 0.9rem;
  }

  .auth-button {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}
</style>

