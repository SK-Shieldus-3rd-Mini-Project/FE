// src/utils/chatUtils.js

import api from '../lib/api'; 

// 💡 정렬 함수를 ID 숫자 기준으로 내림차순 정렬
const sortSessions = (sessions) => {
    return sessions.slice().sort((a, b) => { 
        // 🚨 핵심: sessionId를 숫자로 변환
        const idA = parseInt(a.sessionId, 10) || 0;
        const idB = parseInt(b.sessionId, 10) || 0;
        
        // 내림차순 정렬: (B - A) -> ID가 큰 값(B)이 앞으로 오도록 함 (최신 순)
        return idB - idA; 
    });
};

export const handleStartChat = async (navigate) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("사용자 ID가 없습니다.");
        return;
    }

    const title = "새 대화"; 
    try {
        // 새 채팅방 생성 요청
        const response = await api.post(`/api/users/${userId}/chat/sessions`, { title });
        const newSessionId = response.data; 

        // 새로 생성된 대화방으로 이동
        navigate(`/chat/${newSessionId}`);

    } catch (err) {
        console.error("새 채팅 시작 실패:", err);
        alert("새 채팅방 생성 중 오류가 발생했습니다.");
    }
};

// 💡 가장 최근 대화방으로 이동하는 함수
export const handleGoToLatestChat = async (navigate) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("사용자 ID가 없습니다.");
        return;
    }

    try {
        const response = await api.get(`/api/users/${userId}/chat/sessions`); 
        const chatSessions = response.data;
        
        if (chatSessions && chatSessions.length > 0) {
            // 🚨 핵심 수정: ID 숫자 기준으로 정렬하여 가장 큰 ID를 가진 방을 선택
            const sortedSessions = sortSessions(chatSessions);
            
            const latestSessionId = sortedSessions[0].sessionId;
            
            navigate(`/chat/${latestSessionId}`);
        } else {
            alert("기존 채팅방이 없습니다. 새로운 채팅을 시작할 수 없습니다.");
        }

    } catch (err) {
        console.error("최신 채팅방 이동 실패:", err);
        alert("채팅 목록을 불러오는 중 오류가 발생했습니다.");
    }
};