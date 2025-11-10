# Core Web Vitals 告警与通知方案

面向前端 `admin` 与后端 `server` 的性能指标采集、评估、告警推送与可视化展示方案。该方案在“检测到性能问题时给出告警，并通知到对应人员”，同时在仪表盘页面让其看到对应的性能问题细节。

## 目标
- 采集 Web Vitals（LCP/CLS/INP/FCP/TTFB）并持久化最近记录。
- 基于推荐阈值评估是否触发告警，写入告警日志并推送到外部机器人（Slack/飞书/钉钉等）。
- 在仪表盘顶部展示最近告警，点击/查看即可定位到时序与明细。
- 提供前端本地 UI 告警提示，当前操作者可即时感知问题。

## 总体架构与数据流
1. 前端采集器：`apps/admin/src/metrics/webVitals.ts` 采样并收集指标，调用后端 `POST /api/metrics/webvitals`。
2. 后端接收：`apps/server/src/index.ts` 写入 `data/web-vitals.log` 并执行 `evaluateAlerts()` 生成告警。
3. 告警持久化与推送：告警写入 `data/web-vitals-alerts.log`，若设置 `ALERT_WEBHOOK_URL` 则执行 `notifyWebhook()` 发送文本消息。
4. 前端展示：`GET /api/metrics/webvitals/alerts/recent` 提供最近告警，仪表盘通过 `useAlertsFeed()` 轮询展示。
5. 本地 UI 告警：采集器检测到明显 “poor” 或超阈值时，以 `ElNotification` 进行提示。

## 后端实现

### 路由与持久化
- `POST /api/metrics/webvitals`
  - 校验上报体，写入 `data/web-vitals.log`。
  - 调用 `evaluateAlerts(record)`，触发告警则写入 `data/web-vitals-alerts.log` 并执行 Webhook 推送。
- `GET /api/metrics/webvitals/recent?limit=200`
  - 读取最近指标记录，返回 `{ items, total }`。
- `GET /api/metrics/webvitals/alerts/recent?limit=50`
  - 读取最近告警记录，返回 `{ items, total }`。

### 告警评估与格式化
- 代码位置：`apps/server/src/index.ts`
- 关键方法：
  - `evaluateAlerts(record)`：按指标与阈值生成告警对象 `AlertRecord`（包含时间、指标、值、严重级别、路由、会话等）。
  - `notifyWebhook(alert)`：若配置了 `ALERT_WEBHOOK_URL`，以 `{ text }` 发送到入站 webhook（适配 Slack/飞书/钉钉等常见机器人）。
  - `formatMetric(name, value)`：将数值按人类可读格式输出（`CLS` 保留三位小数，其余转换为秒）。

### 环境变量与默认阈值
在 `apps/server/src/config/env.ts` 已接入以下变量：
- `ALERT_WEBHOOK_URL`：可选，入站 webhook 地址（例如飞书/Slack 机器人）。
- `ALERT_LCP_POOR_MS`（默认 4000）
- `ALERT_INP_POOR_MS`（默认 500）
- `ALERT_CLS_POOR`（默认 0.25）
- `ALERT_TTFB_POOR_MS`（默认 800）
- `ALERT_FCP_POOR_MS`（默认 3000）

说明：若 `rating=poor` 或者数值超阈值，则触发告警。可根据业务规模调整阈值，或在后端增加聚合告警策略（例如滑窗内计数超过 N 次再告警）。

## 前端实现

### 采集与上报
- 文件：`apps/admin/src/metrics/webVitals.ts`
- 采样率：`METRICS.sampleRate = import.meta.env.VITE_METRICS_SAMPLE_RATE`，开发可设为 `1` 全量采样。
- 上报目标：`BASE = VITE_API_BASE`（自动补 `/api`），调用 `POST /api/metrics/webvitals`。
- 本地 UI 告警：检测到 LCP/INP/CLS “poor” 或超阈值时，触发 `ElNotification`。

### 告警展示与轮询
- API：`apps/admin/src/apis/alerts.ts`，`GET /metrics/webvitals/alerts/recent?limit=50`。
- Hook：`apps/admin/src/hooks/useAlertsFeed.ts`，定时轮询告警列表并维护 `items`。
- 组件：`apps/admin/src/components/AlertsList.vue`，在仪表盘顶部渲染最近告警（时间、路由、严重级别、消息）。
- 集成：`apps/admin/src/views/Dashboard.vue` 引入 `AlertsList` 并在页面顶部展示。

## 启动与配置

### 开发环境
- 后端（默认 `3000`，若端口占用可改）：
  ```sh
  PORT=3010 pnpm --filter server dev
  ```
- 前端（确保联通后端）：
  ```sh
  VITE_API_BASE=http://localhost:3010 pnpm run start:dev
  ```
- 采样率（开发建议 100%）：在 `apps/admin/.env.dev` 设置 `VITE_METRICS_SAMPLE_RATE=1`。
- Webhook：在后端 `.env` 设置 `ALERT_WEBHOOK_URL=https://your-webhook-url`。

### 生产环境
- 将后端阈值配置通过环境变量注入，按业务 SLA 调整。
- 将 `ALERT_WEBHOOK_URL` 指向你的机器人或平台入站地址（Slack/飞书/钉钉等）。
- 前端 `VITE_API_BASE` 指向生产后端；建议保留采样率可控能力。

## API 契约

### 上报体（请求）
`POST /api/metrics/webvitals`
```json
{
  "appId": "admin",
  "sessionId": "8b0b...",
  "navigationId": 12,
  "route": { "name": "Dashboard", "path": "/dashboard" },
  "viewport": { "width": 1440, "height": 900 },
  "connection": { "effectiveType": "4g" },
  "metrics": [
    { "name": "LCP", "value": 5200, "rating": "poor" },
    { "name": "CLS", "value": 0.18, "rating": "needs-improvement" }
  ]
}
```

### 告警记录（响应）
`GET /api/metrics/webvitals/alerts/recent?limit=50`
```json
{
  "items": [
    {
      "ts": 1728793000000,
      "appId": "admin",
      "sessionId": "8b0b...",
      "navigationId": 12,
      "route": { "path": "/dashboard" },
      "metric": "LCP",
      "value": 5200,
      "rating": "poor",
      "severity": "error",
      "message": "[LCP] 5.20s · rating=poor · route=/dashboard · session=8b0b..."
    }
  ],
  "total": 1
}
```

## 验证步骤
- 启动后端与前端（确保 `VITE_API_BASE` 正确）。
- 打开仪表盘，执行压力操作（大图渲染、强制回流等）以触发 LCP/INP/CLS 异常。
- 观察：
  - 页面右上角出现 Element Plus 本地通知提示。
  - 仪表盘顶部“性能告警”列表出现最新告警。
  - 后端 `data/web-vitals-alerts.log` 写入告警记录；若配置了 Webhook，机器人收到文本消息。

## 扩展与优化建议
- 聚合告警：在后端增加滑窗与抑制策略（例如 5 分钟内 LCP poor ≥ N 次再告警）。
- 责任人映射：维护路由到负责人映射表，Webhook 自动 @ 对应人员或群组。
- 消息格式：不同平台自定义卡片/Block 格式（飞书卡片、Slack Block Kit）。
- 可视化细节：在仪表盘为每条告警提供“查看对应时间窗趋势”的快捷入口。

## 代码位置总览
- 前端
  - 采集器：`apps/admin/src/metrics/webVitals.ts`
  - 告警 API：`apps/admin/src/apis/alerts.ts`
  - 告警 Hook：`apps/admin/src/hooks/useAlertsFeed.ts`
  - 告警组件：`apps/admin/src/components/AlertsList.vue`
  - 仪表盘集成：`apps/admin/src/views/Dashboard.vue`
- 后端
  - 路由与告警：`apps/server/src/index.ts`
  - 环境变量：`apps/server/src/config/env.ts`