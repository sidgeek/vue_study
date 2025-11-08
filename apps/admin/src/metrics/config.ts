export const METRICS = {
  // 采样率：默认 10%，可通过环境变量覆盖
  sampleRate: Number(import.meta.env.VITE_METRICS_SAMPLE_RATE ?? 0.1),
  // 应用标识与版本
  appId: String(import.meta.env.VITE_APP_ID ?? 'admin'),
  appVersion: String(import.meta.env.VITE_APP_VERSION ?? 'dev'),
}