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
        <el-row :gutter="16" class="mt16" v-for="(row, ri) in chunkedLargeData" :key="ri">
          <el-col :span="12" v-for="(ds, ci) in row" :key="ci">
            <BaseCard>
              <template #header>{{ ((ri*2+ci)%2===0) ? '折线图' : '柱状图' }}</template>
              <G2LineChart v-if="(ri*2+ci)%2===0" :data="ds" :height="300" :withLabel="true" :tickCount="6" labelMode="complex" :labelStep="120" />
              <G2IntervalChart v-else :data="ds" :height="300" :withLabel="true" :tickCount="6" labelMode="complex" :labelStep="120" />
            </BaseCard>
          </el-col>
        </el-row>
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

 type Point = { ts: number; date: string; series: string; value: number }

const tab = ref<'normal'|'large'>('normal')
const chartCountLarge = ref(4)
const singleData = ref<Point[]>([])

const normalData = ref<Point[]>([])
const largeDataList = ref<Point[][]>([])

function buildLargeList() {
  const list: Point[][] = []
  for (let i = 0; i < chartCountLarge.value; i++) {
    list.push(gen(360))
  }
  largeDataList.value = list
}

const chunkedLargeData = computed(() => {
  const rows: Point[][][] = []
  for (let i = 0; i < largeDataList.value.length; i += 2) {
    rows.push(largeDataList.value.slice(i, i + 2))
  }
  return rows
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

onMounted(() => {
  normalData.value = gen(90)
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

watch(chartCountLarge, () => buildLargeList())
</script>

<style scoped>
.g2-perf { display: grid; gap: 16px; }
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.desc { color: var(--el-text-color-secondary); }
.canvas { width: 100%; height: 300px; }
</style>