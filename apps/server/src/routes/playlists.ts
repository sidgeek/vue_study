import Router from '@koa/router'
import type { PrismaClient } from '@prisma/client'
import { signUrl, listSongs } from '../services/cos'
import { verifyJwt } from '../middlewares/auth'

export function buildPlaylistsRouter(prisma: PrismaClient) {
  const r = new Router()

  async function requireAdmin(ctx: any, next: any) {
    const userId = Number(ctx.state.user?.sub || 0)
    if (!userId) {
      ctx.status = 401
      ctx.body = { message: '未授权' }
      return
    }
    const user = await (prisma as any).user.findUnique({ where: { id: userId } })
    if (!user) {
      ctx.status = 401
      ctx.body = { message: '未授权' }
      return
    }
    const role = await (prisma as any).role.findUnique({ where: { id: (user as any).roleId } })
    const code = (role && role.code) || null
    if (!code || !['ADMIN','SUPER_ADMIN'].includes(code)) {
      ctx.status = 403
      ctx.body = { message: '禁止访问：需要管理员权限' }
      return
    }
    return next()
  }

  r.get('/', async (ctx) => {
    const items = await prisma.playlist.findMany({ orderBy: { createdAt: 'desc' } })
    ctx.body = { items }
  })

  r.get('/scan', verifyJwt as any, requireAdmin, async (ctx) => {
    const limit = Number(ctx.query.limit || 0)
    const page = Math.max(1, Number(ctx.query.page || 1))
    const pageSize = Math.max(1, Number(ctx.query.pageSize || 10))
    const all = await listSongs()
    const scanned = limit > 0 ? all.slice(0, limit) : all
    for (const s of scanned) {
      const last = s.lastModified ? new Date(s.lastModified) : null
      await (prisma as any).song.upsert({
        where: { key: s.key },
        update: { name: s.name, size: s.size, lastModified: last },
        create: { key: s.key, name: s.name, size: s.size, lastModified: last }
      })
    }
    const start = (page - 1) * pageSize
    const items = scanned.slice(start, start + pageSize)
    ctx.body = { items, total: scanned.length, page, pageSize }
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

  r.post('/', verifyJwt as any, requireAdmin, async (ctx) => {
    const { code, name, description, keys } = (ctx.request as any).body || {}
    let c = String(code || '').trim()
    const n = String(name || '').trim()
    const d = description ? String(description) : undefined
    if (!c || !n) {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
      function gen(len: number) { let s = ''; for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random()*alphabet.length)]; return s }
      c = gen(8)
      for (let i = 0; i < 5; i++) {
        const exists = await prisma.playlist.findUnique({ where: { code: c } })
        if (!exists) break
        c = gen(8)
      }
    }
    const exists = await prisma.playlist.findUnique({ where: { code: c } })
    if (exists) {
      ctx.status = 409
      ctx.body = { message: '歌单 code 已存在' }
      return
    }
    const p = await prisma.playlist.create({ data: { code: c, name: n, description: d } })
    const arr: string[] = Array.isArray(keys) ? keys.map((x: any) => String(x)) : []
    if (arr.length) {
      const existing = await prisma.playlistItem.findMany({ where: { playlistId: p.id }, orderBy: { order: 'asc' } })
      let order = existing.length
      for (const key of arr) {
        const s = await prisma.song.findUnique({ where: { key } })
        if (!s) continue
        try { await prisma.playlistItem.create({ data: { playlistId: p.id, songId: s.id, order: order++ } }) } catch {}
      }
    }
    ctx.body = { playlist: { code: p.code, name: p.name, description: p.description ?? null } }
  })

  r.post('/:code/items', verifyJwt as any, requireAdmin, async (ctx) => {
    const code = String(ctx.params.code)
    const { keys } = (ctx.request as any).body || {}
    const arr: string[] = Array.isArray(keys) ? keys.map((x: any) => String(x)) : []
    if (!arr.length) {
      ctx.status = 400
      ctx.body = { message: 'keys 必须为非空数组' }
      return
    }
    const p = await prisma.playlist.findUnique({ where: { code } })
    if (!p) {
      ctx.status = 404
      ctx.body = { message: '歌单不存在' }
      return
    }
    const existing = await prisma.playlistItem.findMany({ where: { playlistId: p.id }, orderBy: { order: 'asc' } })
    let order = existing.length
    let inserted = 0
    for (const key of arr) {
      const s = await prisma.song.findUnique({ where: { key } })
      if (!s) continue
      try {
        await prisma.playlistItem.create({ data: { playlistId: p.id, songId: s.id, order: order++ } })
        inserted++
      } catch {}
    }
    ctx.body = { inserted, total: arr.length }
  })

  r.post('/:code/items/remove', verifyJwt as any, requireAdmin, async (ctx) => {
    const code = String(ctx.params.code)
    const { keys } = (ctx.request as any).body || {}
    const arr: string[] = Array.isArray(keys) ? keys.map((x: any) => String(x)) : []
    if (!arr.length) {
      ctx.status = 400
      ctx.body = { message: 'keys 必须为非空数组' }
      return
    }
    const p = await prisma.playlist.findUnique({ where: { code } })
    if (!p) {
      ctx.status = 404
      ctx.body = { message: '歌单不存在' }
      return
    }
    const songs = await prisma.song.findMany({ where: { key: { in: arr } } })
    const ids = songs.map((s) => s.id)
    await prisma.playlistItem.deleteMany({ where: { playlistId: p.id, songId: { in: ids } } })
    ctx.body = { removed: ids.length }
  })

  r.post('/:code/delete', verifyJwt as any, requireAdmin, async (ctx) => {
    const code = String(ctx.params.code)
    const p = await prisma.playlist.findUnique({ where: { code } })
    if (!p) {
      ctx.status = 404
      ctx.body = { message: '歌单不存在' }
      return
    }
    await prisma.playlistItem.deleteMany({ where: { playlistId: p.id } })
    await prisma.playlist.delete({ where: { id: p.id } })
    ctx.body = { success: true }
  })

  return r
}