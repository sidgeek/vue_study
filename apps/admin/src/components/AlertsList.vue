<template>
  <el-card class="mb16">
    <template #header>
      <div class="hdr">
        <span>性能告警</span>
        <span class="muted" v-if="items.length">最近 {{ items.length }} 条</span>
      </div>
    </template>
    <div v-if="!items.length" class="empty">当前没有告警</div>
    <div v-else class="list">
      <el-alert
        v-for="a in items"
        :key="a.ts + '-' + a.metric"
        :type="a.severity === 'error' ? 'error' : 'warning'"
        :closable="false"
        show-icon
        class="item"
        :title="formatTitle(a)"
        :description="formatDesc(a)"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { AlertRecord } from '@/apis/alerts'

defineProps<{ items: AlertRecord[] }>()

function formatTs(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatTitle(a: AlertRecord) {
  const route = (a.route && (a.route.path || a.route.name)) || '—'
  return `${a.metric} · ${a.severity.toUpperCase()} · ${formatTs(a.ts)} · ${route}`
}

function formatDesc(a: AlertRecord) {
  return a.message
}
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.empty { color: var(--el-text-color-secondary); }
.list { display: grid; gap: 8px; }
.item { width: 100%; }
</style>