<template>
  <div class="slate-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">Slate 示例</div>
      </template>
      <Demo />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import Demo from '@/components/SlateEditor/Demo.vue'
</script>

<style scoped>
.slate-page { padding: 0; }
.card-header { font-weight: 600; }
</style>