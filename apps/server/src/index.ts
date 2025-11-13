import Koa from 'koa'
import Router from '@koa/router'
import koaBody from 'koa-body'
import cors from '@koa/cors'
import { env } from './config/env'
import { buildAuthRouter } from './routes/auth'
import { verifyJwt } from './middlewares/auth'
import { requestLogger } from './middlewares/logger'
import { createUserRepo } from './datasource/factory'
import { openapi } from './config/openapi'
import { koaSwagger } from 'koa2-swagger-ui'
import { ensureDefaultRoles } from './config/roles'
import * as path from 'path'
import { appendFile, mkdir, readFile } from 'fs/promises'
import { buildSongsRouter } from './routes/songs'
import { buildPlaylistsRouter } from './routes/playlists'
import { ensureDefaultPlaylists } from './config/playlists'

const app = new Koa()
const router = new Router({ prefix: '/api' })
// 使用异步 bootstrap 初始化数据源与路由，避免顶层 await
async function bootstrap() {
  const { repo, prisma } = await createUserRepo()

  console.log('[boot] COS env id=%s key=%s bucket=%s region=%s prefix=%s', env.COS_SECRET_ID.slice(10), env.COS_SECRET_KEY.slice(10), env.COS_BUCKET || '(missing)', env.COS_REGION || '(missing)', env.COS_SONGS_PREFIX || '(empty)')

app.use(cors())
app.use(
  koaBody({
    multipart: true,
    urlencoded: true,
    json: true
  })
)

// 在解析完 body 后挂载日志，确保能记录请求体
app.use(requestLogger)

// 基础健康检查
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok ya ya ya' }
})

// OpenAPI 文档 JSON
router.get('/openapi.json', (ctx) => {
  ctx.body = openapi
})

// 认证路由
const auth = buildAuthRouter(repo, env.JWT_SECRET, prisma)
router.use('/auth', auth.routes(), auth.allowedMethods())

// const songs = buildSongsRouter()
// router.use('/songs', songs.routes(), songs.allowedMethods())
const playlists = buildPlaylistsRouter(prisma)
router.use('/playlists', playlists.routes(), playlists.allowedMethods())

// 示例受保护路由
router.get('/me', verifyJwt, async (ctx) => {
  const userId = (ctx.state.user?.sub as number) || 0
  const user = await repo.findById(userId)
  if (!user) {
    ctx.status = 404
    ctx.body = { message: 'User not found' }
    return
  }
  // 查询角色代码（若 Role 模型可用）
  let roleCode: string | null = null
  const roleModel = (prisma as any)?.role
  if (roleModel && typeof roleModel.findUnique === 'function') {
    try {
      const r = await roleModel.findUnique({ where: { id: (user as any).roleId } })
      roleCode = (r && r.code) || null
    } catch {}
  }
  // 仅返回非敏感信息，并将 name 统一为 nickname
  ctx.body = {
    id: user.id,
    username: user.username,
    nickname: user.nickname ?? null,
    roleId: (user as any).roleId,
    roleCode: roleCode || 'VISITOR'
  }
})

// 简单角色校验中间件：要求用户具备任一指定角色代码
function requireRoleCodes(codes: string[]) {
  return async (ctx: any, next: any) => {
    const userId = Number(ctx.state.user?.sub || 0)
    if (!userId) {
      ctx.status = 401
      ctx.body = { message: '未授权' }
      return
    }
    const user = await repo.findById(userId)
    if (!user) {
      ctx.status = 401
      ctx.body = { message: '未授权' }
      return
    }
    const roleModel = (prisma as any)?.role
    let code: string | null = null
    if (roleModel && typeof roleModel.findUnique === 'function') {
      try {
        const r = await roleModel.findUnique({ where: { id: (user as any).roleId } })
        code = (r && r.code) || null
      } catch {}
    }
    if (!code || !codes.includes(code)) {
      ctx.status = 403
      ctx.body = { message: '禁止访问：需要管理员权限' }
      return
    }
    return next()
  }
}

// 用户列表（分页）
router.get('/users', verifyJwt, requireRoleCodes(['ADMIN', 'SUPER_ADMIN']), async (ctx) => {
  const page = Number(ctx.query.page ?? 1)
  const pageSize = Number(ctx.query.pageSize ?? 10)
  const username = String(ctx.query.username || '').trim() || undefined
  const { items, total } = await repo.list({ page, pageSize, username })
  const safeItems = items.map((u) => ({ id: u.id, username: u.username, nickname: (u as any).nickname ?? (u as any).name ?? null, roleId: (u as any).roleId }))
  ctx.body = {
    items: safeItems,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / Math.max(1, pageSize))
  }
})

// 告警评估：按照 Core Web Vitals 推荐阈值生成告警
type WebVitalMetric = { name: string; value: number; rating?: string; id?: string }
type WebVitalRecord = { ts: number; appId: string; sessionId: string; navigationId: number; route?: any; metrics: WebVitalMetric[] }
type AlertRecord = {
  ts: number
  appId: string
  sessionId: string
  navigationId: number
  route: any
  metric: string
  value: number
  rating?: string
  severity: 'warn' | 'error'
  message: string
}

function evaluateAlerts(record: WebVitalRecord): AlertRecord[] {
  const out: AlertRecord[] = []
  for (const m of record.metrics) {
    const name = m.name as string
    const rating = (m.rating || '').toLowerCase()
    const value = Number(m.value)
    let triggered = false
    let severity: 'warn' | 'error' = 'warn'
    switch (name) {
      case 'LCP':
        triggered = value >= env.ALERT_LCP_POOR_MS || rating === 'poor'
        severity = rating === 'poor' || value >= env.ALERT_LCP_POOR_MS ? 'error' : 'warn'
        break
      case 'INP':
        triggered = value >= env.ALERT_INP_POOR_MS || rating === 'poor'
        severity = rating === 'poor' || value >= env.ALERT_INP_POOR_MS ? 'error' : 'warn'
        break
      case 'CLS':
        triggered = value >= env.ALERT_CLS_POOR || rating === 'poor'
        severity = rating === 'poor' || value >= env.ALERT_CLS_POOR ? 'error' : 'warn'
        break
      case 'TTFB':
        triggered = value >= env.ALERT_TTFB_POOR_MS
        severity = value >= env.ALERT_TTFB_POOR_MS ? 'warn' : 'warn'
        break
      case 'FCP':
        triggered = value >= env.ALERT_FCP_POOR_MS
        severity = value >= env.ALERT_FCP_POOR_MS ? 'warn' : 'warn'
        break
      default:
        triggered = false
    }
    if (triggered) {
      const routeStr = record.route && (record.route.path || record.route.name) || null
      const msg = `[${name}] ${formatMetric(name, value)} · rating=${rating || 'n/a'} · route=${routeStr || '—'} · session=${record.sessionId}`
      out.push({
        ts: record.ts,
        appId: record.appId,
        sessionId: record.sessionId,
        navigationId: record.navigationId,
        route: record.route || null,
        metric: name,
        value,
        rating,
        severity,
        message: msg
      })
    }
  }
  return out
}

function formatMetric(name: string, value: number) {
  if (name === 'CLS') return value.toFixed(3)
  // 其余均为毫秒
  return `${(value / 1000).toFixed(2)}s`
}

async function notifyWebhook(alert: AlertRecord) {
  if (!env.ALERT_WEBHOOK_URL) return
  // 兼容 Slack/飞书等入站 webhook，一般接受 {text} 即可
  const text = `性能告警(${alert.severity}): ${alert.message}`
  await (globalThis as any).fetch(env.ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  }).catch(() => void 0)
}

// Web Vitals 指标采集上报入口（无鉴权）
router.post('/metrics/webvitals', async (ctx) => {
  const body = (ctx.request as any).body || {}
  const metrics = Array.isArray(body?.metrics) ? body.metrics : null
  const appId = String(body?.appId || '')
  const sessionId = String(body?.sessionId || '')
  if (!metrics || !appId || !sessionId) {
    ctx.status = 400
    ctx.body = { message: 'invalid payload' }
    return
  }

  const record = {
    ts: Date.now(),
    appId,
    sessionId,
    navigationId: Number(body?.navigationId || 0),
    route: body?.route || null,
    viewport: body?.viewport || null,
    connection: body?.connection || null,
    metrics
  }

  try {
    const dir = path.resolve(process.cwd(), 'data')
    await mkdir(dir, { recursive: true })
    const file = path.join(dir, 'web-vitals.log')
    await appendFile(file, JSON.stringify(record) + '\n')

    // 评估告警并持久化、通知
    const alerts = evaluateAlerts(record)
    if (alerts.length) {
      const afile = path.join(dir, 'web-vitals-alerts.log')
      for (const a of alerts) {
        await appendFile(afile, JSON.stringify(a) + '\n')
        notifyWebhook(a).catch((err) => console.warn('Webhook notify failed:', err?.message || err))
      }
    }
    ctx.status = 204
  } catch (err: any) {
    console.error('Write web-vitals failed:', err)
    ctx.status = 500
    ctx.body = { message: 'persist failed' }
  }
})

// 获取最近的 Web Vitals 记录（轻量查询，无鉴权）
router.get('/metrics/webvitals/recent', async (ctx) => {
  const limit = Math.max(1, Math.min(500, Number(ctx.query.limit ?? 200)))
  try {
    const dir = path.resolve(process.cwd(), 'data')
    const file = path.join(dir, 'web-vitals.log')
    const content = await readFile(file, 'utf-8')
    const lines = content.split('\n').filter((l) => l.trim().length > 0)
    const slice = lines.slice(Math.max(0, lines.length - limit))
    const items = slice.map((l) => {
      try { return JSON.parse(l) } catch { return null }
    }).filter(Boolean)
    ctx.body = { items, total: lines.length }
  } catch (err) {
    // 文件不存在或读取失败时返回空集
    ctx.body = { items: [], total: 0 }
  }
})

// 获取最近的告警记录（轻量查询，无鉴权）
router.get('/metrics/webvitals/alerts/recent', async (ctx) => {
  const limit = Math.max(1, Math.min(200, Number(ctx.query.limit ?? 50)))
  try {
    const dir = path.resolve(process.cwd(), 'data')
    const file = path.join(dir, 'web-vitals-alerts.log')
    const content = await readFile(file, 'utf-8')
    const lines = content.split('\n').filter((l) => l.trim().length > 0)
    const slice = lines.slice(Math.max(0, lines.length - limit))
    const items = slice.map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    ctx.body = { items, total: lines.length }
  } catch (err) {
    ctx.body = { items: [], total: 0 }
  }
})

// 为用户分配角色（简单版）
router.post('/users/:id/role', verifyJwt, requireRoleCodes(['ADMIN', 'SUPER_ADMIN']), async (ctx) => {
  const id = Number(ctx.params.id)
  const { roleId, roleCode } = (ctx.request as any).body || {}
  let targetRoleId = Number(roleId) || 0
  // 兼容 PrismaClient 尚未生成 Role 类型的情况
  const roleModel = (prisma as any)?.role
  if (!targetRoleId && roleCode && roleModel && typeof roleModel.findUnique === 'function') {
    const r = await roleModel.findUnique({ where: { code: String(roleCode) } })
    targetRoleId = r?.id || 0
  }
  if (!targetRoleId) {
    ctx.status = 400
    ctx.body = { message: 'roleId 或 roleCode 必须提供且有效' }
    return
  }

  try {
    const user = await repo.updateRole(id, targetRoleId)
    ctx.body = { id: user.id, username: user.username, nickname: (user as any).nickname ?? (user as any).name ?? null, roleId: (user as any).roleId }
  } catch (e: any) {
    ctx.status = 400
    ctx.body = { message: e?.message || '更新角色失败' }
  }
})

  app.use(router.routes()).use(router.allowedMethods())

// Swagger UI 挂载在 /api/docs
app.use(
  koaSwagger({
    routePrefix: '/api/docs',
    swaggerOptions: {
      url: '/api/openapi.json'
    }
  })
)

  app.on('error', (err) => {
    console.error('Unhandled error', err)
  })

// 确保 Prisma 模式下默认角色存在
  ensureDefaultRoles(prisma).catch((err) => console.error('Ensure roles failed', err))
  ensureDefaultPlaylists(prisma).catch((err) => console.error('Ensure playlists failed', err))

  app.listen(env.PORT, () => {
    console.log(`API server listening on http://localhost:${env.PORT}`)
  })

// 可选：优雅关闭（仅当使用 Prisma）
  process.on('SIGINT', async () => {
    if (prisma) {
      await prisma.$disconnect()
    }
    process.exit(0)
  })
}

bootstrap().catch((err) => {
  console.error('Server bootstrap failed:', err)
})