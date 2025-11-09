<template>
  <el-card class="trend-chart">
    <template #header>
      <div class="hdr">
        <span>趋势折线</span>
        <div class="ops">
          <el-select v-model="selected" size="small" multiple collapse-tags placeholder="选择指标" style="width:240px">
            <el-option v-for="k in allKeys" :key="k" :label="k" :value="k" />
          </el-select>
        </div>
      </div>
    </template>
    <div ref="mount" class="canvas"></div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import type { MetricKey } from '@/hooks/useWebVitalsFeed'
import type { WebVitalRecord } from '@/apis/metrics'
import { buildSeries } from '@/hooks/useWebVitalsSeries'
import { Chart } from '@antv/g2'

const props = defineProps<{ items: WebVitalRecord[]; defaultKeys?: MetricKey[] }>()
const allKeys: MetricKey[] = ['LCP','CLS','INP','FCP','TTFB']
const selected = ref<MetricKey[]>(props.defaultKeys || ['LCP','TTFB'])
const mount = ref<HTMLDivElement | null>(null)
let chart: Chart | null = null

const data = computed(() => buildSeries(props.items, selected.value))

onMounted(() => {
  if (!mount.value) return
  chart = new Chart({ container: mount.value, autoFit: true, height: 240 })
  chart.options({
    theme: 'classic',
    tooltip: { shared: true },
    axes: {
      value: { title: '值', labelFormatter: (v: number) => String(Number(v).toFixed(2)) },
      ts: { title: '时间' }
    }
  })
  chart.line().data(data.value).encode('x','ts').encode('y','value').encode('color','metric').style('shape','smooth')
  chart.render()
})

watch(data, (val) => {
  if (!chart) return
  chart.changeData(val)
})

onUnmounted(() => { if (chart) { chart.destroy(); chart = null } })
</script>

<style scoped>
.trend-chart { margin-top: 8px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.ops { display: flex; align-items: center; gap: 8px; }
.canvas { width: 100%; height: 260px; }
</style>