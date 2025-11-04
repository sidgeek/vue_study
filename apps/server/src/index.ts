import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { env } from './config/env'
import { buildAuthRouter } from './routes/auth'
import { verifyJwt } from './middlewares/auth'
import { createUserRepo } from './datasource/factory'

const app = new Koa()
const router = new Router({ prefix: '/api' })
const { repo, prisma } = createUserRepo()

app.use(cors())
app.use(bodyParser())

// 基础健康检查
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok' }
})

// 认证路由
const auth = buildAuthRouter(repo, env.JWT_SECRET)
router.use('/auth', auth.routes(), auth.allowedMethods())

// 示例受保护路由
router.get('/me', verifyJwt, async (ctx) => {
  const userId = (ctx.state.user?.sub as number) || 0
  const user = await repo.findById(userId)
  ctx.body = user
})

app.use(router.routes()).use(router.allowedMethods())

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