<template>
  <el-card class="perf-card">
    <template #header>
      <div class="hdr">
        <span class="title">{{ title }}</span>
        <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
      </div>
    </template>
    <div class="metrics">
      <div class="item">
        <span class="label">p50</span>
        <span class="value">{{ format(p50) }}</span>
      </div>
      <div class="item">
        <span class="label">p75</span>
        <span class="value">{{ format(p75) }}</span>
      </div>
      <div class="item">
        <span class="label">p95</span>
        <span class="value">{{ format(p95) }}</span>
      </div>
      <div class="item">
        <span class="label">样本</span>
        <span class="value">{{ count }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: 'LCP'|'CLS'|'INP'|'FCP'|'TTFB'; p50: number; p75: number; p95: number; count: number }>()

const title = computed(() => props.name)
const p50 = computed(() => props.p50)
const p75 = computed(() => props.p75)
const p95 = computed(() => props.p95)
const count = computed(() => props.count)

function format(v: number): string {
  if (props.name === 'CLS') return v.toFixed(3)
  // 秒显示，保留2位
  return `${v.toFixed(2)}s`
}

function getStatus(): 'good'|'ni'|'poor' {
  const v = p75.value // 以 p75 作为健康度判断依据
  switch (props.name) {
    case 'LCP':
      return v <= 2.5 ? 'good' : v <= 4.0 ? 'ni' : 'poor'
    case 'CLS':
      return v <= 0.1 ? 'good' : v <= 0.25 ? 'ni' : 'poor'
    case 'INP':
      return v <= 0.2 ? 'good' : v <= 0.5 ? 'ni' : 'poor' // 单位秒
    case 'FCP':
      return v <= 1.8 ? 'good' : v <= 3.0 ? 'ni' : 'poor'
    case 'TTFB':
      return v <= 0.8 ? 'good' : v <= 1.8 ? 'ni' : 'poor'
    default:
      return 'ni'
  }
}

const statusTagType = computed(() => {
  const s = getStatus()
  return s === 'good' ? 'success' : s === 'ni' ? 'warning' : 'danger'
})
const statusText = computed(() => {
  const s = getStatus()
  return s === 'good' ? '良好' : s === 'ni' ? '需改进' : '较差'
})
</script>

<style scoped>
.perf-card { min-width: 220px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.title { font-weight: 600; }
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.item { display: grid; gap: 2px; }
.label { color: var(--el-text-color-secondary); font-size: 12px; }
.value { font-size: 14px; }
</style>