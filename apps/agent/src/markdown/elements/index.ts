import { defineCustomElement } from 'vue'
import DatasetCard from '../cards/DatasetCard.vue'
import DashboardCard from '../cards/DashboardCard.vue'

export const DatasetCardElement = defineCustomElement(DatasetCard as any)
export const DashboardCardElement = defineCustomElement(DashboardCard as any)

export function registerMarkdownElements() {
  if (!customElements.get('dataset-card')) {
    customElements.define('dataset-card', DatasetCardElement)
  }
  if (!customElements.get('dashboard-card')) {
    customElements.define('dashboard-card', DashboardCardElement)
  }
}