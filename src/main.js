import './assets/main.css'
import './assets/themes/dark-tech.css'
import './assets/primeicons-fix.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

// Importar el tester para desarrollo
import './utils/sessionExpiredTester.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark-mode',
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    }
})

// Importar PrimeIcons CSS al final para asegurar prioridad
import 'primeicons/primeicons.css'

app.mount('#app')