<template>
  <div class="g2-minimal">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">G2 简图</div>
      </template>
      <G2BarChart :data="barData" :height="320" :withLabel="true" :useOverflowHide="true"/>
      <G2LineChart :data="lineData" :height="320" :withLabel="true" :useOverflowHide="true"/>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import G2BarChart from './G2BarChart.vue'
import G2LineChart from './G2LineChart.vue'

const base = new Date('2024-01-01T00:00:00Z').getTime()
const raw = [1, 78, 55, 90, 35, 62, 80, 27, 70, 88]

const barData = computed(() => raw.map((y, i) => ({
  date: new Date(base + i * 24 * 3600 * 1000).toISOString().slice(0, 10),
  value: y,
  series: 'Series 1',
})))

const lineData = computed(() => raw.map((y, i) => ({
  ts: base + i * 24 * 3600 * 1000,
  value: y,
  series: 'Series 1',
})))
</script>

<style scoped>
.g2-minimal { padding: 0 8px; }
.card-header { font-weight: 600; }
</style>