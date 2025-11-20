<template>
  <div class="page">
    <h2>Custom Block · Demo</h2>
    <div class="editor"><textarea v-model="text" rows="10"/></div>
    <MarkdownViewer :source="text" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MarkdownViewer from './components/MarkdownViewer.vue'
import sample from './content/sample.md?raw'

const text = ref(sample)
</script>

<style scoped>
.page { max-width: 960px; margin: 24px auto; padding: 0 16px }
.editor { margin-bottom: 16px }
textarea { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>