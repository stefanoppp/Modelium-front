<template>
  <footer class="footer-section">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="@/assets/logo-modelium.png" alt="Modelium" class="footer-logo" />
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">
            © 2025 - Derechos reservados
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-section {
  padding: 3rem 0 1.5rem;
  background: #000000;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.footer-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copyright {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 300;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}



@media (max-width: 768px) {
  .footer-content {
    gap: 1rem;
  }
}
</style>
