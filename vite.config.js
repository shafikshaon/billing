import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/billing/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Ensure proper module resolution for production
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Generate source maps for debugging if needed
    sourcemap: false,
    // Ensure assets are properly hashed for cache busting
    assetsInlineLimit: 4096,
  },
})
