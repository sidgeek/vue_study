<template>
  <div class="markdown-viewer" :class="{ 'html-mode': true }" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import customBlock from 'markdown-it-custom-block'

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
function safeLink(url: string) {
  const u = String(url || '').trim()
  if (!u) return '#'
  return u.startsWith('http') ? u : `http://${u}`
}

md.use(customBlock as any, {
  'analysis-result': (arg: string) => {
    const data = normalizeJson(arg || '{}')
    const title = escapeAttr(String(data.title || ''))
    const items = Array.isArray(data.items) ? data.items : []
    const rows = items.map((it: any) => `<div class=\"row\"><span class=\"label\">${escapeAttr(String(it.label||''))}</span><span class=\"value\">${escapeAttr(String(it.value||''))}</span></div>`).join('')
    return `<div class=\"card analysis\" data-kind=\"analysis-result\"><div class=\"hdr\"><span class=\"title\">${title}</span></div><div class=\"body\">${rows}</div></div>`
  },
  'dataset-card': (arg: string) => {
    const data = normalizeJson(arg || '{}')
    const title = escapeAttr(String(data.title || ''))
    const name = escapeAttr(String(data.name || ''))
    const value = escapeAttr(String(data.value ?? ''))
    return `<div class=\"card dataset\" data-kind=\"dataset-card\"><div class=\"hdr\"><span class=\"title\">${title}</span><span class=\"tag\">${name}</span></div><div class=\"val\">${value}</div></div>`
  },
  'dashboard-card': (arg: string) => {
    const data = normalizeJson(arg || '{}')
    const title = escapeAttr(String(data.title || ''))
    const linkText = escapeAttr(String(data.linkText || '查看'))
    const href = escapeAttr(safeLink(String(data.link || '')))
    return `<div class=\"card dashboard\" data-kind=\"dashboard-card\"><div class=\"hdr\"><span class=\"title\">${title}</span></div><a class=\"link\" href=\"${href}\" target=\"_blank\" rel=\"noopener noreferrer\">${linkText}</a></div>`
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