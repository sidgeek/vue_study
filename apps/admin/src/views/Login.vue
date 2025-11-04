<template>
  <div class="login">
    <el-card class="box">
      <h2>登录</h2>
      <el-form @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
          <el-button @click="onRegister" style="margin-left:8px">注册并登录</el-button>
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
const password = ref('')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
auth.restore()

async function onSubmit() {
  if (!username.value || !password.value) return
  try {
    await auth.loginWithApi(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    alert(e?.message || '登录失败')
  }
}

async function onRegister() {
  if (!username.value || !password.value) return
  try {
    await auth.registerAndLogin(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    alert(e?.message || '注册失败')
  }
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