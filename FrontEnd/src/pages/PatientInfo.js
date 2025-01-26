import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Page.css'; // Import the CSS file for page styling
import { ReactComponent as EmergencyIcon } from '../assets/emergency-icon.svg';

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
    const [submittedSymptoms, setSubmittedSymptoms] = useState('');
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
            setQueueInfo(data);
            setTotalPatients(data.totalPatients || 10); // fallback to 10 if not provided
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
        // Fetch lab tests from the backend
        const fetchLabTests = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/lab-tests/${name}`);
                const data = await response.json();
                setLabTests(data);
            } catch (error) {
                console.error('Error fetching lab tests:', error);
            }
        };

        fetchLabTests();
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

    const handleSymptomSubmit = (e) => {
        e.preventDefault();
        // Simulate sending symptoms to the backend
        console.log('Symptoms submitted:', symptoms);
        setSubmittedSymptoms(symptoms);
        setSymptoms('');
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
            
            <div className="queue-info">
                <h2>Your Queue Status</h2>
                {queueInfo.position && (
                    <p>Your Position in Queue: {queueInfo.position}</p>
                )}
                {queueInfo.waitTime && (
                    <p>Estimated Wait Time: {queueInfo.waitTime} minutes</p>
                )}
                <div className="queue-progress">
                    <div 
                        className="queue-progress-bar" 
                        style={{ width: `${(1 - queueInfo.position/totalPatients) * 100}%` }}
                    />
                </div>
            </div>

            <button className="emergency-button" onClick={handleEmergency}>
                <EmergencyIcon className="emergency-icon" />
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

            <h2>Lab Tests</h2>
            {labTests.length > 0 ? (
                <ul>
                    {labTests.map(test => (
                        <li key={test.id}>
                            {test.name}: {test.status}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No lab tests available.</p>
            )}
            <h2>Submit Your Symptoms</h2>
            <form onSubmit={handleSymptomSubmit}>
                <div>
                    <label>Symptoms:</label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                </div>
                <button type="submit">Submit Symptoms</button>
            </form>
            {submittedSymptoms && (
                <div>
                    <h3>Your Submitted Symptoms:</h3>
                    <p>{submittedSymptoms}</p>
                </div>
            )}
        </div>
    );
};

export default PatientInfo;
