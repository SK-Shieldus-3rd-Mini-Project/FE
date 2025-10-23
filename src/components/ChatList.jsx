// src/components/ChatList.jsx (수정)

import React, { useState, useEffect } from 'react';
// 1. NavLink 외에 useNavigate 훅을 임포트합니다.
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import '../assets/ChatList.css';

function ChatList() {
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 2. navigate 함수를 사용할 수 있도록 선언합니다.
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatSessions = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError("사용자 ID를 찾을 수 없습니다.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await api.get(`/api/users/${userId}/chat/sessions`);
                setChatSessions(response.data);
                setError(null);
            } catch (err) {
                console.error("채팅 목록 로딩 실패:", err);
                setError("채팅 목록을 불러오는 중 오류가 발생했습니다.");
                setChatSessions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatSessions();
    }, []); // 컴포넌트 마운트 시 1회 실행

    // 새 채팅 시작 함수 (수정됨)
    const handleNewChat = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("사용자 ID가 없습니다.");
            return;
        }
        const title = prompt("새 채팅방 제목을 입력하세요:", "새 대화");
        
        if (title) {
            try {
                // 3. 백엔드에 새 세션 생성을 요청합니다.
                const response = await api.post(`/api/users/${userId}/chat/sessions`, { title });
                // 4. 응답으로 받은 새 세션 ID를 변수에 저장합니다.
                const newSessionId = response.data;

                // 5. (선택적) 목록 상태를 즉시 업데이트하여 새 채팅방을 목록 상단에 추가합니다.
                // 이렇게 하면 목록 새로고침 API를 다시 호출할 필요가 없습니다.
                const newSession = { sessionId: newSessionId, title: title };
                setChatSessions(prevSessions => [newSession, ...prevSessions]);

                // 6. ★ 방금 만든 새 채팅방으로 즉시 이동시킵니다. ★
                // 이렇게 newSessionId를 사용함으로써 ESlint 오류가 해결됩니다.
                navigate(`/chat/${newSessionId}`);

                /* // 이전 코드 (목록만 새로고침 - newSessionId를 사용 안 함)
                const sessionsResponse = await api.get(`/api/users/${userId}/chat/sessions`);
                setChatSessions(sessionsResponse.data);
                */
            } catch (err) {
                console.error("새 채팅 시작 실패:", err);
                alert("새 채팅방 생성 중 오류가 발생했습니다.");
            }
        }
    };

    if (isLoading) {
        return <aside className="chat-list-sidebar"><h3>로딩 중...</h3></aside>;
    }

    if (error) {
         return <aside className="chat-list-sidebar"><h3>오류</h3><p>{error}</p></aside>;
    }

    return (
        <aside className="chat-list-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3>대화 목록</h3>
                 <button onClick={handleNewChat} style={{ cursor: 'pointer' }}>+</button>
             </div>
            <nav className="chat-session-nav">
                <ul>
                    {chatSessions.length > 0 ? (
                        chatSessions.map(session => (
                            <li key={session.sessionId}>
                                <NavLink
                                    to={`/chat/${session.sessionId}`}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    {session.title}
                                </NavLink>
                            </li>
                        ))
                     ) : (
                         <li>대화 기록이 없습니다.</li>
                     )}
                </ul>
            </nav>
        </aside>
    );
}

export default ChatList;