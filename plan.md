# Vue3 + TypeScript 学习与实战计划（对齐岗位JD）

> 目标：在 4 周内以项目驱动掌握 Vue3 + TS、Pinia、Vue Router、Vite 工程化与性能优化，能独立搭建中后台框架、完成复杂业务、产出可量化优化报告，并沉淀技术博客与开源贡献。

## 一、阶段产出与里程碑
- 周度目标：每周完成一个里程碑与可展示成果。
- 最终产出：
  - 中后台管理系统骨架（权限、路由、状态、请求、布局、组件库接入）。
  - 数据看板项目（ECharts + Pinia + 动态配置）。
  - 性能优化报告（代码分割、懒加载、渲染优化、Vite 构建优化、指标对比）。
  - 工程化规范（ESLint/Prettier/Husky/lint-staged/Commitlint/Vitest/Playwright）。
  - 2 篇技术博客 + 1 个轻量开源包（例如 `use-echarts` 钩子或 `pinia-persist` 简版）。

## 二、学习路径（4 周计划）
### 第 1 周：Vue3 + TS 基础与工程化起步
- 技术点：
  - Composition API、`script setup`、响应式系统、`ref/reactive`、`computed/watchEffect`。
  - TS 基础：类型、接口、泛型、类型推断与守卫、模块与别名。
  - Vite 初始化与目录规范；环境变量管理（`import.meta.env`）。
  - ESLint + Prettier 统一风格；Husky + lint-staged + Commitlint 提交流程。
  - Vitest 单元测试框架接入。
- 任务与输出：
  - 创建 `vite` + `vue-ts` 项目模板，完成基础规范与脚手架。
  - Demo：TodoList（增删改查、持久化），覆盖 3 个单元测试。

### 第 2 周：架构设计、路由与状态管理（Pinia）
- 技术点：
  - 路由系统：基础路由、嵌套路由、动态路由、路由守卫与权限控制（基于 token/role）。
  - 布局系统：多布局（登录/主框架/空白页）、菜单高亮、面包屑。
  - 状态管理：Pinia store 设计、模块划分、持久化（localStorage/IndexedDB）。
  - 请求层：Axios 封装、拦截器、错误处理、取消请求、重试与缓存。
  - 组件库：引入 Element Plus，封装通用组件（表格、表单、弹窗）。
- 任务与输出：
  - 管理系统骨架：登录页、主框架、动态菜单 + 权限。
  - 编写 `useAuth`、`useAxios`、`usePermission` 等业务 Hook。

### 第 3 周：性能优化与构建分析（Vite）
- 技术点：
  - 代码分割：`dynamic import`、路由懒加载、`import.meta.glob`。
  - 渲染优化：`v-memo`、`shallowRef/markRaw`、虚拟列表、避免不必要的依赖追踪。
  - 静态资源优化：图片懒加载、压缩（`vite-imagetools`/CI 方案）、字体与图标策略。
  - 构建优化：`rollupOptions.output.manualChunks`、`esbuild` 目标、`brotli/gzip`、`chunk` 命名。
  - 可观测性：`rollup-plugin-visualizer`、`performance.mark/measure`、Core Web Vitals（LCP/FCP/CLS）。
- 任务与输出：
  - 为管理系统输出构建分析报告（前后对比图与指标数据）。
  - 编写性能优化清单与复盘文档。

### 第 4 周：数据可视化与复杂业务场景
- 技术点：
  - ECharts 集成：图表封装组件、`shallowRef` 管理实例、响应式 Resize、主题切换。
  - 大表单与复杂交互：分步表单、校验、联动、草稿保存与回填。
  - 拖拽与吸附：图表布局拖拽、网格系统（如 `vue-grid-layout`）。
  - 持续集成：Playwright 端到端测试、Github Actions 持续构建与报告。
- 任务与输出：
  - 数据看板项目：多卡片布局、图表配置面板、状态持久化。
  - 发布一个轻量开源包 + 2 篇博客（性能优化/图表封装实践）。

## 三、与岗位 JD 的逐条对齐
1. 负责中大型前端项目核心模块开发（Vue3+TS）
   - 产出：中后台骨架 + 核心模块（权限、路由、状态、请求）。
2. 架构拆分、状态管理（Pinia）、路由（Vue Router）、代码复用与跨端兼容
   - 实践：模块化目录、store 设计、动态路由、Hook/组件复用策略、适配移动端。
3. 前端性能优化：代码分割、路由懒加载、渲染优化（`v-memo`/`shallowRef`）、Vite 构建优化与报告
   - 实践：可量化指标表（包体积/LCP/FCP 前后对比）与分析图。
4. 工程化体系建设：ESLint/Prettier、封装组件库、测试与自动化
   - 实践：基础组件库（Button/Modal/Form），建库与打包发布流程，Vitest/Playwright。
5. 技术博客/开源贡献、ECharts、CSS
   - 实践：博客输出、开源 Hook、Dashboard 项目与样式工程（原子化/SCSS 模块化）。

## 四、项目目录建议
```
├─ apps/
│  ├─ admin/               # 中后台项目
│  └─ dashboard/           # 数据看板项目
├─ packages/
│  ├─ ui/                  # 个人组件库（Vite 打包）
│  ├─ hooks/               # 业务与通用 Hook
│  └─ utils/               # 工具函数与规范
└─ docs/                   # 技术文档与博客草稿
```

## 五、性能优化清单（落地项）
- 路由懒加载、首屏按需加载、骨架屏。
- `manualChunks` 拆包策略、第三方库按需引入。
- `shallowRef` 管理 ECharts 实例；`v-memo` 缓存静态节点。
- 虚拟滚动 + Diff 优化大列表；避免深层响应式开销（`markRaw`）。
- 资源优化：`webp`、字体子集、`preload/prefetch`、`vite-plugin-compression`。
- 可观测性：埋点 + `performance` API；构建分析可视化。

## 六、工程化与规范
- ESLint（含 TS 规则）+ Prettier；统一提交规范（Husky/lint-staged/Commitlint）。
- Git 分支策略（feature/hotfix/release）、PR 模板、CI 构建与测试。
- 测试：Vitest（单测）+ Playwright（E2E）；关键模块必须覆盖率 > 80%。

## 七、博客选题与开源计划
- 博客：
  - 《用 v-memo 与 shallowRef 优化大图表渲染》
  - 《Vite 构建拆包与可视化分析实战》
- 开源：
  - `@your-scope/use-echarts`：一体化封装（初始化、主题、Resize、销毁）。
  - `pinia-persist-mini`：轻量持久化插件（策略与序列化）。

## 八、每日学习节奏（示例）
- 2h 系统学习 + 3h 项目实战 + 1h 复盘总结与记录。
- 每晚输出当天学习笔记与明日任务清单。

## 九、衡量标准（可量化）
- 管理系统：首屏体积 < 300 KB、LCP < 2.5s（本地模拟弱网）。
- Dashboard：图表切换响应 < 100ms；窗口 Resize 无卡顿。
- 测试覆盖率 ≥ 80%；CI 通过率 100%。
- 至少 2 篇博客 + 1 个 npm 包或 GitHub 项目。

---

如需，我可以在该目录下同步创建项目骨架与脚手架配置，直接开始落地实施。