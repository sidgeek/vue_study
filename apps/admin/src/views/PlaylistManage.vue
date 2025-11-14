<template>
  <div class="pm">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="h">扫描 COS</div>
          </template>
          <div class="v">
            <el-form label-width="80px">
              <el-form-item label="数量">
                <el-input-number v-model="limit" :min="1" :step="10" placeholder="不填为全部" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="scanning" @click="onScan">开始扫描</el-button>
              </el-form-item>
            </el-form>
            <div v-if="scanError" class="error">{{ scanError }}</div>
            <el-table :data="scanned" height="360" border style="width: 100%" @selection-change="onSel">
              <el-table-column type="selection" width="48" />
              <el-table-column prop="name" label="名称" min-width="200" />
              <el-table-column label="大小" width="120">
                <template #default="{ row }">{{ fmtSize(row.size) }}</template>
              </el-table-column>
              <el-table-column label="修改时间" width="180">
                <template #default="{ row }">{{ fmtDate(row.lastModified) }}</template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="h">歌单管理</div>
          </template>
          <div class="v">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form label-width="90px">
                  <el-form-item label="新歌单 code">
                    <el-input v-model="newCode" placeholder="唯一标识" />
                  </el-form-item>
                  <el-form-item label="歌单名称">
                    <el-input v-model="newName" placeholder="显示名称" />
                  </el-form-item>
                  <el-form-item label="描述">
                    <el-input v-model="newDesc" placeholder="可选" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="creating" @click="onCreate">创建歌单</el-button>
                  </el-form-item>
                  <div v-if="createError" class="error">{{ createError }}</div>
                </el-form>
              </el-col>
              <el-col :span="12">
                <el-form label-width="90px">
                  <el-form-item label="目标歌单">
                    <el-select v-model="target" filterable placeholder="选择歌单" :loading="loadingPlaylists">
                      <el-option v-for="p in playlists" :key="p.code" :label="p.name" :value="p.code" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :disabled="!target || !selectedKeys.length" :loading="adding" @click="onAdd">加入选中歌曲</el-button>
                    <span class="hint">已选 {{ selectedKeys.length }} 首</span>
                  </el-form-item>
                  <div v-if="addError" class="error">{{ addError }}</div>
                </el-form>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePlaylistAdmin } from '@/hooks/usePlaylistAdmin'

const { scanLimit, scanning, scanError, scanned, creating, createError, adding, addError, playlists, loadingPlaylists, playlistsError, fetchPlaylists, scan, createPlaylist, bulkAdd } = usePlaylistAdmin()

const limit = scanLimit
const selectedKeys = ref<string[]>([])
const target = ref('')
const newCode = ref('')
const newName = ref('')
const newDesc = ref('')

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}
function fmtDate(s: string) {
  if (!s) return '—'
  const d = new Date(s)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function onSel(rows: any[]) {
  selectedKeys.value = rows.map((r) => String(r.key))
}
async function onScan() {
  await scan(limit.value ?? null)
}
async function onCreate() {
  if (!newCode.value || !newName.value) return
  await createPlaylist(newCode.value, newName.value, newDesc.value || null)
  newCode.value = ''
  newName.value = ''
  newDesc.value = ''
}
async function onAdd() {
  if (!target.value || !selectedKeys.value.length) return
  await bulkAdd(target.value, selectedKeys.value)
  selectedKeys.value = []
}

onMounted(async () => {
  await fetchPlaylists()
})
</script>

<style scoped>
.pm { display: grid; gap: 16px; }
.h { font-weight: 600; }
.v { display: grid; gap: 12px; }
.error { color: var(--el-color-danger); }
.hint { margin-left: 8px; color: var(--el-text-color-secondary); }
</style>