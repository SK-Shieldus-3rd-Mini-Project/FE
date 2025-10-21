// src/lib/api.js

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Spring Boot 서버 주소
    withCredentials: true // ★ 세션 쿠키를 주고받기 위해 필수
});

export default api;