/**
 * Configuración de la aplicación
 * Centraliza todas las variables de entorno
 */

export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  },
  app: {
    env: import.meta.env.VITE_NODE_ENV || 'development',
    isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
    isProduction: import.meta.env.VITE_NODE_ENV === 'production',
  },
}

export default config
