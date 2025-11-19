# Agent 应用 · Markdown 渲染流程

## 入口与数据加载
- 在 `App.vue` 中通过 `?raw` 导入 Markdown 文本并传入渲染组件
- 代码位置：`apps/agent/src/App.vue:12-16`

## Markdown 渲染
- 使用 `markdown-it` 将 Markdown 转为 HTML，并启用自定义插件
- 代码位置：`apps/agent/src/components/MarkdownViewer.vue:13-20`

## 自定义指令解析
- 插件：`analysisPlugin.ts`
- 支持三类指令：
  - `@analysis-result` → `.md-analysis` + `data-analysis`
  - `@dataset-card` → `.md-dataset-card` + `data-dataset-card`
  - `@dashboard-card` → `.md-dashboard-card` + `data-dashboard-card`
- 规则解析与容器渲染：
  - `apps/agent/src/markdown/analysisPlugin.ts:7-40`（规则解析）
  - `apps/agent/src/markdown/analysisPlugin.ts:42-61`（容器渲染）

## 组件挂载
- 遍历占位容器，解析 `data-*` 的 JSON，挂载对应组件或 SDK
- `.md-analysis` 使用 `@analysis` SDK 挂载
- `.md-dataset-card` 挂载 `DatasetCard.vue`
- `.md-dashboard-card` 挂载 `DashboardCard.vue`
- 代码位置：
  - `apps/agent/src/components/MarkdownViewer.vue:23-40`（analysis）
  - `apps/agent/src/components/MarkdownViewer.vue:41-55`（dataset/dashboard）

## 自定义卡片组件
- 数据集卡片：`apps/agent/src/markdown/cards/DatasetCard.vue:1-18`
- 看板卡片（带头部点击打开链接）：`apps/agent/src/markdown/cards/DashboardCard.vue:1-18`

## 交互与样式
- 卡片 hover 显示指针：
  - `apps/agent/src/markdown/cards/DashboardCard.vue:20-26`
  - `apps/agent/src/markdown/cards/DatasetCard.vue:15-21`

## 依赖与别名
- 别名 `@analysis` 指向 admin 的 SDK：`apps/agent/vite.config.ts:9-11`
- FS 允许跨目录访问：`apps/agent/vite.config.ts:13-21`

## 扩展指令
- 在 `analysisPlugin.ts` 增加新规则与渲染器
- 在 `MarkdownViewer.vue` 增加查询与挂载逻辑