// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // 1. Spring Boot 백엔드 API (localhost:8080)
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },

            // 2. 마켓 데이터 API (127.0.0.1:8001)
            '/marketdata': {
                target: 'http://127.0.0.1:8001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/marketdata/, ''), // '/marketdata'를 '/api'로 변경
            },
            '/ai-api': {
                target: 'http://127.0.0.1:8001',
                changeOrigin: true,
                // AI 서버의 엔드포인트가 '/api/ai/query'이므로, 경로 앞부분만 바꿔줍니다.
                rewrite: (path) => path.replace(/^\/ai-api/, '/api'),
            }
        }
    }
})