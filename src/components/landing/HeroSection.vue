<template>
  <section class="hero-section">
    <div class="hero-background">
      <div class="grid-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element" v-for="i in 10" :key="i"></div>
      </div>
    </div>
    
    <div class="container">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="content-wrapper">
            <div class="hero-badge">
              <span class="badge-text">🚀 Modelium - Plataforma de IA Avanzada</span>
            </div>
            
            <h1 class="hero-title">
              <span class="title-line">Libera el</span>
              <span class="title-line gradient-text">Poder de la IA</span>
            </h1>
            
            <h2 class="hero-subtitle">
              Genera tu Modelo Hoy
            </h2>
            
            <p class="hero-description">
              Crea modelos de IA personalizados con tus datos usando AutoML avanzado. 
              Sin código necesario, resultados profesionales en minutos.
            </p>
            
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">10K+</span>
                <span class="stat-label">Modelos Creados</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">99.5%</span>
                <span class="stat-label">Precisión</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">5min</span>
                <span class="stat-label">Tiempo Promedio</span>
              </div>
            </div>
            
            <div class="hero-actions">
              <TechButton 
                label="Comenzar Gratis" 
                icon="pi pi-rocket"
                @click="navigateToAuth"
                class="primary-btn"
                size="large"
              />
              <TechButton 
                label="Ver Demo" 
                icon="pi pi-play"
                severity="secondary"
                outlined
                size="large"
              />
            </div>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="visual-container">
            <div class="ai-visualization">
              <div class="central-core">
                <div class="core-ring"></div>
                <div class="core-center">AI</div>
              </div>
              
              <div class="orbital-elements">
                <div class="orbit orbit-1">
                  <div class="orbit-node node-1">ML</div>
                </div>
                <div class="orbit orbit-2">
                  <div class="orbit-node node-2">DL</div>
                </div>
                <div class="orbit orbit-3">
                  <div class="orbit-node node-3">NN</div>
                </div>
              </div>
              
              <div class="data-streams">
                <div class="stream stream-1"></div>
                <div class="stream stream-2"></div>
                <div class="stream stream-3"></div>
              </div>
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

const navigateToAuth = () => {
  router.push('/auth/login')
}
</script>

<style scoped>
.hero-section {
  padding: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-background {
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
    linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
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
  width: 4px;
  height: 4px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  box-shadow: 0 0 10px var(--accent-color);
}

.floating-element:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.floating-element:nth-child(2) { top: 60%; left: 20%; animation-delay: 2s; }
.floating-element:nth-child(3) { top: 40%; left: 80%; animation-delay: 4s; }
.floating-element:nth-child(4) { top: 80%; left: 70%; animation-delay: 6s; }
.floating-element:nth-child(5) { top: 10%; left: 60%; animation-delay: 1s; }
.floating-element:nth-child(6) { top: 70%; left: 40%; animation-delay: 3s; }
.floating-element:nth-child(7) { top: 30%; left: 30%; animation-delay: 5s; }
.floating-element:nth-child(8) { top: 90%; left: 15%; animation-delay: 7s; }
.floating-element:nth-child(9) { top: 15%; left: 85%; animation-delay: 2.5s; }
.floating-element:nth-child(10) { top: 55%; left: 90%; animation-delay: 4.5s; }

.container {
  position: relative;
  z-index: 2;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 6rem;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.hero-content {
  padding-left: 2rem;
}

.content-wrapper {
  max-width: 600px;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.hero-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

.badge-text {
  font-size: 0.9rem;
  background: linear-gradient(135deg, #00D4FF, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  line-height: 1.1;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

.title-line {
  color: white;
  font-weight: 300;
}

.gradient-text {
  background: linear-gradient(135deg, #00D4FF, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 0.5rem;
  font-weight: 400;
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 400;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  opacity: 0.9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.hero-description {
  font-size: 1.3rem;
  color: #b1b8d4;
  margin-bottom: 3rem;
  line-height: 1.7;
  max-width: 500px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: -0.005em;
}

.hero-stats {
  display: flex;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 400;
  color: var(--primary-500);
  margin-bottom: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.visual-container {
  position: relative;
  width: 520px;
  height: 520px;
}

.ai-visualization {
  width: 100%;
  height: 100%;
  position: relative;
}

.central-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.core-ring {
  position: absolute;
  inset: 0;
  border: 3px solid var(--primary-500);
  border-radius: 50%;
  background: rgba(0, 212, 255, 0.1);
  animation: coreGlow 3s ease-in-out infinite;
}

.core-center {
  font-size: 1.9rem;
  font-weight: 700;
  color: white;
  z-index: 2;
  text-shadow: 0 0 20px var(--primary-500);
}

.orbital-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.orbit-1 {
  width: 240px;
  height: 240px;
  animation: rotate 20s linear infinite;
}

.orbit-2 {
  width: 360px;
  height: 360px;
  animation: rotate 30s linear infinite reverse;
}

.orbit-3 {
  width: 480px;
  height: 480px;
  animation: rotate 40s linear infinite;
}

.orbit-node {
  position: absolute;
  width: 55px;
  height: 55px;
  background: rgba(42, 42, 60, 0.9);
  border: 2px solid #8B5CF6;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #8B5CF6;
  font-size: 0.85rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 5px rgba(0, 212, 255, 0.3);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  box-sizing: border-box;
}

.node-1 {
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
}

.node-2 {
  top: 50%;
  right: -28px;
  transform: translateY(-50%);
}

.node-3 {
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
}

.data-streams {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.stream {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00D4FF, #8B5CF6, transparent);
  animation: streamFlow 4s ease-in-out infinite;
}

.stream-1 {
  top: 30%;
  left: 0;
  right: 0;
  animation-delay: 0s;
}

.stream-2 {
  top: 50%;
  left: 0;
  right: 0;
  animation-delay: 1.5s;
}

.stream-3 {
  top: 70%;
  left: 0;
  right: 0;
  animation-delay: 3s;
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

@keyframes coreGlow {
  0%, 100% { 
    box-shadow: 0 0 20px var(--primary-500);
    border-color: var(--primary-500);
  }
  50% { 
    box-shadow: 0 0 40px var(--primary-500), 0 0 20px var(--accent-color);
    border-color: var(--accent-color);
  }
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes streamFlow {
  0% { opacity: 0; }
  50% { opacity: 0.8; }
  100% { opacity: 0; }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .hero-grid {
    gap: 4rem;
  }
  
  .hero-title {
    font-size: 3.5rem;
    font-weight: 300;
  }
  
  .visual-container {
    width: 420px;
    height: 420px;
  }
  
  .orbit-1 {
    width: 200px;
    height: 200px;
  }
  
  .orbit-2 {
    width: 300px;
    height: 300px;
  }
  
  .orbit-3 {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  
  .hero-content {
    padding-left: 0;
  }
  
  .content-wrapper {
    max-width: none;
  }
  
  .hero-title {
    font-size: 2.5rem;
    font-weight: 300;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
    max-width: none;
  }
  
  .hero-stats {
    gap: 2rem;
    justify-content: center;
  }
  
  .visual-container {
    width: 330px;
    height: 330px;
  }
  
  .orbit-1 {
    width: 160px;
    height: 160px;
  }
  
  .orbit-2 {
    width: 240px;
    height: 240px;
  }
  
  .orbit-3 {
    width: 320px;
    height: 320px;
  }
  
  .orbit-node {
    width: 44px;
    height: 44px;
    font-size: 0.75rem;
  }
}
</style>
