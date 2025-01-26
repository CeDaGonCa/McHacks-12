import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import medicalLogo from '../assets/medical-logo.png';

const Header = () => {
    return (
        <header className="header">
            <div className="logo-container">
                <img src={medicalLogo} alt="Medical Symbol" className="logo" />
            </div>
            <nav className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/patient">Patient</Link>
                <Link to="/nurse">Nurse</Link>
                <Link to="/doctor">Doctor</Link>
                <Link to="/contact">Contact</Link>
            </nav>
        </header>
    );
};

export default Header; 