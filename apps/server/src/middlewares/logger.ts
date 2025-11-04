import type { Context, Next } from 'koa'

function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj
  const maskKeys = new Set(['password', 'pwd', 'token', 'authorization'])
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (maskKeys.has(k.toLowerCase())) {
      out[k] = '***'
    } else if (v && typeof v === 'object') {
      out[k] = sanitize(v)
    } else {
      out[k] = v
    }
  }
  return out
}

export async function requestLogger(ctx: Context, next: Next) {
  const start = Date.now()
  try {
    await next()
  } finally {
    const ms = Date.now() - start
    const ip = ctx.ip
    const userId = (ctx.state.user?.sub as number) ?? '-'
    const query = sanitize(ctx.query)
    // body 由 koa-bodyparser 解析后可用，已在 index 中调整挂载顺序
    const body = sanitize((ctx.request as any).body)
    const safeQuery = query ? JSON.stringify(query) : '{}'
    const safeBody = body ? JSON.stringify(body) : '{}'
    console.log(
      `${ctx.method} ${ctx.path} ${ctx.status} ${ms}ms - ip:${ip} uid:${userId} query:${safeQuery} body:${safeBody}`
    )
  }
}