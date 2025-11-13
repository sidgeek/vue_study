const RAW_BASE = import.meta.env.VITE_API_BASE as string | undefined

const BASE = RAW_BASE
  ? (RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE.replace(/\/$/, '')}/api`)
  : ''

async function request(path: string, init: RequestInit = {}) {
  if (!BASE) throw new Error('API base is not configured')
  const url = `${BASE}${path}`
  const headers = new Headers(init.headers || {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  // 自动附加 Authorization 令牌（若已登录）
  try {
    const raw = localStorage.getItem('auth')
    if (raw) {
      const data = JSON.parse(raw)
      const token = data?.token
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }
  } catch {}
  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${res.status}`
    throw new Error(message)
  }
  return data
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export function getJson<T>(path: string): Promise<T> {
  return request(path, { method: 'GET' })
}

export { BASE }