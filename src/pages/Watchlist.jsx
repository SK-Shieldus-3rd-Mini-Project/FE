import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/Watchlist.css";

function readWatchedIds() {
  const ids = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("watch:") && localStorage.getItem(k) === "1") {
      ids.push(k.replace("watch:", ""));
    }
  }
  return ids;
}

const STOCK_META = {
  "005930": { name: "삼성전자" },
  "000660": { name: "SK하이닉스" },
  "035420": { name: "NAVER" },
  "068270": { name: "셀트리온" },
  "035720": { name: "카카오" },
};

export default function Watchlist() {
  const [tab, setTab] = useState("own"); // "own" | "watch"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const watchedIds = useMemo(() => readWatchedIds(), []);

  // 보유 종목 (임시)
  const [ownList, setOwnList] = useState([
    { id: "005930", name: "삼성전자", price: 92351, quantity: 10, profit: +3.51 },
    { id: "000660", name: "SK하이닉스", price: 123120, quantity: 5, profit: -0.84 },
  ]);

  useEffect(() => {
    setLoading(true);
    const base = 92351;

    const watchList = watchedIds.map((id) => {
      const changePct = (Math.random() * 4 - 2).toFixed(2);
      return {
        id,
        name: STOCK_META[id]?.name ?? `종목(${id})`,
        price: base + Math.floor(Math.random() * 5000 - 2500),
        changePct: Number(changePct),
      };
    });

    setRows(tab === "own" ? ownList : watchList);
    setLoading(false);
  }, [tab, watchedIds, ownList]);

  /** 관심종목 해제 */
  const handleUnwatch = (id) => {
    localStorage.setItem(`watch:${id}`, "0");
    setRows((prev) => prev.filter((r) => r.id !== id));
    window.dispatchEvent(new Event("watchlist:changed"));
  };

  /** 보유종목 삭제(매도) */
  const handleRemoveOwn = (id) => {
    if (confirm("정말 이 종목을 보유목록에서 제거할까요?")) {
      setOwnList((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1 className="wl-h1">내 주식</h1>

        <div className="wl-tabbar">
          <button
            className={`wl-pill ${tab === "own" ? "active" : ""}`}
            onClick={() => setTab("own")}
          >
            보유 종목
          </button>
          <button
            className={`wl-pill ${tab === "watch" ? "active" : ""}`}
            onClick={() => setTab("watch")}
          >
            관심 종목
          </button>

          <div className={`wl-underline ${tab}`} />
        </div>
      </div>

      <div className="wl-card">
        {loading ? (
          <div className="wl-skel">불러오는 중…</div>
        ) : rows.length === 0 ? (
          <div className="wl-empty">
            {tab === "watch"
              ? "💡 아직 관심등록한 종목이 없습니다."
              : "💡 보유 중인 종목이 없습니다."}
          </div>
        ) : (
          <>
            <div className="wl-row wl-head">
              <div className="c-name">종목명</div>
              <div className="c-price">현재가</div>
              {tab === "own" && <div className="c-qty">보유수량</div>}
              <div className="c-change">{tab === "own" ? "수익률" : "등락률"}</div>
              <div className="c-actions">액션</div>
            </div>

            {rows.map((r) => (
              <div className="wl-row" key={r.id}>
                <div className="c-name">
                  <Link className="wl-link" to={`/stock/${r.id}`}>
                    {r.name}
                  </Link>
                  <span className="wl-ticker">{r.id}</span>
                </div>

                <div className="c-price">₩{Number(r.price).toLocaleString("ko-KR")}</div>

                {tab === "own" && <div className="c-qty">{r.quantity}</div>}

                <div
                  className={`c-change ${
                    (r.changePct ?? r.profit) >= 0 ? "up" : "down"
                  }`}
                >
                  {(r.changePct ?? r.profit) >= 0 ? "+" : ""}
                  {(r.changePct ?? r.profit).toFixed(2)}%
                </div>

                <div className="c-actions">
                  {tab === "watch" ? (
                    <button className="wl-btn ghost" onClick={() => handleUnwatch(r.id)}>
                      관심 해제
                    </button>
                  ) : (
                    <button className="wl-btn ghost danger" onClick={() => handleRemoveOwn(r.id)}>
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
