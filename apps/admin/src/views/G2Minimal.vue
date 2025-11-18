<template>
  <div class="g2-minimal">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">G2 最简柱状图</div>
      </template>
      <div ref="mount" class="canvas"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'
import { Chart } from '@antv/g2'

const mount = ref<HTMLDivElement | null>(null)
const chart = shallowRef<Chart | null>(null)

const data = [
  { x: 1, y: 1 },
  { x: 2, y: 78 },
  { x: 3, y: 55 },
  { x: 4, y: 90 },
  { x: 5, y: 35 },
  { x: 6, y: 62 },
  { x: 7, y: 80 },
  { x: 8, y: 27 },
  { x: 9, y: 70 },
  { x: 10, y: 88 },
]

function init() {
  dispose()
  if (!mount.value) return
  const c = new Chart({ container: mount.value, autoFit: true })
  c.options({
    theme: 'classic',
    axis: { x: { title: 'x', tickCount: 10 }, y: { title: 'y' } },
    scale: { x: { type: 'band' }, y: { nice: true } },
    tooltip: { shared: false, crosshairs: true },
  })
  c.data(data)
  const bar = c.interval().encode('x', 'x').encode('y', 'y').style('columnWidthRatio', 0.6)
  bar.label({ text: 'y', position: 'top' })
  c.render()
  chart.value = c
}

function dispose() { if (chart.value) { chart.value.destroy(); chart.value = null } }

onMounted(() => init())
onBeforeUnmount(() => dispose())
</script>

<style scoped>
.g2-minimal { padding: 0 8px; }
.canvas { width: 100%; height: 320px; }
.card-header { font-weight: 600; }
</style>