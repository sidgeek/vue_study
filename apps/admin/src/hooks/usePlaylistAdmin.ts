import { ref } from 'vue'
import { getJson, postJson } from '@/apis/http'

type Song = { key: string; name: string; size: number; lastModified: string; url: string }
type Playlist = { code: string; name: string; description?: string | null }

export function usePlaylistAdmin() {
  const scanLimit = ref<number | null>(null)
  const scanning = ref(false)
  const scanError = ref('')
  const scanned = ref<Song[]>([])
  const scanPage = ref(1)
  const scanPageSize = ref(10)
  const scanTotal = ref(0)

  const creating = ref(false)
  const createError = ref('')

  const adding = ref(false)
  const addError = ref('')

  const playlists = ref<Playlist[]>([])
  const loadingPlaylists = ref(false)
  const playlistsError = ref('')

  async function fetchPlaylists() {
    loadingPlaylists.value = true
    playlistsError.value = ''
    try {
      const res = await getJson<{ items: Playlist[] }>(`/playlists`)
      playlists.value = res.items
    } catch (e: any) {
      playlistsError.value = e?.message || '加载歌单失败'
    } finally {
      loadingPlaylists.value = false
    }
  }

  async function scan(limit?: number | null) {
    scanning.value = true
    scanError.value = ''
    try {
      const params: Record<string, string> = {}
      if (limit && limit > 0) params.limit = String(limit)
      const q = new URLSearchParams(params)
      await getJson<{ items: Song[]; total: number }>(`/playlists/scan?${q.toString()}`)
      await fetchScanned()
    } catch (e: any) {
      scanError.value = e?.message || '扫描失败'
    } finally {
      scanning.value = false
    }
  }

  function setScanPage(page: number) { scanPage.value = page }
  function setScanPageSize(size: number) { scanPageSize.value = size }

  async function fetchScanned() {
    try {
      const q = new URLSearchParams({ page: String(scanPage.value), pageSize: String(scanPageSize.value) })
      const res = await getJson<{ items: Song[]; total: number; page: number; pageSize: number }>(`/songs?${q.toString()}`)
      scanned.value = res.items
      scanTotal.value = res.total
      scanPage.value = res.page
      scanPageSize.value = res.pageSize
    } catch (e: any) {
      scanError.value = e?.message || '加载失败'
    }
  }

  async function createPlaylist(code: string | null, name: string, description?: string | null, keys?: string[]) {
    creating.value = true
    createError.value = ''
    try {
      const payload: any = { name, description }
      if (code && code.trim()) payload.code = code.trim()
      if (keys && keys.length) payload.keys = keys
      const res = await postJson<{ playlist: { code: string; name: string; description?: string | null } }>(`/playlists`, payload)
      await fetchPlaylists()
      return res.playlist
    } catch (e: any) {
      createError.value = e?.message || '创建失败'
    } finally {
      creating.value = false
    }
  }

  async function bulkAdd(code: string, keys: string[]) {
    adding.value = true
    addError.value = ''
    try {
      await postJson(`/playlists/${code}/items`, { keys })
    } catch (e: any) {
      addError.value = e?.message || '加入失败'
    } finally {
      adding.value = false
    }
  }

  const currentItems = ref<Song[]>([])
  const loadingItems = ref(false)
  const itemsError = ref('')
  async function fetchItems(code: string) {
    loadingItems.value = true
    itemsError.value = ''
    try {
      const res = await getJson<{ playlist: Playlist; items: Song[] }>(`/playlists/${code}`)
      currentItems.value = res.items
    } catch (e: any) {
      itemsError.value = e?.message || '加载歌单失败'
    } finally {
      loadingItems.value = false
    }
  }
  async function bulkRemove(code: string, keys: string[]) {
    adding.value = true
    addError.value = ''
    try {
      await postJson(`/playlists/${code}/items/remove`, { keys })
    } catch (e: any) {
      addError.value = e?.message || '移除失败'
    } finally {
      adding.value = false
    }
  }

  async function deletePlaylist(code: string) {
    adding.value = true
    addError.value = ''
    try {
      await postJson(`/playlists/${code}/delete`, {})
      await fetchPlaylists()
      currentItems.value = []
    } catch (e: any) {
      addError.value = e?.message || '删除歌单失败'
    } finally {
      adding.value = false
    }
  }

  return {
    scanLimit, scanning, scanError, scanned,
    scanPage, scanPageSize, scanTotal,
    setScanPage, setScanPageSize,
    fetchScanned,
    creating, createError,
    adding, addError,
    playlists, loadingPlaylists, playlistsError,
    fetchPlaylists, scan, createPlaylist, bulkAdd,
    currentItems, loadingItems, itemsError, fetchItems, bulkRemove, deletePlaylist
  }
}