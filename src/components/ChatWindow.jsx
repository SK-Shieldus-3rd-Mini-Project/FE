// src/components/ChatWindowjsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api'; // api 임포트
import '../assets/ChatWindow.css';

function ChatWindow() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);

    // 로딩 상태 분리: 초기 목록 로딩과 전송 대기 상태를 분리
    const [isFetchingList, setIsFetchingList] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // 메시지 목록 가져오기 함수
    const fetchMessages = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId || !chatId) {
            setError("사용자 ID 또는 채팅 ID가 없습니다.");
            setIsFetchingList(false);
            setMessages([]);
            return;
        }

        try {
            // 초기 목록 로딩 상태만 관리
            setIsFetchingList(true);
            const response = await api.get(`/api/users/${userId}/chat/sessions/${chatId}/messages`);
            setMessages(response.data);
            setError(null);
        } catch (err) {
            console.error(`메시지 로딩 실패 (Chat ID: ${chatId}):`, err);
            setError("메시지를 불러오는 중 오류가 발생했습니다.");
            setMessages([]);
        } finally {
            setIsFetchingList(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 🟢 메시지 전송 및 AI 응답 처리 함수 (폴링 적용)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("사용자 ID가 없습니다.");
            return;
        }

        const userMessageContent = newMessage;
        setNewMessage("");
        setIsSending(true); // 전송 상태 시작

        // 1. 사용자 메시지 및 임시 AI 메시지 설정 (화면에 즉시 표시)
        const timestamp = Date.now();
        const sentMessage = {
            messageId: `user-${timestamp}`,
            sender: 'USER',
            content: userMessageContent,
            timestamp: new Date().toISOString(),
        };
        const tempAiMessageId = `ai-temp-${timestamp + 1}`;
        const aiWaitingMessage = {
            messageId: tempAiMessageId,
            sender: 'AI',
            content: 'AI가 응답을 생성하는 중입니다...',
            timestamp: new Date().toISOString(),
            isPending: true,
        };

        setMessages(prevMessages => [...prevMessages, sentMessage, aiWaitingMessage]);

        try {
            // 2. 사용자 질문 백엔드로 전송
            await api.post(`/api/users/${userId}/chat/sessions/${chatId}/query`, {
                question: userMessageContent
            });

            // 3. 🟢 [핵심 수정]: 폴링 로직으로 AI 응답이 DB에 저장되기를 기다립니다.
            let foundAiResponse = false;
            const maxAttempts = 30; // 💡 30회 시도 (1.5초 * 30 = 45초 대기)
            const delayMs = 1500;   // 1.5초 간격

            for (let i = 0; i < maxAttempts; i++) {
                const response = await api.get(`/api/users/${userId}/chat/sessions/${chatId}/messages`);
                const latestMessages = response.data;

                // 임시 메시지 다음의 마지막 메시지가 AI 응답인지 확인
                const lastMessage = latestMessages[latestMessages.length - 1];

                // 서버에서 가져온 마지막 메시지가 AI 응답이면 (그리고 임시 메시지가 아니면)
                if (lastMessage && lastMessage.sender === 'AI' && !lastMessage.isPending && lastMessage.content !== aiWaitingMessage.content) {
                    setMessages(latestMessages); // 상태를 최신 목록으로 업데이트
                    foundAiResponse = true;
                    break;
                }

                // AI 응답을 찾지 못했거나, 아직 임시 메시지가 DB에 반영된 상태라면 잠시 기다립니다.
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            if (!foundAiResponse) {
                console.warn("AI 응답을 시간 내에 찾지 못했습니다. 최종 목록을 새로고침합니다.");
                // 최종적으로 한 번 더 fetchMessages 호출 (실제 AI 응답을 확실히 가져옴)
                await fetchMessages();
            }

        } catch (err) {
            console.error("메시지 전송 실패:", err);
            alert("메시지 전송 중 오류가 발생했습니다.");
            // 롤백: 전송 실패 시, 사용자 메시지와 임시 AI 메시지를 제거합니다.
            setMessages(prevMessages => prevMessages.filter(msg =>
                msg.messageId !== sentMessage.messageId && msg.messageId !== tempAiMessageId
            ));
        } finally {
            setIsSending(false); // 전송 상태 종료
        }
    };


    // 로딩 시 UI 분리
    if (error) {
        return <div className="chat-window-container"><h3>오류</h3><p>{error}</p></div>;
    }

    if (isFetchingList) {
        return <div className="chat-window-container"><h3>메시지 목록을 불러오는 중...</h3></div>;
    }


    return (
        <div className="chat-window-container">
            <div className="message-list">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg.messageId}
                            className={`message ${msg.sender === 'AI' ? 'message-bot' : 'message-user'}`}
                        >
                            <span className="message-sender">{msg.sender === 'AI' ? 'AI' : '나'}</span>
                            <div className="message-content">

                                {msg.isPending && msg.sender === 'AI' ? (
                                    <>
                                        {/* 로딩 애니메이션 (CSS의 .dot-typing 필요) */}
                                        <div className="pending-indicator">
                                            <div className="dot-typing"></div>
                                        </div>
                                        {/* 🟢 로딩 텍스트를 메시지 내용으로 직접 표시 */}
                                        <p style={{ margin: 0, padding: 0 }}>AI가 응답을 생성하는 중입니다...</p>
                                    </>
                                ) : (
                                    // 🟢 로딩 중이 아닐 때만 실제 메시지 내용 표시
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                )}
                            </div>
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
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                />
                <button type="submit" className="send-button" disabled={isSending}>
                    {isSending ? '전송 중...' : '전송'}
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;
