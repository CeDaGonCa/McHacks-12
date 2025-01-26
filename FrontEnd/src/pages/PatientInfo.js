import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Page.css'; // Import the CSS file for page styling

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

    useEffect(() => {
        // Set up WebSocket connection to receive real-time updates
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setQueueInfo(data);
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

    const handleSymptomSubmit = (e) => {
        e.preventDefault();
        // Simulate sending symptoms to the backend
        console.log('Symptoms submitted:', symptoms);
        setSubmittedSymptoms(symptoms);
        setSymptoms('');
    };

    return (
        <div className="page-content">
            <h1>Patient Information</h1>
            <p>Welcome, {name}</p>
            
            <div className="queue-info">
                <h2>Your Queue Status</h2>
                {queueInfo.severityLevel && (
                    <p>Severity Level: {queueInfo.severityLevel}</p>
                )}
                {queueInfo.position && (
                    <p>Your Position in Queue: {queueInfo.position}</p>
                )}
                {queueInfo.patientsAhead && (
                    <p>Patients Ahead of You: {queueInfo.patientsAhead}</p>
                )}
                {queueInfo.waitTime && (
                    <p>Estimated Wait Time: {queueInfo.waitTime} minutes</p>
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
