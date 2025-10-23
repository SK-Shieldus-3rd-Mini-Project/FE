// src/pages/MainPage.jsx (최종 수정)

import React from 'react';
import Hero from '../components/main/Hero.jsx';
import AboutSection from '../components/main/AboutSection.jsx';
import '../assets/MainPage.css';

import IndexComponent from '../components/dashboard/IndexComponent';
import TopGainers from '../components/dashboard/TopGainers.jsx';
import TopLosers from '../components/dashboard/TopLosers.jsx';
import TopVolume from '../components/dashboard/TopVolume.jsx';
import TopMarketCap from '../components/dashboard/TopMarketCap.jsx';

const MarketSummary = () => <div>시장 요약 텍스트...</div>;
const MajorNews = () => <div>관심 종목...</div>;

const DashboardCard = ({ title, children }) => (
    <div className="dashboard-card">
        <h2 className="dashboard-card-title">{title}</h2>
        <div>{children}</div>
    </div>
);

function MainPage() {
    return (
        <div className="main-page-container">
            <Hero />
            <main className="dashboard-main">
                <div className="dashboard-flex-container">
                    {/* 왼쪽 영역 */}
                    <div className="dashboard-main-content">
                        <div className="top-row-container">
                            <div className="top-row-item">
                                <DashboardCard title="코스피">
                                    <IndexComponent symbol="kospi" />
                                </DashboardCard>
                            </div>
                            <div className="top-row-item">
                                <DashboardCard title="코스닥">
                                    <IndexComponent symbol="kosdaq" />
                                </DashboardCard>
                            </div>
                        </div>

                        <DashboardCard title="시장 요약">
                            <MarketSummary />
                        </DashboardCard>

                        <div className="bottom-row-container">
                            <div className="bottom-row-item">
                                {/* 이제 이 코드는 import된 실제 컴포넌트를 올바르게 사용합니다. */}
                                <DashboardCard title="상승률 상위"><TopGainers /></DashboardCard>
                            </div>
                            <div className="bottom-row-item">
                                <DashboardCard title="하락률 상위"><TopLosers /></DashboardCard>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 좁은 사이드바 영역 */}
                    <div className="dashboard-sidebar">
                        <DashboardCard title="관심 종목"><MajorNews /></DashboardCard>
                        <DashboardCard title="거래량 상위">
                            <TopVolume />
                        </DashboardCard>
                        <DashboardCard title="시가총액 상위"><TopMarketCap /></DashboardCard>
                    </div>
                </div>
            </main>

            <AboutSection />
        </div>
    );
}

export default MainPage;