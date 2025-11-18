<template>
  <div class="g2-perf">
    <el-card class="mb16" shadow="never">
      <template #header>
        <div class="hdr">
          <span>G2 性能模拟</span>
          <div class="ops">
            <span class="muted">大跨度图表个数</span>
            <el-input-number v-model="chartCountLarge" :min="1" :max="12" />
          </div>
        </div>
      </template>
      <p class="desc">下方两个 Tab：正常跨度（约 90 天）与大跨度（约 2000 天）。每个 Tab 放置 4 个图表（折线/柱状），默认开启标签以模拟主线程计算负载。</p>
    </el-card>

    <el-tabs v-model="tab">
      <el-tab-pane label="正常跨度" name="normal" lazy>
        <el-row :gutter="16">
          <el-col :span="12">
            <BaseCard>
              <template #header>折线图</template>
              <G2LineChart :data="normalData" :height="300" :withLabel="true" :tickCount="6" labelMode="simple" :labelStep="1" />
            </BaseCard>
          </el-col>
          <el-col :span="12">
            <BaseCard>
              <template #header>折线图2</template>
              <G2LineChart :data="normalData" :height="300" :withLabel="true" :tickCount="6" labelMode="simple" :labelStep="16" />
            </BaseCard>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="大跨度" name="large" lazy>
        <div class="cards mt16" v-loading="isLargeLoading" element-loading-text="加载大跨度图表...">
          <div class="cardItem" v-for="(ds, i) in chunkedLargeData.slice(0, visibleLargeCount)" :key="i">
            <BaseCard :showHeader="false">
              <!-- <G2LineChart :data="ds" :height="300" :withLabel="true" :tickCount="6" labelMode="complex" :labelStep="labelStepFor(ds)" /> -->
              <G2LineChart :data="ds" :height="300" :withLabel="true" :tickCount="6" labelMode="complex" :labelStep="1" />
            </BaseCard>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="折线图" name="single" lazy>
        <el-row :gutter="16">
          <el-col :span="24">
            <BaseCard>
              <template #header>折线图（10点）</template>
              <SimpleLineChart :data="singleData" :height="300" :labelStep="2" />
            </BaseCard>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="OverflowHide" name="overflow" lazy>
        <el-row :gutter="16">
          <el-col :span="12">
            <BaseCard>
              <template #header>同数据 · 关闭 OverflowHide</template>
               <div v-for="(ds, i) in edgeDataSets" :key="i">
                  <G2BarChart :data="ds" :height="300" :withLabel="true" :tickCount="6" :useOverflowHide="false" />
                </div>
            </BaseCard>
          </el-col>
          <el-col :span="12">
            <BaseCard>
              <template #header>
              </template>
                <span>多组 · 开启 OverflowHide</span>
                <el-switch v-model="useOverflowHide" />
                <div v-for="(ds, i) in edgeDataSets" :key="i">
                  <G2BarChart :data="ds" :height="300" :withLabel="true" :tickCount="6" :useOverflowHide="useOverflowHide" />
                </div>
            </BaseCard>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="最简柱状图" name="minimal" lazy>
        <G2Minimal />
      </el-tab-pane>
    </el-tabs>
  </div>
 </template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, computed, watch } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import G2LineChart from '@/components/g2/G2LineChart.vue'
import G2IntervalChart from '@/components/g2/G2IntervalChart.vue'
import SimpleLineChart from '@/components/g2/SimpleLineChart.vue'
import G2BarChart from '@/components/g2/G2BarChart.vue'
import G2Minimal from '@/components/g2/G2Minimal.vue'

 type Point = { ts: number; date: string; series: string; value: number }

const tab = ref<'normal'|'large'>('normal')
const chartCountLarge = ref(12)
const useOverflowHide = ref(true)
const isLargeLoading = ref(false)
const visibleLargeCount = ref(0)
const singleData = ref<Point[]>([])

const normalData = ref<Point[]>([])
const midData = ref<Point[]>([])
const edgeData = ref<Point[]>([])
const edgeDataSets = ref<Point[][]>([])
const largeDataList = ref<Point[][]>([])

function buildLargeList() {
  const list: Point[][] = []
  for (let i = 0; i < chartCountLarge.value; i++) {
    list.push(gen(180))
  }
  largeDataList.value = list
}

const chunkedLargeData = computed(() => largeDataList.value)

function progressiveRender() {
  const total = largeDataList.value.length
  const step = 3
  visibleLargeCount.value = 0
  for (let i = 0; i < Math.ceil(total / step); i++) {
    setTimeout(() => {
      visibleLargeCount.value = Math.min(total, visibleLargeCount.value + step)
    }, i * 120)
  }
}

function startLargeLoading() {
  isLargeLoading.value = true
  visibleLargeCount.value = 0
  setTimeout(() => {
    isLargeLoading.value = false
    progressiveRender()
  }, 200)
}

watch(tab, (t) => {
  if (t === 'large') startLargeLoading()
  else visibleLargeCount.value = 0
})

function gen(days: number): Point[] {
  const out: Point[] = []
  const start = new Date()
  start.setDate(start.getDate() - days)
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime())
    d.setDate(start.getDate() + i)
    const ts = d.getTime()
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    out.push({ ts, date, series: 'A', value: Math.round(Math.random()*100) })
    out.push({ ts, date, series: 'B', value: Math.round(Math.random()*100) })
  }
  return out
}

function genMid(days: number): Point[] {
  const out: Point[] = []
  const start = new Date()
  start.setDate(start.getDate() - days)
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime())
    d.setDate(start.getDate() + i)
    const ts = d.getTime()
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const vA = 20 + Math.round(Math.random()*60)
    const vB = 20 + Math.round(Math.random()*60)
    out.push({ ts, date, series: 'A', value: vA })
    out.push({ ts, date, series: 'B', value: vB })
  }
  return out
}

function genEdge(days: number): Point[] {
  const out: Point[] = []
  const start = new Date()
  start.setDate(start.getDate() - days)
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime())
    d.setDate(start.getDate() + i)
    const ts = d.getTime()
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const high = 92 + Math.round(Math.random()*8)
    const low = Math.round(Math.random()*8)
    const vA = i % 2 === 0 ? high : low
    const vB = i % 2 === 0 ? low : high
    out.push({ ts, date, series: 'A', value: vA })
    out.push({ ts, date, series: 'B', value: vB })
  }
  return out
}

function buildEdgeSets(groups: number = 4) {
  const list: Point[][] = []
  for (let i = 0; i < groups; i++) {
    list.push(genEdge(360))
  }
  edgeDataSets.value = list
}

function labelStepFor(ds: Point[]): number {
  const n = Array.isArray(ds) ? ds.length : 0
  const maxLabels = 30
  return n > 50 ? Math.max(1, Math.ceil(n / maxLabels)) : 1
}

onMounted(() => {
  normalData.value = gen(90)
  midData.value = genMid(90)
  edgeData.value = genEdge(360)
  buildEdgeSets()
  buildLargeList()
  const start = new Date()
  start.setDate(start.getDate() - 10)
  const arr: Point[] = []
  for (let i = 0; i < 10; i++) {
    const d = new Date(start.getTime())
    d.setDate(start.getDate() + i)
    const ts = d.getTime()
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    arr.push({ ts, date, series: 'S', value: Math.round(Math.random()*100) })
  }
  singleData.value = arr
})

watch(chartCountLarge, () => { buildLargeList(); if (tab.value === 'large') startLargeLoading() })
</script>

<style scoped>
.g2-perf { display: grid; gap: 16px; }
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.desc { color: var(--el-text-color-secondary); }
.canvas { width: 100%; height: 300px; }
.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.cardItem { flex: 0 0 calc((100% - 3*16px)/4); }
</style>