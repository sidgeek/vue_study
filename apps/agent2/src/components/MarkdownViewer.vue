<template>
  <div class="markdown-viewer" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import analysisPlugin from '@/markdown/analysisPlugin'
import { createAnalysisSDK } from '@analysis'

const props = defineProps<{ source: string }>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
})
md.use(analysisPlugin)

const html = computed(() => md.render(props.source || ''))

let mounts: { el: HTMLElement; unmount: () => void }[] = []
async function mountAnalysis() {
  mounts.forEach((m) => m.unmount())
  mounts = []
  await nextTick()
  const root = document.querySelector('.markdown-viewer') as HTMLElement
  if (!root) return
  const nodes = Array.from(root.querySelectorAll('.md-analysis')) as HTMLElement[]
  for (const el of nodes) {
    const raw = el.dataset.analysis || '{}'
    const norm = raw.replace(/[“”]/g, '"').replace(/，/g, ',').replace(/：/g, ':')
    let props: any
    try { props = JSON.parse(norm) } catch { props = { title: 'SDK 卡片', items: [] } }
    const sdk = createAnalysisSDK()
    const inst = sdk.mount(el, props)
    mounts.push({ el, unmount: () => inst.unmount() })
  }
}

onMounted(mountAnalysis)
watch(html, mountAnalysis)
onBeforeUnmount(() => { mounts.forEach((m) => m.unmount()); mounts = [] })
</script>

<style scoped>
.markdown-viewer :deep(h1),
.markdown-viewer :deep(h2),
.markdown-viewer :deep(h3) { font-weight: 600; margin: 12px 0 }
.markdown-viewer :deep(p) { margin: 8px 0; line-height: 1.6 }
.markdown-viewer :deep(code) { background: #f6f8fa; padding: 0 4px; border-radius: 4px }
.markdown-viewer :deep(pre code) { display: block; padding: 12px }
.markdown-viewer :deep(ul) { padding-left: 20px }
.markdown-viewer :deep(.card) { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; }
.markdown-viewer :deep(.card:hover) { cursor: pointer; }
.markdown-viewer :deep(.hdr) { display: flex; align-items: center; justify-content: space-between; }
.markdown-viewer :deep(.title) { font-weight: 600; }
.markdown-viewer :deep(.tag) { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.markdown-viewer :deep(.val) { font-size: 24px; font-weight: 700; margin-top: 8px; }
.markdown-viewer :deep(.link) { display: inline-block; margin-top: 8px; color: #2563eb; text-decoration: none; }
.markdown-viewer :deep(.link:hover) { text-decoration: underline; }
</style>