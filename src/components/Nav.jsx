import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Nav.css'; // Nav.css 파일 import
import useDebounce from '../components/hooks/useDebounce'; // 디바운스 훅
import { searchStocksByQuery } from '../lib/api'; // API 호출 함수

function Nav() {
    const [query, setQuery] = useState(''); // 검색어
    const [results, setResults] = useState([]); // 검색 결과
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태

    const navigate = useNavigate();
    const searchContainerRef = useRef(null); // 검색창+드롭다운 영역 참조

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery) {
                try {
                    const data = await searchStocksByQuery(debouncedQuery);
                    setResults(data);
                    setIsDropdownOpen(data.length > 0);
                } catch (error) {
                    console.error("Error fetching search results:", error);
                    setResults([]);
                    setIsDropdownOpen(false);
                }
            } else {
                setResults([]);
                setIsDropdownOpen(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // 검색 결과 항목 클릭 시
    const handleResultClick = (stockId) => { // 1. stockCode -> stockId
        navigate(`/stock/${stockId}`); // 상세 페이지로 이동
        setQuery('');
        setResults([]);
        setIsDropdownOpen(false);
    };

    // 검색창 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchContainerRef]);

    return (
        <nav className="navbar">
            <div className="nav-section nav-left">
                <Link to="/" className="nav-logo">전봉준</Link>

                <div className="search-container" ref={searchContainerRef}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="종목명 또는 코드를 검색하세요"
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setIsDropdownOpen(true)}
                    />

                    {isDropdownOpen && results.length > 0 && (
                        <ul className="search-results-dropdown">
                            {results.map((stock) => (
                                <li
                                    // 2. stockCode -> stockId
                                    key={stock.stockId}
                                    onClick={() => handleResultClick(stock.stockId)}
                                >
                                    {stock.stockName} ({stock.stockId})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* (오른쪽 링크 부분은 동일) ... */}
            <div className="nav-section nav-right">
                <ul className="nav-links">
                    <li><Link to="/news">최신 뉴스</Link></li>
                    <li><Link to="/myshop">나의 자산</Link></li>
                    <li><Link to="/chat" >투자 상담</Link></li>
                    <li><Link to="/support">고객 광장</Link></li>
                </ul>
                <Link to="/register" className="nav-register-button">
                    입점
                </Link>
            </div>
        </nav>
    );
}

export default Nav;