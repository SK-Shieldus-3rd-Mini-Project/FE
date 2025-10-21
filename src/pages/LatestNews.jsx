// src/pages/LatestNews.jsx

import React, { useState, useEffect } from 'react';
import NewsModal from '../components/NewsModal.jsx'; // 1. 모달 다시 import
import api from '../lib/api';
import '../assets/LatestNews.css';

function LatestNews() {
    const [newsList, setNewsList] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null); // 2. 모달 상태 복구
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/api/news/latest');
                setNewsList(response.data);
            } catch (error) {
                console.error("뉴스 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNews();
    }, []);

    // 3. 모달 핸들러 복구
    const handleOpenModal = (newsItem) => {
        setSelectedNews(newsItem);
    };

    const handleCloseModal = () => {
        setSelectedNews(null);
    };

    if (isLoading) {
        return <div className="news-container"><h3>최신 뉴스 로딩 중...</h3></div>;
    }

    return (
        <section className="news-container">
            <h2 className="section-title">최신 마켓 뉴스</h2>
            <div className="news-list">
                {newsList.map((news) => (
                    <div key={news.id} className="news-item-card">
                        <div className="news-card-header">
                            <span className="news-press">{news.press}</span>
                        </div>
                        <h3 className="news-title">{news.title}</h3>

                        {/* 백엔드 NewsService가
                          keyword 검색으로 highlight를 가져오므로 요약이 보임
                        */}
                        <p
                            className="news-summary"
                            dangerouslySetInnerHTML={{ __html: news.summary }}
                        />

                        {/* 4. <button>으로 다시 변경 */}
                        <button
                            className="read-more-button"
                            onClick={() => handleOpenModal(news)}
                        >
                            더보기
                        </button>
                    </div>
                ))}
            </div>

            {/* 5. 모달 컴포넌트 복구 */}
            {selectedNews && (
                <NewsModal news={selectedNews} onClose={handleCloseModal} />
            )}
        </section>
    );
}

export default LatestNews;