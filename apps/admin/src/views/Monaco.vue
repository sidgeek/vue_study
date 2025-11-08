<template>
  <div class="monaco-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">Monaco Editor 示例</div>
      </template>
      <MonacoEditor />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import MonacoEditor from '@/components/MonacoEditor/index.vue'
</script>

<style scoped>
.monaco-page { padding: 0; }
.card-header { font-weight: 600; }
</style>