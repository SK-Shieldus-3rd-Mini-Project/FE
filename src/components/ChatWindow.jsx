// src/components/ChatWindow.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api'; // api 임포트
import axios from "axios";
import '../assets/ChatWindow.css';

function ChatWindow() {
    const { chatId } = useParams(); // URL에서 chatId 가져오기
    const [messages, setMessages] = useState([]); // 메시지 목록 상태
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState(""); // 입력 메시지 상태
    const messagesEndRef = useRef(null); // 스크롤 맨 아래로 이동하기 위한 ref

    // 메시지 목록 가져오기 함수
    const fetchMessages = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId || !chatId) {
             setError("사용자 ID 또는 채팅 ID가 없습니다.");
             setIsLoading(false);
             setMessages([]); // ID 없으면 빈 배열
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get(`/api/users/${userId}/chat/sessions/${chatId}/messages`);
            setMessages(response.data); // 메시지 상태 업데이트
             setError(null);
        } catch (err) {
            console.error(`메시지 로딩 실패 (Chat ID: ${chatId}):`, err);
            setError("메시지를 불러오는 중 오류가 발생했습니다.");
             setMessages([]); // 오류 시 빈 배열
        } finally {
            setIsLoading(false);
        }
    };

    // chatId가 변경될 때 메시지 목록 다시 로드
    useEffect(() => {
        fetchMessages();
    }, [chatId]);

     // 메시지 목록 맨 아래로 스크롤
     useEffect(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     }, [messages]);


    // 메시지 전송 핸들러
    const handleSendMessage = async (e) => {
        e.preventDefault(); // 폼 기본 제출 방지
        if (!newMessage.trim()) return; // 빈 메시지 방지

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("사용자 ID가 없습니다.");
            return;
        }

        // 낙관적 업데이트: 사용자 메시지를 즉시 화면에 추가
         const sentMessage = {
             messageId: Date.now(), // 임시 ID
             sender: 'USER', // '나' 대신 'USER' 사용 (백엔드와 일치)
             content: newMessage,
             timestamp: new Date().toISOString(),
             aiResponseDetail: null
         };
         setMessages(prevMessages => [...prevMessages, sentMessage]);
        setNewMessage(""); // 입력창 비우기

        try {
            const aiResponse = await axios.post(`/ai-api/ai/query`, {
                session_id: chatId, // AI 서버는 session_id를 받습니다
                question: newMessage
            }, { withCredentials: true }); // 필요하다면 쿠키 전송 옵션 추가

            const receivedAiMessage = {
                messageId: `ai-${Date.now()}`, // 임시 ID
                sender: 'AI',
                content: aiResponse.data.answer, // AI 서버 응답의 answer 필드 사용
                timestamp: aiResponse.data.timestamp,
                aiResponseDetail: { // 필요 시 AI 응답의 추가 정보 저장
                    category: aiResponse.data.category,
                    sources: aiResponse.data.sources
                }
            };
            setMessages(prevMessages => [...prevMessages, receivedAiMessage]);


        } catch (err) {
            console.error("메시지 전송 또는 AI 응답 처리 실패:", err);
            alert("메시지 전송 중 오류가 발생했습니다.");
            setMessages(prevMessages => prevMessages.filter(msg => msg.messageId !== sentMessage.messageId));
        }
    };

    if (isLoading) {
        return <div className="chat-window-container"><h3>메시지 로딩 중...</h3></div>;
    }

     if (error) {
         return <div className="chat-window-container"><h3>오류</h3><p>{error}</p></div>;
     }

    return (
        <div className="chat-window-container">
            <div className="message-list">
                {messages.length > 0 ? (
                     messages.map((msg) => (
                         <div
                             // messageId를 key로 사용
                             key={msg.messageId}
                             // sender 값에 따라 클래스 분기 ('USER' 또는 'AI')
                             className={`message ${msg.sender === 'AI' ? 'message-bot' : 'message-user'}`}
                         >
                             <span className="message-sender">{msg.sender === 'AI' ? 'AI' : '나'}</span>
                             <div className="message-content">
                                 {/* pre-wrap으로 줄바꿈 처리 */}
                                 <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                             </div>
                             {/* 타임스탬프 표시 (선택적) */}
                             {/* <span style={{fontSize: '0.7em', color: '#888', marginTop: '3px', display: 'block'}}>
                                 {new Date(msg.timestamp).toLocaleString()}
                             </span> */}
                         </div>
                     ))
                 ) : (
                     <p>메시지가 없습니다.</p>
                 )}
                 {/* 스크롤 대상 빈 div */}
                 <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="message-input"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)} // 입력 값 상태 관리
                />
                <button type="submit" className="send-button">
                    전송
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;