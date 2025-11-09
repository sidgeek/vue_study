import type { WebVitalRecord } from '@/apis/metrics'
import type { MetricKey } from '@/hooks/useWebVitalsFeed'

export type SeriesPoint = { ts: number; value: number; metric: MetricKey }

function normalizeValue(name: string, value: number): number {
  if (name === 'CLS') return value
  return value / 1000
}

export function buildSeries(items: WebVitalRecord[], metrics: MetricKey[]): SeriesPoint[] {
  const set = new Set(metrics)
  const out: SeriesPoint[] = []
  for (const rec of items) {
    for (const m of rec.metrics) {
      if (set.has(m.name as MetricKey)) {
        out.push({ ts: rec.ts, value: normalizeValue(m.name, m.value), metric: m.name as MetricKey })
      }
    }
  }
  // 按时间排序，保证折线顺序正确
  return out.sort((a, b) => a.ts - b.ts)
}