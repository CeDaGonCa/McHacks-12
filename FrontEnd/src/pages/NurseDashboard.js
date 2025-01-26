import React, { useState, useEffect } from 'react';
import './Page.css'; // Import the CSS file for page styling

const NurseDashboard = () => {
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        age: '',
        contactNumber: '',
        email: '',
        emergencyContact: '',
        labTests: [],
    });
    const [currentLabTest, setCurrentLabTest] = useState('');
    const [severityLevel, setSeverityLevel] = useState(3);
    const [estimatedVisitDuration, setEstimatedVisitDuration] = useState(30);
    const [queuedPatients, setQueuedPatients] = useState([]);

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
                    patientName: patientInfo.name,
                    severityLevel,
                    estimatedVisitDuration,
                    labTests: patientInfo.labTests,
                    ...patientInfo
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
                });
                setSeverityLevel(3);
                setEstimatedVisitDuration(30);
                fetchQueuedPatients();
            }
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    };

    const handleAddTest = async (e) => {
        e.preventDefault();
        if (!patientInfo.name || !currentLabTest.trim()) return;

        // First update local state
        const newTest = {
            name: currentLabTest.trim(),
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        setPatientInfo(prev => ({
            ...prev,
            labTests: [...prev.labTests, newTest]
        }));

        try {
            const response = await fetch('http://localhost:3001/api/lab-tests/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientName: patientInfo.name,
                    testName: currentLabTest.trim(),
                    status: 'pending',
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                // Clear the lab test input after successful addition
                setCurrentLabTest('');
                
                // Emit WebSocket event to notify patient's page
                const ws = new WebSocket('ws://localhost:3001');
                ws.onopen = () => {
                    ws.send(JSON.stringify({
                        type: 'LAB_TEST_ADDED',
                        data: {
                            patientName: patientInfo.name,
                            testName: currentLabTest.trim(),
                            status: 'pending',
                            timestamp: new Date().toISOString()
                        }
                    }));
                    ws.close();
                };
            }
        } catch (error) {
            // If there's an error, remove the test from local state
            setPatientInfo(prev => ({
                ...prev,
                labTests: prev.labTests.filter(test => test.name !== currentLabTest.trim())
            }));
            console.error('Error adding lab test:', error);
        }
    };

    const handleRemoveLabTest = (index) => {
        setPatientInfo(prev => ({
            ...prev,
            labTests: prev.labTests.filter((_, i) => i !== index)
        }));
    };

    return (
        <>
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
                    <div className="lab-tests-section">
                        <label>Lab Tests:</label>
                        <div className="lab-tests-input">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleAddTest(e);
                            }}>
                                <input
                                    type="text"
                                    value={currentLabTest}
                                    onChange={(e) => setCurrentLabTest(e.target.value)}
                                    placeholder="Enter lab test"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddTest(e);
                                        }
                                    }}
                                />
                                <button 
                                    type="button" 
                                    onClick={(e) => handleAddTest(e)} 
                                    className="add-test-btn"
                                >
                                    Add Test
                                </button>
                            </form>
                        </div>
                        
                        {/* Display added lab tests */}
                        <div className="added-tests-container">
                            <h3>Added Tests:</h3>
                            {patientInfo.labTests.length > 0 ? (
                                <ul className="lab-tests-list">
                                    {patientInfo.labTests.map((test, index) => (
                                        <li key={index} className="lab-test-item">
                                            <span className="test-name">{test.name}</span>
                                            <span className="test-status">{test.status}</span>
                                            <span className="test-date">
                                                {new Date(test.timestamp).toLocaleString()}
                                            </span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveLabTest(index)}
                                                className="remove-test"
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No tests added yet</p>
                            )}
                        </div>
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
                        min="1"
                        max="180"
                        step="1"
                    />
                </div>
                <button type="submit">Add to Queue</button>
            </form>

            <h2>Current Queue</h2>
            <div className="queue-list">
                {queuedPatients.map((patient, index) => (
                    <div key={patient.id} className={`patient-card severity-${patient.severityLevel}`}>
                        <p>Name: {patient.name || patient.patientName}</p>
                        <p>Severity: {patient.severityLevel}</p>
                        <p>Wait Time: {patient.estimatedWaitTime} minutes</p>
                        <p>Queue Position: {index + 1}</p>
                        {patient.labTests && patient.labTests.length > 0 && (
                            <div className="patient-lab-tests">
                                <p>Lab Tests:</p>
                                <ul>
                                    {patient.labTests.map((test, testIndex) => (
                                        <li key={testIndex}>
                                            {test.name} - {test.status}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default NurseDashboard;
