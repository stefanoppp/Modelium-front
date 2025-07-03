<template>
  <section class="features-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title neon-text">Características</h2>
        <p class="section-description">
          Todo lo que necesitas para construir, entrenar y desplegar modelos de IA
        </p>
        <div class="header-decoration"></div>
      </div>
      
      <div class="features-grid">
        <div class="feature-card tech-glow" v-for="feature in features" :key="feature.id">
          <div class="card-header">
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <div class="card-number">{{ String(feature.id).padStart(2, '0') }}</div>
          </div>
          <div class="card-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
          <div class="card-decoration"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  {
    id: 1,
    icon: 'pi pi-cog',
    title: 'Pipeline AutoML',
    description: 'Pipeline automatizado de machine learning que maneja preprocesamiento, entrenamiento y optimización.'
  },
  {
    id: 2,
    icon: 'pi pi-chart-line',
    title: 'Análisis en Tiempo Real',
    description: 'Monitorea el rendimiento de tu modelo con métricas en tiempo real y visualizaciones.'
  },
  {
    id: 3,
    icon: 'pi pi-cloud-upload',
    title: 'Subida Fácil de Datos',
    description: 'Sube tus datasets con funcionalidad de arrastrar y soltar y validación automática.'
  },
  {
    id: 4,
    icon: 'pi pi-shield',
    title: 'Seguro y Privado',
    description: 'Los datos de tu cuenta son encriptados y almacenados de forma segura con seguridad de nivel empresarial.'
  },
  {
    id: 5,
    icon: 'pi pi-download',
    title: 'Exportación de Modelos',
    description: 'Exporta tus modelos entrenados en múltiples formatos para despliegue fácil.'
  },
  {
    id: 6,
    icon: 'pi pi-users',
    title: 'Colaboración en Equipo',
    description: 'Comparte modelos y colabora con tu equipo en tiempo real.'
  }
]
</script>

<style scoped>
.features-section {
  padding: 8rem 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.4) 0%, rgba(42, 42, 42, 0.3) 100%);
  position: relative;
  overflow: hidden;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(124, 58, 237, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
  position: relative;
  z-index: 2;
}

.section-title {
  font-size: 3.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

.section-description {
  font-size: 1.4rem;
  color: #b1b8d4;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: -0.005em;
}

.header-decoration {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--accent-color));
  margin: 0 auto;
  border-radius: 2px;
  position: relative;
}

.header-decoration::after {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--accent-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(42, 42, 60, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-500), var(--accent-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: 
    0 25px 50px rgba(0, 212, 255, 0.25),
    0 0 0 1px rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2.5rem 2.5rem 1rem;
  position: relative;
}

.feature-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-color));
  border-radius: 1.25rem;
  font-size: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
  position: relative;
}

.feature-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-color));
  border-radius: 1.25rem;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .feature-icon::after {
  opacity: 0.3;
}

.card-number {
  font-size: 1.25rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.card-content {
  padding: 0 2.5rem 2.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #ffffff;
  line-height: 1.3;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.feature-description {
  color: #b1b8d4;
  line-height: 1.7;
  font-size: 1rem;
  flex-grow: 1;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: -0.005em;
}

.card-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-500), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .card-decoration {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .features-grid {
    gap: 2.5rem;
  }
}

@media (max-width: 1200px) {
  .features-section {
    padding: 6rem 0;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  .section-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .features-section {
    padding: 4rem 0;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    min-height: auto;
  }
  
  .card-header {
    padding: 2rem 2rem 1rem;
  }
  
  .card-content {
    padding: 0 2rem 2rem;
  }
  
  .feature-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 2.5rem;
  }
  
  .section-description {
    font-size: 1.2rem;
  }
}
</style>
