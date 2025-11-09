# Core Web Vitals 无侵入采集与上报方案

## 背景与目标
- 背景：需要在不改动业务页面的情况下，采集并上报 Core Web Vitals 指标，用于性能评估与优化。
- 目标：以“无侵入”方式采集 INP、LCP、CLS、FID、TTFB，支持采样、会话与导航上下文、可靠上报、后端入库与轻量聚合。
- 约束：不影响用户交互与页面性能；一次初始化，全局有效；可通过环境变量调控。

## 范围与非目标
- 范围：前端采集与上报（apps/admin）、后端接收与存储（apps/server）、基础聚合与查询接口。
- 非目标：本阶段不做可视化报表页面；不接入外部 APM；暂不做复杂离线计算（后续迭代）。

## 无侵入定义
- 不改业务页面与组件：通过应用入口/插件完成采集与上报初始化。
- 无 UI 改动：不引入任何新的用户界面元素。
- 可靠上报：优先使用 `navigator.sendBeacon`，后备使用 `fetch` 的 `keepalive`，避免阻塞页面卸载与导航。
- 可调控：采样率、上报开关、目标地址均由环境变量驱动，无需改动业务代码。

## 总体架构
前端（Admin）在应用启动时初始化采集器，监听 SPA 路由变化，使用 `web-vitals` 捕获指标，打上会话与导航上下文，通过 Beacon 上报到后端。后端提供 `POST /api/metrics/webvitals` 接口，进行校验与入库，同时可按日/版本/路由进行轻量聚合。

## 前端方案（apps/admin）
### 依赖
- `web-vitals`（采集库，小体积，基于 PerformanceObserver）

### 新增模块与文件
- `src/metrics/config.ts`：上报地址、采样率、应用 ID/版本、开关。
- `src/metrics/session.ts`：生成与维护 `sessionId`，管理 `navigationId`（路由变更递增），收集 UA/viewport/network 等上下文。
- `src/metrics/webVitals.ts`：对 `web-vitals` 封装，统一初始化与上报，支持 `reportAllChanges` 与去抖合并。

### 初始化位置
- 在 `src/main.ts` 调用 `initWebVitalsCollector(router)` 一次；在 `router.afterEach` 中递增 `navigationId` 与记录 `routeName/path`。

### 采集策略
- 启用回调：`onINP`、`onLCP`、`onCLS`、`onFID`、`onTTFB`。
- 选项：`reportAllChanges: true`，确保获得指标稳定值更新（如 CLS/INP）。
- 上下文：`sessionId`（localStorage 持久化）、`navigationId`（SPA 导航计数）、`routeName/path`（来自路由）。
- 扩展属性：`userId?`（从 `useAuthStore()` 获取，如有）、`appVersion`（`import.meta.env.VITE_APP_VERSION`）、`env`（`import.meta.env.MODE`）、`viewport`、`connection`（`navigator.connection`）。

### 上报策略
- 首选 `navigator.sendBeacon(url, blob)`，后备 `fetch(url, { method: 'POST', body, keepalive: true, headers })`。
- 失败不重试，避免在卸载/后台状态增加干扰；可在后续引入队列与采样重试。

### 采样与限流
- 采样率：默认 10%（`VITE_METRICS_SAMPLE_RATE=0.1`），白名单页面（如首页、Dashboard）可强制全量。
- 客户端限流：同一 `metric.id` 在同一 `navigationId` 下多次更新，仅在 `rating` 变化或时间窗口（如 5s）内保留最后一次。

### 示例初始化（参考）
```ts
// src/main.ts
import { initWebVitalsCollector } from '@/metrics/webVitals'
import router from '@/router'
initWebVitalsCollector(router)
```

### 示例上报载荷（INP）
```json
{
  "metric": "INP",
  "value": 180,
  "rating": "good",
  "delta": 0,
  "id": "v3-165904",
  "attribution": {
    "eventTarget": "button.save",
    "interactionType": "click",
    "inputDelay": 30,
    "processingDuration": 20,
    "presentationDelay": 130
  },
  "sessionId": "s_abc",
  "navigationId": 3,
  "routeName": "home",
  "path": "/",
  "appVersion": "1.2.0",
  "env": "development",
  "viewport": { "w": 1440, "h": 900 },
  "connection": { "type": "4g", "rtt": 50, "downlink": 10 },
  "ts": 1731080000000
}
```

## 后端方案（apps/server）
### API
- `POST /api/metrics/webvitals`，`Content-Type: application/json`。
- 请求体字段：
  - `metric`: `INP|LCP|CLS|FID|TTFB`
  - `value`: number，`rating`: `good|needs-improvement|poor`，`delta?`: number，`id`: 唯一 ID
  - `attribution?`: 对象（元素选择器、导航类型、资源 URL 等）
  - `sessionId`, `navigationId`, `routeName`, `path`, `userId?`, `appVersion`, `env`, `viewport?`, `connection?`, `ts`
- 响应：`{ ok: true }` 或 `204 No Content`；错误返回 4xx/5xx。

### 校验与限流
- 校验：类型与长度限制；拒绝包含 PII 的字段；JSON 结构校验。
- 限流：IP + `sessionId` + 时间窗口（如 60 req/min）返回 429。

### 存储模型（Prisma）
```prisma
model WebVitalsRaw {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  appId         String
  env           String
  version       String?
  sessionId     String
  navigationId  Int
  userId        String?
  routeName     String?
  path          String?
  metric        String
  value         Float
  rating        String
  delta         Float?
  entriesCount  Int?
  attribution   Json?
  ua            String?
  viewportW     Int?
  viewportH     Int?
  networkType   String?
  networkRtt    Int?
  networkDownlink Float?
}

model WebVitalsDaily {
  id        String   @id @default(cuid())
  date      DateTime
  appId     String
  env       String
  version   String?
  routeName String?
  metric    String
  p50       Float
  p75       Float
  p95       Float
  count     Int
}
```

### 轻量聚合策略
- 维度：`date + appId + env + version? + routeName? + metric`。
- 统计：`p50/p75/p95` + `count`；定时任务或触发器每日汇总。

### 安全与隐私
- 不收集 PII；`userId` 若需使用业务 ID 或匿名哈希。
- 校验 `Origin` 与 CORS；仅允许前端域名；JSON-only；CSRF 豁免。

### 可观测性
- 采样记录接收日志；错误报警；接口指标（QPS、4xx/5xx）。

## 部署与配置
- 前端 `.env.*`：
  - `VITE_API_BASE`（后端地址，自动补 `/api`）
  - `VITE_METRICS_SAMPLE_RATE=0.1`
  - `VITE_APP_ID=admin`，`VITE_APP_VERSION=1.0.0`
- 后端：启用 `POST /api/metrics/webvitals` 路由，数据库迁移，定时聚合任务（可选）。

## 实施计划
1) 前端
   - 新增 `metrics/config.ts`、`metrics/session.ts`、`metrics/webVitals.ts`
   - 在 `main.ts` 初始化；`router.afterEach` 更新导航上下文
   - `pnpm add web-vitals`
2) 后端
   - 新增路由 `POST /api/metrics/webvitals`
   - 增加 Prisma 模型与迁移；入库与基础校验
   - （可选）日聚合任务与查询接口
3) 联调
   - 配置 `VITE_API_BASE`，本地联通后端
   - 压力场景（首页组合页）验证指标上报与入库

## 测试与验收
- 单元：前端 `session/config` 纯函数；后端路由参数校验。
- 集成：导航与交互操作验证 INP/CLS/LCP/TTFB 入库与聚合。
- 性能：在“首页组合演示”场景验证采集器开销可忽略；Beacon 上报不阻塞卸载。
- 验收标准：指标成功采集与入库；基础聚合正确；对业务页面零改动；关闭采样开关后无上报。

## 风险与缓解
- 风险：不同浏览器对 PerformanceObserver 支持差异；SPA 特性导致导航定义不一致。
- 缓解：针对旧浏览器降级（不采集或仅 TTFB）；导航以路由事件为准，保持一致性。

## 里程碑
- M1：前端采集模块与初始化完成，后端路由接收成功。
- M2：入库与基础聚合，提供查询接口。
- M3：指标仪表盘（本次迭代提前交付）。

## 仪表盘迭代（实时展示）
为快速洞察最近性能问题，本次迭代在 Admin 前端新增“性能仪表盘”并在后端提供轻量查询接口：

### 后端新增
- `GET /api/metrics/webvitals/recent?limit=200`：返回最近 N 条原始记录，来源于 `data/web-vitals.log`（文件不存在时返回空集）。
- 目的：避免首次阶段的数据库依赖，便于快速验证与可视化。

### 前端新增
- `src/apis/metrics.ts`：封装 `getRecentWebVitals(limit)` 请求与类型。
- `src/hooks/useWebVitalsFeed.ts`：每 2s 轮询最近记录，在客户端计算 `p50/p75/p95/count`，并输出最新上下文（会话/导航/路由）。
- `src/components/PerfCard.vue`：通用性能卡片组件，按 `p75` 显示健康度状态（良好/需改进/较差），并展示 `p50/p75/p95/样本量`。
- `src/views/Dashboard.vue`：仪表盘页面，包含五项核心指标（`LCP/CLS/INP/FCP/TTFB`）的卡片与“最近记录”表格明细。

### 指标显示与阈值
- 单位规范：`CLS` 为无单位；其余指标统一以秒展示（采集值毫秒→秒）。
- 阈值（按 p75 判断）：
  - `LCP` ≤ 2.5 良好；≤ 4 需改进；> 4 较差
  - `CLS` ≤ 0.1 良好；≤ 0.25 需改进；> 0.25 较差
  - `INP` ≤ 0.2 良好；≤ 0.5 需改进；> 0.5 较差
  - `FCP` ≤ 1.8 良好；≤ 3 需改进；> 3 较差
  - `TTFB` ≤ 0.8 良好；≤ 1.8 需改进；> 1.8 较差

### 使用与验证
- 本地开发：`pnpm dev`（admin）后访问 `http://localhost:5173/#/dashboard`；每 2s 自动更新统计与明细。
- Docker 验证：访问 `http://localhost:8080/#/dashboard`；如需在宿主机直接查看日志，建议在 `docker-compose.yml` 为 `server` 增加卷映射 `./data:/app/data`。

### 后续增强（可选）
- 流式更新：将 `recent` 改造为 SSE 端点，前端通过 `EventSource` 实时接收；或在服务器端维护固定大小的内存环形缓冲避免频繁读文件。
- 维度过滤与聚合：支持按 `route`/`env`/`appId` 过滤；提供后端 `stats` 接口返回预聚合的 `p50/p75/p95/count`。
- UI 提示与告警：在仪表盘顶部增加总体状态 HUD；当 p75 趋于“较差”时提供提醒与定位建议。


## 附录：常用命令（pnpm）
```bash
pnpm -w add web-vitals -F admin
pnpm -w dev -F admin
pnpm -w dev -F server
```