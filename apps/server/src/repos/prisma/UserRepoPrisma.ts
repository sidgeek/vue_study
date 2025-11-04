import type { UserRepo, UserEntity } from '../UserRepo'
import { PrismaClient } from '@prisma/client'

export class UserRepoPrisma implements UserRepo {
  constructor(private prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { username } })
    return u
      ? {
          id: u.id,
          username: u.username,
          passwordHash: u.passwordHash,
          nickname: (u as any).nickname ?? u.nickname ?? null,
          createdAt: u.createdAt
        }
      : null
  }

  async findById(id: number): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { id } })
    return u
      ? {
          id: u.id,
          username: u.username,
          passwordHash: u.passwordHash,
          nickname: (u as any).nickname ?? u.nickname ?? null,
          createdAt: u.createdAt
        }
      : null
  }

  async create(data: { username: string; passwordHash: string; nickname?: string | null }): Promise<UserEntity> {
    const u = await this.prisma.user.create({
      data: { username: data.username, passwordHash: data.passwordHash, nickname: data.nickname ?? null }
    })
    return {
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: (u as any).nickname ?? u.nickname ?? null,
      createdAt: u.createdAt
    }
  }

  async list({ page, pageSize }: { page: number; pageSize: number }): Promise<{ items: UserEntity[]; total: number }> {
    const take = Math.max(1, Math.min(100, pageSize))
    const skip = Math.max(0, (Math.max(1, page) - 1) * take)
    const [itemsRaw, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count()
    ])
    type DbUser = { id: number; username: string; passwordHash: string; nickname?: string | null; createdAt: Date }
    const rows = itemsRaw as DbUser[]
    const items: UserEntity[] = rows.map((u: DbUser): UserEntity => ({
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: u.nickname ?? null,
      createdAt: u.createdAt
    }))
    return { items, total }
  }
}