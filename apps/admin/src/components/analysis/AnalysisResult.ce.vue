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
</style>