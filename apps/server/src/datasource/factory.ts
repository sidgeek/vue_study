import { env } from '../config/env'
import type { UserRepo } from '../repos/UserRepo'
import { UserRepoPrisma } from '../repos/prisma/UserRepoPrisma'
import { UserRepoFile } from '../repos/file/UserRepoFile'
import path from 'path'

export async function createUserRepo(): Promise<{ repo: UserRepo; prisma?: any }> {
  const source = (env.DATA_SOURCE || 'postgres').toLowerCase()
  if (source === 'file') {
    const filePath = env.DATA_FILE_PATH || path.resolve(process.cwd(), 'data/db.json')
    return { repo: new UserRepoFile(filePath) }
  }
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  return { repo: new UserRepoPrisma(prisma), prisma }
}