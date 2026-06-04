/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    {
      name: 'copy-data-plugin',
      buildStart() {
        // Copy data file to public folder for both dev and build
        try {
          const src = '../data/programs.json'
          const dest = './public/data/programs.json'
          mkdirSync('./public/data', { recursive: true })
          copyFileSync(src, dest)
          console.log('✅ Copied data/programs.json to public/data/')
        } catch (e) {
          console.log('Note: data copy issue:', e.message)
        }
      }
    }
  ],
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
  },
}))
