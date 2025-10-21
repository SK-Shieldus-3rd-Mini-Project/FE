import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/Hero.css';

function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>AI 로보 어드바이저, 전봉준</h1>
                <p>LangChain과 RAG로 구동되는 당신만의 투자 비서</p>
                <Link to="/chat" className="hero-button">
                    지금 바로 상담 시작하기
                </Link>
            </div>
        </section>
    );
}

export default Hero;