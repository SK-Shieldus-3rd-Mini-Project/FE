import {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import "./../assets/StockDetail.css";

// 작게 쓰는 공용 카드
function StatCard({label, value}) {
  return (
    <div className="sd-stat-card">
      <div className="sd-stat-label">{label}</div>
      <div className="sd-stat-value">{value}</div>
    </div>
  );
}

// 간단 스파크라인 (SVG)
function Sparkline({points = [], height = 180}) {
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
      {/* 기준선 */}
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

    const watchKey = `watch:${id}`;

    useEffect(() => {
        setWatch(localStorage.getItem(watchKey) === "1");
    }, [watchKey, id]);

    useEffect(() => {
        // [수정 2] id가 undefined이면 API를 호출하지 않습니다.
        if (!id) {
            setError("종목 코드가 없습니다.");
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            setError(null);
            try {
                // [수정 2] AI 서버와 백엔드 서버를 동시에 호출합니다.
                const [
                    aiPriceRes,  // AI 서버 (가격/OHLC)
                    aiChartRes,  // AI 서버 (차트)
                    backendRes   // 백엔드 서버 (뉴스/리포트)
                ] = await Promise.all([
                    // 1. AI 서버 (pykrx 가격 정보)
                    fetch(`http://127.0.0.1:8001/api/stock/${id}`),
                    // 2. AI 서버 (pykrx 차트 정보)
                    fetch(`http://127.0.0.1:8001/api/stock/${id}/chart`),
                    // 3. 백엔드 서버 (DeepSearch 뉴스/리포트)
                    fetch(`/api/stocks/${id}`) // vite 프록시가 :8080으로 연결
                ]);

                if (!aiPriceRes.ok || !aiChartRes.ok || !backendRes.ok) {
                    throw new Error('종목 정보를 가져오는 데 실패했습니다.');
                }

                const aiPriceData = await aiPriceRes.json();   // AI 서버 응답 1
                const aiChartData = await aiChartRes.json();   // AI 서버 응답 2
                const backendData = await backendRes.json(); // 백엔드 서버 응답

                // [수정 3] 두 서버의 응답을 하나로 합칩니다.
                setData({
                    // --- AI 서버 (pykrx) ---
                    name: aiPriceData.name,
                    price: aiPriceData.price,
                    changePct: aiPriceData.changePct,
                    changeAmt: aiPriceData.changeAmt,
                    ohlc: aiPriceData.ohlc,
                    chart: aiChartData.chart,

                    // --- 백엔드 (DeepSearch) ---
                    news: backendData.news,
                    reports: backendData.reports,

                    // --- 임시 Mock (AI 서버가 추후 제공) ---
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

  const toggleWatch = () => {
    const next = !watch;
    setWatch(next);
    localStorage.setItem(watchKey, next ? "1" : "0");
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
                <button className={`sd-watch ${watch ? "on" : ""}`} onClick={toggleWatch} aria-label="관심등록">
                    <span className="sd-seal">關心</span>
                    <span className="sd-watch-text">{watch ? "관심등록 중" : "관심등록"}</span>
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
                    {news?.map((n, i) => <li key={i} className="sd-list-item">• {n}</li>)}
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