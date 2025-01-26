import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page.css'; // Import the CSS file for page styling

const Home = () => {
    const [patientName, setPatientName] = useState('');
    const navigate = useNavigate();

    const handlePatientSubmit = (e) => {
        e.preventDefault();
        if (patientName.trim()) {
            navigate('/patient-info', { state: { name: patientName } });
        }
    };

    return (
        <div className="page-content">
            <h1>Welcome to the Home Page</h1>
            <p>Please enter your name to see wait times and further information about your emergency room visit.</p>

            <div className="patient-section">
                <h2>For Patients</h2>
                <form onSubmit={handlePatientSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Enter Name"
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Enter Queue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;