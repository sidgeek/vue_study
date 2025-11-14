import { ref } from 'vue'
import { getJson, postJson } from '@/apis/http'

type Song = { key: string; name: string; size: number; lastModified: string; url: string }
type Playlist = { code: string; name: string; description?: string | null }

export function usePlaylistAdmin() {
  const scanLimit = ref<number | null>(null)
  const scanning = ref(false)
  const scanError = ref('')
  const scanned = ref<Song[]>([])

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
      const res = await getJson<{ items: Song[]; total: number }>(`/playlists/scan${q.toString() ? `?${q.toString()}` : ''}`)
      scanned.value = res.items
    } catch (e: any) {
      scanError.value = e?.message || '扫描失败'
    } finally {
      scanning.value = false
    }
  }

  async function createPlaylist(code: string, name: string, description?: string | null) {
    creating.value = true
    createError.value = ''
    try {
      await postJson(`/playlists`, { code, name, description })
      await fetchPlaylists()
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

  return {
    scanLimit, scanning, scanError, scanned,
    creating, createError,
    adding, addError,
    playlists, loadingPlaylists, playlistsError,
    fetchPlaylists, scan, createPlaylist, bulkAdd
  }
}