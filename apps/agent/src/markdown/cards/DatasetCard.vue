<template>
  <div class="card">
    <div class="hdr">
      <span class="title">{{ title }}</span>
      <span class="tag">{{ name }}</span>
    </div>
    <div class="val">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string; name?: string; value?: number | string }>()
</script>

<style scoped>
.card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.title { font-weight: 600; }
.tag { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.val { font-size: 24px; font-weight: 700; margin-top: 8px; }
</style>