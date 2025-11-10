import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getRecentAlerts, type AlertRecord } from '@/apis/alerts'

export function useAlertsFeed(pollMs = 5000, limit = 50) {
  const items = ref<AlertRecord[]>([])
  const error = ref<string>('')
  let timer: any = null

  async function poll() {
    try {
      const { items: list } = await getRecentAlerts(limit)
      items.value = list
      error.value = ''
    } catch (e: any) {
      error.value = e?.message || '获取告警失败'
    }
  }

  onMounted(() => {
    poll()
    timer = setInterval(poll, pollMs)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    timer = null
  })

  return { items, error }
}