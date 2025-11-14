<template>
  <div class="playlists-page">
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">歌单</div>
          </template>
          <el-skeleton :loading="loadingList" animated>
            <template #template>
              <el-skeleton-item variant="p" style="width: 80%" />
              <el-skeleton-item variant="p" style="width: 60%" />
              <el-skeleton-item variant="p" style="width: 70%" />
            </template>
            <div class="list">
              <el-radio-group v-model="selected" @change="onSelect">
                <el-radio-button v-for="p in playlists" :key="p.code" :label="p.code">{{ p.name }}</el-radio-button>
              </el-radio-group>
              <div v-if="errorList" class="error">{{ errorList }}</div>
            </div>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ current?.name || '未选择' }}</span>
              <el-tag v-if="current?.description" type="info" size="small">{{ current?.description }}</el-tag>
            </div>
          </template>
          <el-skeleton :loading="loadingItems" animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 100%; height: 120px" />
              <el-skeleton-item variant="p" style="width: 60%" />
              <el-skeleton-item variant="p" style="width: 80%" />
            </template>
            <div style="margin-bottom: 8px; display: flex; gap: 8px">
              <el-button size="small" @click="prev">上一首</el-button>
              <el-button size="small" type="primary" @click="next">下一首</el-button>
            </div>
            <el-table :data="items" stripe style="width: 100%">
              <el-table-column prop="name" label="名称" min-width="180" />
              <el-table-column label="大小" width="120">
                <template #default="{ row }">{{ formatSize(row.size) }}</template>
              </el-table-column>
              <el-table-column label="修改时间" width="180">
                <template #default="{ row }">{{ formatDate(row.lastModified) }}</template>
              </el-table-column>
              <el-table-column label="播放" width="240">
                <template #default="scope">
                  <audio :src="scope.row.url" controls preload="none" style="width: 220px" :ref="(el) => setAudioRef(el, scope.$index)"></audio>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="errorItems" class="error">{{ errorItems }}</div>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistsFeed } from '@/hooks/usePlaylists'

const { playlists, loadingList, errorList, current, items, loadingItems, errorItems, fetchList, select } = usePlaylistsFeed()
const selected = ref<string>('')
const route = useRoute()
const router = useRouter()
const audioRefs = ref<HTMLAudioElement[]>([])
const currentIndex = ref<number>(-1)

function onSelect(code: string) { select(code) }

onMounted(async () => {
  await fetchList()
  const qCode = String(route.query.code || '')
  if (qCode) {
    selected.value = qCode
    await select(qCode)
  } else if (current.value?.code) {
    selected.value = current.value.code
    await select(current.value.code)
  }
})

function formatSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function formatDate(s: string) {
  if (!s) return '—'
  const d = new Date(s)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(current, (p) => {
  const title = p?.name || '音乐歌单'
  document.title = title
  const q = new URLSearchParams({ code: p?.code || '', name: p?.name || '' })
  const query: Record<string, string> = {}
  q.forEach((v, k) => { query[k] = v })
  router.replace({ name: 'playlists', query })
})

function setAudioRef(el: any, i: number) {
  if (el) audioRefs.value[i] = el as HTMLAudioElement
}

function playAt(i: number) {
  if (!items.value.length) return
  const idx = Math.max(0, Math.min(i, items.value.length - 1))
  currentIndex.value = idx
  nextTick(() => {
    audioRefs.value.forEach((a, k) => { if (a && k !== idx) { try { a.pause(); a.currentTime = 0 } catch {} } })
    const el = audioRefs.value[idx]
    if (el) {
      el.currentTime = 0
      const p = el.play()
      if (p && typeof (p as any).catch === 'function') (p as any).catch(() => {})
    }
  })
}

function next() {
  if (!items.value.length) return
  const idx = currentIndex.value >= 0 ? (currentIndex.value + 1) % items.value.length : 0
  playAt(idx)
}

function prev() {
  if (!items.value.length) return
  const idx = currentIndex.value > 0 ? (currentIndex.value - 1 + items.value.length) % items.value.length : 0
  playAt(idx)
}
</script>

<style scoped>
.playlists-page { display: grid; gap: 16px; }
.card-header { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.list { display: grid; gap: 8px; }
.error { margin-top: 8px; color: var(--el-color-danger); }
</style>