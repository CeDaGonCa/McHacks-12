import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page.css'; // Import the CSS file for page styling

const Home = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleEnterName = (e) => {
        e.preventDefault();
        // Navigate to the PatientInfo page with the entered name
        navigate('/patient-info', { state: { name } });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // Check if the entered username and password are correct
        if (username === 'username' && password === 'password') {
            // Navigate to the NurseDashboard page
            navigate('/nurse-dashboard');
        } else {
            console.log('Invalid username or password');
        }
    };

    return (
        <div className="page-content">
            <h1>Welcome to the Home Page</h1>
            <p>Please enter your name to see wait times and further information about your emergency room visit.</p>
            
            <h2>For Patients</h2>
            <form onSubmit={handleEnterName}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <button type="submit">Enter Name</button>
            </form>

            <h2>For Nurses</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Home;