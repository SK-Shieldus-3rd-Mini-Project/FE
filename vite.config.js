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
            }
        }
    }
})