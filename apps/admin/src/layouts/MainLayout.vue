<template>
  <div class="layout">
    <AppHeader />
    <main class="content">
      <el-breadcrumb separator="/" class="mb16">
        <el-breadcrumb-item>{{ t('nav.home') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentLabel }}</el-breadcrumb-item>
      </el-breadcrumb>
      <router-view />
    </main>
  </div>
 </template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
auth.restore()

const currentLabel = computed(() => {
  if (route.name?.toString() === 'playlists') {
    const qn = String((route.query as any)?.name || '').trim()
    if (qn) return qn
  }
  
  const i18nKey = route.meta?.i18nKey as string
  return i18nKey ? t(i18nKey) : (route.name?.toString() || t('nav.home'))
})
</script>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.content { flex: 1; width: 100%; padding: 20px; overflow: auto; }
.mb16 { margin-bottom: 16px; }
</style>