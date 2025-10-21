// src/components/ChatList.jsx (신규)

import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/ChatList.css';

// 임시 채팅 세션 데이터
const chatSessions = [
    { id: '1', title: '미국 증시 및 AI 주식' },
    { id: '2', title: '포트폴리오 리밸런싱' },
    { id: '3', title: '새로운 대화' },
];

function ChatList() {
    return (
        <aside className="chat-list-sidebar">
            <h3>대화 목록</h3>
            <nav className="chat-session-nav">
                <ul>
                    {chatSessions.map(session => (
                        <li key={session.id}>
                            <NavLink
                                to={`/chat/${session.id}`}
                                // NavLink는 활성화될 때 'active' 클래스를 자동으로 추가
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                {session.title}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default ChatList;