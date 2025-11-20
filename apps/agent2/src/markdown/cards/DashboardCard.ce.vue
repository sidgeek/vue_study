<template>
  <div class="card">
    <div class="hdr">
      <span class="title">{{ title }}</span>
    </div>
    <a class="link" :href="safeLink" target="_blank" rel="noopener noreferrer">{{ linkText || '查看' }}</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ title?: string; link?: string; linkText?: string }>()
const safeLink = computed(() => {
  const url = String(props.link || '').trim()
  if (!url) return '#'
  return url.startsWith('http') ? url : `http://${url}`
})
</script>

<style scoped>
.card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.title { font-weight: 600; }
.link { display: inline-block; margin-top: 8px; color: #2563eb; text-decoration: none; }
.link:hover { text-decoration: underline; }
</style>