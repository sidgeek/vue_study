<template>
  <div class="g2-perf">
    <el-card class="mb16" shadow="never">
      <template #header>
        <div class="hdr">
          <span>G2 性能模拟</span>
          <span class="muted">多图 + 大时间跨度场景下的渲染表现</span>
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
              <G2LineChart :data="normalData" :height="300" :withLabel="true" :tickCount="6" />
            </BaseCard>
          </el-col>
          <el-col :span="12">
            <BaseCard>
              <template #header>柱状图</template>
              <G2IntervalChart :data="normalData" :height="300" :withLabel="true" :tickCount="6" />
            </BaseCard>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="大跨度" name="large" lazy>
        <el-row :gutter="16">
          <el-col :span="12">
            <BaseCard>
              <template #header>折线图</template>
              <G2LineChart :data="largeData" :height="300" :withLabel="true" :tickCount="6" />
            </BaseCard>
          </el-col>
          <el-col :span="12">
            <BaseCard>
              <template #header>柱状图</template>
              <G2IntervalChart :data="largeData" :height="300" :withLabel="true" :tickCount="6" />
            </BaseCard>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
 </template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import G2LineChart from '@/components/g2/G2LineChart.vue'
import G2IntervalChart from '@/components/g2/G2IntervalChart.vue'

 type Point = { ts: number; date: string; series: string; value: number }

const tab = ref<'normal'|'large'>('normal')

const normalData = ref<Point[]>([])
const largeData = ref<Point[]>([])

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
  largeData.value = gen(100)
})
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