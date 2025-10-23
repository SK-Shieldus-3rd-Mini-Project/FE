import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/Nav.css'; // Nav.css 파일을 import

function Nav() {
    return (
        <nav className="navbar">
            {/* 1. 왼쪽 로고 */}
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

            {/* 3. 오른쪽 링크 및 버튼 */}
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