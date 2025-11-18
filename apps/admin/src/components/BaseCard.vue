<template>
  <el-card :shadow="props.shadow ?? 'never'">
    <template #header v-if="props.showHeader !== false">
      <div class="card-header"><slot name="header">{{ props.title }}</slot></div>
    </template>
    <slot />
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string; shadow?: 'always' | 'hover' | 'never'; showHeader?: boolean }>()
</script>

<style scoped>
.card-header { font-weight: 600; }
</style>