import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
        meta: { requiresAuth: true }
      }
      ,
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresAuth: true }
      }
      ,
      {
        path: 'g6-dagre',
        name: 'g6-dagre',
        component: () => import('@/views/G6Dagre.vue'),
        meta: { requiresAuth: true }
      }
      ,
      {
        path: 'slate',
        name: 'slate',
        component: () => import('@/views/Slate.vue'),
        meta: { requiresAuth: true }
      }
      ,
      {
        path: 'monaco-editor',
        name: 'monaco-editor',
        component: () => import('@/views/Monaco.vue'),
        meta: { requiresAuth: true }
      }
      ,
      {
        path: 'perf-stress',
        name: 'perf-stress',
        component: () => import('@/views/PerfStress.vue'),
        meta: { requiresAuth: true }
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
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router