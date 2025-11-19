<template>
  <div class="page">
    <h2>Agent 模拟 · Markdown 展示</h2>
    <div class="editor">
      <textarea v-model="text" rows="10"/>
    </div>
    <MarkdownViewer :source="text" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MarkdownViewer from './components/MarkdownViewer.vue'

const text = ref(`# 分析结果\n\n- 准确率: **92%**\n- 召回率: 88%\n\n> 这是一个来自大模型的示例 Markdown。\n\n\`\`\`ts\nexport const hello = (name: string) => 'Hello ' + name\n\`\`\`
`)
</script>

<style scoped>
.page { max-width: 960px; margin: 24px auto; padding: 0 16px }
.editor { margin-bottom: 16px }
textarea { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>