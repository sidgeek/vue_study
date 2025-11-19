import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import AnalysisWidget from './AnalysisWidget.vue'

export type AnalysisItem = { label: string; value: string | number }
export type AnalysisProps = { title: string; items: AnalysisItem[] }

export type AnalysisSDK = {
  mount: (container: HTMLElement, props: AnalysisProps) => { unmount: () => void }
  on: (event: 'action', handler: (p: { source: string }) => void) => void
  off: (event: 'action', handler: (p: { source: string }) => void) => void
}

export function createAnalysisSDK(): AnalysisSDK {
  const listeners = new Set<(p: { source: string }) => void>()
  return {
    mount(container, props) {
      const Root = { render() { return h(AnalysisWidget, { ...props, onAction: (p: { source: string }) => { for (const hnd of listeners) hnd(p) } }) } }
      const app = createApp(Root)
      app.use(ElementPlus)
      app.mount(container)
      return { unmount() { app.unmount() } }
    },
    on(event, handler) {
      if (event === 'action') listeners.add(handler)
    },
    off(event, handler) {
      if (event === 'action') listeners.delete(handler)
    }
  }
}