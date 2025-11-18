import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const ADMIN_OFFLINE = String(import.meta.env.VITE_ADMIN_OFFLINE ?? '').toLowerCase()
  .replace(/\s+/g, '')
  .split(',')
  .some((v) => v === '1' || v === 'true' || v === 'yes' || v === 'on')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'analysis',
        name: 'analysis',
        component: () => import('@/views/Analysis.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'echarts',
        name: 'echarts',
        component: () => import('@/views/ECharts.vue'),
        meta: { requiresAuth: true }
      }
      ,
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN','SUPER_ADMIN'] }
      }
      ,
      {
        path: 'g6-dagre',
        name: 'g6-dagre',
        component: () => import('@/views/G6Dagre.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'slate',
        name: 'slate',
        component: () => import('@/views/Slate.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'monaco-editor',
        name: 'monaco-editor',
        component: () => import('@/views/Monaco.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'perf-stress',
        name: 'perf-stress',
        component: () => import('@/views/PerfStress.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'g2-perf',
        name: 'g2-perf',
        component: () => import('@/views/G2Perf.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'g2-minimal',
        name: 'g2-minimal',
        component: () => import('@/views/G2Minimal.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'playlists',
        name: 'playlists',
        component: () => import('@/views/Playlists.vue'),
        meta: { public: true }
      }
      ,
      {
        path: 'playlist-manage',
        name: 'playlist-manage',
        component: () => import('@/views/PlaylistManage.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN','SUPER_ADMIN'] }
      }
      ,
      {
        path: 'xss-lab',
        name: 'xss-lab',
        component: () => import('@/views/XSSLab.vue'),
        meta: { public: true }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', name: '404', component: () => import('@/views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) return true
  if (ADMIN_OFFLINE) {
    const roles = (to.meta as any)?.roles as string[] | undefined
    if (roles && roles.length) {
      const roleCode = (auth as any).roleCode || 'VISITOR'
      if (!roles.includes(roleCode)) {
        return { name: 'home' }
      }
    }
    return true
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // 若路由要求特定角色，则进行前端拦截（需登录后获取到 roleCode）
  const roles = (to.meta as any)?.roles as string[] | undefined
  if (roles && roles.length) {
    const roleCode = (auth as any).roleCode || 'VISITOR'
    if (!roles.includes(roleCode)) {
      // 无权限时返回首页或提示
      return { name: 'home' }
    }
  }
  return true
})

export default router