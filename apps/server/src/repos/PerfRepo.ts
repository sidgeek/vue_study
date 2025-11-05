export interface PerfEvent {
  id?: number
  name: string
  value: number
  rating?: string
  route?: string
  userAgent?: string
  device?: string
  network?: string
  ts: number
}

export interface PerfRepo {
  insert(event: PerfEvent): Promise<void>
  stats(opts?: { route?: string; from?: number; to?: number }): Promise<{
    count: number
    latestTs?: number
  }>
}