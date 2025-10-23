// src/pages/MainPage.jsx (이미지 주소 수정)

import React from 'react';
import Hero from '../components/main/Hero.jsx';
import ContentScroll from '../components/main/ContentScroll.jsx';
import AboutSection from '../components/main/AboutSection.jsx';
import '../assets/MainPage.css';

// 임시 데이터: AI가 분석한 전통적 투자 포트폴리오
const recommendedPortfolios = [
    {
        id: 'p1',
        title: '견실한 가치주',
        description: 'AI가 분석한 저평가 우량주 중심 포트폴리오입니다.',
        tag: '가치 투자',
        // --- 이미지 수정 ---
        imageUrl: '../assets/images/전봉준.jpg'
    },
    {
        id: 'p2',
        title: '안정형 배당주',
        description: '지속 가능한 현금 흐름을 창출하는 배당주입니다.',
        tag: '저위험',
        // --- 이미지 수정 ---
        imageUrl: '../assets/images/전봉준.jpg'
    },
    {
        id: 'p3',
        title: '국고채 중심',
        description: '금리 변동성을 고려한 단기/장기 채권 혼합입니다.',
        tag: '안정형',
        // --- 이미지 수정 ---
        imageUrl: '../assets/images/전봉준.jpg'
    },
];

// 임시 데이터: 최신 마켓 인사이트
const marketInsights = [
    {
        id: 'm1',
        title: '주간 시장 동향 요약',
        description: 'AI가 분석한 지난 주 주요 시장 이슈 요약본입니다.',
        tag: '리포트',
        // --- 이미지 수정 ---
        imageUrl: '../assets/images/전봉준.jpg'
    },
    {
        id: 'm2',
        title: '오늘의 경제 지표',
        description: '실시간으로 수집된 주요 경제 지표입니다.',
        tag: '지표',
        // --- 이미지 수정 ---
        imageUrl: '../assets/images/전봉준.jpg'
    },
];


function MainPage() {
    return (
        <div className="main-page-container">

            <Hero />

            <ContentScroll
                title="AI 추천 포트폴리오"
                items={recommendedPortfolios}
            />

            <ContentScroll
                title="최신 마켓 인사이트"
                items={marketInsights}
            />

            <AboutSection />

        </div>
    );
}

export default MainPage;