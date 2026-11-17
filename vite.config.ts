
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
  },
  build: {
    // Tăng giới hạn cảnh báo lên 2000kb (2MB) để không bị hiện chữ vàng
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      output: {
        // Chia nhỏ file code để tải nhanh hơn
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['lucide-react'],
          excel: ['xlsx-js-style', 'exceljs'],
          docx: ['docx', 'file-saver']
        }
      }
    }
  }
})
