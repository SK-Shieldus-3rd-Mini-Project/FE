import React, { useState, useEffect } from 'react';
import StockListItem from './StockListItem';

function TopVolume() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/marketdata/api/top-volume')
            .then(res => res.ok ? res.json() : Promise.reject('서버 응답 실패'))
            .then(setData)
            .catch(err => setError(err.message));
    }, []);

    if (error) return <p style={{ color: 'red' }}>오류: {error}</p>;
    if (!Array.isArray(data)) return <p>데이터 로딩 중...</p>;
    
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.map((stock, index) => (
                <StockListItem
                    key={stock.code}
                    rank={index + 1}
                    name={stock.name}
                    // ▼▼▼ 여기가 핵심! value prop에 JSX를 직접 전달합니다. ▼▼▼
                    value={
                        <span>
                            <span style={{ fontSize: '0.85em', color: '#9ca3af', marginRight: '5px' }}>
                                거래량
                            </span>
                            {stock.volume.toLocaleString()}
                        </span>
                    }
                />
            ))}
        </ul>
    );
}

export default TopVolume;