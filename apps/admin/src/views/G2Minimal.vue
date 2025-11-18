<template>
  <div class="g2-minimal">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">G2 最简折线图</div>
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

const data = Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: Math.round(20 + Math.random() * 80) }))

function init() {
  dispose()
  if (!mount.value) return
  const c = new Chart({ container: mount.value, autoFit: true })
  c.options({
    theme: 'classic',
    axis: { x: { title: 'x', tickCount: 10 }, y: { title: 'y' } },
    scale: { x: { type: 'linear', domain: [1, 10], nice: true }, y: { nice: true } },
    tooltip: { shared: false, crosshairs: true },
  })
  c.data(data)
  const line = c.line().encode('x', 'x').encode('y', 'y')
  line.label({ text: 'y' })
  c.point().encode('x', 'x').encode('y', 'y').style('size', 32)
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