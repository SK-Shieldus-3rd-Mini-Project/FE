// src/pages/MainPage.jsx (최종 수정)

import React, { useState, useEffect } from 'react';
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
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8001/api/dashboard')
            .then(res => {
                if (!res.ok) throw new Error('대시보드 데이터를 가져오는데 실패했습니다.');
                return res.json();
            })
            .then(data => {
                setDashboardData(data); 
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); 

    if (loading) return <div className="loading-screen">전체 대시보드 데이터를 불러오는 중...</div>;
    if (error) return <div className="error-screen" style={{color: 'red', padding: '20px'}}>오류: {error}</div>;

    return (
        <div className="main-page-container">
            <Hero />
            <main className="dashboard-main">
                <div className="dashboard-flex-container">
                    <div className="dashboard-main-content">
                        <div className="top-row-container">
                            <div className="top-row-item">
                                <DashboardCard title="코스피">
                                    {/* ▼▼▼ 여기가 핵심! 받아온 데이터를 props로 내려줍니다. ▼▼▼ */}
                                    <IndexComponent data={dashboardData?.indices?.kospi} />
                                </DashboardCard>
                            </div>
                            <div className="top-row-item">
                                <DashboardCard title="코스닥">
                                    <IndexComponent data={dashboardData?.indices?.kosdaq} />
                                </DashboardCard>
                            </div>
                        </div>

                        <DashboardCard title="시장 요약"><MarketSummary /></DashboardCard>

                        <div className="bottom-row-container">
                            <div className="bottom-row-item">
                                <DashboardCard title="상승률 상위"><TopGainers data={dashboardData?.topGainers} /></DashboardCard>
                            </div>
                            <div className="bottom-row-item">
                                <DashboardCard title="하락률 상위"><TopLosers data={dashboardData?.topLosers} /></DashboardCard>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-sidebar">
                        <DashboardCard title="관심 종목"><MajorNews /></DashboardCard>
                        <DashboardCard title="거래량 상위"><TopVolume data={dashboardData?.topVolume} /></DashboardCard>
                        <DashboardCard title="시가총액 상위"><TopMarketCap data={dashboardData?.topMarketCap} /></DashboardCard>
                    </div>
                </div>
            </main>
            <AboutSection />
        </div>
    );
}

export default MainPage;