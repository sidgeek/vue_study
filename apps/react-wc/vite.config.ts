import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), vue()],
  resolve: {
    alias: {
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