import type { PerfRepo, PerfEvent } from '../PerfRepo'
import { promises as fs } from 'fs'
import path from 'path'

type DbShape = {
  events: PerfEvent[]
}

export class PerfRepoFile implements PerfRepo {
  constructor(private filePath: string) {}

  private async ensureFile() {
    try {
      await fs.access(this.filePath)
    } catch {
      const dir = path.dirname(this.filePath)
      await fs.mkdir(dir, { recursive: true })
      const init: DbShape = { events: [] }
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

  async insert(event: PerfEvent): Promise<void> {
    const db = await this.read()
    db.events.push(event)
    await this.write(db)
  }

  async stats(opts?: { route?: string; from?: number; to?: number }): Promise<{ count: number; latestTs?: number }> {
    const db = await this.read()
    let list = db.events
    if (opts?.route) list = list.filter((e) => e.route === opts.route)
    if (opts?.from) list = list.filter((e) => e.ts >= opts.from)
    if (opts?.to) list = list.filter((e) => e.ts <= opts.to)
    const latestTs = list.length ? Math.max(...list.map((e) => e.ts)) : undefined
    return { count: list.length, latestTs }
  }
}