import { createApp } from 'vue'
import App from './App.vue'
import { registerMarkdownElements } from './markdown/elements'
import { registerMdComponent } from './markdown/mdComponent'
import { registerAnalysisElement } from '@analysis'

registerMarkdownElements()
registerMdComponent()
registerAnalysisElement()
createApp(App).mount('#app')