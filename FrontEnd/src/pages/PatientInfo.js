import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Page.css'; // Import the CSS file for page styling
import './PatientInfo.css';

const PatientInfo = () => {
    const location = useLocation();
    const { name } = location.state || { name: 'Unknown' };
    const [queueInfo, setQueueInfo] = useState({
        position: null,
        waitTime: null,
        severityLevel: null,
        patientsAhead: null
    });
    const [labTests, setLabTests] = useState([]);
    const [symptoms, setSymptoms] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [patientRecord, setPatientRecord] = useState({
        tests: [],
        notes: [],
        room: null
    });
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [totalPatients, setTotalPatients] = useState(0);

    useEffect(() => {
        // Set up WebSocket connection to receive real-time updates
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Update queue info with null checks
            const initial = data.initial || [];
            const testResults = data.testResults || [];
            const additionalTests = data.additionalTests || [];
            
            // Combine all patients and sort by severity (5 is highest priority, 1 is lowest)
            const allPatients = [...initial, ...testResults, ...additionalTests]
                .sort((a, b) => {
                    // First sort by severity (descending)
                    const severityDiff = (b.severityLevel || 0) - (a.severityLevel || 0);
                    if (severityDiff !== 0) return severityDiff;
                    
                    // If severity is equal, sort by arrival time (ascending)
                    return (a.arrivalTime || 0) - (b.arrivalTime || 0);
                });

            // Reassign positions based on sorted order
            allPatients.forEach((patient, index) => {
                patient.position = index + 1;
            });
            
            // Find current patient in sorted queue
            const patientInQueue = allPatients.find(p => p.name === name || p.patientName === name);
            
            if (patientInQueue) {
                setQueueInfo({
                    position: patientInQueue.position,
                    waitTime: calculateWaitTime(patientInQueue.position, patientInQueue.severityLevel),
                    severityLevel: patientInQueue.severityLevel,
                    patientsAhead: patientInQueue.position - 1
                });
                
                // Update lab tests if they exist
                if (patientInQueue.labTests) {
                    setLabTests(patientInQueue.labTests);
                }
            }
        };

        // Helper function to calculate estimated wait time based on position and severity
        const calculateWaitTime = (position, severity) => {
            // Base wait time per patient
            const baseWaitTime = 15; // 15 minutes per patient
            
            // Adjust wait time based on severity
            const severityMultiplier = {
                5: 0.5,  // Emergency cases get priority (50% less wait)
                4: 0.7,  // Urgent cases (30% less wait)
                3: 1.0,  // Standard wait time
                2: 1.2,  // Non-urgent (20% longer wait)
                1: 1.5   // Minor issues (50% longer wait)
            };
            
            return Math.round(position * baseWaitTime * (severityMultiplier[severity] || 1));
        };

        // Initial fetch of queue information
        const fetchQueueInfo = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/queue/${name}`);
                const data = await response.json();
                setQueueInfo(data);
            } catch (error) {
                console.error('Error fetching queue info:', error);
            }
        };

        fetchQueueInfo();

        return () => {
            socket.close();
        };
    }, [name]);

    useEffect(() => {
        // Set up WebSocket connection for real-time updates
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'LAB_TEST_ADDED' && data.data.patientName === name) {
                // Add new lab test to the list
                setLabTests(prevTests => [...prevTests, data.data]);
            }
        };

        // Initial fetch of lab tests
        const fetchLabTests = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/lab-tests/${name}`);
                if (response.ok) {
                    const data = await response.json();
                    setLabTests(data);
                }
            } catch (error) {
                console.error('Error fetching lab tests:', error);
            }
        };

        fetchLabTests();

        return () => {
            socket.close();
        };
    }, [name]);

    useEffect(() => {
        // Fetch patient record
        const fetchPatientRecord = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/patient/${name}/record`);
                const data = await response.json();
                setPatientRecord(data);
            } catch (error) {
                console.error('Error fetching patient record:', error);
            }
        };

        fetchPatientRecord();
    }, [name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        try {
            const response = await fetch('http://localhost:3001/api/patient/symptoms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientName: name,  // Add patient name to identify who submitted
                    symptoms: symptoms,
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                // Notify nurses via WebSocket about new symptoms
                const ws = new WebSocket('ws://localhost:3001');
                ws.onopen = () => {
                    ws.send(JSON.stringify({
                        type: 'NEW_SYMPTOMS',
                        data: {
                            patientName: name,
                            symptoms: symptoms,
                            timestamp: new Date().toISOString()
                        }
                    }));
                    ws.close();
                };

                setSubmitted(true);
                setSymptoms('');
                setTimeout(() => setSubmitted(false), 3000);
            }
        } catch (error) {
            console.error('Error submitting symptoms:', error);
        }
    };

    const handleEmergency = async () => {
        try {
            await fetch(`http://localhost:3001/api/patient/${name}/emergency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            setShowEmergencyModal(true);
        } catch (error) {
            console.error('Error sending emergency signal:', error);
        }
    };

    return (
        <div className="page-content">
            <h1>Patient Information</h1>
            <p>Welcome, {name}</p>
            
            <div className="queue-status-container">
                <h2>Your Queue Status</h2>
                {queueInfo.position && (
                    <p>Your Position in Queue: {queueInfo.position}</p>
                )}
                {queueInfo.waitTime && (
                    <p>Estimated Wait Time: {queueInfo.waitTime} minutes</p>
                )}
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar" 
                        style={{
                            width: `${Math.max(0, 100 - (queueInfo.position * 25))}%`,
                            backgroundColor: '#4285f4',
                            transition: 'width 1s ease-in-out'
                        }}
                    />
                </div>
            </div>

            <button className="emergency-button" onClick={handleEmergency}>
                <span className="emergency-text">!</span>
            </button>

            {showEmergencyModal && (
                <div className="emergency-modal">
                    <p>Emergency signal sent. A nurse will be with you shortly.</p>
                    <button onClick={() => setShowEmergencyModal(false)}>Close</button>
                </div>
            )}

            {patientRecord.room && (
                <div className="room-info">
                    <h2>Room Assignment</h2>
                    <p>You have been assigned to Room {patientRecord.room}</p>
                </div>
            )}

            <div className="test-results">
                <h2>Test Results</h2>
                {patientRecord.tests.length > 0 ? (
                    <div className="results-list">
                        {patientRecord.tests.map((test, index) => (
                            <div key={index} className="test-result-card">
                                <p>Type: {test.type}</p>
                                <p>Status: {test.status}</p>
                                {test.result && <p>Result: {test.result}</p>}
                                <p>Date: {new Date(test.timestamp).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No test results available yet.</p>
                )}
            </div>

            <div className="lab-tests-section">
                <h2>Lab Tests</h2>
                {labTests.length > 0 ? (
                    <ul className="lab-tests-list">
                        {labTests.map((test, index) => (
                            <li key={index} className={`lab-test-item ${test.status}`}>
                                <div className="test-name">{test.testName}</div>
                                <div className="test-status">{test.status}</div>
                                <div className="test-date">
                                    {new Date(test.timestamp).toLocaleDateString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No lab tests ordered</p>
                )}
            </div>

            <h2>Submit Your Symptoms</h2>
            <form onSubmit={handleSubmit} className="symptoms-form">
                <div className="form-group">
                    <label>Symptoms:</label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Please describe your symptoms in detail..."
                        required
                        className="symptoms-input"
                    />
                </div>
                <button type="submit" className="submit-button">
                    Submit Symptoms
                </button>
            </form>
            {submitted && (
                <div className="success-message">
                    Symptoms submitted successfully! A nurse will review them shortly.
                </div>
            )}
        </div>
    );
};

export default PatientInfo;
