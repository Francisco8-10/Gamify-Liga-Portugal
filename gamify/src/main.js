import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Import registerSW from virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker with auto-update
registerSW({ immediate: true })

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
