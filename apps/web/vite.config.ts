import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
        
          //  Data fetching
          if (id.includes('@tanstack/react-query')) return 'data-query'

          //  Markdown (your biggest win)
          if (
            id.includes('react-markdown') ||
            id.includes('remark') ||
            id.includes('micromark') ||
            id.includes('mdast') ||
            id.includes('unified')
          ) {
            return 'markdown'
          }
        
          //  Optional: axios
          if (id.includes('axios')) {
            return 'network'
          }
        
          //  Everything else → vendor (including React)
          return 'vendor'
        }
      },
    },
  },
})
