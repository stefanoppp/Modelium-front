<template>
  <section class="cta-section">
    <div class="cta-background">
      <div class="geometric-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
    
    <div class="container">
      <div class="cta-content">
        <div class="cta-badge">
          <span class="badge-icon">⚡</span>
          <span class="badge-text">Únete a la Revolución IA</span>
        </div>
        
        <h2 class="cta-title">
          <span class="title-line">¿Listo para</span>
          <span class="title-line gradient-text">Transformar tu Negocio?</span>
        </h2>
        
        <p class="cta-description">
          Únete a más de 10,000 desarrolladores y científicos de datos que ya están 
          construyendo el futuro con nuestra plataforma de IA avanzada.
        </p>
        
        <div class="cta-features">
          <div class="feature-item">
            <i class="pi pi-check-circle"></i>
            <span>Setup en 5 minutos</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-check-circle"></i>
            <span>Sin tarjeta de crédito</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-check-circle"></i>
            <span>Soporte 24/7</span>
          </div>
        </div>
        
        <div class="cta-actions">
          <TechButton 
            label="Empezar Gratis Ahora" 
            icon="pi pi-rocket"
            @click="navigateToRegister"
            size="large"
            class="cta-primary"
          />
          <TechButton 
            label="Ver Demo en Vivo" 
            icon="pi pi-play"
            severity="secondary"
            outlined
            size="large"
          />
        </div>
        
        <div class="trust-indicators">
          <p class="trust-text">Confiado por empresas líderes en todo el mundo</p>
          <div class="trust-stats">
            <div class="stat">
              <span class="stat-number">99.9%</span>
              <span class="stat-label">Uptime</span>
            </div>
            <div class="stat">
              <span class="stat-number">10K+</span>
              <span class="stat-label">Usuarios Activos</span>
            </div>
            <div class="stat">
              <span class="stat-number">50M+</span>
              <span class="stat-label">Modelos Entrenados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import TechButton from '@/components/ui/TechButton.vue'

const router = useRouter()

const navigateToRegister = () => {
  router.push('/auth/register')
}
</script>

<style scoped>
.cta-section {
  padding: 8rem 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(42, 42, 60, 0.95) 100%);
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.geometric-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.container {
  position: relative;
  z-index: 2;
}

.cta-content {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 50px;
  padding: 0.75rem 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.badge-icon {
  font-size: 1.2rem;
}

.badge-text {
  font-size: 1rem;
  color: var(--accent-color);
  font-weight: 600;
}

.cta-title {
  font-size: 4rem;
  font-weight: 300;
  margin-bottom: 2rem;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

.title-line {
  color: white;
  font-weight: 300;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-500), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 400;
}

.cta-description {
  font-size: 1.4rem;
  color: #b1b8d4;
  margin-bottom: 3rem;
  line-height: 1.7;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: -0.005em;
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.feature-item i {
  color: var(--primary-500);
  font-size: 1.2rem;
}

.cta-actions {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.trust-indicators {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.trust-text {
  color: #94a3b8;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.trust-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-500);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.6;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .cta-title {
    font-size: 3.5rem;
  }
  
  .cta-features {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .cta-section {
    padding: 6rem 0;
  }
  
  .cta-title {
    font-size: 2.5rem;
  }
  
  .cta-description {
    font-size: 1.2rem;
  }
  
  .cta-features {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  
  .trust-stats {
    gap: 2rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
