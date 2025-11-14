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
            <div style="display:flex; justify-content:flex-end; margin-top:8px">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next"
                :total="scanTotal"
                :page-size="scanPageSize"
                :current-page="scanPage"
                :page-sizes="[10,20,50,100]"
                @size-change="onScanSizeChange"
                @current-change="onScanPageChange"
              />
            </div>
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
                    <el-input v-model="newCode" placeholder="留空自动生成" />
                  </el-form-item>
                  <el-form-item label="歌单名称">
                    <el-input v-model="newName" placeholder="显示名称" />
                  </el-form-item>
                  <el-form-item label="描述">
                    <el-input v-model="newDesc" placeholder="可选" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="creating" @click="onCreate">创建歌单并加入选中</el-button>
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
                    <el-button type="danger" :disabled="!target" :loading="adding" style="margin-left:8px" @click="onDeletePlaylist">删除当前歌单</el-button>
                  </el-form-item>
                  <div v-if="addError" class="error">{{ addError }}</div>
                </el-form>
                <el-divider />
                <div class="v">
                  <div class="h">当前歌单歌曲</div>
                  <el-table :data="currentItems" height="360" border style="width: 100%" @selection-change="onSelRemove">
                    <el-table-column type="selection" width="48" />
                    <el-table-column prop="name" label="名称" min-width="200" />
                    <el-table-column label="大小" width="120">
                      <template #default="{ row }">{{ fmtSize(row.size) }}</template>
                    </el-table-column>
                    <el-table-column label="修改时间" width="180">
                      <template #default="{ row }">{{ fmtDate(row.lastModified) }}</template>
                    </el-table-column>
                  </el-table>
                  <el-button type="danger" :disabled="!target || !removeKeys.length" :loading="adding" @click="onRemove">从歌单移除选中</el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { usePlaylistAdmin } from '@/hooks/usePlaylistAdmin'

const { scanLimit, scanning, scanError, scanned, scanPage, scanPageSize, scanTotal, setScanPage, setScanPageSize, fetchScanned, creating, createError, adding, addError, playlists, loadingPlaylists, playlistsError, fetchPlaylists, scan, createPlaylist, bulkAdd, currentItems, loadingItems, itemsError, fetchItems, bulkRemove, deletePlaylist } = usePlaylistAdmin()

const limit = scanLimit
const selectedKeys = ref<string[]>([])
const target = ref('')
const newCode = ref('')
const newName = ref('')
const newDesc = ref('')
const removeKeys = ref<string[]>([])

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
  await fetchScanned()
}
async function onCreate() {
  if (!newName.value) return
  const p = await createPlaylist(newCode.value || null, newName.value, newDesc.value || null, selectedKeys.value)
  if (p) {
    target.value = p.code
    selectedKeys.value = []
    await fetchItems(p.code)
  }
  newCode.value = ''
  newName.value = ''
  newDesc.value = ''
}
async function onAdd() {
  if (!target.value || !selectedKeys.value.length) return
  await bulkAdd(target.value, selectedKeys.value)
  selectedKeys.value = []
  await fetchItems(target.value)
}

function onSelRemove(rows: any[]) {
  removeKeys.value = rows.map((r) => String(r.key))
}
async function onRemove() {
  if (!target.value || !removeKeys.value.length) return
  await bulkRemove(target.value, removeKeys.value)
  removeKeys.value = []
  await fetchItems(target.value)
}

function onScanPageChange(p: number) { setScanPage(p); fetchScanned() }
function onScanSizeChange(s: number) { setScanPageSize(s); setScanPage(1); fetchScanned() }

async function onDeletePlaylist() {
  if (!target.value) return
  await deletePlaylist(target.value)
  target.value = ''
}

onMounted(async () => {
  await fetchPlaylists()
  await fetchScanned()
})

watch(target, async (code) => {
  if (code) await fetchItems(code)
})
</script>

<style scoped>
.pm { display: grid; gap: 16px; }
.h { font-weight: 600; }
.v { display: grid; gap: 12px; }
.error { color: var(--el-color-danger); }
.hint { margin-left: 8px; color: var(--el-text-color-secondary); }
</style>