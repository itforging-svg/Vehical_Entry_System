import React from 'react';
import logo from '../assets/logo.png';
import './Header.css';

const Header = ({ title = "Vehicle Entry System" }) => {
    return (
        <header className="main-header">
            <div className="header-left">
                <img src={logo} alt="CSL Logo" className="header-logo-img" />
                <div className="header-text">
                    <h1>{title}</h1>
                    <p>CHANDAN STEEL LTD</p>
                </div>
            </div>
            <div className="header-right">
                <span className="system-badge">STANDALONE ENTRY PORTAL</span>
            </div>
        </header>
    );
};

export default Header;
