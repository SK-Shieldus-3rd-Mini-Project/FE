import React, { useState, useEffect } from 'react';
// StockListItem import를 제거합니다.

function TopMarketCap() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/marketdata/api/top-market-cap')
            .then(res => res.ok ? res.json() : Promise.reject('서버 응답 실패'))
            .then(setData)
            .catch(err => setError(err.message));
    }, []);

    if (error) return <p style={{ color: 'red' }}>오류: {error}</p>;
    if (!Array.isArray(data)) return <p>데이터 로딩 중...</p>;
    
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.map((stock, index) => {
                const isPositive = stock.change_rate > 0;
                const isNegative = stock.change_rate < 0;
                const color = isPositive ? 'red' : (isNegative ? 'blue' : 'black');
                const sign = isPositive ? '+' : '';

                return (
                    // ▼▼▼ 여기가 핵심! 목록 아이템을 직접 렌더링합니다. ▼▼▼
                    <li key={stock.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.95em' }}>
                        {/* 왼쪽: 순위와 종목명 */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '25px', textAlign: 'left', marginRight: '8px', color: '#333' }}>{index + 1}.</span>
                            <span>{stock.name}</span>
                        </div>
                        {/* 오른쪽: 현재가와 등락률 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: '500', minWidth: '70px', textAlign: 'right' }}>
                                {stock.price.toLocaleString()}
                            </span>
                            <span style={{ color: color, fontWeight: '500', minWidth: '60px', textAlign: 'right' }}>
                                {sign}{stock.change_rate}%
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default TopMarketCap;