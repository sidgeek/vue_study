<template>
  <div class="dashboard">
    <el-card class="mb16">
      <template #header>
        <div class="hdr">
          <span>性能仪表盘</span>
          <el-tag v-if="latest" type="info" size="small">最近会话 {{ latest.sessionId }} · 导航 {{ latest.navigationId }}</el-tag>
        </div>
      </template>
      <p class="desc">以下为最近 {{ limit }} 条记录的统计（p50/p75/p95），每 {{ pollMs/1000 }}s 轮询更新。</p>
    </el-card>

  <div class="grid">
      <PerfCard name="LCP" :p50="stats.LCP.p50" :p75="stats.LCP.p75" :p95="stats.LCP.p95" :count="stats.LCP.count" />
      <PerfCard name="CLS" :p50="stats.CLS.p50" :p75="stats.CLS.p75" :p95="stats.CLS.p95" :count="stats.CLS.count" />
      <PerfCard name="INP" :p50="stats.INP.p50" :p75="stats.INP.p75" :p95="stats.INP.p95" :count="stats.INP.count" />
      <PerfCard name="FCP" :p50="stats.FCP.p50" :p75="stats.FCP.p75" :p95="stats.FCP.p95" :count="stats.FCP.count" />
      <PerfCard name="TTFB" :p50="stats.TTFB.p50" :p75="stats.TTFB.p75" :p95="stats.TTFB.p95" :count="stats.TTFB.count" />
  </div>

  <TrendPanel :stats="stats" />
  <TrendChart :items="items" />

    <el-card>
      <template #header>
        <div class="hdr">
          <span>最近记录</span>
          <span class="muted">{{ items.length }} 条</span>
        </div>
      </template>
      <el-table :data="items" height="360" stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :data="row.metrics" size="small">
              <el-table-column prop="name" label="指标" width="100" />
              <el-table-column label="值">
                <template #default="{ row: m }">
                  <span v-if="m.name==='CLS'">{{ m.value.toFixed(3) }}</span>
                  <span v-else>{{ (m.value/1000).toFixed(2) }}s</span>
                </template>
              </el-table-column>
              <el-table-column prop="rating" label="评级" width="120" />
              <el-table-column prop="id" label="ID" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatTs(row.ts) }}</template>
        </el-table-column>
        <el-table-column label="路由" min-width="160">
          <template #default="{ row }">
            {{ (row.route && (row.route.path || row.route.name)) || '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="sessionId" label="会话" width="200" />
        <el-table-column prop="navigationId" label="导航" width="100" />
        <el-table-column label="指标数" width="100">
          <template #default="{ row }">{{ row.metrics.length }}</template>
        </el-table-column>
      </el-table>
      <div v-if="error" class="error">{{ error }}</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import PerfCard from '@/components/PerfCard.vue'
import TrendPanel from '@/components/TrendPanel.vue'
import TrendChart from '@/components/TrendChart.vue'
import { useWebVitalsFeed } from '@/hooks/useWebVitalsFeed'

const pollMs = 2000
const limit = 200
const { items, stats, error, latestContext: latest } = useWebVitalsFeed(pollMs, limit)

function formatTs(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
</script>

<style scoped>
.dashboard { display: grid; gap: 16px; }
.mb16 { margin-bottom: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.desc { color: var(--el-text-color-secondary); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.error { margin-top: 8px; color: var(--el-color-danger); }
</style>