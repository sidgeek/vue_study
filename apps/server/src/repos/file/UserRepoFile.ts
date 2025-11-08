import type { UserRepo, UserEntity } from '../UserRepo'
import { promises as fs } from 'fs'
import path from 'path'

type DbShape = {
  seq: number
  roles: Array<{ id: number; code: string; name: string }>
  users: Array<{
    id: number
    username: string
    passwordHash: string
    name?: string | null
    roleId: number
    createdAt: string
  }>
}

export class UserRepoFile implements UserRepo {
  constructor(private filePath: string) {}

  private async ensureFile() {
    try {
      await fs.access(this.filePath)
    } catch {
      const dir = path.dirname(this.filePath)
      await fs.mkdir(dir, { recursive: true })
      const init: DbShape = {
        seq: 1,
        roles: [
          { id: 1, code: 'SUPER_ADMIN', name: '超级管理员' },
          { id: 2, code: 'ADMIN', name: '管理员' },
          { id: 3, code: 'STAFF', name: '员工' },
          { id: 4, code: 'VISITOR', name: '访问者' }
        ],
        users: []
      }
      await fs.writeFile(this.filePath, JSON.stringify(init, null, 2), 'utf-8')
    }
  }

  private async read(): Promise<DbShape> {
    await this.ensureFile()
    const raw = await fs.readFile(this.filePath, 'utf-8')
    return JSON.parse(raw) as DbShape
  }

  private async write(db: DbShape) {
    await fs.writeFile(this.filePath, JSON.stringify(db, null, 2), 'utf-8')
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const db = await this.read()
    const u = db.users.find((x) => x.username === username)
    return u ? { id: u.id, username: u.username, passwordHash: u.passwordHash, nickname: u.name ?? null, roleId: u.roleId, createdAt: new Date(u.createdAt) } : null
  }

  async findById(id: number): Promise<UserEntity | null> {
    const db = await this.read()
    const u = db.users.find((x) => x.id === id)
    return u ? { id: u.id, username: u.username, passwordHash: u.passwordHash, nickname: u.name ?? null, roleId: u.roleId, createdAt: new Date(u.createdAt) } : null
  }

  async create(data: { username: string; passwordHash: string; nickname?: string | null }): Promise<UserEntity> {
    const db = await this.read()
    const exists = db.users.find((x) => x.username === data.username)
    if (exists) throw new Error('Username exists')
    const id = db.seq++
    const createdAt = new Date()
    const rec = {
      id,
      username: data.username,
      passwordHash: data.passwordHash,
      name: data.nickname ?? null,
      roleId: 4, // 默认访客角色
      createdAt: createdAt.toISOString()
    }
    db.users.push(rec)
    await this.write(db)
    return { id: rec.id, username: rec.username, passwordHash: rec.passwordHash, nickname: rec.name ?? null, roleId: rec.roleId, createdAt }
  }

  async list({ page, pageSize }: { page: number; pageSize: number }): Promise<{ items: UserEntity[]; total: number }> {
    const db = await this.read()
    const total = db.users.length
    const take = Math.max(1, Math.min(100, pageSize))
    const start = Math.max(0, (Math.max(1, page) - 1) * take)
    const slice = db.users
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(start, start + take)
    const items = slice.map((u) => ({ id: u.id, username: u.username, passwordHash: u.passwordHash, nickname: u.name ?? null, roleId: u.roleId, createdAt: new Date(u.createdAt) }))
    return { items, total }
  }

  async updateRole(id: number, roleId: number): Promise<UserEntity> {
    const db = await this.read()
    const u = db.users.find((x) => x.id === id)
    if (!u) throw new Error('User not found')
    u.roleId = roleId
    await this.write(db)
    return { id: u.id, username: u.username, passwordHash: u.passwordHash, nickname: u.name ?? null, roleId: u.roleId, createdAt: new Date(u.createdAt) }
  }
}