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
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [watch, setWatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const watchKey = `watch:${id}`;

    useEffect(() => {
        setWatch(localStorage.getItem(watchKey) === "1");
    }, [watchKey]);

    useEffect(() => {
        const fetchAll = async () => {
            setError(null);
            try {
                // 1. 주식 상세 정보와 차트 데이터를 동시에 호출합니다.
                const [detailRes, chartRes] = await Promise.all([
                    fetch(`http://127.0.0.1:8001/api/stock/${id}`),
                    fetch(`http://127.0.0.1:8001/api/stock/${id}/chart`)
                ]);

                if (!detailRes.ok || !chartRes.ok) {
                    throw new Error('종목 정보를 가져오는 데 실패했습니다.');
                }

                const detail = await detailRes.json();
                const chart = await chartRes.json();

                // 2. 모든 데이터를 하나로 합쳐서 state에 저장합니다.
                setData({
                    ...detail,
                    ...chart,
                    // ▼▼▼ 여기가 핵심! AI 코멘트를 다시 임시 목데이터로 변경 ▼▼▼
                    comment: "현재 저평가 구간이며, AI 반도체 수요로 중장기 성장 전망이 긍정적입니다.",
                    // 뉴스, 리포트도 임시 데이터를 유지합니다.
                    news: [ `${detail.name}, 새로운 모멘텀 발견`, `외국인, ${detail.name} 순매수 지속`, ],
                    reports: [ { broker: "NH투자증권", target: "95,000원", stance: "매수" }, ],
                    // 기술적 지표도 임시값을 사용합니다.
                    tech: { rsi: 32, macd: 92351, ma20: 92351 },
                });

            } catch (e) {
                console.error(e);
                setError("데이터를 불러오지 못했어요.");
            } finally {
                if (loading) setLoading(false);
            }
        };

        // 페이지에 처음 들어왔을 때 한 번 즉시 실행
        fetchAll();

        // 5초마다 데이터 자동 새로고침 (폴링)
        const intervalId = setInterval(fetchAll, 5000);

        // 페이지를 떠나면 반복을 멈춤
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

      {/* 요약 스탯 */}
      <div className="sd-stats">
        <StatCard label="시가" value={fmt(ohlc.open)} />
        <StatCard label="저가" value={fmt(ohlc.low)} />
        <StatCard label="고가" value={fmt(ohlc.high)} />
        <StatCard label="RSI" value={tech.rsi} />
        <StatCard label="MACD" value={fmt(tech.macd)} />
        <StatCard label="이동평균선" value={fmt(tech.ma20)} />
      </div>

      {/* 최근 뉴스 */}
      <section className="sd-section">
        <h3 className="sd-sec-title">최근 뉴스</h3>
        <ul className="sd-list">
          {news.map((n, i) => <li key={i} className="sd-list-item">• {n}</li>)}
        </ul>
      </section>

      {/* 증권사 리포트 */}
      <section className="sd-section">
        <h3 className="sd-sec-title">증권사 리포트</h3>
        <ul className="sd-list">
          {reports.map((r, i) => (
            <li key={i} className="sd-list-item">
              {r.broker}: 목표주가 {r.target} ({r.stance})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

