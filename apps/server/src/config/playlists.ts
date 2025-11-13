import type { PrismaClient } from '@prisma/client'
import { listSongs } from '../services/cos'

export async function ensureDefaultPlaylists(prisma: PrismaClient) {
  const count = await prisma.playlist.count()
  if (count > 0) return
  const items = await listSongs()
  const songs = items.slice(0, 50)
  console.log('ensureDefaultPlaylists', songs)
  for (const s of songs) {
    const last = s.lastModified ? new Date(s.lastModified) : null
    await prisma.song.upsert({
      where: { key: s.key },
      update: { name: s.name, size: s.size, lastModified: last },
      create: { key: s.key, name: s.name, size: s.size, lastModified: last }
    })
  }
  const pick = async (code: string, name: string, sorter: (a: any, b: any) => number) => {
    console.log(`pick ${code} ${name}`)
    const top = [...songs].sort(sorter).slice(0, 10)
    const p = await prisma.playlist.create({ data: { code, name } })
    let i = 0
    for (const s of top) {
      const song = await prisma.song.findUnique({ where: { key: s.key } })
      if (!song) continue
      await prisma.playlistItem.create({ data: { playlistId: p.id, songId: song.id, order: i++ } })
    }
  }
  await pick('featured-10', '精选10首', (a, b) => String(a.name).localeCompare(String(b.name)))
  await pick('hot-10', '最热10首', (a, b) => Number(b.size) - Number(a.size))
}