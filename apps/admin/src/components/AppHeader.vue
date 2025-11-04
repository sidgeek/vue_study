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
        <el-menu-item index="dashboard">仪表盘</el-menu-item>
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

const active = computed(() => (route.name?.toString() || 'dashboard'))
const displayName = computed(() => auth.name || '未登录')

function onSelect(index: string) {
  if (index === 'dashboard') router.push({ name: 'dashboard' })
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