import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-.env',
  DATABASE_URL: process.env.DATABASE_URL || '',
  // 仅使用 Prisma（SQLite），不再支持本地文件数据源
}