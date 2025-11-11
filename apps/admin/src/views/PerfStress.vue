<template>
  <div class="perf-stress">
    <el-card class="mb16">
      <template #header>
        <div class="hdr">
          <span>性能压测（故意制造问题）</span>
          <span class="muted">导航到本页后，Core Web Vitals 会显著变差</span>
        </div>
      </template>
      <div class="ops">
        <el-switch v-model="enableLCP" active-text="拉高 LCP/FCP" inactive-text="关闭 LCP/FCP" />
        <el-switch v-model="enableCLS" active-text="制造 CLS" inactive-text="关闭 CLS" />
        <el-switch v-model="enableINP" active-text="降低 INP" inactive-text="关闭 INP" />
      </div>
      <p class="desc">
        打开本页后会：
        1) 延迟渲染超大列表与图片（增大 LCP/FCP）；
        2) 弹出顶部 Banner 未预留空间（产生 CLS）；
        3) 点击按钮触发主线程阻塞（降低 INP）。
      </p>
    </el-card>

    <!-- 顶部 Banner：延迟出现且不预留空间，造成布局偏移（CLS） -->
    <div v-if="showBanner && enableCLS" class="banner">
      <strong>广告 Banner</strong>
      <span class="muted">（延迟插入导致布局下移，产生 CLS）</span>
    </div>

    <!-- 大图：不设置宽高，图片解码与布局调整会拉高 LCP/FCP，也可能带来 CLS -->
    <div class="mb16">
      <img v-if="loadBigImage && enableLCP" :src="bigImgUrl" alt="Big" class="big-img" />
    </div>

    <!-- 超大列表：大量 DOM 节点渲染，拉高 LCP/FCP -->
    <el-card class="mb16">
      <template #header>
        <div class="hdr">
          <span>超大列表</span>
          <span class="muted">{{ items.length }} 项（延迟渲染以影响 LCP）</span>
        </div>
      </template>
      <div class="list">
        <div v-for="i in items" :key="i" class="row">Row #{{ i }} - 一些占位文本用于撑开布局</div>
      </div>
    </el-card>

    <!-- 交互：点击触发主线程阻塞，降低 INP -->
    <el-card>
      <template #header>
        <div class="hdr">
          <span>交互阻塞（INP）</span>
        </div>
      </template>
      <div class="actions">
        <el-button type="danger" @click="block(400)" :disabled="!enableINP">阻塞 400ms</el-button>
        <el-button type="danger" @click="block(800)" :disabled="!enableINP">阻塞 800ms</el-button>
        <el-button type="warning" @click="thrashLayout()" :disabled="!enableINP">强制回流 2000 次</el-button>
      </div>
      <p class="muted">点击以上按钮会显著降低输入响应性（INP）。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'

// 控制开关：默认开启，进入页面即可看到明显问题
const enableLCP = ref(true)
const enableCLS = ref(true)
const enableINP = ref(true)

// 开关持久化：localStorage
const STORAGE_KEY = 'perf-stress-switches'
function restoreSwitches() {
  try {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (typeof data?.LCP === 'boolean') enableLCP.value = data.LCP
    if (typeof data?.CLS === 'boolean') enableCLS.value = data.CLS
    if (typeof data?.INP === 'boolean') enableINP.value = data.INP
  } catch { /* noop */ }
}
function saveSwitches() {
  try {
    if (typeof window === 'undefined') return
    const payload = { LCP: enableLCP.value, CLS: enableCLS.value, INP: enableINP.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch { /* noop */ }
}
// 初始化时恢复用户选择
restoreSwitches()

// 延迟触发的标志位
const showBanner = ref(false)
const loadBigImage = ref(false)
const renderBigList = ref(false)

// 超大图片（不设置尺寸，可能带来 CLS；图片解码与布局调整会拉高 LCP/FCP）
const bigImgUrl = 'https://picsum.photos/2000/1400'

// 超大列表（5000 行）
const items = computed(() => (renderBigList.value && enableLCP.value) ? Array.from({ length: 5000 }, (_, i) => i + 1) : [])

onMounted(() => {
  // 分阶段延迟，确保导航后的 LCP/FCP/CLS 都能被影响
  setTimeout(() => { if (enableCLS.value) showBanner.value = true }, 600)
  setTimeout(() => { if (enableLCP.value) renderBigList.value = true }, 800)
  setTimeout(() => { if (enableLCP.value) loadBigImage.value = true }, 1000)
})

// 侦听开关变化并持久化
watch([enableLCP, enableCLS, enableINP], () => {
  // 使用微队列合并同一渲染帧内的多次切换
  queueMicrotask(saveSwitches)
}, { immediate: true })


function block(ms: number) {
  const end = performance.now() + ms
  // 忙等待阻塞主线程，降低交互响应性（INP）
  while (performance.now() < end) {
    // 做一些无意义运算，确保 CPU 占用
    Math.sqrt(Math.random() * 1e8)
  }
}

function thrashLayout() {
  // 强制回流多次以制造卡顿
  for (let i = 0; i < 2000; i++) {
    // 访问 offsetHeight 会触发强制同步布局
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight
  }
}
</script>

<style scoped>
.perf-stress { display: grid; gap: 16px; }
.hdr { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--el-text-color-secondary); font-size: 12px; }
.ops { display: flex; gap: 12px; align-items: center; }
.desc { margin-top: 8px; color: var(--el-text-color-secondary); }
.banner {
  background: #fffbec;
  border: 1px solid #f7d07a;
  padding: 12px;
  margin-bottom: 16px;
}
.list { max-height: 300px; overflow: auto; border: 1px solid var(--el-border-color); }
.row { padding: 6px 10px; border-bottom: 1px dashed var(--el-border-color); }
.big-img { max-width: 100%; display: block; }
.actions { display: flex; gap: 12px; align-items: center; }
.mb16 { margin-bottom: 16px; }
</style>