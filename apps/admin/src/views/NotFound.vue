<template>
  <div class="nf">
    <el-empty description="页面未找到" />
    <el-button type="primary" @click="$router.replace('/')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.nf { display: grid; place-items: center; gap: 12px; padding: 60px 0; }
</style>