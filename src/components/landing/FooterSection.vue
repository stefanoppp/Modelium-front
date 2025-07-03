<template>
  <footer class="footer-section">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3 class="brand-name neon-text">Modelium</h3>
          <p class="brand-description">
            Potenciando el futuro del desarrollo de IA
          </p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">Producto</h4>
            <ul class="link-list">
              <li><a href="#" class="footer-link">Características</a></li>
              <li><a href="#" class="footer-link">Precios</a></li>
              <li><a href="#" class="footer-link">Documentación</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Empresa</h4>
            <ul class="link-list">
              <li><a href="#" class="footer-link">Acerca de</a></li>
              <li><a href="#" class="footer-link">Blog</a></li>
              <li><a href="#" class="footer-link">Carreras</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Soporte</h4>
            <ul class="link-list">
              <li><a href="#" class="footer-link">Centro de Ayuda</a></li>
              <li><a href="#" class="footer-link">Contacto</a></li>
              <li><a href="#" class="footer-link">Estado</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">
          © 2025 Modelium. Todos los derechos reservados.
        </p>
        <div class="social-links">
          <a href="#" class="social-link"><i class="pi pi-twitter"></i></a>
          <a href="#" class="social-link"><i class="pi pi-github"></i></a>
          <a href="#" class="social-link"><i class="pi pi-linkedin"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-section {
  padding: 4rem 0 2rem;
  background: rgba(10, 10, 10, 0.9);
  border-top: 1px solid rgba(0, 212, 255, 0.2);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.brand-name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.brand-description {
  color: #94a3b8;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.link-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-500);
}

.link-list {
  list-style: none;
  padding: 0;
}

.link-list li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--primary-500);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.copyright {
  color: #64748b;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 50%;
  color: var(--primary-500);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--primary-500);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
