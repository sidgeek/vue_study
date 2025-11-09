import { computed, ref, type Ref } from 'vue'
import type { MetricKey } from '@/hooks/useWebVitalsFeed'

type SummaryLike = { p50: number; p75: number; p95: number; count: number }

export type Trend = { direction: 'up' | 'down' | 'flat'; delta: number }

function thresholdFor(name: MetricKey): number {
  // useWebVitalsFeed 中已将数值统一为秒；CLS 为无单位
  if (name === 'CLS') return 0.005
  return 0.05
}

export function useWebVitalsTrend(statsRef: Ref<Record<MetricKey, SummaryLike>>) {
  const prev = ref<Record<MetricKey, number>>({ CLS: 0, FCP: 0, INP: 0, LCP: 0, TTFB: 0 })

  const trend = computed<Record<MetricKey, Trend>>(() => {
    const out: Record<MetricKey, Trend> = {
      CLS: { direction: 'flat', delta: 0 },
      FCP: { direction: 'flat', delta: 0 },
      INP: { direction: 'flat', delta: 0 },
      LCP: { direction: 'flat', delta: 0 },
      TTFB: { direction: 'flat', delta: 0 }
    }
    const curr = statsRef.value
    ;(Object.keys(curr) as MetricKey[]).forEach((k) => {
      const delta = (curr[k]?.p50 || 0) - (prev.value[k] || 0)
      const th = thresholdFor(k)
      out[k] = {
        direction: Math.abs(delta) < th ? 'flat' : delta > 0 ? 'up' : 'down',
        delta
      }
    })
    // 更新 prev 为当前值，供下一次比较
    ;(Object.keys(curr) as MetricKey[]).forEach((k) => { prev.value[k] = curr[k]?.p50 || 0 })
    return out
  })

  return { trend }
}