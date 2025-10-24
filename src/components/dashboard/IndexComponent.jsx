import React from 'react';

function IndexComponent({ data }) {
    // 부모(MainPage)가 로딩/에러를 처리하므로, 여기서는 데이터가 있는지 여부만 확인합니다.
    if (!data) {
        return <p>데이터를 기다리는 중...</p>;
    }

    // 데이터 구조에 맞게 키 이름을 수정합니다. (예: value, changeValue)
    const isDown = data.changeValue < 0;
    const chartData = data.chartData;
    // const lineColor = isDown ? '#2f7bb6' : '#ee2834';

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
                <h3 style={{ margin: '0' }}>{data.value}</h3>
                <p style={{ color: isDown ? 'blue' : 'red', margin: '5px 0 0 0', fontSize: '1.1em' }}>
                    {data.changeValue} ({data.changeRate}%)
                </p>
            </div>

            {chartData && chartData.length > 0 && (
                <div className="chart-wrapper">
                    {/* 여기에 이전에 문제가 됐던 차트 컴포넌트를 나중에 추가할 수 있습니다. */}
                </div>
            )}
        </div>
    );
}

export default IndexComponent;