import Router from '@koa/router'
import type { PrismaClient } from '@prisma/client'

export function buildSongsRouter(prisma: PrismaClient) {
  const r = new Router()

  r.get('/', async (ctx) => {
    const page = Math.max(1, Number(ctx.query.page || 1))
    const pageSize = Math.max(1, Number(ctx.query.pageSize || 10))
    const skip = (page - 1) * pageSize
    const [itemsDb, total] = await Promise.all([
      prisma.song.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.song.count()
    ])
    const items = itemsDb.map((s) => ({
      key: s.key,
      name: s.name,
      size: s.size,
      lastModified: s.lastModified ? s.lastModified.toISOString() : '',
      url: ''
    }))
    ctx.body = { items, total, page, pageSize }
  })

  return r
}