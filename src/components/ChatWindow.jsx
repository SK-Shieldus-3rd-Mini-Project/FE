// src/components/ChatWindow.jsx (신규)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // 1. useParams 훅 import
import '../assets/ChatWindow.css'; // 2. ChatWindow 전용 CSS import

// 임시 채팅 메시지 DB
const allMessages = {
    '1': [
        { sender: 'AI', content: '안녕하세요! "미국 증시 및 AI 주식"에 대해 무엇이든 물어보세요.' },
        { sender: '나', content: '최근 미국 증시 동향과 함께 AI 관련 유망 주식 3가지만 추천해줘.' },
    ],
    '2': [
        { sender: 'AI', content: '포트폴리오 리밸런싱 상담입니다. 현재 자산 배분을 알려주세요.' },
    ],
    '3': [
        { sender: 'AI', content: '새로운 대화를 시작합니다.' },
    ]
};

function ChatWindow() {
    // 3. URL의 :chatId 값을 가져옴 (예: /chat/1 이면 chatId는 '1')
    const { chatId } = useParams();

    // 4. chatId에 맞는 메시지를 상태로 관리
    const [messages, setMessages] = useState([]);

    // 5. chatId가 변경될 때마다 해당 세션의 메시지를 불러옴
    useEffect(() => {
        setMessages(allMessages[chatId] || []); // chatId에 맞는 데이터가 없으면 빈 배열
    }, [chatId]); // chatId가 바뀔 때마다 이 effect 실행


    // 6. 렌더링 (이전 ChatPage.jsx의 렌더링 내용과 동일)
    return (
        <div className="chat-window-container">
            {/* 메시지들이 표시되는 영역 */}
            <div className="message-list">

                {/* 7. 상태(messages)에 따라 동적으로 렌더링 */}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === 'AI' ? 'message-bot' : 'message-user'}`}
                    >
                        <span className="message-sender">{msg.sender}</span>
                        <div className="message-content">
                            {msg.content}
                        </div>
                    </div>
                ))}

            </div>

            {/* 메시지 입력 폼 */}
            <form className="message-input-form">
                <input
                    type="text"
                    className="message-input"
                    placeholder="메시지를 입력하세요..."
                />
                <button type="submit" className="send-button">
                    전송
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;