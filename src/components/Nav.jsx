import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/Nav.css';

function Nav() {

    return (
        <nav className='main-nav'>
            <div className='logo-container'>
                <Link to="/">
                    <img src="/logo.png" alt="전봉준" className='logo' />
                </Link>
            </div>
        </nav>
    );
}

export default Nav;