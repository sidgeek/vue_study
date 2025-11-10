/*
 * Prisma seed script: creates default roles and test users in SQLite.
 * Run with: pnpm run seed
 */
const bcrypt = require('bcryptjs')
const { getPrisma, disconnect } = require('./prismaClient')
const prisma = getPrisma()

const DEFAULT_ROLES = [
  { code: 'SUPER_ADMIN', name: '超级管理员' },
  { code: 'ADMIN', name: '管理员' },
  { code: 'STAFF', name: '员工' },
  { code: 'VISITOR', name: '访问者' }
]

const TEST_USERS = [
  { username: 'superadmin', password: '123456', nickname: '超级管理员', roleCode: 'SUPER_ADMIN' },
  { username: 'admin', password: '123456', nickname: '管理员', roleCode: 'ADMIN' },
  { username: 'user01', password: '123456', nickname: '员工01', roleCode: 'STAFF' },
  { username: 'user02', password: '123456', nickname: '员工02', roleCode: 'STAFF' },
  { username: 'user03', password: '123456', nickname: '员工03', roleCode: 'STAFF' },
  { username: 'user04', password: '123456', nickname: '员工04', roleCode: 'STAFF' },
  { username: 'user05', password: '123456', nickname: '员工05', roleCode: 'STAFF' },
  { username: 'user06', password: '123456', nickname: '员工06', roleCode: 'STAFF' },
  { username: 'user07', password: '123456', nickname: '员工07', roleCode: 'STAFF' },
  { username: 'user08', password: '123456', nickname: '员工08', roleCode: 'STAFF' },
  { username: 'user09', password: '123456', nickname: '员工09', roleCode: 'STAFF' },
  { username: 'user10', password: '123456', nickname: '员工10', roleCode: 'STAFF' },
  { username: 'user11', password: '123456', nickname: '员工11', roleCode: 'STAFF' },
  { username: 'visitor', password: '123456', nickname: '访问者', roleCode: 'VISITOR' }
]

async function ensureRoles() {
  for (const r of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { code: r.code, name: r.name }
    })
  }
}

async function ensureUsers() {
  for (const u of TEST_USERS) {
    const passwordHash = bcrypt.hashSync(u.password, 10)
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash,
        nickname: u.nickname,
        role: { connect: { code: u.roleCode } }
      },
      create: {
        username: u.username,
        passwordHash,
        nickname: u.nickname,
        role: { connect: { code: u.roleCode } }
      }
    })
  }
}

async function main() {
  console.log('Seeding: default roles and test users...')
  await ensureRoles()
  await ensureUsers()
  const [roleCount, userCount] = await Promise.all([
    prisma.role.count(),
    prisma.user.count()
  ])
  console.log(`Done. roles=${roleCount}, users=${userCount}`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnect()
  })