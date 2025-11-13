<template>
  <div class="echarts-page">
    <el-card class="mb16" shadow="never">
      <template #header>
        <div class="hdr">
          <span>ECharts 学习与示例</span>
          <div class="ops">
            <el-switch v-model="dark" active-text="暗色主题" inactive-text="亮色主题" />
            <el-slider v-model="size" :min="10" :max="200" :step="10" style="width:240px" />
            <el-button size="small" @click="refresh">刷新数据</el-button>
          </div>
        </div>
      </template>
      <p class="desc">包含折线图、柱状图、饼图的基础用法，支持主题切换、数据刷新与自适应。</p>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">折线图</div>
          </template>
          <div ref="lineRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">柱状图</div>
          </template>
          <div ref="barRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">饼图</div>
          </template>
          <div ref="pieRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">事件与交互</div>
          </template>
          <div class="events">
            <el-alert :title="eventMsg || '暂无事件'" type="info" show-icon />
            <p class="muted">点击图形后显示最近一次事件信息。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'

echarts.use([LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent, CanvasRenderer, UniversalTransition])

const lineRef = ref<HTMLDivElement | null>(null)
const barRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
const lineChart = shallowRef<echarts.EChartsType | null>(null)
const barChart = shallowRef<echarts.EChartsType | null>(null)
const pieChart = shallowRef<echarts.EChartsType | null>(null)
const dark = ref(false)
const size = ref(50)
const eventMsg = ref('')

function genSeries(n: number) {
  const xs: string[] = []
  const a: number[] = []
  const b: number[] = []
  for (let i = 0; i < n; i++) {
    xs.push(String(i + 1))
    a.push(Math.round(Math.random() * 100))
    b.push(Math.round(Math.random() * 100))
  }
  return { xs, a, b }
}

function genPie(n: number) {
  const items: { name: string; value: number }[] = []
  for (let i = 0; i < Math.max(3, Math.min(12, Math.floor(n / 10))); i++) {
    items.push({ name: `分类${i + 1}`, value: Math.round(Math.random() * 100) + 10 })
  }
  return items
}

function initAll() {
  disposeAll()
  if (lineRef.value) lineChart.value = echarts.init(lineRef.value, dark.value ? 'dark' : undefined)
  if (barRef.value) barChart.value = echarts.init(barRef.value, dark.value ? 'dark' : undefined)
  if (pieRef.value) pieChart.value = echarts.init(pieRef.value, dark.value ? 'dark' : undefined)
  setOptions()
  bindEvents()
}

function disposeAll() {
  if (lineChart.value) { lineChart.value.dispose(); lineChart.value = null }
  if (barChart.value) { barChart.value.dispose(); barChart.value = null }
  if (pieChart.value) { pieChart.value.dispose(); pieChart.value = null }
}

function setOptions() {
  const series = genSeries(size.value)
  if (lineChart.value) {
    lineChart.value.setOption({
      title: { text: '折线图' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['A', 'B'] },
      grid: { left: 40, right: 20, top: 40, bottom: 40 },
      xAxis: { type: 'category', data: series.xs },
      yAxis: { type: 'value' },
      series: [
        { type: 'line', name: 'A', data: series.a, smooth: true },
        { type: 'line', name: 'B', data: series.b, smooth: true }
      ]
    })
  }
  if (barChart.value) {
    barChart.value.setOption({
      title: { text: '柱状图' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['A', 'B'] },
      grid: { left: 40, right: 20, top: 40, bottom: 40 },
      xAxis: { type: 'category', data: series.xs },
      yAxis: { type: 'value' },
      series: [
        { type: 'bar', name: 'A', data: series.a },
        { type: 'bar', name: 'B', data: series.b }
      ]
    })
  }
  if (pieChart.value) {
    pieChart.value.setOption({
      title: { text: '饼图' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        { type: 'pie', radius: '60%', data: genPie(size.value), emphasis: { itemStyle: { shadowBlur: 6, shadowOffsetX: 0 } } }
      ]
    })
  }
}

function bindEvents() {
  const handler = (params: any) => {
    eventMsg.value = `${params.seriesName || params.name || ''} · ${Array.isArray(params.value) ? params.value.join(',') : params.value}`
  }
  if (lineChart.value) lineChart.value.on('click', handler)
  if (barChart.value) barChart.value.on('click', handler)
  if (pieChart.value) pieChart.value.on('click', handler)
}

function refresh() {
  setOptions()
}

function resizeAll() {
  if (lineChart.value) lineChart.value.resize()
  if (barChart.value) barChart.value.resize()
  if (pieChart.value) pieChart.value.resize()
}

watch(dark, () => { initAll() })
watch(size, () => { setOptions() })

onMounted(() => {
  initAll()
  window.addEventListener('resize', resizeAll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAll)
  disposeAll()
})
</script>

<style scoped>
.echarts-page { display: grid; gap: 16px; }
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.ops { display: flex; align-items: center; gap: 12px; }
.desc { color: var(--el-text-color-secondary); }
.chart { width: 100%; height: 320px; }
.card-header { font-weight: 600; }
.events { display: grid; gap: 8px; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
</style>