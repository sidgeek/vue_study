import type { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export async function verifyJwt(ctx: Context, next: Next) {
  const auth = ctx.request.headers['authorization']
  if (!auth || !auth.startsWith('Bearer ')) {
    ctx.status = 401
    ctx.body = { message: 'Unauthorized' }
    return
  }

  const token = auth.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload
    const user = { sub: Number(payload.sub), username: String((payload as any).username) }
    ctx.state.user = user
    await next()
  } catch {
    ctx.status = 401
    ctx.body = { message: 'Invalid token' }
  }
}