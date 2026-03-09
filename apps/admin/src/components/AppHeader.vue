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
        <el-menu-item index="home">{{ $t('nav.home') }}</el-menu-item>
        <el-menu-item index="dashboard">{{ $t('nav.dashboard') }}</el-menu-item>
        <el-menu-item index="analysis">{{ $t('nav.analysis') }}</el-menu-item>
        <el-menu-item index="echarts">{{ $t('nav.echarts') }}</el-menu-item>
        <el-menu-item v-if="canManageUsers" index="users">{{ $t('nav.users') }}</el-menu-item>
        <el-menu-item v-if="canManageUsers" index="playlist-manage">{{ $t('nav.playlistManage') }}</el-menu-item>
        <el-menu-item index="g6-dagre">{{ $t('nav.g6Dagre') }}</el-menu-item>
        <el-menu-item index="slate">{{ $t('nav.slate') }}</el-menu-item>
        <el-menu-item index="monaco-editor">{{ $t('nav.monaco') }}</el-menu-item>
        <el-menu-item index="perf-stress">{{ $t('nav.perfStress') }}</el-menu-item>
        <el-menu-item index="canvas-lab">{{ $t('nav.canvasLab') }}</el-menu-item>
        <el-menu-item index="playlists">{{ $t('nav.playlists') }}</el-menu-item>
      </el-menu>
    </nav>
    <div class="right">
      <el-dropdown @command="handleLangChange">
        <span class="el-dropdown-link">
          {{ $t('common.language') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh">中文</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span class="user">{{ displayName }}</span>
      <el-button type="primary" link @click="onLogout">{{ $t('common.logout') }}</el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'
import i18n from '@/i18n'

const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const active = computed(() => (route.name?.toString() || 'home'))
const displayName = computed(() => auth.name || '未登录')
const canManageUsers = computed(() => ['ADMIN','SUPER_ADMIN'].includes(auth.roleCode || 'VISITOR'))

function handleLangChange(lang: string) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

function onSelect(index: string) {
  if (index === 'home') router.push({ name: 'home' })
  if (index === 'dashboard') router.push({ name: 'dashboard' })
  if (index === 'analysis') router.push({ name: 'analysis' })
  if (index === 'echarts') router.push({ name: 'echarts' })
  if (index === 'users') router.push({ name: 'users' })
  if (index === 'playlist-manage') router.push({ name: 'playlist-manage' })
  if (index === 'g6-dagre') router.push({ name: 'g6-dagre' })
  if (index === 'slate') router.push({ name: 'slate' })
  if (index === 'monaco-editor') router.push({ name: 'monaco-editor' })
  if (index === 'perf-stress') router.push({ name: 'perf-stress' })
  if (index === 'canvas-lab') router.push({ name: 'canvas-lab' })
  if (index === 'playlists') router.push({ name: 'playlists' })
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
.right { display: inline-flex; align-items: center; gap: 16px; }
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  font-size: 14px;
}
.user { color: var(--el-text-color-secondary); }
</style>