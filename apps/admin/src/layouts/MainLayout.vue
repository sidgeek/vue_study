<template>
  <div class="layout">
    <AppHeader />
    <main class="content">
      <el-breadcrumb separator="/" class="mb16">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ current }}</el-breadcrumb-item>
      </el-breadcrumb>
      <router-view />
    </main>
  </div>
 </template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const auth = useAuthStore()
auth.restore()

const current = computed(() => route.name?.toString() || 'dashboard')
</script>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.content { flex: 1; width: 100%; padding: 20px; overflow: auto; }
.mb16 { margin-bottom: 16px; }
</style>