import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Page.css'; // Import the CSS file for page styling

const PatientInfo = () => {
    const location = useLocation();
    const { name } = location.state || { name: 'Unknown' };
    const [waitTime, setWaitTime] = useState(null);
    const [patientsAhead, setPatientsAhead] = useState(null);
    const [labTests, setLabTests] = useState([]);
    const [symptoms, setSymptoms] = useState('');
    const [submittedSymptoms, setSubmittedSymptoms] = useState('');

    useEffect(() => {
        // Fetch wait time, patients ahead, and lab tests from the backend
        // For now, we'll simulate fetching this information
        const fetchPatientInfo = async () => {
            // Simulate a backend call
            const response = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        waitTime: 30,
                        patientsAhead: 5,
                        labTests: [
                            { id: 1, name: 'Blood Test', status: 'Completed' },
                            { id: 2, name: 'X-Ray', status: 'Pending' }
                        ]
                    });
                }, 1000);
            });

            setWaitTime(response.waitTime);
            setPatientsAhead(response.patientsAhead);
            setLabTests(response.labTests);
        };

        fetchPatientInfo();
    }, []);

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
            <p>Welcome, {name}. Here is your information.</p>
            {waitTime !== null && patientsAhead !== null ? (
                <div>
                    <p>Possible Wait Time: {waitTime} minutes</p>
                    <p>Patients Ahead: {patientsAhead}</p>
                </div>
            ) : (
                <p>Loading your information...</p>
            )}
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
