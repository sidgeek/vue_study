import type { PrismaClient } from '@prisma/client'

export const DEFAULT_ROLES = [
  { code: 'SUPER_ADMIN', name: '超级管理员' },
  { code: 'ADMIN', name: '管理员' },
  { code: 'STAFF', name: '员工' },
  { code: 'VISITOR', name: '访问者' }
]

export async function ensureDefaultRoles(prisma?: PrismaClient) {
  if (!prisma) return
  // 当数据库尚未创建 Role 表时，直接跳过初始化以避免 P2021 错误
  try {
    const existsRows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Role'
      ) AS "exists"
    `
    const exists = !!(existsRows && existsRows[0] && (existsRows[0] as any).exists)
    if (!exists) return
  } catch (e) {
    // 查询失败时谨慎跳过，不影响服务启动
    return
  }
  const roleModel = (prisma as any)?.role
  if (!roleModel || typeof roleModel.upsert !== 'function') {
    // 当 PrismaClient 尚未生成 Role 模型时，直接跳过初始化以避免类型错误
    return
  }
  for (const r of DEFAULT_ROLES) {
    await roleModel.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { code: r.code, name: r.name }
    } as any)
  }
}