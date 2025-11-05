import { env } from '../config/env'
import type { UserRepo } from '../repos/UserRepo'
import { UserRepoPrisma } from '../repos/prisma/UserRepoPrisma'
import { UserRepoFile } from '../repos/file/UserRepoFile'
import path from 'path'

export function createUserRepo(): { repo: UserRepo; prisma?: any } {
  const source = (env.DATA_SOURCE || 'postgres').toLowerCase()
  if (source === 'file') {
    const filePath = env.DATA_FILE_PATH || path.resolve(process.cwd(), 'data/db.json')
    return { repo: new UserRepoFile(filePath) }
  }
  // 延迟加载 Prisma 仅在 postgres 模式下使用，避免在 file 模式下报错
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  return { repo: new UserRepoPrisma(prisma), prisma }
}