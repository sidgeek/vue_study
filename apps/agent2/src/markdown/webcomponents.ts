import { defineCustomElement } from 'vue'
import DatasetCardCE from '@/markdown/cards/DatasetCard.ce.vue'
import DashboardCardCE from '@/markdown/cards/DashboardCard.ce.vue'
import { registerAnalysisElement } from '@analysis'

export const DatasetCardElement = defineCustomElement(DatasetCardCE as any)
export const DashboardCardElement = defineCustomElement(DashboardCardCE as any)

export function registerMarkdownWebComponents() {
  if (!customElements.get('dataset-card')) {
    customElements.define('dataset-card', DatasetCardElement)
  }
  if (!customElements.get('dashboard-card')) {
    customElements.define('dashboard-card', DashboardCardElement)
  }
  registerAnalysisElement()
}