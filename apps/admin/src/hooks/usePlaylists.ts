import { ref } from 'vue'
import { getJson } from '@/apis/http'

type P = { code: string; name: string; description?: string | null }
type S = { key: string; name: string; size: number; lastModified: string; url: string }

export function usePlaylistsFeed() {
  const playlists = ref<P[]>([])
  const loadingList = ref(false)
  const errorList = ref('')
  const current = ref<P | null>(null)
  const items = ref<S[]>([])
  const loadingItems = ref(false)
  const errorItems = ref('')

  async function fetchList() {
    loadingList.value = true
    errorList.value = ''
    try {
      const res = await getJson<{ items: P[] }>(`/playlists`)
      playlists.value = res.items
      if (!current.value && playlists.value.length) current.value = playlists.value[0]!
    } catch (e: any) {
      errorList.value = e?.message || '加载失败'
    } finally {
      loadingList.value = false
    }
  }

  async function select(code: string) {
    loadingItems.value = true
    errorItems.value = ''
    try {
      const res = await getJson<{ playlist: P; items: S[] }>(`/playlists/${code}`)
      current.value = res.playlist
      items.value = res.items
    } catch (e: any) {
      errorItems.value = e?.message || '加载失败'
    } finally {
      loadingItems.value = false
    }
  }

  return { playlists, loadingList, errorList, current, items, loadingItems, errorItems, fetchList, select }
}