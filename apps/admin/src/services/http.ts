import axios from 'axios'
import { AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = useAuthStore()
  if (auth.token) {
    const token = `Bearer ${auth.token}`
    // 统一将 headers 转为 AxiosHeaders 实例，保证类型与运行时一致
    config.headers = AxiosHeaders.from(config.headers)
    ;(config.headers as AxiosHeaders).set('Authorization', token)
  }
  return config
})

instance.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err) => {
    // 可扩展为统一错误上报/提示
    return Promise.reject(err)
  }
)

export default instance