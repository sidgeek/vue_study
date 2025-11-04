<template>
  <div class="layout">
    <el-container>
      <el-header>
        <div class="brand">Admin</div>
        <div class="spacer" />
        <el-button type="text" @click="logout">退出</el-button>
      </el-header>
      <el-main>
        <el-breadcrumb separator="/" class="mb16">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ current }}</el-breadcrumb-item>
        </el-breadcrumb>
        <router-view />
      </el-main>
    </el-container>
  </div>
 </template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
auth.restore()

const current = computed(() => route.name?.toString() || 'dashboard')

function logout() {
  auth.logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.layout { min-height: 100vh; }
.brand { font-weight: 600; }
.spacer { flex: 1; }
.mb16 { margin-bottom: 16px; }
:deep(.el-header) { display: flex; align-items: center; gap: 12px; }
</style>