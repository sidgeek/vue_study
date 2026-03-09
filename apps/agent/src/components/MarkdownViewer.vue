<template>
  <div class="markdown-viewer" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import analysisPlugin from '@/markdown/analysisPlugin'
import { registerMarkdownElements } from '@/markdown/elements'

const props = defineProps<{ source: string }>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
})
md.use(analysisPlugin)
registerMarkdownElements()

const html = computed(() => md.render(props.source || ''))
</script>

<style scoped>
.markdown-viewer :deep(h1),
.markdown-viewer :deep(h2),
.markdown-viewer :deep(h3) { font-weight: 600; margin: 12px 0 }
.markdown-viewer :deep(p) { margin: 8px 0; line-height: 1.6 }
.markdown-viewer :deep(code) { background: #f6f8fa; padding: 0 4px; border-radius: 4px }
.markdown-viewer :deep(pre code) { display: block; padding: 12px }
.markdown-viewer :deep(ul) { padding-left: 20px }
</style>