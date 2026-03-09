# i18n 渐进式学习指南

本文档旨在帮助你从零开始，以最小的心理负担学习并掌握 Vue 3 项目中的国际化 (i18n) 流程。

---

## 🚀 第一阶段：最小化流程改动 (Hello World)

如果你想对项目中的某一个具体文案（例如：Canvas 实验室页面的标题）进行国际化，你需要做的**最小改动**分为三步：

### 1. 在语言包中定义 Key
打开 `src/locales/zh.json` 和 `en.json`，为该文案取一个唯一的 Key。

- **zh.json**:
  ```json
  {
    "canvas": { "title": "Canvas 实验室" }
  }
  ```
- **en.json**:
  ```json
  {
    "canvas": { "title": "Canvas Lab" }
  }
  ```

### 2. 在模板中使用翻译函数 `$t`
找到该文案所在的 Vue 文件，将硬编码的文字替换为 `$t('key')`。

- **修改前**: `<h2>Canvas 实验室</h2>`
- **修改后**: `<h2>{{ $t('canvas.title') }}</h2>`

### 3. (可选) 在脚本中使用 `useI18n`
如果你需要在 `<script setup>` 逻辑中使用翻译（例如：弹窗提示、设置页面标题），可以这样做：

```typescript
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

console.log(t('canvas.title')) // 输出对应的语言文案
```

---

## 📈 第二阶段：渐进式扩展

当你熟悉了上述流程，可以尝试以下进阶练习：

1. **结构化 Key**: 使用对象嵌套（如 `nav.home`, `nav.users`）来管理庞大的翻译项。
2. **变量注入**: 
   - 语言包: `"welcome": "你好, {name}!"`
   - 使用: `$t('welcome', { name: '张三' })`
3. **语言切换持久化**: 
   - 监听切换事件，将 `locale.value` 保存到 `localStorage` 中，确保用户刷新页面后语言不会重置。

---

## 🛠️ 第三阶段：工程化实践 (本项已配置)

本项目的 `i18n` 基础设施已在以下文件中搭建完成：
- [i18n/index.ts](file:///Users/shilili/workstudy/vue_study/apps/admin/src/i18n/index.ts): 核心配置文件。
- [main.ts](file:///Users/shilili/workstudy/vue_study/apps/admin/src/main.ts): 插件注册。
- [AppHeader.vue](file:///Users/shilili/workstudy/vue_study/apps/admin/src/components/AppHeader.vue): 实现了 `localStorage` 持久化切换逻辑。
