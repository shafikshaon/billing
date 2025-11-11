import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
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
        // Use default chunk splitting for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        // Add build timestamp to entry chunks for version tracking
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generate source maps for debugging if needed
    sourcemap: false,
    // Ensure assets are properly hashed for cache busting
    assetsInlineLimit: 4096,
    // Target modern browsers
    target: 'es2015',
    // Ensure chunks are properly generated
    chunkSizeWarningLimit: 1000,
  },
})
