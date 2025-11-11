<template>
  <div class="home-page">
    <el-alert type="info" title="首页组合演示" show-icon class="mb16" description="该页面一次性渲染各示例组件，用于模拟前端性能压力场景。" />

    <!-- 性能压测组件：直接在首页触发可控的性能问题 -->
    <el-row :gutter="16" class="mt16">
      <el-col :span="24">
        <PerfStress />
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">Monaco Editor 示例</div>
          </template>
          <MonacoEditor />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">Slate 示例</div>
          </template>
          <SlateDemo />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt16">
      <el-col :span="12">
        <Analysis />
      </el-col>

      <el-col :span="12">
        <Users v-if="canManageUsers" />
        <el-card v-else shadow="never">
          <template #header>
            <div class="card-header">用户管理</div>
          </template>
          <el-empty description="权限不足，无法查看用户列表" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt16">
      <el-col :span="24">
        <G6Dagre />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import MonacoEditor from '@/components/MonacoEditor/index.vue'
import SlateDemo from '@/components/SlateEditor/Demo.vue'
import Analysis from '@/views/Analysis.vue'
import Users from '@/views/Users.vue'
import G6Dagre from '@/views/G6Dagre.vue'
import PerfStress from '@/views/PerfStress.vue'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
auth.restore()
console.log('>>> roleCode', auth.roleCode)
const canManageUsers = computed(() => ['ADMIN','SUPER_ADMIN'].includes(auth.roleCode || 'VISITOR'))
</script>

<style scoped>
.home-page { padding: 0; }
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
.card-header { font-weight: 600; }
</style>