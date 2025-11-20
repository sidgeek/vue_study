<template>
  <div class="markdown-viewer" :class="{ 'html-mode': true }" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { registerMarkdownWebComponents } from '@/markdown/webcomponents'
import MarkdownIt from 'markdown-it'
import customBlock from 'markdown-it-custom-block'
registerMarkdownWebComponents()

const props = defineProps<{ source: string }>()

const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: true })

function escapeAttr(s: string) {
  return s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string))
}
function normalizeJson(raw: string): any {
  const norm = String(raw || '')
    .replace(/[“”]/g, '"')
    .replace(/，/g, ',')
    .replace(/：/g, ':')
    .replace(/,\s*([}\]])/g, '$1')
  try { return JSON.parse(norm) } catch { return {} }
}


md.use(customBlock as any, {
  'analysis-result': (arg: string) => {
    const data = normalizeJson(arg || '{}')
    const title = escapeAttr(String(data.title || ''))
    const items = Array.isArray(data.items) ? data.items : []
    const itemsJson = escapeAttr(JSON.stringify(items).replace(/'/g, '&#39;'))
    return `<analysis-result title="${title}" items='${itemsJson}'></analysis-result>`
  },
  'dataset-card': (arg: string) => {
    const data = normalizeJson(arg || '{}')
    const title = escapeAttr(String(data.title || ''))
    const name = escapeAttr(String(data.name || ''))
    const value = escapeAttr(String(data.value ?? ''))
    return `<dataset-card title="${title}" name="${name}" value="${value}"></dataset-card>`
  },
  'dashboard-card': (arg: string) => {
    const data = normalizeJson(arg || '{}')
    const title = escapeAttr(String(data.title || ''))
    const link = escapeAttr(String(data.link || ''))
    const linkText = escapeAttr(String(data.linkText || '查看'))
    return `<dashboard-card title="${title}" link="${link}" link-text="${linkText}"></dashboard-card>`
  }
})

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