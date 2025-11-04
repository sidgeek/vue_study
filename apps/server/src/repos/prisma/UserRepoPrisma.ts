import type { UserRepo, UserEntity } from '../UserRepo'
import { PrismaClient } from '@prisma/client'

export class UserRepoPrisma implements UserRepo {
  constructor(private prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { username } })
    return u ? { ...u, createdAt: u.createdAt } : null
  }

  async findById(id: number): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { id } })
    return u ? { ...u, createdAt: u.createdAt } : null
  }

  async create(data: { username: string; passwordHash: string; name?: string | null }): Promise<UserEntity> {
    const u = await this.prisma.user.create({
      data: { username: data.username, passwordHash: data.passwordHash, name: data.name ?? null }
    })
    return { ...u, createdAt: u.createdAt }
  }
}