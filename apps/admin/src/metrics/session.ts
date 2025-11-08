import type { Router } from 'vue-router'

const SESSION_KEY = 'metrics_session_id'

let sessionId: string | null = null
let navigationId = 0
let routeName: string | null = null
let routePath: string | null = null

export function getSessionId(): string {
  if (sessionId) return sessionId
  const cached = localStorage.getItem(SESSION_KEY)
  if (cached) {
    sessionId = cached
    return sessionId
  }
  sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem(SESSION_KEY, sessionId)
  return sessionId
}

export function attachRouter(router: Router) {
  // 初始化当前路由上下文
  const r = router.currentRoute.value
  routeName = (r.name as string) || null
  routePath = r.path || null
  navigationId = 1

  router.afterEach((to) => {
    navigationId += 1
    routeName = (to.name as string) || null
    routePath = to.path || null
  })
}

export function getNavigationContext() {
  const nav = {
    sessionId: getSessionId(),
    navigationId,
    routeName,
    path: routePath,
  }
  const viewport = { w: window.innerWidth || 0, h: window.innerHeight || 0 }
  const conn: any = (navigator as any).connection || null
  const connection = conn
    ? { type: String(conn.effectiveType || conn.type || ''), rtt: Number(conn.rtt || 0), downlink: Number(conn.downlink || 0) }
    : undefined
  return { nav, viewport, connection }
}