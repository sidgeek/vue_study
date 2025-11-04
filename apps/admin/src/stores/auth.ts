import { defineStore } from 'pinia'
import { login, register } from '@/apis/auth'

type Role = 'admin' | 'user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    role: 'user' as Role,
    name: '' as string
  }),
  getters: {
    isAuthenticated: (s) => !!s.token
  },
  actions: {
    login(token: string, role: Role, name: string) {
      this.token = token
      this.role = role
      this.name = name
      localStorage.setItem('auth', JSON.stringify({ token, role, name }))
    },
    async loginWithApi(username: string, password: string) {
      const res = await login(username, password)
      const name = res.user.nickname ?? res.user.username
      this.login(res.token, 'user', name)
    },
    async registerAndLogin(username: string, password: string) {
      await register(username, password, username)
      const res = await login(username, password)
      const name = res.user.nickname ?? res.user.username
      this.login(res.token, 'user', name)
    },
    logout() {
      this.token = ''
      this.role = 'user'
      this.name = ''
      localStorage.removeItem('auth')
    },
    restore() {
      try {
        const raw = localStorage.getItem('auth')
        if (!raw) return
        const { token, role, name } = JSON.parse(raw)
        this.token = token
        this.role = role
        this.name = name
      } catch {
        /* noop */
      }
    }
  }
})