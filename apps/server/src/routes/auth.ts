import Router from '@koa/router'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { UserRepo } from '../repos/UserRepo'

export function buildAuthRouter(repo: UserRepo, jwtSecret: string) {
  const router = new Router()

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

    ctx.body = { id: user.id, username: user.username, nickname: user.nickname }
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
    ctx.body = {
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname }
    }
  })

  return router
}