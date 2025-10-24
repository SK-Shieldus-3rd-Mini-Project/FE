import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api"; // [추가] 백엔드 API
import "./../assets/StockDetail.css";

// 작게 쓰는 공용 카드
function StatCard({ label, value }) {
    // ... (이하 동일)
    return (
        <div className="sd-stat-card">
            <div className="sd-stat-label">{label}</div>
            <div className="sd-stat-value">{value}</div>
        </div>
    );
}

// 간단 스파크라인 (SVG)
function Sparkline({ points = [], height = 180 }) {
    // ... (이하 동일)
    const width = 640;
    const path = useMemo(() => {
        if (!points.length) return "";
        const max = Math.max(...points);
        const min = Math.min(...points);
        const norm = (v) => {
            if (max === min) return height / 2;
            return height - ((v - min) / (max - min)) * height;
        };
        const step = width / (points.length - 1);
        const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step},${norm(p)}`).join(" ");
        return d;
    }, [points, height]);

    return (
        <svg className="sd-chart" viewBox={`0 0 640 ${height}`} preserveAspectRatio="none">
            <path d={path} className="sd-chart-line" />
            <line x1="0" x2="640" y1={height * 0.35} y2={height * 0.35} className="sd-chart-baseline" />
        </svg>
    );
}

export default function StockDetail() {
    const { stockId: id } = useParams();
    const [data, setData] = useState(null);
    const [watch, setWatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const watchKey = `watch:${id}`; // localStorage 키는 유지 (UI 즉각 반응용)

    // 페이지 로드 시 localStorage를 확인해 '관심' 상태를 초기화
    useEffect(() => {
        setWatch(localStorage.getItem(watchKey) === "1");
    }, [watchKey, id]);

    // 데이터 페칭 useEffect (기존과 동일)
    useEffect(() => {
        if (!id) {
            setError("종목 코드가 없습니다.");
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            setError(null);
            try {
                const [
                    aiPriceRes,
                    aiChartRes,
                    backendRes
                ] = await Promise.all([
                    fetch(`http://127.0.0.1:8001/api/stock/${id}`),
                    fetch(`http://127.0.0.1:8001/api/stock/${id}/chart`),
                    fetch(`/api/stocks/${id}`)
                ]);

                if (!aiPriceRes.ok || !aiChartRes.ok || !backendRes.ok) {
                    throw new Error('종목 정보를 가져오는 데 실패했습니다.');
                }

                const aiPriceData = await aiPriceRes.json();
                const aiChartData = await aiChartRes.json();
                const backendData = await backendRes.json();

                setData({
                    name: aiPriceData.name,
                    price: aiPriceData.price,
                    changePct: aiPriceData.changePct,
                    changeAmt: aiPriceData.changeAmt,
                    ohlc: aiPriceData.ohlc,
                    chart: aiChartData.chart,
                    news: backendData.news,
                    reports: backendData.reports,
                    foreignTicker: aiPriceData.foreignTicker || id,
                    tech: aiPriceData.tech || { rsi: 32, macd: 92351, ma20: 92351 },
                });

            } catch (e) {
                console.error(e);
                setError("데이터를 불러오지 못했어요.");
            } finally {
                if (loading) setLoading(false);
            }
        };

        fetchAll();

        const intervalId = setInterval(fetchAll, 5000);
        return () => clearInterval(intervalId);
    }, [id]);

    // [수정] 관심종목 토글 함수 (API 연동)
    const toggleWatch = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("로그인이 필요합니다."); // 또는 로그인 페이지로 리다이렉트
            return;
        }

        // 1. UI 즉시 업데이트 (Optimistic Update)
        const next = !watch;
        setWatch(next);

        // 2. localStorage 업데이트 (다른 페이지와의 동기화용)
        localStorage.setItem(watchKey, next ? "1" : "0");

        try {
            if (next) {
                // 3-1. 관심 종목 추가 API 호출
                // POST /api/users/{userId}/watchlist
                // Body: { "stockId": "..." }
                await api.post(`/api/users/${userId}/watchlist`, { stockId: id });
                alert("관심종목에 추가되었습니다.");
            } else {
                // 3-2. 관심 종목 삭제 API 호출
                // DELETE /api/users/{userId}/watchlist/{stockId}
                await api.delete(`/api/users/${userId}/watchlist/${id}`);
                alert("관심종목에서 제거되었습니다.");
            }
        } catch (err) {
            console.error("관심종목 처리 실패:", err);
            // 4. API 실패 시 UI 롤백 (선택적)
            alert("요청 처리에 실패했습니다. 다시 시도해 주세요.");
            setWatch(!next); // UI 상태를 원래대로 되돌림
            localStorage.setItem(watchKey, !next ? "1" : "0");
        }
    };


    if (loading) {
        return <div className="sd-wrap"><div className="sd-skel">불러오는 중…</div></div>;
    }

    if (error || !data) {
        return <div className="sd-wrap"><div className="sd-error">{error || '데이터를 불러오지 못했어요.'}</div></div>;
    }

    const {
        name, foreignTicker, price, changePct, changeAmt,
        ohlc, tech, chart, news, reports
    } = data;

    const fmt = (n) => n?.toLocaleString("ko-KR");

    return (
        <div className="sd-wrap">
            {/* 헤더줄 */}
            <div className="sd-header">
                <div className="sd-breadcrumb">종목 상세</div>
                {/* [수정] 버튼 클릭 시 수정된 toggleWatch 함수 호출 */}
                <button className={`sd-watch ${watch ? "on" : ""}`} onClick={toggleWatch} aria-label="관심등록">
                    <span className="sd-seal">關心</span>
                    <span className="sd-watch-text">{watch ? "관심등록됨" : "관심등록"}</span>
                </button>
            </div>

            {/* 타이틀/가격 */}
            <div className="sd-title">
                <div className="sd-name">{name}</div>
                <div className="sd-ticker">{foreignTicker}</div>
                <div className="sd-price">₩{fmt(price)}</div>
                <div className={`sd-change ${changePct >= 0 ? "up" : "down"}`}>
                    {changePct >= 0 ? "+" : ""}{changePct}% {changePct >= 0 ? "▲" : "▼"} {changePct >= 0 ? "+" : ""}{fmt(changeAmt)}
                </div>
            </div>

            {/* 차트 */}
            <div className="sd-chart-wrap">
                <Sparkline points={chart} />
            </div>

            {/* 요약 스탯 (AI 서버 데이터) */}
            <div className="sd-stats">
                <StatCard label="시가" value={fmt(ohlc?.open)} />
                <StatCard label="저가" value={fmt(ohlc?.low)} />
                <StatCard label="고가" value={fmt(ohlc?.high)} />
                <StatCard label="RSI" value={tech?.rsi} />
                <StatCard label="MACD" value={fmt(tech?.macd)} />
                <StatCard label="이동평균선" value={fmt(tech?.ma20)} />
            </div>

            {/* 최근 뉴스 (백엔드 서버 데이터) */}
            <section className="sd-section">
                <h3 className="sd-sec-title">최근 뉴스</h3>
                <ul className="sd-list">
                    {news?.map((n, i) => <li key={i} className="sd-list-item">{n}</li>)}
                </ul>
            </section>

            {/* 증권사 리포트 (백엔드 서버 데이터) */}
            <section className="sd-section">
                <h3 className="sd-sec-title">증권사 리포트</h3>
                <ul className="sd-list">
                    {reports?.map((r, i) => (
                        <li key={i} className="sd-list-item">
                            {r.broker}: 목표주가 {r.target} ({r.stance})
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}