import { defineStore } from 'pinia'

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