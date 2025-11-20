import { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'

type Item = { label: string; value: string | number }
type Props = { title?: string; items: Item[] }

function ResultCard({ title, items }: Props) {
  const [stats, setStats] = useState(items)
  const next = useMemo(() => stats.map((it) => ({ ...it })), [stats])

  function mutate() {
    const updated = stats.map((it) => {
      if (String(it.label).includes('准确率')) return { ...it, value: `${Math.min(99, Math.max(80, Math.round(90 + Math.random() * 5)))}%` }
      if (String(it.label).includes('召回率')) return { ...it, value: `${Math.min(99, Math.max(80, Math.round(86 + Math.random() * 5)))}%` }
      if (String(it.label).includes('样本数')) return { ...it, value: (typeof it.value === 'number' ? it.value : parseInt(String(it.value) || '0', 10)) + 50 }
      if (String(it.label).includes('耗时')) return { ...it, value: `${Math.round(360 + Math.random() * 60)}ms` }
      return it
    })
    setStats(updated)
    const evt = new CustomEvent('action', { detail: { source: 'ReactResultCard', items: updated } })
    document.querySelector('react-analysis')?.dispatchEvent(evt)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {next.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>{it.label}</span>
            <span style={{ color: '#222', fontWeight: 500 }}>{it.value}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'right' }}>
        <button style={{ padding: '6px 12px' }} onClick={mutate}>操作</button>
      </div>
    </div>
  )
}

export function registerReactAnalysisElement() {
  if (customElements.get('react-analysis')) return

  class ReactAnalysisElement extends HTMLElement {
    static get observedAttributes() { return ['title', 'items'] }
    #root: ReactDOM.Root | null = null
    #props: Props = { title: '', items: [] }

    connectedCallback() { this.#mount() }
    disconnectedCallback() { this.#unmount() }
    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
      if (name === 'title') this.#props.title = value || ''
      if (name === 'items') {
        const raw = String(value || '[]')
        try { const v = JSON.parse(raw.replace(/&#39;/g, "'")); this.#props.items = Array.isArray(v) ? v : [] } catch { this.#props.items = [] }
      }
      this.#render()
    }

    #mount() {
      const shadow = this.attachShadow({ mode: 'open' })
      const host = document.createElement('div')
      const style = document.createElement('style')
      style.textContent = ':host{display:block} button{cursor:pointer}'
      shadow.append(style, host)
      this.#root = ReactDOM.createRoot(host)
      this.#render()
    }
    #render() { if (this.#root) this.#root.render(<ResultCard {...this.#props} />) }
    #unmount() { if (this.#root) { this.#root.unmount(); this.#root = null } }
  }

  customElements.define('react-analysis', ReactAnalysisElement)
}