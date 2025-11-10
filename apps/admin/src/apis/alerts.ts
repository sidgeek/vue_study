import { getJson } from '@/apis/http'

export type AlertRecord = {
  ts: number
  appId: string
  sessionId: string
  navigationId: number
  route?: any
  metric: 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP' | string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor' | string
  severity: 'warn' | 'error'
  message: string
}

export type RecentAlertsResponse = { items: AlertRecord[]; total: number }

export async function getRecentAlerts(limit = 50): Promise<RecentAlertsResponse> {
  const q = new URLSearchParams({ limit: String(limit) })
  return getJson<RecentAlertsResponse>(`/metrics/webvitals/alerts/recent?${q.toString()}`)
}