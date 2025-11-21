import { defineCustomElement } from 'vue'
import DatasetCard from '../cards/DatasetCard.vue'
import DashboardCard from '../cards/DashboardCard.vue'
import { createVueRenderer, registerMdRenderer } from '../mdComponent'

export const DatasetCardElement = defineCustomElement(DatasetCard as any)
export const DashboardCardElement = defineCustomElement(DashboardCard as any)

export function registerMarkdownElements() {
  if (!customElements.get('dataset-card')) {
    customElements.define('dataset-card', DatasetCardElement)
  }
  if (!customElements.get('dashboard-card')) {
    customElements.define('dashboard-card', DashboardCardElement)
  }
  // 为 markdown 通用宿主注册特定标签的渲染器（用 Vue 直接挂载，样式不丢失）
  registerMdRenderer('dataset-card', createVueRenderer(DatasetCard))
  registerMdRenderer('dashboard-card', createVueRenderer(DashboardCard))
}