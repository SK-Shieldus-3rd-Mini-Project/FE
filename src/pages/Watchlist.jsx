import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api"; // 백엔드 API
import "../assets/Watchlist.css";

// [신규] 프론트엔드에서 AI 서버로 직접 가격을 요청하는 함수
const fetchPriceFromAI = async (stockId) => {
  try {
    // StockDetail.jsx와 동일한 방식으로 AI 서버에 직접 요청
    const res = await fetch(`http://127.0.0.1:8001/api/stock/${stockId}`);
    if (!res.ok) {
      throw new Error(`AI server request failed for ${stockId}`);
    }
    const data = await res.json();
    return {
      price: data.price,
      changePct: data.changePct,
      gainLossPct: data.changePct // 보유/관심 모두 changePct를 사용 (필요시 백엔드 DTO 수정)
    };
  } catch (err) {
    console.error(err);
    // 실패 시 0으로 반환
    return { price: 0, changePct: 0.0, gainLossPct: 0.0 };
  }
};


export default function Watchlist() {
  const [tab, setTab] = useState("own"); // "own" | "watch"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // API 응답 원본을 저장
  const [realOwnList, setRealOwnList] = useState([]);
  const [realWatchList, setRealWatchList] = useState([]);

  // 1. 컴포넌트 마운트 시 백엔드에서 '목록'만 가져오기
  useEffect(() => {
    const fetchLists = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        console.error("userId 없음");
        return;
      }

      setLoading(true);
      try {
        const [portfolioRes, watchlistRes] = await Promise.all([
          api.get(`/api/users/${userId}/portfolio`),
          api.get(`/api/users/${userId}/watchlist`)
        ]);

        // --- ▼▼▼▼▼ 핵심 수정 ▼▼▼▼▼ ---
        // 2. 백엔드에서 받은 목록을 기반으로 AI 서버에 가격 정보 병렬 요청

        // 2-1. 보유 종목 (Portfolio) 가격 요청
        const portfolioWithPrices = await Promise.all(
            portfolioRes.data.map(async (item) => {
              const aiData = await fetchPriceFromAI(item.stockId);
              return {
                ...item, // { stockId, stockName, quantity, ... }
                currentPrice: aiData.price, // AI 서버의 실시간 가격
                gainLossPct: aiData.changePct, // AI 서버의 실시간 등락률
              };
            })
        );

        // 2-2. 관심 종목 (Watchlist) 가격 요청
        const watchlistWithPrices = await Promise.all(
            watchlistRes.data.map(async (item) => {
              // (백엔드가 0을 줬더라도 무시하고 AI 서버 데이터로 덮어씀)
              const aiData = await fetchPriceFromAI(item.stockId);
              return {
                ...item, // { stockId, stockName }
                price: aiData.price, // AI 서버의 실시간 가격
                changePct: aiData.changePct, // AI 서버의 실시간 등락률
              };
            })
        );
        // --- ▲▲▲▲▲ 핵심 수정 ▲▲▲▲▲ ---

        setRealOwnList(portfolioWithPrices);
        setRealWatchList(watchlistWithPrices);

      } catch (err) {
        console.error("내 주식 정보 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []); // 마운트 시 1회 실행

  // 3. 탭이 변경되거나 '실제 데이터'가 바뀌면 화면 렌더링용 'rows' 업데이트
  useEffect(() => {
    if (loading) return;

    if (tab === "own") {
      const mappedOwnList = realOwnList.map(item => ({
        id: item.stockId,
        name: item.stockName,
        price: item.currentPrice, // AI 서버에서 받아온 가격
        quantity: item.quantity,
        profit: item.gainLossPct, // AI 서버에서 받아온 등락률
      }));
      setRows(mappedOwnList);
    } else {
      const mappedWatchList = realWatchList.map(item => ({
        id: item.stockId,
        name: item.stockName,
        price: item.price,      // AI 서버에서 받아온 가격
        changePct: item.changePct, // AI 서버에서 받아온 등락률
      }));
      setRows(mappedWatchList);
    }
  }, [tab, realOwnList, realWatchList, loading]);

  // --- (이하 핸들러 함수들은 동일) ---

  const handleStockClick = (id) => {
    navigate(`/stock/${id}`);
  };

  const handleUnwatch = async (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      await api.delete(`/api/users/${userId}/watchlist/${id}`);
      setRealWatchList((prev) => prev.filter((r) => r.stockId !== id));
    } catch (err) {
      console.error("관심 종목 삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleRemoveOwn = async (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    if (window.confirm("정말 이 종목을 보유목록에서 제거할까요?")) {
      try {
        await api.delete(`/api/users/${userId}/portfolio/${id}`);
        setRealOwnList((prev) => prev.filter((r) => r.stockId !== id));
      } catch (err) {
        console.error("보유 종목 삭제 실패:", err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  // --- (이하 렌더링 JSX는 동일, toFixed 오류는 이미 해결됨) ---

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
                  <span className="wl-link" onClick={() => handleStockClick(r.id)}>
                    {r.name}
                  </span>
                        <span className="wl-ticker">{r.id}</span>
                      </div>

                      <div className="c-price">₩{Number(r.price).toLocaleString("ko-KR")}</div>

                      {tab === "own" && <div className="c-qty">{r.quantity}</div>}

                      <div
                          className={`c-change ${
                              (r.profit ?? r.changePct ?? 0) >= 0 ? "up" : "down"
                          }`}
                      >
                        {(r.profit ?? r.changePct ?? 0) >= 0 ? "+" : ""}
                        {(r.profit ?? r.changePct ?? 0).toFixed(2)}%
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