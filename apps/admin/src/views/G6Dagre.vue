<template>
  <el-card class="g6-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span>G6 Dagre 布局演示</span>
        <div class="actions">
          <el-select v-model="dir" size="small" style="width: 140px">
            <el-option label="从上到下 (TB)" value="TB" />
            <el-option label="从左到右 (LR)" value="LR" />
            <el-option label="从下到上 (BT)" value="BT" />
            <el-option label="从右到左 (RL)" value="RL" />
          </el-select>
          <el-button size="small" @click="refresh">刷新布局</el-button>
        </div>
      </div>
    </template>
    <div ref="containerRef" class="graph-container"></div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import G6 from '@antv/g6'

const containerRef = ref<HTMLDivElement | null>(null)
// 修正类型声明：@antv/g6 默认导出不提供命名空间类型，使用构造函数实例类型
type GGraph = InstanceType<typeof G6.Graph>
const graphRef = ref<GGraph | null>(null)
const dir = ref<'TB' | 'LR' | 'BT' | 'RL'>('LR')

const data = {
  nodes: [
    { id: 'A', label: '开始' },
    { id: 'B', label: '任务 1' },
    { id: 'B2', label: '任务 1-2' },
    { id: 'C', label: '任务 2' },
    { id: 'D', label: '任务 3' },
    { id: 'E', label: '结束' }
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'B2' },
    { source: 'B2', target: 'D' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'E' }
  ]
}

let ro: ResizeObserver | null = null

async function init() {
  await nextTick()
  const el = containerRef.value
  if (!el) return
  graphRef.value?.destroy()
  let width = el.clientWidth
  let height = el.clientHeight

  // 兼容首次渲染容器尺寸为 0 的情况（Card/Flex 布局尚未完成）
  if (width === 0 || height === 0) {
    await new Promise((r) => setTimeout(r, 50))
    width = el.clientWidth
    height = el.clientHeight
    if (width === 0 || height === 0) return
  }

  const graph = new G6.Graph({
    container: el,
    width,
    height,
    layout: {
      type: 'dagre',
      rankdir: dir.value,
      nodesep: 30,
      ranksep: 60,
      controlPoints: true
    },
    modes: { default: ['drag-node', 'zoom-canvas', 'drag-canvas'] },
    defaultNode: {
      type: 'rect',
      size: [100, 40],
      style: { radius: 8, fill: '#fff', stroke: '#d9d9d9' },
      labelCfg: { style: { fill: '#333' } }
    },
    defaultEdge: {
      type: 'polyline',
      style: { stroke: '#bfbfbf', endArrow: true, radius: 8 }
    }
  })

  graph.data(data)
  graph.render()
  graph.fitView(20)
  graphRef.value = graph
}

function refresh() {
  if (!graphRef.value) return
  graphRef.value.updateLayout({ type: 'dagre', rankdir: dir.value })
}

onMounted(() => {
  init()
  const resize = () => {
    const el = containerRef.value
    if (!el || !graphRef.value) return
    graphRef.value.changeSize(el.clientWidth, el.clientHeight)
  }
  window.addEventListener('resize', resize)
  // 使用 ResizeObserver 在容器尺寸变化时自动调整画布
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => resize())
    if (containerRef.value) ro.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  graphRef.value?.destroy()
  graphRef.value = null
  ro?.disconnect()
  ro = null
})

watch(dir, () => {
  refresh()
})
</script>

<style scoped>
.g6-card { height: calc(100vh - 140px); display: flex; flex-direction: column; }
.g6-card :deep(.el-card__body) { flex: 1; display: flex; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.actions { display: inline-flex; gap: 8px; align-items: center; }
.graph-container { width: 100%; flex: 1; min-height: 420px; border: 1px dashed var(--el-border-color); border-radius: 8px; }
</style>