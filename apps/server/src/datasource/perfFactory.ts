import { env } from '../config/env'
import type { PerfRepo } from '../repos/PerfRepo'
import { PerfRepoFile } from '../repos/file/PerfRepoFile'
import path from 'path'

export function createPerfRepo(): { repo: PerfRepo } {
  const source = (env.PERF_DATA_SOURCE || 'file').toLowerCase()
  if (source === 'file') {
    const filePath = env.DATA_FILE_PATH || path.resolve(process.cwd(), 'data/perf.json')
    return { repo: new PerfRepoFile(filePath) }
  }
  // 预留：未来支持 Prisma 模式
  const filePath = env.DATA_FILE_PATH || path.resolve(process.cwd(), 'data/perf.json')
  return { repo: new PerfRepoFile(filePath) }
}