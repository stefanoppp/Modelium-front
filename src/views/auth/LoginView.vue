<template>
  <div class="auth-container">
    <!-- Background animado -->
    <div class="background-grid"></div>
    <div class="floating-elements">
      <div class="floating-element" v-for="n in 15" :key="n"></div>
    </div>
    <div class="grid-lines">
      <div class="grid-line horizontal" v-for="n in 8" :key="'h' + n"></div>
      <div class="grid-line vertical" v-for="n in 12" :key="'v' + n"></div>
    </div>

    <div class="auth-card">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuario o Email</label>
          <input v-model="form.username" id="username" type="text" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input v-model="form.password" id="password" type="password" required />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
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
        <div class="footer-brand">
          <router-link to="/" class="brand-name">Modelium</router-link>
          <span class="brand-tagline">Potenciando el futuro del desarrollo de IA</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  const result = await authStore.login({
    username: form.username,
    password: form.password,
  })
  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error || 'Usuario o contraseña incorrectos.'
  }
  isLoading.value = false
}
</script>

<style scoped>
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
  padding: 1rem;
}

/* Background Grid */
.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridPulse 4s ease-in-out infinite;
}

/* Floating Elements (estrellitas) */
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
  background: #00d4ff;
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  box-shadow: 0 0 6px #00d4ff;
}

.floating-element:nth-child(1) {
  top: 10%;
  left: 15%;
  animation-delay: -2s;
}
.floating-element:nth-child(2) {
  top: 20%;
  left: 85%;
  animation-delay: -5s;
}
.floating-element:nth-child(3) {
  top: 70%;
  left: 10%;
  animation-delay: -1s;
}
.floating-element:nth-child(4) {
  top: 40%;
  left: 90%;
  animation-delay: -7s;
}
.floating-element:nth-child(5) {
  top: 80%;
  left: 75%;
  animation-delay: -3s;
}
.floating-element:nth-child(6) {
  top: 30%;
  left: 25%;
  animation-delay: -6s;
}
.floating-element:nth-child(7) {
  top: 60%;
  left: 60%;
  animation-delay: -4s;
}
.floating-element:nth-child(8) {
  top: 15%;
  left: 50%;
  animation-delay: -8s;
}
.floating-element:nth-child(9) {
  top: 85%;
  left: 40%;
  animation-delay: -2.5s;
}
.floating-element:nth-child(10) {
  top: 50%;
  left: 80%;
  animation-delay: -4.5s;
}
.floating-element:nth-child(11) {
  top: 25%;
  left: 70%;
  animation-delay: -1.5s;
}
.floating-element:nth-child(12) {
  top: 75%;
  left: 20%;
  animation-delay: -6.5s;
}
.floating-element:nth-child(13) {
  top: 45%;
  left: 35%;
  animation-delay: -3.5s;
}
.floating-element:nth-child(14) {
  top: 65%;
  left: 85%;
  animation-delay: -7.5s;
}
.floating-element:nth-child(15) {
  top: 35%;
  left: 5%;
  animation-delay: -4.5s;
}

/* Grid Lines que se encienden */
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4), transparent);
  animation: lineGlow 6s ease-in-out infinite;
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
  left: 0;
}

.grid-line.vertical {
  width: 1px;
  height: 100%;
  top: 0;
  background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.4), transparent);
}

.grid-line:nth-child(1) {
  top: 10%;
  animation-delay: -2s;
}
.grid-line:nth-child(2) {
  top: 25%;
  animation-delay: -4s;
}
.grid-line:nth-child(3) {
  top: 40%;
  animation-delay: -1s;
}
.grid-line:nth-child(4) {
  top: 55%;
  animation-delay: -5s;
}
.grid-line:nth-child(5) {
  top: 70%;
  animation-delay: -3s;
}
.grid-line:nth-child(6) {
  top: 85%;
  animation-delay: -6s;
}
.grid-line:nth-child(7) {
  top: 95%;
  animation-delay: -1.5s;
}
.grid-line:nth-child(8) {
  top: 5%;
  animation-delay: -4.5s;
}

.grid-line:nth-child(9) {
  left: 10%;
  animation-delay: -2.5s;
}
.grid-line:nth-child(10) {
  left: 25%;
  animation-delay: -5.5s;
}
.grid-line:nth-child(11) {
  left: 40%;
  animation-delay: -1.2s;
}
.grid-line:nth-child(12) {
  left: 55%;
  animation-delay: -4.2s;
}
.grid-line:nth-child(13) {
  left: 70%;
  animation-delay: -3.2s;
}
.grid-line:nth-child(14) {
  left: 85%;
  animation-delay: -6.2s;
}
.grid-line:nth-child(15) {
  left: 95%;
  animation-delay: -2.8s;
}
.grid-line:nth-child(16) {
  left: 5%;
  animation-delay: -5.8s;
}
.grid-line:nth-child(17) {
  left: 30%;
  animation-delay: -1.8s;
}
.grid-line:nth-child(18) {
  left: 60%;
  animation-delay: -4.8s;
}
.grid-line:nth-child(19) {
  left: 80%;
  animation-delay: -3.8s;
}
.grid-line:nth-child(20) {
  left: 15%;
  animation-delay: -6.8s;
}

.auth-card {
  background: rgba(26, 26, 46, 0.9);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 40px rgba(0, 212, 255, 0.15);
  width: 100%;
  max-width: 380px;
  color: #ffffff;
  position: relative;
  z-index: 10;
}

/* Animaciones */
@keyframes gridPulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes float {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-10px) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
  75% {
    transform: translateY(-10px) scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
}

@keyframes lineGlow {
  0% {
    opacity: 0.2;
  }
  25% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
  75% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.2;
  }
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  font-size: 1.3rem;
}
.form-group {
  margin-bottom: 0.6rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
  color: #ffffff;
  font-size: 0.85rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  background: rgba(42, 42, 58, 0.8);
  border: 1.5px solid rgba(0, 212, 255, 0.2);
  color: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}
input:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
}
input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: linear-gradient(135deg, #00d4ff, #8b5cf6);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.auth-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  position: relative;
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4), transparent);
  margin-bottom: 1.5rem;
  position: relative;
}

.footer-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: #00d4ff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00d4ff;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.footer-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.footer-link {
  position: relative;
  color: #00d4ff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.footer-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  border-color: rgba(0, 212, 255, 0.5);
}

.link-text {
  position: relative;
  z-index: 2;
}

.link-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.footer-link:hover .link-glow {
  left: 100%;
}

.footer-brand {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

.brand-name {
  display: block;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  margin-bottom: 0.5rem;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  position: relative;
  letter-spacing: 0.5px;
}

.brand-name::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  transform: translateX(-50%);
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.brand-name:hover {
  color: #ffffff;
  text-shadow:
    0 0 20px rgba(0, 212, 255, 0.8),
    0 0 30px rgba(0, 212, 255, 0.4);
  transform: translateY(-1px);
  letter-spacing: 1px;
}

.brand-name:hover::before {
  width: 100%;
}

.brand-tagline {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}

.error-message {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

/* Responsive vertical - pantallas pequeñas */
@media (max-height: 700px) {
  .auth-container {
    padding: 0.5rem;
  }

  .auth-card {
    padding: 1rem;
    max-height: 98vh;
    overflow-y: auto;
  }

  .auth-card h2 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }

  .form-group {
    margin-bottom: 0.5rem;
  }

  .form-group label {
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
  }

  .form-group input {
    padding: 0.4rem;
    font-size: 0.85rem;
  }

  button {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .auth-footer {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .footer-brand {
    padding-top: 1rem;
  }

  .brand-name {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }

  .brand-tagline {
    font-size: 0.75rem;
  }
}

/* Responsive vertical - pantallas muy pequeñas */
@media (max-height: 600px) {
  .auth-card {
    padding: 0.8rem;
  }

  .auth-card h2 {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }

  .form-group {
    margin-bottom: 0.4rem;
  }

  .form-group label {
    font-size: 0.75rem;
    margin-bottom: 0.15rem;
  }

  .form-group input {
    padding: 0.35rem;
    font-size: 0.8rem;
  }

  button {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .auth-footer {
    margin-top: 0.8rem;
    padding-top: 0.8rem;
  }

  .footer-content {
    font-size: 0.8rem;
  }

  .footer-brand {
    padding-top: 0.8rem;
  }

  .brand-name {
    font-size: 1rem;
    margin-bottom: 0.3rem;
  }

  .brand-tagline {
    font-size: 0.7rem;
  }
}
</style>
