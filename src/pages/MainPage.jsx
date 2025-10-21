// src/pages/MainPage.jsx (이미지 주소 수정)

import React from 'react';
import Hero from '../components/main/Hero.jsx';
import ContentScroll from '../components/main/ContentScroll.jsx';
import AboutSection from '../components/main/AboutSection.jsx';
import '../assets/MainPage.css';
import jbj1 from '../assets/images/전봉준.jpg'
import jbj2 from '../assets/images/전봉준2.webp'

const recommendedPortfolios = [
    {
        id: 'p1',
        title: '견실한 가치주',
        description: 'AI가 분석한 저평가 우량주 중심 포트폴리오입니다.',
        tag: '가치 투자',
        // --- 이미지 수정 ---
        imageUrl: 'https://dummyimage.com/300x200/f3f1ef/8d6e63.png&text=Value+Stocks'
    },
    {
        id: 'p2',
        title: '안정형 배당주',
        description: '지속 가능한 현금 흐름을 창출하는 배당주입니다.',
        tag: '저위험',
        // --- 이미지 수정 ---
        imageUrl: 'https://dummyimage.com/300x200/f3f1ef/8d6e63.png&text=Dividends'
    },
    {
        id: 'p3',
        title: '국고채 중심',
        description: '금리 변동성을 고려한 단기/장기 채권 혼합입니다.',
        tag: '안정형',
        // --- 이미지 수정 ---
        imageUrl: 'https://dummyimage.com/300x200/f3f1ef/8d6e63.png&text=Bonds'
    },
];

const marketInsights = [
    {
        id: 'm1',
        title: '주간 시장 동향 요약',
        description: 'AI가 분석한 지난 주 주요 시장 이슈 요약본입니다.',
        tag: '리포트',
        // --- 이미지 수정 ---
        imageUrl: 'https://dummyimage.com/300x200/eee/333.png&text=Market+Report'
    },
    {
        id: 'm2',
        title: '오늘의 경제 지표',
        description: '실시간으로 수집된 주요 경제 지표입니다.',
        tag: '지표',
        // --- 이미지 수정 ---
        imageUrl: jbj2
    },
];


function MainPage() {
    return (
        <div className="main-page-container">

            <Hero />

            <ContentScroll
                title="주요 지수 현황"
                items={recommendedPortfolios}
            />

            <ContentScroll
                title="시장 요약"
                items={marketInsights}
            />

            <AboutSection />

        </div>
    );
}

export default MainPage;