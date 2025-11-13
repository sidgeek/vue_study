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
    </el-card>

    <el-tabs v-model="tab">
      <el-tab-pane label="基础图表" name="basic">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">折线图</div>
              </template>
              <ELineChart :title="'折线图'" :categories="line.categories" :series="line.series" :dark="dark" :height="320" @click="onChartClick" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">柱状图</div>
              </template>
              <EBarChart :title="'柱状图'" :categories="bar.categories" :series="bar.series" :dark="dark" :height="320" @click="onChartClick" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="16" class="mt16">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">饼图</div>
              </template>
              <EPieChart :title="'饼图'" :data="pie" :dark="dark" :height="320" @click="onChartClick" />
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
      </el-tab-pane>

      <el-tab-pane label="折线进阶" name="line-advanced">
        <el-card shadow="never"><div class="card-header">待添加</div></el-card>
      </el-tab-pane>
      <el-tab-pane label="柱状进阶" name="bar-advanced">
        <el-card shadow="never"><div class="card-header">待添加</div></el-card>
      </el-tab-pane>
      <el-tab-pane label="饼图进阶" name="pie-advanced">
        <el-card shadow="never"><div class="card-header">待添加</div></el-card>
      </el-tab-pane>
      <el-tab-pane label="地图/关系" name="geo-graph">
        <el-card shadow="never"><div class="card-header">待添加</div></el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ELineChart from '@/components/echarts/ELineChart.vue'
import EBarChart from '@/components/echarts/EBarChart.vue'
import EPieChart from '@/components/echarts/EPieChart.vue'

const dark = ref(false)
const size = ref(50)
const eventMsg = ref('')
const tab = ref('basic')
const line = ref<{ categories: string[]; series: { name: string; data: number[] }[] }>({ categories: [], series: [] })
const bar = ref<{ categories: string[]; series: { name: string; data: number[] }[] }>({ categories: [], series: [] })
const pie = ref<{ name: string; value: number }[]>([])

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

function buildData() {
  const s = genSeries(size.value)
  line.value = { categories: s.xs, series: [{ name: 'A', data: s.a }, { name: 'B', data: s.b }] }
  bar.value = { categories: s.xs, series: [{ name: 'A', data: s.a }, { name: 'B', data: s.b }] }
  pie.value = genPie(size.value)
}

function refresh() { buildData() }

function onChartClick(params: any) {
  eventMsg.value = `${params.seriesName || params.name || ''} · ${Array.isArray(params.value) ? params.value.join(',') : params.value}`
}

watch(size, () => { if (tab.value === 'basic') buildData() })
watch(tab, (val) => { if (val === 'basic') buildData() })

buildData()
</script>

<style scoped>
.echarts-page { display: grid; gap: 16px; }
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.ops { display: flex; align-items: center; gap: 12px; }
.chart { width: 100%; height: 320px; }
.card-header { font-weight: 600; }
.events { display: grid; gap: 8px; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
</style>