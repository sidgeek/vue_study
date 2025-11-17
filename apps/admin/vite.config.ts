import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@antv/g2': fileURLToPath(new URL('../G2/src/index.ts', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ['@antv/g2']
  },
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        fileURLToPath(new URL('../G2', import.meta.url))
      ]
    }
  }
})