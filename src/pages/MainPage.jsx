// src/pages/MainPage.jsx (2단 구조로 수정됨)

import React from 'react';
import Hero from '../components/main/Hero.jsx';
import AboutSection from '../components/main/AboutSection.jsx';
import '../assets/MainPage.css';

// --- 컴포넌트들은 그대로 사용 ---
const DashboardCard = ({ title, children }) => (
    <div className="dashboard-card">
        <h2 className="dashboard-card-title">{title}</h2>
        <div>{children}</div>
    </div>
);

const MajorIndices = () => <div>주요 지수 현황 그래프 및 데이터...</div>;
const MajorNews = () => <div>주요 소식 목록...</div>;
const MarketSummary = () => <div>시장 요약 텍스트...</div>;
const ThematicRates = () => <div>테마별 증감률 바 차트...</div>;
const TopGainers = () => <div>상승률 상위 종목 목록...</div>;
const TopLosers = () => <div>하락률 상위 종목 목록...</div>;

// -------------------------------------------------------------------
// 메인 페이지 컴포넌트 (2단 구조 적용)
// -------------------------------------------------------------------
function MainPage() {
    return (
        <div className="main-page-container">
            <Hero />

            <main className="dashboard-main">
                <div className="dashboard-flex-container">

                    {/* 왼쪽 넓은 메인 영역 */}
                    <div className="dashboard-main-content">
                        <DashboardCard title="주요 지수 현황">
                            <MajorIndices />
                        </DashboardCard>
                        <DashboardCard title="시장 요약">
                            <MarketSummary />
                        </DashboardCard>

                        {/* 상승률/하락률을 나란히 배치하기 위한 컨테이너 */}
                        <div className="bottom-row-container">
                            <div className="bottom-row-item">
                                <DashboardCard title="상승률 상위">
                                    <TopGainers />
                                </DashboardCard>
                            </div>
                            <div className="bottom-row-item">
                                <DashboardCard title="하락률 상위">
                                    <TopLosers />
                                </DashboardCard>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 좁은 사이드바 영역 */}
                    <div className="dashboard-sidebar">
                        <DashboardCard title="주요 소식">
                            <MajorNews />
                        </DashboardCard>
                        <DashboardCard title="테마별 증감률">
                            <ThematicRates />
                        </DashboardCard>
                    </div>

                </div>
            </main>

            <AboutSection />
        </div>
    );
}

export default MainPage;