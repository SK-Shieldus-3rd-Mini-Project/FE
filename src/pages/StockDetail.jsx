import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./../assets/StockDetail.css";
import InlineLoader from "../components/InlineLoader.jsx";

// (StatCard, Sparkline 함수는 기존과 동일)
function StatCard({ label, value }) {
    return (
        <div className="sd-stat-card">
            <div className="sd-stat-label">{label}</div>
            <div className="sd-stat-value">{value}</div>
        </div>
    );
}

function Sparkline({ points = [], height = 180 }) {
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
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [watch, setWatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // [수정] 포트폴리오 폼 State
    const [quantity, setQuantity] = useState("");
    const [avgPrice, setAvgPrice] = useState("");
    // [신규] 기존 보유 여부 확인용 State
    const [existingPortfolio, setExistingPortfolio] = useState(null);

    // 데이터 로딩 (Watchlist, Portfolio 모두 가져오도록 수정)
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!id || !userId) {
            setError("종목 코드 또는 userId가 없습니다.");
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            setError(null);
            setLoading(true); // 로딩 시작
            try {
                const [
                    aiPriceRes,
                    aiChartRes,
                    backendRes,
                    watchlistRes,
                    portfolioRes // [신규] 보유 목록 API 호출
                ] = await Promise.all([
                    fetch(`ai/api/stock/${id}`),
                    fetch(`ai/api/stock/${id}/chart`),
                    fetch(`/api/stocks/${id}`),
                    api.get(`/api/users/${userId}/watchlist`),
                    api.get(`/api/users/${userId}/portfolio`) // [신규]
                ]);

                // (에러 체크 ...)
                if (!aiPriceRes.ok || !aiChartRes.ok || !backendRes.ok || !watchlistRes.status === 200 || !portfolioRes.status === 200) {
                    throw new Error('종목 정보를 가져오는 데 실패했습니다.');
                }

                const aiPriceData = await aiPriceRes.json();
                const aiChartData = await aiChartRes.json();
                const backendData = await backendRes.json();
                const watchlistData = watchlistRes.data;
                const portfolioData = portfolioRes.data; // [신규]

                // 1. 관심종목 상태 설정
                const isWatched = watchlistData.some(item => item.stockId === id);
                setWatch(isWatched);

                // 2. [신규] 보유종목 상태 설정 (폼 자동 채우기)
                const existingItem = portfolioData.find(item => item.stockId === id);
                if (existingItem) {
                    setExistingPortfolio(existingItem);
                    setQuantity(existingItem.quantity);
                    setAvgPrice(existingItem.avgPurchasePrice);
                } else {
                    setExistingPortfolio(null);
                    setQuantity("");
                    setAvgPrice("");
                }

                // 3. 페이지 데이터 설정
                setData({
                    name: aiPriceData.name,
                    price: aiPriceData.price,
                    // (이하 동일)
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
                setLoading(false); // 로딩 종료
            }
        };

        fetchAll();
        // [수정] 의존성 배열에서 loading 제거 (무한 루프 방지)
    }, [id]);

    // (관심종목 토글 함수 - 기존과 동일)
    const toggleWatch = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }
        const next = !watch;
        setWatch(next);
        try {
            if (next) {
                await api.post(`/api/users/${userId}/watchlist`, { stockId: id });
            } else {
                await api.delete(`/api/users/${userId}/watchlist/${id}`);
            }
        } catch (err) {
            console.error("관심종목 처리 실패:", err);
            alert("요청 처리에 실패했습니다. 다시 시도해 주세요.");
            setWatch(!next);
        }
    };

    // [수정] 보유 종목 추가 (POST) / 수정 (PUT) 핸들러
    const handlePortfolioSubmit = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return alert("로그인이 필요합니다.");

        const numQuantity = parseInt(quantity, 10);
        const numAvgPrice = parseInt(avgPrice, 10);

        if (!numQuantity || numQuantity <= 0) return alert("보유 수량을 올바르게 입력하세요.");
        if (!numAvgPrice || numAvgPrice <= 0) return alert("평균 매수 단가를 올바르게 입력하세요.");

        // DTO에 맞춘 페이로드
        const payload = {
            stockId: id,
            quantity: numQuantity,
            avgPurchasePrice: numAvgPrice
        };

        try {
            if (existingPortfolio) {
                // --- 1. 이미 존재: 수정 (PUT) ---
                await api.put(`/api/users/${userId}/portfolio/${id}`, payload);
                alert(`${data.name} 종목이 수정되었습니다.`);
            } else {
                // --- 2. 신규: 추가 (POST) ---
                await api.post(`/api/users/${userId}/portfolio`, payload);
                alert(`${data.name} 종목이 보유 목록에 추가되었습니다.`);
            }
            navigate('/watchlist'); // 성공 시 '내 주식' 페이지로 이동

        } catch (err) {
            console.error("보유 종목 처리 실패:", err);
            alert("요청 처리에 실패했습니다.");
        }
    };


    if (loading) {
        return <div className="sd-wrap"><InlineLoader/></div>;
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
            {/* (헤더) */}
            <div className="sd-header">
                <div className="sd-breadcrumb">종목 상세</div>
                <button className={`sd-watch ${watch ? "on" : ""}`} onClick={toggleWatch} aria-label="관심등록">
                    <span className="sd-seal">關心</span>
                    <span className="sd-watch-text">{watch ? "관심등록됨" : "관심등록"}</span>
                </button>
            </div>

            {/* (제목/가격/차트/스탯 ... 기존과 동일) */}
            <div className="sd-title">
                <div className="sd-name">{name}</div>
                <div className="sd-ticker">{foreignTicker}</div>
                <div className="sd-price">₩{fmt(price)}</div>
                <div className={`sd-change ${changePct >= 0 ? "up" : "down"}`}>
                    {changePct >= 0 ? "+" : ""}{changePct}% {changePct >= 0 ? "▲" : "▼"} {changePct >= 0 ? "+" : ""}{fmt(changeAmt)}
                </div>
            </div>
            <div className="sd-chart-wrap">
                <Sparkline points={chart} />
            </div>
            <div className="sd-stats">
                <StatCard label="시가" value={fmt(ohlc?.open)} />
                <StatCard label="저가" value={fmt(ohlc?.low)} />
                <StatCard label="고가" value={fmt(ohlc?.high)} />
                <StatCard label="RSI" value={tech?.rsi} />
                <StatCard label="MACD" value={fmt(tech?.macd)} />
                <StatCard label="이동평균선" value={fmt(tech?.ma20)} />
            </div>

            {/* --- [수정] 보유 종목 추가/수정 폼 --- */}
            <section className="sd-section sd-add-portfolio">
                {/* [수정] 폼 제목 변경 */}
                <h3 className="sd-sec-title">
                    {existingPortfolio ? "보유 종목 수정" : "보유 종목에 추가"}
                </h3>
                <div className="sd-portfolio-form">
                    <div className="sd-form-group">
                        <label htmlFor="quantity">보유 수량</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="예: 10"
                            min="1"
                        />
                    </div>
                    <div className="sd-form-group">
                        <label htmlFor="avgPrice">평균 매수 단가 (원)</label>
                        <input
                            type="number"
                            id="avgPrice"
                            value={avgPrice}
                            onChange={(e) => setAvgPrice(e.target.value)}
                            placeholder="예: 80000"
                            min="1"
                        />
                    </div>
                    {/* [수정] 버튼 텍스트 변경 */}
                    <button className="sd-add-btn" onClick={handlePortfolioSubmit}>
                        {existingPortfolio ? "수정하기" : "추가하기"}
                    </button>
                </div>
            </section>

            {/* (뉴스, 리포트 섹션 - 기존과 동일) */}
            <section className="sd-section">
                <h3 className="sd-sec-title">최근 뉴스</h3>
                <ul className="sd-list">
                    {news?.map((n, i) => <li key={i} className="sd-list-item">{n}</li>)}
                </ul>
            </section>
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