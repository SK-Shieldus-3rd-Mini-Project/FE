import React, { useState, useEffect } from 'react';
import StockListItem from './StockListItem'; // 새로 만든 컴포넌트 import

function TopLosers() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8001/api/top-losers')
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
                    value={`${stock.change_rate}%`}
                    valueColor="blue"
                />
            ))}
        </ul>
    );
}
export default TopLosers;