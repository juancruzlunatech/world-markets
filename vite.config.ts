import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
      },
      '/api/google-news': {
        target: 'https://news.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google-news/, ''),
      },
      '/api/rss2json': {
        target: 'https://api.rss2json.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rss2json/, ''),
      },
    },
  },
})
