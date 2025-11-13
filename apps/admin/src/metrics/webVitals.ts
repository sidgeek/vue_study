import type { Router } from 'vue-router'
import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import { METRICS } from './config'
import { ElNotification } from 'element-plus'
import { attachRouter, getNavigationContext } from './session'
import { BASE } from '@/apis/http'

type WebVitalMetric = Metric & {
  // 统一扩展，方便后端无需版本适配
  rating?: string
  attribution?: Record<string, any>
}

function send(payload: any) {
  if (!BASE) return
  const url = `${BASE}/metrics/webvitals`
  const body = JSON.stringify(payload)
  const canBeacon = typeof navigator !== 'undefined' && !!navigator.sendBeacon && !import.meta.env.DEV
  if (canBeacon) {
    const ok = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
    if (ok) return
  }
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

    // 前端本地 UI 告警（仅在采样命中且出现明显问题时提示一次）
    try {
      const r = String(metric.rating || '').toLowerCase()
      const name = metric.name
      const v = metric.value
      const severe =
        (name === 'LCP' && (r === 'poor' || v >= 4000)) ||
        (name === 'INP' && (r === 'poor' || v >= 500)) ||
        (name === 'CLS' && (r === 'poor' || v >= 0.25))
      if (severe) {
        const pretty = name === 'CLS' ? v.toFixed(3) : `${(v / 1000).toFixed(2)}s`
        ElNotification({
          title: `性能告警 · ${name}`,
          message: `检测到 ${name} 异常：${pretty}（rating=${r || 'n/a'}）` ,
          type: 'error',
          duration: 8000,
        })
      }
    } catch {}
  }

  const opts: any = { reportAllChanges: true }
  onTTFB(handle)
  onLCP(handle, opts)
  onCLS(handle, opts)
  onINP(handle, opts)
}