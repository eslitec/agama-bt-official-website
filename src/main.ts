import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { vReveal } from './directives/reveal'
import './styles/fonts'
import './styles/main.scss'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).use(i18n).use(router).directive('reveal', vReveal).mount('#app')
