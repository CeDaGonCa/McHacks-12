import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page.css';

const MedicalLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (username === 'username' && password === 'password') {
            // Successful login
            localStorage.setItem('medicalStaffToken', 'test-token');
            navigate('/medical-dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="page-content">
            <div className="login-container">
                <h1>Medical Staff Login</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default MedicalLogin; 