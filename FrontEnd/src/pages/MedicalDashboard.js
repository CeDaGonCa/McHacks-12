import React, { useState, useEffect } from 'react';
import NurseDashboard from './NurseDashboard';
import './Page.css';

const MedicalDashboard = () => {
    const [activeRole, setActiveRole] = useState('nurse');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [queues, setQueues] = useState({
        initial: [],
        testResults: [],
        additionalTests: []
    });
    const [testResults, setTestResults] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [dischargeNotes, setDischargeNotes] = useState('');

    useEffect(() => {
        if (activeRole !== 'doctor') return;

        // Set up WebSocket connection for real-time updates
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Ensure data has the expected structure
                setQueues({
                    initial: data.initial || [],
                    testResults: data.testResults || [],
                    additionalTests: data.additionalTests || []
                });
            } catch (error) {
                console.error('Error parsing WebSocket data:', error);
            }
        };

        // Initial fetch of queues
        fetchQueues();

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [activeRole]);

    const fetchQueues = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/queue');
            const data = await response.json();
            setQueues({
                initial: data.initial || [],
                testResults: data.testResults || [],
                additionalTests: data.additionalTests || []
            });
        } catch (error) {
            console.error('Error fetching queues:', error);
        }
    };

    const handleTestResultSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;

        try {
            await fetch(`http://localhost:3001/api/patient/${selectedPatient.id}/tests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tests: [{
                        type: 'general',
                        result: testResults,
                        status: 'completed',
                        timestamp: new Date().toISOString()
                    }]
                })
            });
            setTestResults('');
            fetchQueues();
        } catch (error) {
            console.error('Error submitting test results:', error);
        }
    };

    const handleRoomAssignment = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;

        try {
            await fetch(`http://localhost:3001/api/patient/${selectedPatient.id}/room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomNumber })
            });
            setRoomNumber('');
            fetchQueues();
        } catch (error) {
            console.error('Error assigning room:', error);
        }
    };

    const handleDischargePatient = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;

        try {
            await fetch(`http://localhost:3001/api/patient/${selectedPatient.id}/discharge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    dischargeNotes,
                    timestamp: new Date().toISOString()
                })
            });
            setDischargeNotes('');
            setSelectedPatient(null);
            fetchQueues();
        } catch (error) {
            console.error('Error discharging patient:', error);
        }
    };

    const renderDoctorDashboard = () => (
        <>
            <h1>Doctor Dashboard</h1>
            
            <div className="queues-container">
                <div className="queue-section">
                    <h2>Initial Queue</h2>
                    <div className="queue-list">
                        {Array.isArray(queues.initial) && queues.initial.map(patient => (
                            <div 
                                key={patient.id}
                                className={`patient-card ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <p>Name: {patient.name || patient.patientName}</p>
                                <p>Severity: {patient.severityLevel}</p>
                                <p>Wait Time: {patient.estimatedWaitTime} minutes</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="queue-section">
                    <h2>Awaiting Test Results</h2>
                    <div className="queue-list">
                        {Array.isArray(queues.testResults) && queues.testResults.map(patient => (
                            <div 
                                key={patient.id}
                                className={`patient-card ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <p>Name: {patient.name || patient.patientName}</p>
                                <p>Pending Tests: {patient.pendingTests?.length || 0}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedPatient && (
                <div className="patient-actions">
                    <h3>Selected Patient: {selectedPatient.name || selectedPatient.patientName}</h3>
                    
                    <form onSubmit={handleTestResultSubmit}>
                        <div>
                            <label>Test Results:</label>
                            <textarea
                                value={testResults}
                                onChange={(e) => setTestResults(e.target.value)}
                                placeholder="Enter test results..."
                            />
                        </div>
                        <button type="submit">Submit Test Results</button>
                    </form>

                    <form onSubmit={handleRoomAssignment}>
                        <div>
                            <label>Assign Room:</label>
                            <input
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                placeholder="Room number"
                            />
                        </div>
                        <button type="submit">Assign Room</button>
                    </form>

                    <form onSubmit={handleDischargePatient}>
                        <div>
                            <label>Discharge Notes:</label>
                            <textarea
                                value={dischargeNotes}
                                onChange={(e) => setDischargeNotes(e.target.value)}
                                placeholder="Enter discharge notes..."
                            />
                        </div>
                        <button type="submit" className="discharge-btn">
                            Discharge Patient
                        </button>
                    </form>
                </div>
            )}
        </>
    );

    return (
        <div className="page-content">
            <div className="dashboard-toggle">
                <button 
                    className={`toggle-btn ${activeRole === 'nurse' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveRole('nurse');
                        setSelectedPatient(null);
                    }}
                >
                    Nurse Dashboard
                </button>
                <button 
                    className={`toggle-btn ${activeRole === 'doctor' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveRole('doctor');
                        setSelectedPatient(null);
                    }}
                >
                    Doctor Dashboard
                </button>
            </div>

            <div className="dashboard-content">
                {activeRole === 'nurse' ? (
                    <NurseDashboard />
                ) : (
                    renderDoctorDashboard()
                )}
            </div>
        </div>
    );
};

export default MedicalDashboard; 