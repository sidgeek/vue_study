import type { Router } from 'vue-router'
import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import { METRICS } from './config'
import { attachRouter, getNavigationContext } from './session'
import { BASE } from '@/apis/http'

type WebVitalMetric = Metric & {
  // 统一扩展，方便后端无需版本适配
  rating?: string
  attribution?: Record<string, any>
}

function send(payload: any) {
  const url = `${BASE}/metrics/webvitals`
  const body = JSON.stringify(payload)
  // 开发环境优先使用 fetch，避免某些浏览器对跨域 sendBeacon 的限制
  const canBeacon = typeof navigator !== 'undefined' && !!navigator.sendBeacon && !import.meta.env.DEV
  if (canBeacon) {
    const ok = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
    if (ok) return
  }
  // 使用 fetch，上报失败不抛错
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => void 0)
}

export function initWebVitalsCollector(router: Router) {
  // 采样：降低对业务的影响
  if (Math.random() > METRICS.sampleRate) return

  attachRouter(router)
  const { nav, viewport, connection } = getNavigationContext()

  const common = { appId: METRICS.appId, sessionId: nav.sessionId, navigationId: nav.navigationId, route: { name: nav.routeName, path: nav.path }, viewport, connection }

  const buffer: WebVitalMetric[] = []
  const flush = () => {
    if (!buffer.length) return
    send({ ...common, metrics: buffer.splice(0, buffer.length) })
  }

  const handle = (m: Metric) => {
    const metric: WebVitalMetric = {
      name: m.name,
      id: m.id,
      value: m.value,
      delta: m.delta,
      rating: (m as any).rating,
      navigationType: (m as any).navigationType,
      entries: m.entries,
      attribution: (m as any).attribution
    }
    buffer.push(metric)
    // 简单聚合：若多指标一起到达，则微队列合并一批
    queueMicrotask(flush)
  }

  const opts: any = { reportAllChanges: true }
  onTTFB(handle)
  onLCP(handle, opts)
  onCLS(handle, opts)
  onINP(handle, opts)
}