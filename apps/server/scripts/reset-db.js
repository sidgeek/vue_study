/*
 * Reset SQLite database: delete DB file if possible,
 * otherwise truncate tables and attempt to reset sequences.
 * Run with: pnpm run db:reset
 */
const fs = require('fs/promises')
const path = require('path')
const { getPrisma, disconnect } = require('./prismaClient')

function resolveSqlitePathFromUrl(url) {
  if (!url || !url.startsWith('file:')) return null
  const rest = url.slice('file:'.length)
  if (rest.startsWith('/')) return rest // absolute
  const prismaDir = path.resolve(__dirname, '../prisma')
  return path.resolve(prismaDir, rest) // relative to prisma/schema.prisma
}

async function removeDbFile(dbPath) {
  try {
    await fs.access(dbPath)
  } catch (e) {
    if (e && e.code === 'ENOENT') {
      console.log('Database file not found:', dbPath)
      return false
    }
    throw e
  }
  await fs.unlink(dbPath)
  console.log('Removed SQLite file:', dbPath)
  return true
}

async function truncateTables() {
  const prisma = getPrisma()
  try {
    console.log('Truncating tables: User, Role')
    await prisma.user.deleteMany({})
    await prisma.role.deleteMany({})
    // Best effort: reset autoincrement sequences in SQLite
    try {
      await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name IN ("User","Role")')
      console.log('Reset sqlite_sequence for User, Role')
    } catch (seqErr) {
      console.warn('Sequence reset skipped:', seqErr?.message || seqErr)
    }
  } finally {
    await disconnect()
  }
}

async function main() {
  const url = process.env.DATABASE_URL || 'file:../dev.db'
  const dbPath = resolveSqlitePathFromUrl(url)
  if (!dbPath) {
    console.log('DATABASE_URL is not a SQLite file URL. Falling back to truncate tables.')
    await truncateTables()
    return
  }
  try {
    const removed = await removeDbFile(dbPath)
    if (!removed) {
      console.log('Falling back to truncate tables...')
      await truncateTables()
    }
  } catch (e) {
    console.warn('Failed to remove DB file:', e?.message || e)
    console.log('Falling back to truncate tables...')
    await truncateTables()
  }
}

main().catch((e) => {
  console.error('Reset DB failed:', e)
  process.exitCode = 1
})