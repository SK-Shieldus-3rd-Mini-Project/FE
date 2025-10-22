import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
server: {
    proxy: {
      // '/api'로 시작하는 모든 요청을 target 주소로 전달합니다.
      '/api': {
        target: 'https://openapi.koreainvestment.com:9443',
        changeOrigin: true, // cross-origin을 허용
        // '/api'를 실제 요청에서는 제거합니다.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})
