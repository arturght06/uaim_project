import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['uaim.karoada.ovh'],
    proxy: {
      '/auth': {
        target: 'http://backend:8800',
        // target: 'https://uaim-api.karoada.ovh',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://backend:8800',
        // target: 'https://uaim-api.karoada.ovh',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://backend:8800',
        // target: 'https://uaim-api.karoada.ovh',
        changeOrigin: true,
      }
    },
  },
})
