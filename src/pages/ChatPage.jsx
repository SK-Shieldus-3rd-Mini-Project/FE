// src/pages/ChatPage.jsx (수정본 - 레이아웃)

import React from 'react';
import { Outlet } from 'react-router-dom'; // 중첩 라우트의 내용이 렌더링될 위치
import ChatList from '../components/ChatList.jsx';
import '../assets/ChatPage.css'; // ChatPage 레이아웃 전용 CSS

function ChatPage() {
    return (
        <div className="chat-layout-container">
            {/* 1. 왼쪽 사이드바 */}
            <ChatList />

            {/* 2. 오른쪽 채팅창 영역 */}
            {/* Routes.jsx에서 정의한 /chat/:chatId 컴포넌트(ChatWindow)가 여기에 렌더링됩니다. */}
            <main className="chat-content-area">
                <Outlet />
            </main>
        </div>
    );
}

export default ChatPage;