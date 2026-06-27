import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18next, { I18NextVue } from './i18n.ts'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(I18NextVue, { i18next })
app.mount('#app')
