<template>
  <div class="users-page">
    <div class="toolbar">
      <div class="left">
        <el-input
          v-model="usernameFilter"
          placeholder="按用户名过滤"
          clearable
          style="width: 240px"
          @keyup.enter="onSearch"
        />
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </div>
      <div class="right">
        <el-button type="primary" @click="showCreate = true">新增用户</el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="users" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="nickname" label="昵称" min-width="160">
          <template #default="{ row }">
            <span>{{ row.nickname || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5,10,20,50]"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="showCreate" title="新增用户" width="420px">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="输入初始密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="onCreate">创建</el-button>
      </template>
      <p class="tip">当前后端未提供编辑/删除接口；昵称将与用户名相同。</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listUsers } from '@/apis/users'
import { register } from '@/apis/auth'
import { ElMessage } from 'element-plus'

type U = { id: number; username: string; nickname: string | null }

const users = ref<U[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const usernameFilter = ref('')
const route = useRoute()
const router = useRouter()

async function fetchData() {
  const res = await listUsers(page.value, pageSize.value, usernameFilter.value)
  users.value = res.items
  total.value = res.total
}

function applyQuery() {
  const q: Record<string, any> = {
    page: page.value,
    pageSize: page.value ? pageSize.value : undefined,
    username: usernameFilter.value || undefined
  }
  // 清理 undefined，避免出现多余的键
  Object.keys(q).forEach((k) => q[k] === undefined && delete (q as any)[k])
  router.replace({ name: 'users', query: q })
}

function restoreFromQuery() {
  const qp = Number(route.query.page || 1)
  const qs = Number(route.query.pageSize || 10)
  const qu = String(route.query.username || '')
  page.value = isFinite(qp) && qp > 0 ? qp : 1
  pageSize.value = isFinite(qs) && qs > 0 ? qs : 10
  usernameFilter.value = qu
}

function onPageChange(p: number) { page.value = p; applyQuery(); fetchData() }
function onSizeChange(s: number) { pageSize.value = s; page.value = 1; applyQuery(); fetchData() }
function onSearch() { page.value = 1; applyQuery(); fetchData() }

onMounted(() => { restoreFromQuery(); fetchData() })

// 当用户手动修改地址栏或通过浏览器前进/后退导致 query 变化时，同步状态并拉取数据
watch(() => route.query, () => { restoreFromQuery(); fetchData() })

const showCreate = ref(false)
const creating = ref(false)
const form = reactive({ username: '', password: '' })

async function onCreate() {
  if (!form.username || !form.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  try {
    creating.value = true
    await register(form.username, form.password, form.username)
    ElMessage.success('创建成功')
    showCreate.value = false
    form.username = ''
    form.password = ''
    // 刷新列表，回到第一页以可见新用户（后端按创建时间倒序）
    page.value = 1
    await fetchData()
  } catch (e: any) {
    ElMessage.error(e?.message || '创建失败')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.users-page { display: grid; gap: 12px; }
.toolbar { display: flex; justify-content: flex-end; }
.pager { display: flex; justify-content: flex-end; margin-top: 12px; }
.tip { margin-top: 8px; color: var(--el-text-color-secondary); font-size: 12px; }
</style>