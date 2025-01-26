import React, { useState, useEffect } from 'react';
import './Page.css';

const DoctorDashboard = () => {
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
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setQueues(data);
        };

        return () => socket.close();
    }, []);

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
        } catch (error) {
            console.error('Error discharging patient:', error);
        }
    };

    return (
        <div className="page-content">
            <h1>Doctor Dashboard</h1>
            
            <div className="queues-container">
                <div className="queue-section">
                    <h2>Initial Queue</h2>
                    <div className="queue-list">
                        {queues.initial.map(patient => (
                            <div 
                                key={patient.id} 
                                className={`patient-card severity-${patient.severityLevel} ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <p>Name: {patient.name}</p>
                                <p>Severity: {patient.severityLevel}</p>
                                <p>Wait Time: {patient.estimatedWaitTime} minutes</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="queue-section">
                    <h2>Awaiting Test Results</h2>
                    <div className="queue-list">
                        {queues.testResults.map(patient => (
                            <div 
                                key={patient.id} 
                                className={`patient-card severity-${patient.severityLevel} ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <p>Name: {patient.name}</p>
                                <p>Pending Tests: {patient.pendingTests.length}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedPatient && (
                <div className="patient-actions">
                    <h3>Selected Patient: {selectedPatient.name}</h3>
                    
                    <form onSubmit={handleTestResultSubmit}>
                        <div>
                            <label>Test Results:</label>
                            <textarea
                                value={testResults}
                                onChange={(e) => setTestResults(e.target.value)}
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
                        <button type="submit" className="discharge-btn">Discharge Patient</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard; 