// src/components/NewsModal.jsx

import React from 'react';
import '../assets/NewsModal.css';

function NewsModal({ news, onClose }) {
    if (!news) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{news.title}</h2>
                    <span className="modal-press">{news.press}</span>
                </div>

                {/* --- [수정된 부분] --- */}
                {/* iframe 대신 텍스트 본문을 렌더링합니다. */}
                <div className="modal-body">
                    {/* API 응답 본문의 줄바꿈(\n)을 HTML에
                        표시하기 위해 <p> 태그를 사용합니다.
                        (CSS에서 white-space: pre-wrap; 설정 필요)
                    */}
                    <p>{news.fullContent}</p>
                </div>
                {/* --- [수정 완료] --- */}

                <div className="modal-footer">
                    <button className="modal-close-button" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NewsModal;