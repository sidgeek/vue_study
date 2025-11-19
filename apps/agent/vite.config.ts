import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@analysis': fileURLToPath(new URL('../admin/src/components/analysis/index.ts', import.meta.url))
    }
  },
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        fileURLToPath(new URL('../admin', import.meta.url)),
        fileURLToPath(new URL('../..', import.meta.url))
      ]
    }
  }
})