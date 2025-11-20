<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">{{ title }}</div>
    </template>
    <div class="items">
      <div v-for="(it, i) in stats" :key="i" class="item">
        <span class="label">{{ it.label }}</span>
        <span class="value">{{ it.value }}</span>
      </div>
    </div>
    <div class="actions">
      <el-button type="primary" size="small" :disabled="!interactive" @click="handleOperate">操作</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps<{ title: string; items: { label: string; value: string | number }[]; interactive?: boolean }>()
const emit = defineEmits<{ (e: 'action', payload: { source: string; items: { label: string; value: string | number }[] }): void }>()
const stats = ref(props.items.slice())
const interactive = props.interactive ?? true
watch(() => props.items, (v) => { stats.value = v.slice() })

function handleOperate() {
  if (!interactive) return
  const next = stats.value.map((it) => {
    if (String(it.label).includes('准确率')) {
      const val = Math.min(99, Math.max(80, Math.round(90 + Math.random() * 5)))
      return { ...it, value: `${val}%` }
    }
    if (String(it.label).includes('召回率')) {
      const val = Math.min(99, Math.max(80, Math.round(86 + Math.random() * 5)))
      return { ...it, value: `${val}%` }
    }
    if (String(it.label).includes('样本数')) {
      const num = typeof it.value === 'number' ? it.value : parseInt(String(it.value) || '0', 10)
      return { ...it, value: (isNaN(num) ? 0 : num) + 50 }
    }
    if (String(it.label).includes('耗时')) {
      const val = Math.round(360 + Math.random() * 60)
      return { ...it, value: `${val}ms` }
    }
    return it
  })
  stats.value = next
  emit('action', { source: 'AnalysisWidget', items: next })
}
</script>

<style scoped>
.card-header { font-weight: 600 }
.items { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px }
.item { display: flex; justify-content: space-between }
.label { color: #666 }
.value { color: #222; font-weight: 500 }
.actions { text-align: right }
</style>