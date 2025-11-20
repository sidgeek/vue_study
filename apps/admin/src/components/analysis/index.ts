import type { App } from 'vue'
import AnalysisWidget from './AnalysisWidget.vue'
export { createAnalysisSDK } from './sdk'
export { default as AnalysisWidget } from './AnalysisWidget.vue'
export const AnalysisPlugin = { install(app: App) { app.component('AnalysisWidget', AnalysisWidget) } }