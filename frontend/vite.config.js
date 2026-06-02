/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Copy data folder to dist after build
    rollupOptions: {
      plugins: [{
        name: 'copy-data',
        closeBundle() {
          try {
            mkdirSync('../dist/data', { recursive: true })
            copyFileSync('../data/programs.json', '../dist/data/programs.json')
            console.log('✅ Copied data/programs.json to dist/')
          } catch (e) {
            console.log('Note: data copy skipped in dev mode')
          }
        }
      }]
    }
  },
})
