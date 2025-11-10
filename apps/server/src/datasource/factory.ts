import type { PrismaClient } from '@prisma/client'
import type { UserRepo } from '../repos/UserRepo'
import { UserRepoPrisma } from '../repos/prisma/UserRepoPrisma'

// 仅支持 Prisma（SQLite）数据源，统一返回强类型 PrismaClient
export async function createUserRepo(): Promise<{ repo: UserRepo; prisma: PrismaClient }> {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  return { repo: new UserRepoPrisma(prisma), prisma }
}