import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { initWebVitalsCollector } from './metrics/webVitals'
import i18n from './i18n'

// 测试
const app = createApp(App)
app.use(createPinia())
app.use(i18n)
// Restore auth state before router kicks in
useAuthStore().restore()
app.use(router)
app.use(ElementPlus)
// 初始化 Web Vitals 采集（无侵入）
initWebVitalsCollector(router)
app.mount('#app')
