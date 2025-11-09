import { getJson } from '@/apis/http'

export type WebVitalMetricName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB' | 'DEBUG_INIT'

export type WebVitalMetric = {
  name: WebVitalMetricName
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  id?: string
  delta?: number
  attribution?: Record<string, unknown>
}

export type WebVitalRecord = {
  ts: number
  appId: string
  sessionId: string
  navigationId: number
  route?: string | null
  viewport?: unknown
  connection?: unknown
  metrics: WebVitalMetric[]
}

export type RecentResponse = { items: WebVitalRecord[]; total: number }

export async function getRecentWebVitals(limit = 200): Promise<RecentResponse> {
  const q = new URLSearchParams({ limit: String(limit) })
  return getJson<RecentResponse>(`/metrics/webvitals/recent?${q.toString()}`)
}