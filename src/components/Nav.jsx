// src/components/Nav.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/Nav.css';

export default function Nav() {
  return (
    <nav className="navbar">
      {/* 왼쪽: 로고 + 검색 */}
      <div className="nav-section nav-left">
        <Link to="/" className="nav-logo">전봉준</Link>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="제품을 검색해보세요"
            className="search-input"
          />
        </div>
      </div>

      {/* 오른쪽: 링크/버튼 */}
      <div className="nav-section nav-right">
        <ul className="nav-links">
          <li><Link to="/cart">장바구니</Link></li>
          <li><Link to="/myshop">나의 상점</Link></li>
          <li><Link to="/support">고객 광장</Link></li>
          {/* 👉 추가: 관심종목 / 예시 종목 상세 */}
          <li><Link to="/watchlist">관심종목</Link></li>
          <li><Link to="/stock/005930">삼성전자 상세</Link></li>
        </ul>
        <Link to="/register" className="nav-register-button">입점</Link>
      </div>
    </nav>
  );
}
