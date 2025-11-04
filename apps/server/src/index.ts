import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { env } from './config/env'
import { buildAuthRouter } from './routes/auth'
import { verifyJwt } from './middlewares/auth'
import { createUserRepo } from './datasource/factory'
import { openapi } from './config/openapi'
import { koaSwagger } from 'koa2-swagger-ui'

const app = new Koa()
const router = new Router({ prefix: '/api' })
const { repo, prisma } = createUserRepo()

app.use(cors())
app.use(bodyParser())

// 基础健康检查
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok' }
})

// OpenAPI 文档 JSON
router.get('/openapi.json', (ctx) => {
  ctx.body = openapi
})

// 认证路由
const auth = buildAuthRouter(repo, env.JWT_SECRET)
router.use('/auth', auth.routes(), auth.allowedMethods())

// 示例受保护路由
router.get('/me', verifyJwt, async (ctx) => {
  const userId = (ctx.state.user?.sub as number) || 0
  const user = await repo.findById(userId)
  if (!user) {
    ctx.status = 404
    ctx.body = { message: 'User not found' }
    return
  }
  // 仅返回非敏感信息，并将 name 统一为 nickname
  ctx.body = { id: user.id, username: user.username, nickname: user.nickname ?? null }
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