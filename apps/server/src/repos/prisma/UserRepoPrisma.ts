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
          nickname: (u as any).nickname ?? (u as any).name ?? null,
          roleId: (u as any).roleId ?? (u as any).role_id ?? 0,
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
          nickname: (u as any).nickname ?? (u as any).name ?? null,
          roleId: (u as any).roleId ?? (u as any).role_id ?? 0,
          createdAt: u.createdAt
        }
      : null
  }

  async create(data: { username: string; passwordHash: string; nickname?: string | null }): Promise<UserEntity> {
    // 默认分配为访客角色（code = 'VISITOR'），在未生成 Role 模型类型时优雅降级
    const roleModel = (this.prisma as any).role
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
      data: { username: data.username, passwordHash: data.passwordHash, nickname: data.nickname ?? null, roleId: visitorId } as any
    })
    return {
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: (u as any).nickname ?? (u as any).name ?? null,
      roleId: (u as any).roleId ?? (u as any).role_id ?? visitorId,
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
    type DbUser = { id: number; username: string; passwordHash: string; nickname?: string | null; name?: string | null; createdAt: Date }
    const rows = itemsRaw as DbUser[]
    const items: UserEntity[] = rows.map((u: DbUser): UserEntity => ({
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: (u as any).nickname ?? (u as any).name ?? null,
      roleId: (u as any).roleId ?? (u as any).role_id ?? 0,
      createdAt: u.createdAt
    }))
    return { items, total }
  }

  async updateRole(id: number, roleId: number): Promise<UserEntity> {
    const u = await this.prisma.user.update({ where: { id }, data: { roleId } as any })
    return {
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      nickname: (u as any).nickname ?? (u as any).name ?? null,
      roleId: (u as any).roleId ?? roleId,
      createdAt: u.createdAt
    }
  }
}