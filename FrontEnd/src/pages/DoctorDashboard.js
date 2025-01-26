import React, { useState, useEffect } from 'react';
import './Page.css';

const DoctorDashboard = () => {
    const [doctorQueue, setDoctorQueue] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        // Set up WebSocket connection for real-time updates
        const socket = new WebSocket('ws://localhost:3001');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'DOCTOR_QUEUE_UPDATE') {
                setDoctorQueue(data.queue);
            }
        };

        // Initial fetch of doctor's queue
        fetchDoctorQueue();

        return () => socket.close();
    }, []);

    const fetchDoctorQueue = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/doctor/queue');
            const data = await response.json();
            setDoctorQueue(data.queue || []);
        } catch (error) {
            console.error('Error fetching doctor queue:', error);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
    };

    const handleOrderTests = async () => {
        if (!selectedPatient) return;
        try {
            await fetch(`http://localhost:3001/api/doctor/order-tests/${selectedPatient.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            setSelectedPatient(null);
            fetchDoctorQueue();
        } catch (error) {
            console.error('Error ordering tests:', error);
        }
    };

    const handleHospitalize = async () => {
        if (!selectedPatient) return;
        const roomNumber = prompt('Enter room number for hospitalization:');
        if (!roomNumber) return;

        try {
            await fetch(`http://localhost:3001/api/doctor/hospitalize/${selectedPatient.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomNumber }),
            });
            setSelectedPatient(null);
            fetchDoctorQueue();
        } catch (error) {
            console.error('Error hospitalizing patient:', error);
        }
    };

    const handlePrescribeTreatment = async () => {
        if (!selectedPatient) return;
        const treatment = prompt('Enter treatment details:');
        if (!treatment) return;

        try {
            await fetch(`http://localhost:3001/api/doctor/prescribe/${selectedPatient.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ treatment }),
            });
            setSelectedPatient(null);
            fetchDoctorQueue();
        } catch (error) {
            console.error('Error prescribing treatment:', error);
        }
    };

    return (
        <div className="page-content">
            <h1>Doctor Dashboard</h1>

            <div className="doctor-dashboard-container">
                {/* Patient Queue Section */}
                <div className="queue-section">
                    <h2>Patients Waiting</h2>
                    <div className="patient-list">
                        {doctorQueue.map((patient) => (
                            <div 
                                key={patient.id}
                                className={`patient-card ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                onClick={() => handlePatientSelect(patient)}
                            >
                                <h3>{patient.name}</h3>
                                <p className="severity">Severity Level: {patient.severityLevel}</p>
                                <div className="test-results">
                                    <h4>Lab Test Results:</h4>
                                    <ul>
                                        {patient.labTests?.map((test, index) => (
                                            <li key={index}>
                                                <span className="test-name">{test.name}</span>
                                                <span className="test-result">{test.result || 'Pending'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        {doctorQueue.length === 0 && (
                            <p className="no-patients">No patients waiting</p>
                        )}
                    </div>
                </div>

                {/* Patient Actions Section */}
                {selectedPatient && (
                    <div className="patient-actions">
                        <h3>Actions for {selectedPatient.name}</h3>
                        <div className="action-buttons">
                            <button 
                                className="action-btn additional-tests"
                                onClick={handleOrderTests}
                            >
                                Order Additional Tests
                            </button>
                            <button 
                                className="action-btn hospitalize"
                                onClick={handleHospitalize}
                            >
                                Hospitalize
                            </button>
                            <button 
                                className="action-btn treatment"
                                onClick={handlePrescribeTreatment}
                            >
                                Prescribe Treatment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard; 