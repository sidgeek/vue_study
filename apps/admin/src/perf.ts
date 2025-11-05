import type { Router } from 'vue-router'
import { onCLS, onFCP, onLCP, onINP, onTTFB } from 'web-vitals'

type MetricPayload = {
  name: string
  value: number
  id: string
  route?: string
  rating?: string
  userAgent?: string
  device?: string
  network?: string
  ts: number
}

function send(payload: MetricPayload) {
  const url = '/api/perf/report'
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon(url, blob)
  } else {
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
  }
}

export function initPerfReporting(router: Router) {
  const ua = navigator.userAgent
  const device = /Mobile|Android|iPhone/.test(ua) ? 'mobile' : 'desktop'
  const connection = (navigator as any).connection
  const network = connection?.effectiveType || 'unknown'

  const enrich = (m: { name: string; value: number; id: string; rating?: string }): MetricPayload => ({
    name: m.name,
    value: Number(m.value || 0),
    id: m.id,
    rating: m.rating,
    route: router.currentRoute.value.name?.toString(),
    userAgent: ua,
    device,
    network,
    ts: Date.now()
  })

  onCLS((m) => send(enrich(m)))
  onFCP((m) => send(enrich(m)))
  onLCP((m) => send(enrich(m)))
  onINP((m) => send(enrich(m)))
  onTTFB((m) => send(enrich(m)))

  // 路由耗时打点
  router.beforeEach(() => {
    performance.mark('route-start')
  })
  router.afterEach((to) => {
    performance.mark('route-end')
    try {
      performance.measure('route-change', 'route-start', 'route-end')
      const entry = performance.getEntriesByName('route-change').pop()
      if (entry) {
        send({
          name: 'ROUTE_CHANGE',
          value: entry.duration,
          id: `${Date.now()}`,
          route: to.name?.toString(),
          userAgent: ua,
          device,
          network,
          ts: Date.now()
        })
      }
      performance.clearMarks('route-start')
      performance.clearMarks('route-end')
      performance.clearMeasures('route-change')
    } catch {
      // ignore
    }
  })
}