import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const auth = useAuthStore()
  const hasRole = (roles: Array<'admin' | 'user'>) => roles.includes(auth.role)
  return { hasRole }
}