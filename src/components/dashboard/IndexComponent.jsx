import React, { useState, useEffect } from 'react';

function IndexComponent({ symbol }) {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch('/ai/marketdata/indices');

                if (!response.ok) {
                    throw new Error('데이터 서버에서 응답을 받지 못했습니다.');
                }
                const result = await response.json();
                const indexData = result[symbol];

                setMarketData({
                    stck_prpr: indexData.value,
                    prdy_vrss: indexData.changeValue,
                    prdy_ctrt: indexData.changeRate,
                });

            } catch (err) {
                console.error(`[${symbol}] 데이터 처리 중 최종 에러:`, err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol]);

    if (loading) return <p>불러오는 중...</p>;
    if (error) return <p style={{ color: 'red' }}>오류: {error}</p>;
    if (!marketData) return <p>데이터가 없습니다.</p>;

    return (
        <div style={{ padding: '10px' }}>
            <h3 style={{ margin: '0' }}>{marketData.stck_prpr}</h3>
            <p style={{ color: marketData.prdy_vrss < 0 ? 'blue' : 'red', margin: '5px 0 0 0', fontSize: '1.1em' }}>
                {marketData.prdy_vrss} ({marketData.prdy_ctrt}%)
            </p>
        </div>
    );
}

export default IndexComponent;