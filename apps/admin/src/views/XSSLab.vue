<template>
  <div class="xss-lab">
    <el-card class="mb16">
      <template #header>
        <div class="hdr">
          <span>XSS 演示实验室（请勿用于生产）</span>
          <el-tag type="danger" size="small">此页故意不做转义/过滤</el-tag>
        </div>
      </template>
      <p class="muted">此页面用于安全演示，包含典型的 <strong>反射型</strong>、<strong>存储型</strong>、<strong>DOM 型</strong> XSS。请仅在本地/沙箱环境使用。</p>
    </el-card>

    <!-- 反射型 XSS：通过查询参数渲染到页面，未做任何转义（v-html） -->
    <el-card class="mb16">
      <template #header>
        <div class="hdr">
          <span>反射型 XSS</span>
          <span class="muted">来源：URL 查询参数 q</span>
        </div>
      </template>
      <div class="row">
        <el-input v-model="reflected" placeholder="输入将被以 v-html 渲染（危险）" />
        <el-button type="primary" @click="applyQuery">应用到 URL ?q=...</el-button>
      </div>
      <div class="preview" v-html="reflected"></div>
      <div class="payloads">
        <el-button v-for="p in payloads" :key="p" @click="reflected = p">注入：{{ truncate(p) }}</el-button>
      </div>
    </el-card>

    <!-- 存储型 XSS：保存到本地存储并列表展示，未做任何过滤（v-html） -->
    <el-card class="mb16">
      <template #header>
        <div class="hdr">
          <span>存储型 XSS</span>
          <span class="muted">来源：本地存储（localStorage）</span>
        </div>
      </template>
      <div class="row">
        <el-input v-model="comment" placeholder="添加评论（将以 v-html 展示）" />
        <el-button type="warning" @click="addComment">保存</el-button>
        <el-button type="default" @click="clearComments">清空</el-button>
      </div>
      <div class="list">
        <div v-for="(c, i) in comments" :key="i" class="item" v-html="c"></div>
      </div>
    </el-card>

    <!-- DOM 型 XSS：基于 location.hash 或动态 innerHTML 注入 -->
    <el-card>
      <template #header>
        <div class="hdr">
          <span>DOM 型 XSS</span>
          <span class="muted">来源：location.hash（未校验直接渲染）</span>
        </div>
      </template>
      <div class="row">
        <el-input v-model="hashInput" placeholder="写入到 #hash 并以 v-html 渲染" />
        <el-button type="primary" @click="applyHash">应用到 hash</el-button>
      </div>
      <div class="preview" v-html="hashValue"></div>
      <div class="payloads">
        <el-button v-for="p in payloads" :key="'h-'+p" @click="hashInput = p">注入：{{ truncate(p) }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 演示用的典型 XSS payload（可靠执行的事件属性等）
const payloads = [
  `<img src=x onerror=alert('XSS')>`,
  `<a href=javascript:alert('XSS')>点击我</a>`,
  `<div style=\"color:red\" onclick=alert('XSS')>点我触发</div>`
]

// 反射型：来自查询参数 q
const reflected = ref('')
function readQuery() {
  try {
    const q = new URLSearchParams(location.search).get('q')
    reflected.value = q || ''
  } catch { /* noop */ }
}
function applyQuery() {
  const url = new URL(location.href)
  url.searchParams.set('q', reflected.value)
  history.replaceState(null, '', url.toString())
}

// 存储型：本地存储 comments
const comment = ref('')
const comments = ref<string[]>([])
const KEY = 'xss-lab-comments'
function restoreComments() {
  try {
    const raw = localStorage.getItem(KEY)
    comments.value = raw ? JSON.parse(raw) : []
  } catch { comments.value = [] }
}
function addComment() {
  if (!comment.value) return
  comments.value.push(comment.value)
  localStorage.setItem(KEY, JSON.stringify(comments.value))
  comment.value = ''
}
function clearComments() {
  comments.value = []
  localStorage.removeItem(KEY)
}

// DOM 型：基于 hash 注入
const hashInput = ref('')
const hashValue = ref('')
function readHash() {
  hashValue.value = decodeURIComponent(location.hash.replace(/^#/, ''))
}
function applyHash() {
  location.hash = encodeURIComponent(hashInput.value)
  readHash()
}

onMounted(() => {
  readQuery()
  restoreComments()
  readHash()
})

function truncate(s: string) {
  return s.length > 28 ? s.slice(0, 28) + '…' : s
}
</script>

<style scoped>
.xss-lab { display: grid; gap: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.preview { margin-top: 8px; padding: 10px; border: 1px dashed var(--el-border-color); border-radius: 6px; min-height: 40px; }
.payloads { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
.list { display: grid; gap: 8px; }
.item { padding: 8px; border: 1px solid var(--el-border-color); border-radius: 6px; }
.mb16 { margin-bottom: 16px; }
</style>