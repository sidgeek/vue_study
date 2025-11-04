const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api'

async function request(path: string, init: RequestInit = {}) {
  const url = `${BASE}${path}`
  const headers = new Headers(init.headers || {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
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