<template>
  <el-card :shadow="props.shadow ?? 'never'">
    <template #header>
      <div class="card-header"><slot name="header">{{ props.title }}</slot></div>
    </template>
    <slot />
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string; shadow?: 'always' | 'hover' | 'never' }>()
</script>

<style scoped>
.card-header { font-weight: 600; }
</style>