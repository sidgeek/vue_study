import type { App } from 'vue'
import { createApp, h } from 'vue'
import AnalysisWidget from './AnalysisWidget.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
export { createAnalysisSDK } from './sdk'
export { default as AnalysisWidget } from './AnalysisWidget.vue'
export const AnalysisPlugin = { install(app: App) { app.component('AnalysisWidget', AnalysisWidget) } }

export class AnalysisResultElement extends HTMLElement {
  private _app: any
  private _mountEl: HTMLDivElement | null = null
  static get observedAttributes() { return ['title','items','interactive'] }
  connectedCallback() {
    if (this._app) return
    this._mountEl = document.createElement('div')
    this.appendChild(this._mountEl)
    const title = this.getAttribute('title') || ''
    const interactiveAttr = this.getAttribute('interactive')
    const interactive = interactiveAttr == null ? true : !['false','0','no'].includes(String(interactiveAttr).toLowerCase())
    let items: any[] = []
    const raw = this.getAttribute('items') || '[]'
    try { const v = JSON.parse(raw.replace(/&#39;/g, "'")); items = Array.isArray(v) ? v : [] } catch { items = [] }
    const Root = { render() { return h(AnalysisWidget, { title, items, interactive }) } }
    this._app = createApp(Root)
    this._app.use(ElementPlus)
    this._app.mount(this._mountEl!)
  }
  disconnectedCallback() {
    try { this._app?.unmount() } catch {}
    this._app = null
    if (this._mountEl) { try { this.removeChild(this._mountEl) } catch {} this._mountEl = null }
  }
}

export function registerAnalysisElement() {
  if (!customElements.get('analysis-result')) {
    customElements.define('analysis-result', AnalysisResultElement)
  }
}