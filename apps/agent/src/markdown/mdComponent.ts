import { createApp, defineCustomElement, h } from 'vue'

export type MdComponentRenderer = (host: HTMLElement, tag: string, props: Record<string, any>) => { unmount: () => void }

export function createDefaultRenderer(): MdComponentRenderer {
  return (host, tag, props) => {
    // 原生或已注册的自定义元素：通过属性传递
    const el = document.createElement(tag)
    for (const [k, v] of Object.entries(props)) el.setAttribute(k, typeof v === 'string' ? v : JSON.stringify(v))
    host.appendChild(el)
    return { unmount: () => { host.innerHTML = '' } }
  }
}

export function createVueRenderer(Comp: any): MdComponentRenderer {
  return (host, _tag, props) => {
    const app = createApp({ render: () => h(Comp, props) })
    app.mount(host)
    return { unmount: () => app.unmount() }
  }
}

// 如需 React 渲染器，可在使用处按需实现并传入 createReactRenderer 的等价函数

const mdRenderers = new Map<string, MdComponentRenderer>()

export function registerMdRenderer(tag: string, renderer: MdComponentRenderer) {
  mdRenderers.set(tag, renderer)
}

export class MdComponentElement extends HTMLElement {
  static get observedAttributes() { return ['name', 'props'] }
  #renderer: MdComponentRenderer
  #name = ''
  #props: Record<string, any> = {}

  constructor(renderer?: MdComponentRenderer) {
    super()
    this.#renderer = renderer || createDefaultRenderer()
  }

  connectedCallback() { this.#render() }
  disconnectedCallback() { this.innerHTML = '' }
  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'name') this.#name = value || ''
    if (name === 'props') {
      const raw = String(value || '{}')
      try { this.#props = JSON.parse(raw) } catch { this.#props = {} }
    }
    this.#render()
  }

  #render() {
    if (!this.isConnected || !this.#name) return
    this.innerHTML = ''
    const r = mdRenderers.get(this.#name) || this.#renderer
    r(this, this.#name, this.#props)
  }
}

export function registerMdComponent(renderer?: MdComponentRenderer) {
  if (!customElements.get('md-component')) {
    customElements.define('md-component', class extends MdComponentElement { constructor() { super(renderer) } })
  }
}