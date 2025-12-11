import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true // Cho phép truy cập qua mạng LAN
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
          utils: ['lucide-react']
        }
      }
    }
  }
})