import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['event.karoada.ovh'],
    proxy: {
      // Setup backend as proxy (temporary?)
      '/auth': {
        target: 'http://localhost:8800',
        // target: 'https://uaim-api.karoada.ovh',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8800',
        // target: 'https://uaim-api.karoada.ovh',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8800',
        // target: 'https://uaim-api.karoada.ovh',
        changeOrigin: true,
      }
    },
  },
})
