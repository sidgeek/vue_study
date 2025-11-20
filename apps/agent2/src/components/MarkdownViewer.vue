<template>
  <div class="markdown-viewer" v-html="html"></div>
  <Teleport v-for="c in cards" :key="c.key" :to="c.el">
    <component :is="c.is" v-bind="c.props" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import cardPlugin from '@/markdown/cardPlugin'
import { AnalysisWidget } from '@analysis'
import DatasetCard from '@/markdown/cards/DatasetCard.vue'
import DashboardCard from '@/markdown/cards/DashboardCard.vue'

const props = defineProps<{ source: string }>()

const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: true })
md.use(cardPlugin)

const html = computed(() => md.render(props.source || ''))

type CardMount = { key: string; el: HTMLElement; props: any; is: any }
const cards = ref<CardMount[]>([])

async function collectCards() {
  cards.value = []
  await nextTick()
  const root = document.querySelector('.markdown-viewer') as HTMLElement
  if (!root) return
  const nodes: { el: HTMLElement; is: any; raw: string }[] = []
  root.querySelectorAll('.md-analysis-result').forEach((el) => nodes.push({ el: el as HTMLElement, is: AnalysisWidget, raw: (el as HTMLElement).dataset.props || '{}' }))
  root.querySelectorAll('.md-dataset-card').forEach((el) => nodes.push({ el: el as HTMLElement, is: DatasetCard, raw: (el as HTMLElement).dataset.props || '{}' }))
  root.querySelectorAll('.md-dashboard-card').forEach((el) => nodes.push({ el: el as HTMLElement, is: DashboardCard, raw: (el as HTMLElement).dataset.props || '{}' }))
  let idx = 0
  for (const node of nodes) {
    const raw = node.raw || '{}'
    const norm = raw.replace(/[“”]/g, '"').replace(/，/g, ',').replace(/：/g, ':')
    let props: any
    try { props = JSON.parse(norm) } catch { props = { title: 'Card', items: [] } }
    cards.value.push({ key: `card-${idx++}`, el: node.el, props, is: node.is })
  }
}

onMounted(collectCards)
watch(html, collectCards)
onBeforeUnmount(() => { cards.value = [] })
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