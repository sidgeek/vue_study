<template>
  <el-card class="trend">
    <template #header>
      <div class="hdr">
        <span>变化趋势</span>
        <span class="muted">基于 p50，较上次轮询</span>
      </div>
    </template>
    <div class="grid">
      <div v-for="k in keys" :key="k" class="item">
        <div class="name">{{ k }}</div>
        <div class="val">
          <component :is="iconOf(k)" :class="['ic', dirClass(k)]" />
          <span class="delta">{{ formatDelta(k) }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CaretTop, CaretBottom, Minus } from '@element-plus/icons-vue'
import type { MetricKey } from '@/hooks/useWebVitalsFeed'
import type { Trend } from '@/hooks/useWebVitalsTrend'
import { useWebVitalsTrend } from '@/hooks/useWebVitalsTrend'

type SummaryLike = { p50: number; p75: number; p95: number; count: number }

const props = defineProps<{ stats: Record<MetricKey, SummaryLike> }>()

const { trend } = useWebVitalsTrend(computed(() => props.stats))
const keys: MetricKey[] = ['LCP','CLS','INP','FCP','TTFB']

function iconOf(k: MetricKey) {
  const t: Trend = trend.value[k]
  if (t.direction === 'up') return CaretTop
  if (t.direction === 'down') return CaretBottom
  return Minus
}

function dirClass(k: MetricKey) {
  const d = trend.value[k].direction
  return d === 'up' ? 'up' : d === 'down' ? 'down' : 'flat'
}

function formatDelta(k: MetricKey) {
  const d = trend.value[k].delta
  if (k === 'CLS') return `${d.toFixed(3)}`
  return `${Math.abs(d).toFixed(2)}s${d < 0 ? '↓' : d > 0 ? '↑' : ''}`
}
</script>

<style scoped>
.trend { margin-top: 8px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
.item { display: flex; align-items: center; justify-content: space-between; padding: 8px; border: 1px solid var(--el-border-color); border-radius: 6px; }
.name { font-weight: 600; }
.val { display: flex; align-items: center; gap: 6px; }
.ic { width: 16px; height: 16px; }
.up { color: var(--el-color-danger); }
.down { color: var(--el-color-success); }
.flat { color: var(--el-text-color-secondary); }
.delta { font-variant-numeric: tabular-nums; }
</style>