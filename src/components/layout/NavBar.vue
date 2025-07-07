<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-name">Modelium</span>
        </router-link>
      </div>
      
      <div class="navbar-menu" v-if="authStore.isAuthenticated">
        <router-link to="/dashboard" class="nav-link">
          <i class="pi pi-home"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/models" class="nav-link">
          <i class="pi pi-database"></i>
          <span>Modelos</span>
        </router-link>
        <router-link to="/repository" class="nav-link">
          <i class="pi pi-globe"></i>
          <span>Repositorio</span>
        </router-link>
        <button @click="handleLogout" class="nav-link logout-btn">
          <i class="pi pi-sign-out"></i>
          <span>Salir</span>
        </button>
      </div>
      
      <div class="navbar-menu" v-else>
        <router-link to="/auth/login" class="nav-link">
          <i class="pi pi-sign-in"></i>
          <span>Iniciar Sesión</span>
        </router-link>
        <router-link to="/auth/register" class="nav-link">
          <i class="pi pi-user-plus"></i>
          <span>Registrarse</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  padding: 1rem 0;
  margin: 0;
}

.navbar-container {
  width: 100%;
  padding: 0 3%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #00D4FF 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand-link {
  position: relative;
  overflow: hidden;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand-link:hover::before {
  left: 100%;
}

.brand-link:hover .brand-name {
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transform: translateY(-1px);
}

.brand-link:hover {
  background: rgba(0, 212, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #b1b8d4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  color: var(--primary-500);
  background: rgba(0, 212, 255, 0.08);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: var(--primary-500);
  background: rgba(0, 212, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }
  
  .navbar-menu {
    gap: 1rem;
  }
  
  .nav-link span {
    display: none;
  }
}
</style>
