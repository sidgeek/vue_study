import { defineStore } from 'pinia'
import { login, register } from '@/apis/auth'

type Role = 'admin' | 'user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    role: 'user' as Role,
    name: '' as string,
    // 后端返回的角色代码（如 SUPER_ADMIN/ADMIN/STAFF/VISITOR）
    roleCode: '' as string
  }),
  getters: {
    isAuthenticated: (s) => !!s.token
  },
  actions: {
    login(token: string, role: Role, name: string, roleCode?: string) {
      this.token = token
      this.role = role
      this.name = name
      if (roleCode) this.roleCode = roleCode
      localStorage.setItem('auth', JSON.stringify({ token, role, name, roleCode: this.roleCode }))
    },
    async loginWithApi(username: string, password: string) {
      const res = await login(username, password)
      const name = res.user.nickname ?? res.user.username
      const code = res.user.roleCode || 'VISITOR'
      this.login(res.token, 'user', name, code)
    },
    async registerAndLogin(username: string, password: string) {
      await register(username, password, username)
      const res = await login(username, password)
      const name = res.user.nickname ?? res.user.username
      const code = res.user.roleCode || 'VISITOR'
      this.login(res.token, 'user', name, code)
    },
    logout() {
      this.token = ''
      this.role = 'user'
      this.name = ''
      this.roleCode = ''
      localStorage.removeItem('auth')
    },
    restore() {
      try {
        const raw = localStorage.getItem('auth')
        if (!raw) return
        const { token, role, name, roleCode } = JSON.parse(raw)
        this.token = token
        this.role = role
        this.name = name
        this.roleCode = roleCode || ''
      } catch {
        /* noop */
      }
    }
  }
})