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
          nickname: u.nickname ?? null,
          roleId: u.roleId,
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
          nickname: u.nickname ?? null,
          roleId: u.roleId,
          createdAt: u.createdAt
        }
      : null
  }

  async create(data: { username: string; passwordHash: string; nickname?: string | null }): Promise<UserEntity> {
    // 默认分配为访客角色（code = 'VISITOR'），在未生成 Role 模型类型时优雅降级
    const roleModel = (this.prisma).role
    let visitorId = 0
    if (roleModel && typeof roleModel.upsert === 'function') {
      const visitor = await roleModel.upsert({
        where: { code: 'VISITOR' },
        update: {},
        create: { code: 'VISITOR', name: '访问者' }
      })
      visitorId = (visitor && visitor.id) || 0
    }
    const u = await this.prisma.user.create({
      data: { username: data.username, passwordHash: data.passwordHash, nickname: data.nickname ?? null, roleId: visitorId }
    })
    return {
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: u.nickname ?? null,
      roleId: u.roleId ?? visitorId,
      createdAt: u.createdAt
    }
  }

  async list({ page, pageSize, username }: { page: number; pageSize: number; username?: string }): Promise<{ items: UserEntity[]; total: number }> {
    const take = Math.max(1, Math.min(100, pageSize))
    const skip = Math.max(0, (Math.max(1, page) - 1) * take)
    const where = username ? { username: { contains: username } } : undefined
    const [itemsRaw, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where })
    ])
    const items: UserEntity[] = itemsRaw.map((u): UserEntity => ({
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: u.nickname ?? null,
      roleId: u.roleId,
      createdAt: u.createdAt
    }))
    return { items, total }
  }

  async updateRole(id: number, roleId: number): Promise<UserEntity> {
    const u = await this.prisma.user.update({ where: { id }, data: { roleId } })
    return {
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: u.nickname ?? null,
      roleId: u.roleId ?? roleId,
      createdAt: u.createdAt
    }
  }
}