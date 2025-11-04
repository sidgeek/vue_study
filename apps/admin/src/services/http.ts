import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${auth.token}`
    }
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