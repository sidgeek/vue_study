<template>
  <div class="markdown-viewer" v-html="html"></div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, watch, createApp } from 'vue'
import MarkdownIt from 'markdown-it'
import analysisPlugin from '@/markdown/analysisPlugin'
import { createAnalysisSDK } from '@analysis'
import DatasetCard from '@/markdown/cards/DatasetCard.vue'
import DashboardCard from '@/markdown/cards/DashboardCard.vue'

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
async function mountCards() {
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
    try { props = JSON.parse(norm) } catch { props = { title: 'Card', items: [] } }
    const sdk = createAnalysisSDK()
    const inst = sdk.mount(el, props)
    mounts.push({ el, unmount: () => inst.unmount() })
  }
  const datasetNodes = Array.from(root.querySelectorAll('.md-dataset-card')) as HTMLElement[]
  for (const el of datasetNodes) {
    const raw = el.dataset.datasetCard || '{}'
    const norm = raw.replace(/[“”]/g, '"').replace(/，/g, ',').replace(/：/g, ':')
    let props: any
    try { props = JSON.parse(norm) } catch { props = { title: '数据集', name: '', value: 0 } }
    const app = createApp(DatasetCard, props)
    app.mount(el)
    mounts.push({ el, unmount: () => app.unmount() })
  }
  const dashboardNodes = Array.from(root.querySelectorAll('.md-dashboard-card')) as HTMLElement[]
  for (const el of dashboardNodes) {
    const raw = el.dataset.dashboardCard || '{}'
    const norm = raw.replace(/[“”]/g, '"').replace(/，/g, ',').replace(/：/g, ':')
    let props: any
    try { props = JSON.parse(norm) } catch { props = { title: '看板', link: '', linkText: '查看' } }
    const app = createApp(DashboardCard, props)
    app.mount(el)
    mounts.push({ el, unmount: () => app.unmount() })
  }
}

onMounted(mountCards)
watch(html, mountCards)
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
</style>