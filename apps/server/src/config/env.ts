import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-.env',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATA_SOURCE: process.env.DATA_SOURCE || 'postgres',
  DATA_FILE_PATH: process.env.DATA_FILE_PATH || ''
}