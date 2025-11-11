<template>
  <header class="app-header">
    <div class="left">
      <router-link to="/" class="brand">Admin</router-link>
    </div>
    <nav class="center">
      <el-menu
        class="nav"
        mode="horizontal"
        :default-active="active"
        @select="onSelect"
      >
        <el-menu-item index="home">首页</el-menu-item>
        <el-menu-item index="dashboard">仪表盘</el-menu-item>
        <el-menu-item index="analysis">分析</el-menu-item>
        <el-menu-item v-if="canManageUsers" index="users">用户管理</el-menu-item>
        <el-menu-item index="g6-dagre">G6 Dagre</el-menu-item>
        <el-menu-item index="slate">Slate</el-menu-item>
        <el-menu-item index="monaco-editor">Monaco</el-menu-item>
        <el-menu-item index="perf-stress">性能压测</el-menu-item>
      </el-menu>
    </nav>
    <div class="right">
      <span class="user">{{ displayName }}</span>
      <el-button type="primary" link @click="onLogout">退出</el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const active = computed(() => (route.name?.toString() || 'home'))
const displayName = computed(() => auth.name || '未登录')
const canManageUsers = computed(() => ['ADMIN','SUPER_ADMIN'].includes(auth.roleCode || 'VISITOR'))

function onSelect(index: string) {
  if (index === 'home') router.push({ name: 'home' })
  if (index === 'dashboard') router.push({ name: 'dashboard' })
  if (index === 'analysis') router.push({ name: 'analysis' })
  if (index === 'users') router.push({ name: 'users' })
  if (index === 'g6-dagre') router.push({ name: 'g6-dagre' })
  if (index === 'slate') router.push({ name: 'slate' })
  if (index === 'monaco-editor') router.push({ name: 'monaco-editor' })
  if (index === 'perf-stress') router.push({ name: 'perf-stress' })
}

function onLogout() {
  auth.logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.app-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color);
  backdrop-filter: saturate(180%) blur(8px);
  overflow: hidden;
}
.brand {
  font-weight: 600;
  font-size: 18px;
  color: var(--el-text-color-primary);
}
.nav :deep(.el-menu--horizontal) {
  border-bottom: none;
}
.right { display: inline-flex; align-items: center; gap: 8px; }
.user { color: var(--el-text-color-secondary); }
</style>