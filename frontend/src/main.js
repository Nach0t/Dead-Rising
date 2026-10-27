import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

// 1. Configurar la URL base de tu backend para no repetirla en los componentes
axios.defaults.baseURL = 'http://localhost:3000'

// 2. Importar los estilos globales de la aplicación
import './style.css'

const app = createApp(App)

// Opcional: Si deseas inyectar axios globalmente para Composition API o plugins
app.config.globalProperties.$axios = axios

app.mount('#app')