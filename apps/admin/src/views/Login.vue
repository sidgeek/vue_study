<template>
  <div class="login">
    <el-card class="box">
      <h2>登录</h2>
      <el-form @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="role" placeholder="选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  </template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const role = ref<'admin' | 'user'>('user')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
auth.restore()

function onSubmit() {
  if (!username.value) return
  auth.login('mock-token-' + Date.now(), role.value, username.value)
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}
</script>

<style scoped>
.login {
  display: grid;
  place-items: center;
  height: 100vh;
}
.box { width: 360px; }
</style>