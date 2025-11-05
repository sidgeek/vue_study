import Router from '@koa/router'
import type { PerfRepo } from '../repos/PerfRepo'

export function buildPerfRouter(repo: PerfRepo) {
  const router = new Router()

  router.post('/report', async (ctx) => {
    const body = ctx.request.body as any
    if (!body || !body.name || typeof body.value !== 'number') {
      ctx.status = 400
      ctx.body = { message: 'Invalid payload' }
      return
    }
    await repo.insert({
      name: body.name,
      value: Number(body.value),
      rating: body.rating,
      route: body.route,
      userAgent: body.userAgent,
      device: body.device,
      network: body.network,
      ts: body.ts || Date.now()
    })
    ctx.body = { ok: true }
  })

  router.get('/stats', async (ctx) => {
    const { route, from, to } = ctx.query
    const stats = await repo.stats({
      route: route?.toString(),
      from: from ? Number(from) : undefined,
      to: to ? Number(to) : undefined
    })
    ctx.body = stats
  })

  return router
}