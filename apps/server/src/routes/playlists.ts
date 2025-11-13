import Router from '@koa/router'
import type { PrismaClient } from '@prisma/client'
import { signUrl } from '../services/cos'

export function buildPlaylistsRouter(prisma: PrismaClient) {
  const r = new Router()

  r.get('/', async (ctx) => {
    const items = await prisma.playlist.findMany({ orderBy: { createdAt: 'desc' } })
    ctx.body = { items }
  })

  r.get('/:code', async (ctx) => {
    const code = String(ctx.params.code)
    const p = await prisma.playlist.findUnique({ where: { code } })
    if (!p) {
      ctx.status = 404
      ctx.body = { message: 'playlist not found' }
      return
    }
    const rels = await prisma.playlistItem.findMany({ where: { playlistId: p.id }, orderBy: { order: 'asc' } })
    const songIds = rels.map((x) => x.songId)
    const songs = await prisma.song.findMany({ where: { id: { in: songIds } } })
    const map = new Map(songs.map((s) => [s.id, s]))
    const items = rels.map((rel) => {
      const s = map.get(rel.songId)!
      return { key: s.key, name: s.name, size: s.size, lastModified: s.lastModified ? s.lastModified.toISOString() : '', url: '' }
    })
    const urls = await Promise.all(items.map((x) => signUrl(x.key)))
    for (let i = 0; i < items.length; i++) items[i].url = urls[i] || ''
    ctx.body = { playlist: { code: p.code, name: p.name, description: p.description ?? null }, items }
  })

  return r
}