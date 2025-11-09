import { onMounted, onUnmounted, ref, computed } from 'vue'
import { getRecentWebVitals, type WebVitalRecord, type WebVitalMetric } from '@/apis/metrics'

export type MetricKey = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB'

type Summary = { p50: number; p75: number; p95: number; count: number }

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length) - 1))
  // 某些情况下 TS 推断为可能 undefined，这里兜底为 0
  return sorted[idx] ?? 0
}

function summarize(values: number[]): Summary {
  const arr = values.slice().sort((a, b) => a - b)
  return {
    p50: percentile(arr, 50),
    p75: percentile(arr, 75),
    p95: percentile(arr, 95),
    count: arr.length
  }
}

function normalizeValue(name: string, value: number): number {
  // 采集库通常返回毫秒；CLS 为无单位。将毫秒转换为秒以便展示。
  if (name === 'CLS') return value
  return value / 1000
}

export function useWebVitalsFeed(pollMs = 2000, limit = 200) {
  const items = ref<WebVitalRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let timer: any = null

  async function fetchOnce() {
    try {
      loading.value = true
      const res = await getRecentWebVitals(limit)
      // 调试：打印最近记录数量与总量，便于确认后端返回
      if (typeof window !== 'undefined' && (window as any).console) {
        console.debug('[WebVitals] recent', { count: Array.isArray(res.items) ? res.items.length : 0, total: (res as any).total })
      }
      items.value = res.items
      error.value = null
    } catch (e: any) {
      error.value = e?.message || '加载失败'
    } finally {
      loading.value = false
    }
  }

  function start() {
    fetchOnce()
    timer = setInterval(fetchOnce, pollMs)
  }
  function stop() {
    if (timer) clearInterval(timer)
    timer = null
  }

  onMounted(start)
  onUnmounted(stop)

  const metricValues = computed<Record<MetricKey, number[]>>(() => {
    const acc: Record<MetricKey, number[]> = {
      CLS: [], FCP: [], INP: [], LCP: [], TTFB: []
    }
    for (const rec of items.value) {
      for (const m of rec.metrics) {
        if ((['CLS','FCP','INP','LCP','TTFB'] as string[]).includes(m.name)) {
          const key = m.name as MetricKey
          acc[key].push(normalizeValue(m.name, m.value))
        }
      }
    }
    return acc
  })

  const stats = computed<Record<MetricKey, Summary>>(() => {
    const out = {} as Record<MetricKey, Summary>
    const mv = metricValues.value
    if (typeof window !== 'undefined' && (window as any).console) {
      const counts = {
        CLS: mv.CLS.length, FCP: mv.FCP.length, INP: mv.INP.length, LCP: mv.LCP.length, TTFB: mv.TTFB.length
      }
      console.debug('[WebVitals] counts', counts)
    }
    ;(Object.keys(mv) as MetricKey[]).forEach((k) => {
      out[k] = summarize(mv[k])
    })
    return out
  })

  // 提供最近一次记录的路由与会话信息，辅助展示
  const latestContext = computed(() => {
    const last = items.value[items.value.length - 1]
    return last ? { route: last.route, navigationId: last.navigationId, sessionId: last.sessionId, ts: last.ts } : null
  })

  return { items, stats, loading, error, start, stop, latestContext }
}