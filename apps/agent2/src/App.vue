<template>
  <div class="page">
    <h2>Agent2 · Markdown 展示与组件方式</h2>
    <div class="editor">
      <textarea v-model="text" rows="10"/>
    </div>
    <MarkdownViewer :source="text" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MarkdownViewer from './components/MarkdownViewer.vue'
import analysisMd from './content/analysis.md?raw'

const text = ref(analysisMd)
</script>

<style scoped>
.page { max-width: 960px; margin: 24px auto; padding: 0 16px }
.editor { margin-bottom: 16px }
textarea { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.mt16 { margin-top: 16px }
.card-header { font-weight: 600 }
</style>