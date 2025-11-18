import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const localG2 = process.env.LOCAL_G2 === '1' || process.env.LOCAL_G2 === 'true'
const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
  ...(localG2 ? { '@antv/g2': fileURLToPath(new URL('../G2/src/index.ts', import.meta.url)) } : {})
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias
  },
  optimizeDeps: {},
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        ...(localG2 ? [fileURLToPath(new URL('../G2', import.meta.url))] : [])
      ]
    }
  }
})