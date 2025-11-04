import type { UserRepo, UserEntity } from '../UserRepo'
import { promises as fs } from 'fs'
import path from 'path'

type DbShape = {
  seq: number
  users: Array<{
    id: number
    username: string
    passwordHash: string
    name?: string | null
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
      const init: DbShape = { seq: 1, users: [] }
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
    return u ? { ...u, createdAt: new Date(u.createdAt) } : null
  }

  async findById(id: number): Promise<UserEntity | null> {
    const db = await this.read()
    const u = db.users.find((x) => x.id === id)
    return u ? { ...u, createdAt: new Date(u.createdAt) } : null
  }

  async create(data: { username: string; passwordHash: string; name?: string | null }): Promise<UserEntity> {
    const db = await this.read()
    const exists = db.users.find((x) => x.username === data.username)
    if (exists) throw new Error('Username exists')
    const id = db.seq++
    const createdAt = new Date()
    const rec = {
      id,
      username: data.username,
      passwordHash: data.passwordHash,
      name: data.name ?? null,
      createdAt: createdAt.toISOString()
    }
    db.users.push(rec)
    await this.write(db)
    return { ...rec, createdAt }
  }
}