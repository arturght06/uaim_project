import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Setup backend as proxy (temporary?)
      '/auth': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      }
    },
  },
})
