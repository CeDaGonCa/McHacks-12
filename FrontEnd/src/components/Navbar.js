import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Make sure to create a CSS file for styling

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Logo</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li> {/* Updated to use Link */}
                <li><Link to="/assistance">Assistance</Link></li> {/* Updated to point to Assistance page */}
                {/* <li><Link to="/services">Services</Link></li> */} {/* Removed Services link */}
                <li><Link to="/games">Games</Link></li> {/* Added Games link */}
                <li><Link to="/contact">Contact</Link></li>
                <li>
                    <Link to="/medical-login">Medical Staff</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;