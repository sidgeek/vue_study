import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-.env',
  DATABASE_URL: process.env.DATABASE_URL || '',
  // 告警相关配置（可选）
  ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL || '',
  // 阈值允许通过环境覆盖；使用 Core Web Vitals 推荐值作为默认
  ALERT_LCP_POOR_MS: parseInt(process.env.ALERT_LCP_POOR_MS || '4000', 10),
  ALERT_INP_POOR_MS: parseInt(process.env.ALERT_INP_POOR_MS || '500', 10),
  ALERT_CLS_POOR: parseFloat(process.env.ALERT_CLS_POOR || '0.25'),
  ALERT_TTFB_POOR_MS: parseInt(process.env.ALERT_TTFB_POOR_MS || '800', 10),
  ALERT_FCP_POOR_MS: parseInt(process.env.ALERT_FCP_POOR_MS || '3000', 10),

  // cos 相关配置
  COS_SECRET_ID: process.env.COS_SECRET_ID || '',
  COS_SECRET_KEY: process.env.COS_SECRET_KEY || '',
  COS_BUCKET: process.env.COS_BUCKET || '',
  COS_REGION: process.env.COS_REGION || '',
  COS_SONGS_PREFIX: process.env.COS_SONGS_PREFIX || '',
  COS_SIGN_EXPIRE_SECONDS: parseInt(process.env.COS_SIGN_EXPIRE_SECONDS || '3600', 10)
}