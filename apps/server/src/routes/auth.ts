import Router from '@koa/router'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { UserRepo } from '../repos/UserRepo'
import type { PrismaClient } from '@prisma/client'

export function buildAuthRouter(repo: UserRepo, jwtSecret: string, prisma?: PrismaClient) {
  const router = new Router()

  async function getRoleCodeByUserId(userId: number): Promise<string | null> {
    if (!prisma) return null
    try {
      const u = await (prisma as any).user.findUnique({ where: { id: userId }, include: { role: true } })
      return (u && (u as any).role && (u as any).role.code) || null
    } catch {
      return null
    }
  }

  // 注册
  router.post('/register', async (ctx) => {
    const { username, password } = ctx.request.body as {
      username?: string
      password?: string
    }
    if (!username || !password) {
      ctx.status = 400
      ctx.body = { message: 'username 和 password 必填' }
      return
    }

    const exists = await repo.findByUsername(username)
    if (exists) {
      ctx.status = 409
      ctx.body = { message: '用户名已存在' }
      return
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const user = await repo.create({ username, passwordHash, nickname: username })
    const roleCode = await getRoleCodeByUserId(user.id)
    ctx.body = { id: user.id, username: user.username, nickname: user.nickname, roleId: (user as any).roleId, roleCode: roleCode || 'VISITOR' }
  })

  // 登录
  router.post('/login', async (ctx) => {
    const { username, password } = ctx.request.body as {
      username?: string
      password?: string
    }
    if (!username || !password) {
      ctx.status = 400
      ctx.body = { message: 'username 和 password 必填' }
      return
    }

    const user = await repo.findByUsername(username)
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      ctx.status = 401
      ctx.body = { message: '用户名或密码错误' }
      return
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    )
    const roleCode = await getRoleCodeByUserId(user.id)
    ctx.body = {
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, roleId: (user as any).roleId, roleCode: roleCode || 'VISITOR' }
    }
  })

  return router
}