import type { App } from 'vue'
import { defineCustomElement } from 'vue'
import AnalysisWidget from './AnalysisWidget.vue'
import 'element-plus/dist/index.css'
import './global.css'
import AnalysisResultCE from './AnalysisResult.ce.vue'
export { createAnalysisSDK } from './sdk'
export { default as AnalysisWidget } from './AnalysisWidget.vue'
export const AnalysisPlugin = { install(app: App) { app.component('AnalysisWidget', AnalysisWidget) } }

export const AnalysisResultElement = defineCustomElement(AnalysisResultCE as any)

export function registerAnalysisElement() {
  if (!customElements.get('analysis-result')) {
    customElements.define('analysis-result', AnalysisResultElement)
  }
}