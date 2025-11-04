import { env } from '../config/env'
import type { UserRepo } from '../repos/UserRepo'
import { UserRepoPrisma } from '../repos/prisma/UserRepoPrisma'
import { PrismaClient } from '@prisma/client'
import { UserRepoFile } from '../repos/file/UserRepoFile'
import path from 'path'

export function createUserRepo(): { repo: UserRepo; prisma?: PrismaClient } {
  const source = (env.DATA_SOURCE || 'postgres').toLowerCase()
  if (source === 'file') {
    const filePath = env.DATA_FILE_PATH || path.resolve(process.cwd(), 'data/db.json')
    return { repo: new UserRepoFile(filePath) }
  }
  const prisma = new PrismaClient()
  return { repo: new UserRepoPrisma(prisma), prisma }
}