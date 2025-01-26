import React, { useState, useEffect } from 'react';
import './Page.css'; // Import the CSS file for page styling

const NurseDashboard = () => {
    const [patientName, setPatientName] = useState('');
    const [severityLevel, setSeverityLevel] = useState(3); // Default to middle severity
    const [estimatedVisitDuration, setEstimatedVisitDuration] = useState(30); // Default 30 mins
    const [queuedPatients, setQueuedPatients] = useState([]);
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        age: '',
        contactNumber: '',
        email: '',
        emergencyContact: '',
        labTests: [],
        additionalNotes: ''
    });

    useEffect(() => {
        // Fetch current queue on component mount
        fetchQueuedPatients();

        // Set up WebSocket connection for real-time updates
        const socket = new WebSocket('ws://localhost:3001');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setQueuedPatients(data.patients);
        };

        return () => socket.close();
    }, []);

    const fetchQueuedPatients = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/queue');
            const data = await response.json();
            setQueuedPatients(data.patients);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...patientInfo,
                    severityLevel,
                    estimatedVisitDuration
                }),
            });
            
            if (response.ok) {
                // Reset form
                setPatientInfo({
                    name: '',
                    age: '',
                    contactNumber: '',
                    email: '',
                    emergencyContact: '',
                    labTests: [],
                    additionalNotes: ''
                });
                setSeverityLevel(3);
                setEstimatedVisitDuration(30);
                fetchQueuedPatients();
            }
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    };

    return (
        <div className="page-content">
            <h1>Nurse Dashboard</h1>
            
            <form onSubmit={handleSubmit}>
                <div className="patient-info-grid">
                    <div>
                        <label>Patient Name:</label>
                        <input
                            type="text"
                            value={patientInfo.name}
                            onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Age:</label>
                        <input
                            type="number"
                            value={patientInfo.age}
                            onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Contact Number:</label>
                        <input
                            type="tel"
                            value={patientInfo.contactNumber}
                            onChange={(e) => setPatientInfo({...patientInfo, contactNumber: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={patientInfo.email}
                            onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label>Emergency Contact:</label>
                        <input
                            type="tel"
                            value={patientInfo.emergencyContact}
                            onChange={(e) => setPatientInfo({...patientInfo, emergencyContact: e.target.value})}
                        />
                    </div>
                    <div>
                        <label>Additional Notes:</label>
                        <textarea
                            value={patientInfo.additionalNotes}
                            onChange={(e) => setPatientInfo({...patientInfo, additionalNotes: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label>Severity Level (1-5):</label>
                    <select 
                        value={severityLevel}
                        onChange={(e) => setSeverityLevel(Number(e.target.value))}
                    >
                        <option value={1}>1 - Critical</option>
                        <option value={2}>2 - Severe</option>
                        <option value={3}>3 - Moderate</option>
                        <option value={4}>4 - Mild</option>
                        <option value={5}>5 - Non-urgent</option>
                    </select>
                </div>
                <div>
                    <label>Estimated Visit Duration (minutes):</label>
                    <input
                        type="number"
                        value={estimatedVisitDuration}
                        onChange={(e) => setEstimatedVisitDuration(Number(e.target.value))}
                        min="5"
                        max="180"
                    />
                </div>
                <button type="submit">Add to Queue</button>
            </form>

            <h2>Current Queue</h2>
            <div className="queue-list">
                {queuedPatients.map((patient, index) => (
                    <div key={patient.id} className={`patient-card severity-${patient.severityLevel}`}>
                        <p>Name: {patient.name}</p>
                        <p>Severity: {patient.severityLevel}</p>
                        <p>Wait Time: {patient.estimatedWaitTime} minutes</p>
                        <p>Queue Position: {index + 1}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NurseDashboard;
