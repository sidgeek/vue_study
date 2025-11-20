<template>
  <AnalysisWidget :title="title" :items="parsed" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnalysisWidget from './AnalysisWidget.vue'
const props = defineProps<{ title?: string; items?: string }>()
const parsed = computed(() => {
  const raw = String(props.items || '[]')
  try { const v = JSON.parse(raw.replace(/&#39;/g, "'")); return Array.isArray(v) ? v : [] } catch { return [] }
})
</script>

<style>
@import 'element-plus/dist/index.css';
.el-card { background-color: #f8fafc; border-color: #e5e7eb; }
.card-header { font-weight: 600 }
.items { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px }
.item { display: flex; justify-content: space-between }
.label { color: #666 }
.value { color: #222; font-weight: 500 }
.actions { text-align: right }

.analysis-card .el-card{
  background-color: #9ea6af !important;
  border-color: #9ea6af !important;
}
</style>
