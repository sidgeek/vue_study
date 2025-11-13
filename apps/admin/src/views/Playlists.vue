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
            <el-table :data="items" stripe style="width: 100%">
              <el-table-column prop="name" label="名称" min-width="180" />
              <el-table-column label="大小" width="120">
                <template #default="{ row }">{{ formatSize(row.size) }}</template>
              </el-table-column>
              <el-table-column label="修改时间" width="180">
                <template #default="{ row }">{{ formatDate(row.lastModified) }}</template>
              </el-table-column>
              <el-table-column label="播放" width="240">
                <template #default="{ row }">
                  <audio :src="row.url" controls preload="none" style="width: 220px"></audio>
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
import { onMounted, ref } from 'vue'
import { usePlaylistsFeed } from '@/hooks/usePlaylists'

const { playlists, loadingList, errorList, current, items, loadingItems, errorItems, fetchList, select } = usePlaylistsFeed()
const selected = ref<string>('')

function onSelect(code: string) { select(code) }

onMounted(async () => {
  await fetchList()
  if (current.value?.code) {
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
</script>

<style scoped>
.playlists-page { display: grid; gap: 16px; }
.card-header { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.list { display: grid; gap: 8px; }
.error { margin-top: 8px; color: var(--el-color-danger); }
</style>