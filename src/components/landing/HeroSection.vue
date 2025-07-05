<template>
  <section class="hero-section">
    <div class="hero-background">
      <div class="galaxy-background">
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
        <div class="cosmic-dust"></div>
      </div>
      <div class="starfield">
        <div 
          class="star" 
          v-for="i in 150" 
          :key="i"
          :style="getStarStyle(i)"
        ></div>
      </div>
      <div class="grid-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element" v-for="i in 15" :key="i"></div>
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

const getStarStyle = (index) => {
  // Generar posiciones pseudo-aleatorias basadas en el índice
  const x = (index * 37) % 100
  const y = (index * 73) % 100
  const size = (index % 3) + 1
  const animationDelay = (index * 0.1) % 5
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${animationDelay}s`
  }
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
  background: radial-gradient(ellipse at top, #0a0a0a 0%, #1a0a2e 30%, #0f0f23 70%, #000000 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.galaxy-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  animation: nebulaFloat 30s ease-in-out infinite;
}

.nebula-1 {
  width: 800px;
  height: 600px;
  top: -200px;
  left: -100px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%);
  animation-delay: 0s;
}

.nebula-2 {
  width: 600px;
  height: 500px;
  top: 30%;
  right: -150px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%);
  animation-delay: 10s;
}

.nebula-3 {
  width: 700px;
  height: 400px;
  bottom: -100px;
  left: 20%;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 100%);
  animation-delay: 20s;
}

.cosmic-dust {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(2px 2px at 20% 30%, #fff, transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(139, 92, 246, 0.8), transparent),
    radial-gradient(1px 1px at 90% 40%, rgba(0, 212, 255, 0.8), transparent),
    radial-gradient(1px 1px at 10% 80%, rgba(236, 72, 153, 0.8), transparent);
  background-size: 300px 300px, 400px 400px, 200px 200px, 350px 350px;
  animation: cosmicDrift 60s linear infinite;
  opacity: 0.6;
}

.starfield {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: starTwinkle 3s ease-in-out infinite;
}

.star:nth-child(odd) {
  animation-delay: 0s;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.star:nth-child(even) {
  animation-delay: 1.5s;
  box-shadow: 0 0 3px rgba(139, 92, 246, 0.6);
}

.star:nth-child(3n) {
  animation-delay: 3s;
  box-shadow: 0 0 2px rgba(0, 212, 255, 0.7);
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.4;
  animation: gridMove 25s linear infinite;
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
  background: var(--accent-color);
  border-radius: 50%;
  animation: galaxyFloat 12s ease-in-out infinite;
  box-shadow: 
    0 0 6px var(--accent-color),
    0 0 12px rgba(139, 92, 246, 0.5),
    0 0 18px rgba(0, 212, 255, 0.3);
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
.floating-element:nth-child(11) { top: 25%; left: 5%; animation-delay: 8s; }
.floating-element:nth-child(12) { top: 65%; left: 25%; animation-delay: 9s; }
.floating-element:nth-child(13) { top: 45%; left: 75%; animation-delay: 10s; }
.floating-element:nth-child(14) { top: 85%; left: 45%; animation-delay: 11s; }
.floating-element:nth-child(15) { top: 5%; left: 95%; animation-delay: 12s; }



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
  width: 120px;
  height: 120px;
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
  background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%);
  box-shadow: 
    0 0 20px var(--primary-500),
    0 0 40px rgba(139, 92, 246, 0.5),
    inset 0 0 20px rgba(0, 212, 255, 0.3);
}

.core-ring::before {
  content: '';
  position: absolute;
  inset: -10px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
}

.core-ring::after {
  content: '';
  position: absolute;
  inset: -20px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 50%;
}

.core-center {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  z-index: 2;
  text-shadow: 
    0 0 10px var(--primary-500),
    0 0 20px rgba(139, 92, 246, 0.8),
    0 0 30px rgba(0, 212, 255, 0.6);
}

.orbital-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 
    0 0 20px rgba(139, 92, 246, 0.2),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
}

.orbit-1 {
  width: 260px;
  height: 260px;
  animation: galaxyOrbit 25s linear infinite;
  border-color: rgba(139, 92, 246, 0.5);
}

.orbit-2 {
  width: 380px;
  height: 380px;
  animation: galaxyOrbit 35s linear infinite reverse;
  border-color: rgba(0, 212, 255, 0.4);
}

.orbit-3 {
  width: 500px;
  height: 500px;
  animation: galaxyOrbit 45s linear infinite;
  border-color: rgba(236, 72, 153, 0.3);
}

.orbit-node {
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(42, 42, 60, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%);
  border: 2px solid #8B5CF6;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #8B5CF6;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 15px rgba(139, 92, 246, 0.6),
    0 0 30px rgba(0, 212, 255, 0.4),
    inset 0 0 15px rgba(139, 92, 246, 0.2);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  box-sizing: border-box;
}

.orbit-node::before {
  content: '';
  position: absolute;
  inset: -5px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.node-1 {
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.node-2 {
  top: 50%;
  right: -30px;
  transform: translateY(-50%);
  animation-delay: 1s;
}

.node-3 {
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 2s;
}



/* Galactic Animations */
@keyframes nebulaFloat {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1);
    opacity: 0.15;
  }
  25% { 
    transform: translateY(-20px) rotate(90deg) scale(1.05);
    opacity: 0.2;
  }
  50% { 
    transform: translateY(0px) rotate(180deg) scale(1.1);
    opacity: 0.25;
  }
  75% { 
    transform: translateY(20px) rotate(270deg) scale(1.05);
    opacity: 0.2;
  }
}

@keyframes cosmicDrift {
  0% { transform: translateX(0px) translateY(0px); }
  25% { transform: translateX(-20px) translateY(-10px); }
  50% { transform: translateX(20px) translateY(10px); }
  75% { transform: translateX(-10px) translateY(-20px); }
  100% { transform: translateX(0px) translateY(0px); }
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

@keyframes galaxyFloat {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1);
    opacity: 0.8;
  }
  25% { 
    transform: translateY(-30px) rotate(90deg) scale(1.2);
    opacity: 1;
  }
  50% { 
    transform: translateY(0px) rotate(180deg) scale(1.1);
    opacity: 0.9;
  }
  75% { 
    transform: translateY(30px) rotate(270deg) scale(1.2);
    opacity: 1;
  }
}



@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(80px, 80px); }
}

@keyframes galaxyOrbit {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
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
    width: 220px;
    height: 220px;
  }
  
  .orbit-2 {
    width: 320px;
    height: 320px;
  }
  
  .orbit-3 {
    width: 410px;
    height: 410px;
  }
  
  .nebula-1 {
    width: 600px;
    height: 450px;
  }
  
  .nebula-2 {
    width: 450px;
    height: 400px;
  }
  
  .nebula-3 {
    width: 550px;
    height: 350px;
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
    width: 180px;
    height: 180px;
  }
  
  .orbit-2 {
    width: 260px;
    height: 260px;
  }
  
  .orbit-3 {
    width: 320px;
    height: 320px;
  }
  
  .orbit-node {
    width: 50px;
    height: 50px;
    font-size: 0.75rem;
  }
  
  .node-1 {
    top: -25px;
  }
  
  .node-2 {
    right: -25px;
  }
  
  .node-3 {
    bottom: -25px;
  }
  
  .central-core {
    width: 100px;
    height: 100px;
  }
  
  .core-center {
    font-size: 1.6rem;
  }
  
  .nebula-1 {
    width: 400px;
    height: 300px;
  }
  
  .nebula-2 {
    width: 350px;
    height: 250px;
  }
  
  .nebula-3 {
    width: 400px;
    height: 200px;
  }
  
  .floating-element {
    width: 2px;
    height: 2px;
  }
  
  .data-streams {
    left: 0;
    right: 0;
  }
  
  .stream {
    opacity: 0.2;
    height: 1px;
  }
  
  .breath-line {
    height: 0.8px;
    opacity: 0.6;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .visual-container {
    width: 280px;
    height: 280px;
  }
  
  .orbit-1 {
    width: 150px;
    height: 150px;
  }
  
  .orbit-2 {
    width: 210px;
    height: 210px;
  }
  
  .orbit-3 {
    width: 270px;
    height: 270px;
  }
  
  .orbit-node {
    width: 40px;
    height: 40px;
    font-size: 0.65rem;
  }
  
  .node-1 {
    top: -20px;
  }
  
  .node-2 {
    right: -20px;
  }
  
  .node-3 {
    bottom: -20px;
  }
  
  .central-core {
    width: 80px;
    height: 80px;
  }
  
  .core-center {
    font-size: 1.3rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .data-streams {
    left: 0;
    right: 0;
  }
  
  .stream {
    opacity: 0.15;
    height: 1px;
  }
  
  .breath-line {
    height: 0.5px;
    opacity: 0.4;
  }
}
</style>
