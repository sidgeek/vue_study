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
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.name" 
          :index="item.name"
        >
          {{ $t(item.i18nKey) }}
        </el-menu-item>
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

const menuItems = computed(() => {
  const rootRoute = router.options.routes.find(r => r.path === '/')
  if (!rootRoute || !rootRoute.children) return []

  return rootRoute.children
    .filter(r => {
      // 1. 必须在菜单显示
      if (!r.meta?.showInMenu) return false
      
      // 2. 权限过滤
      const roles = r.meta?.roles as string[] | undefined
      if (roles && roles.length) {
        const userRole = auth.roleCode || 'VISITOR'
        return roles.includes(userRole)
      }
      
      return true
    })
    .map(r => ({
      name: r.name as string,
      i18nKey: (r.meta?.i18nKey as string) || `nav.${r.name as string}`
    }))
})

function handleLangChange(lang: string) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

function onSelect(index: string) {
  router.push({ name: index })
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