import { defineCustomElement } from 'vue'
import DatasetCardCE from '@/markdown/cards/DatasetCard.ce.vue'
import DashboardCardCE from '@/markdown/cards/DashboardCard.ce.vue'
import { registerAnalysisElement } from '@analysis'

export const registerCom: Record<string, any> = {
  'dataset-card': DatasetCardCE,
  'dashboard-card': DashboardCardCE
}

export type MarkdownWCConfig = {
  components?: Record<string, CustomElementConstructor | any>
  external?: Array<() => void>
}

function ensureCtor(comp: any): CustomElementConstructor {
  return typeof comp === 'function' ? (comp as CustomElementConstructor) : defineCustomElement(comp as any)
}

export function registerMarkdownWebComponents(config?: MarkdownWCConfig) {
  const map: Record<string, any> = { ...registerCom, ...(config?.components || {}) }
  for (const [tag, comp] of Object.entries(map)) {
    if (!customElements.get(tag)) {
      const ctor = ensureCtor(comp)
      customElements.define(tag, ctor)
    }
  }
  const externals = config?.external ?? [registerAnalysisElement]
  for (const fn of externals) {
    try { fn() } catch {}
  }
}