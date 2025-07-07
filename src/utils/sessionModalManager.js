let modalInstance = null
let modalElement = null

// Función para crear y mostrar el modal directamente en el DOM
export const showSessionExpiredModal = (reason = 'Su sesión ha expirado') => {
  // Si ya existe un modal, removerlo primero
  if (modalInstance) {
    hideSessionExpiredModal()
  }
  
  // Crear el elemento contenedor del modal
  modalElement = document.createElement('div')
  modalElement.id = 'session-expired-modal-direct'
  modalElement.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: rgba(0, 0, 0, 0.85) !important;
    backdrop-filter: blur(8px) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 2147483647 !important;
    padding: 1rem !important;
  `
  
  // Crear el contenido del modal
  const modalContent = document.createElement('div')
  modalContent.style.cssText = `
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.98) 0%, rgba(40, 40, 60, 0.98) 100%) !important;
    border: 2px solid rgba(120, 119, 198, 0.5) !important;
    border-radius: 20px !important;
    padding: 2rem !important;
    max-width: 500px !important;
    width: 100% !important;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(138, 43, 226, 0.4) !important;
    backdrop-filter: blur(25px) !important;
    color: white !important;
    text-align: center !important;
    font-family: 'Inter', sans-serif !important;
  `
  
  modalContent.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, rgba(255, 100, 100, 0.3), rgba(255, 150, 100, 0.3));
        border: 3px solid rgba(255, 100, 100, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 2rem;
        color: #ff6464;
        box-shadow: 0 0 30px rgba(255, 100, 100, 0.4);
      ">
        ⚠️
      </div>
      <h2 style="font-size: 1.5rem; font-weight: 600; margin: 0; color: #fff;">
        ⚠️ Sesión Expirada
      </h2>
    </div>
    
    <div style="margin-bottom: 2rem;">
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #e2e8f0;">
        ${reason}
      </p>
      
      <div style="
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 12px;
        padding: 1rem;
        text-align: left;
      ">
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <span style="color: #3b82f6; font-size: 1.2rem; margin-top: 2px;">ℹ️</span>
          <div>
            <strong style="display: block; margin-bottom: 0.25rem; color: #fff;">¿Por qué pasó esto?</strong>
            <p style="margin: 0; font-size: 0.9rem; color: #cbd5e1; line-height: 1.4;">
              Por seguridad, las sesiones tienen un tiempo limitado para proteger tu cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div style="display: flex; justify-content: center;">
      <button id="session-modal-login-btn" style="
        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 1rem 2rem !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        color: white !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        min-width: 200px !important;
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
      ">
        🔑 Iniciar Sesión
      </button>
    </div>
  `
  
  modalElement.appendChild(modalContent)
  
  // Agregar event listener al botón
  const loginBtn = modalContent.querySelector('#session-modal-login-btn')
  loginBtn.addEventListener('click', () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Ocultar el modal
    hideSessionExpiredModal()
    
    // Redirigir al login
    window.location.href = '/auth/login'
  })

  // Prevenir cerrar el modal clickeando fuera
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      e.preventDefault()
      e.stopPropagation()
    }
  })
  
  // Bloquear scroll del body
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.height = '100%'
  
  // Agregar al DOM
  document.body.appendChild(modalElement)
}

// Función para ocultar el modal
export const hideSessionExpiredModal = () => {
  if (modalElement && modalElement.parentNode) {
    modalElement.parentNode.removeChild(modalElement)
    modalElement = null
  }
  
  if (modalInstance) {
    modalInstance.unmount()
    modalInstance = null
  }
  
  // Restaurar scroll del body
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.height = ''
}

// Función para verificar si el modal está visible
export const isSessionExpiredModalVisible = () => {
  return modalElement && modalElement.parentNode
}
