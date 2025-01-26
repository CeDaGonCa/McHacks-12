import React, { useState, useEffect } from 'react';
import './Page.css';

const CurrentQueue = () => {
    const [currentQueue, setCurrentQueue] = useState([]);
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3001');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'QUEUE_UPDATE') {
                // Initialize each patient with their wait time
                const queueWithTimers = data.queue.map(patient => ({
                    ...patient,
                    currentWaitTime: patient.waitTime
                }));
                setCurrentQueue(queueWithTimers);
            }
        };

        // Update countdown every second
        const timer = setInterval(() => {
            setCurrentQueue(prevQueue => {
                return prevQueue.map(patient => {
                    const newWaitTime = Math.max(0, patient.currentWaitTime - (1/60));
                    
                    // If wait time reaches 0, move patient to doctor's queue
                    if (newWaitTime === 0) {
                        print("not working")
                        console.log("REACHED IF")
                        movePatientToDoctor(patient);
                        return null;
                    }
                    
                    return {
                        ...patient,
                        currentWaitTime: newWaitTime
                    };
                }).filter(Boolean); // Remove null entries (patients with 0 wait time)
            });
        }, 1000);

        fetchQueue();

        return () => {
            socket.close();
            clearInterval(timer);
        };
    }, []);

    const fetchQueue = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/queue');
            const data = await response.json();
            // Initialize currentWaitTime for each patient
            const queueWithTimers = data.queue.map(patient => ({
                ...patient,
                currentWaitTime: patient.waitTime
            }));
            setCurrentQueue(queueWithTimers);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const movePatientToDoctor = async (patient) => {
        try {
            // Move to awaiting results queue
            await fetch('http://localhost:3001/api/doctor/move-to-awaiting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId: patient.id,
                    patientInfo: {
                        name: patient.name,
                        severityLevel: patient.severityLevel,
                        labTests: []
                    }
                }),
            });

            // Remove from current queue in backend
            await fetch(`http://localhost:3001/api/queue/remove/${patient.id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error moving patient to doctor queue:', error);
        }
    };

    // Function to format time display
    const formatTime = (timeInMinutes) => {
        const minutes = Math.floor(timeInMinutes);
        const seconds = Math.floor((timeInMinutes - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="page-content">
            <h1>Current Queue</h1>
            <div className="queue-list">
                {currentQueue.map((patient, index) => (
                    <div 
                        key={patient.id} 
                        className={`patient-card severity-${patient.severityLevel}`}
                    >
                        <h3>Name: {patient.name}</h3>
                        <p>Severity: {patient.severityLevel}</p>
                        <p className="wait-time">Wait Time: {formatTime(patient.currentWaitTime)}</p>
                        <p>Queue Position: {index + 1}</p>
                    </div>
                ))}
                {currentQueue.length === 0 && (
                    <p className="no-patients">No patients in queue</p>
                )}
            </div>
        </div>
    );
};

export default CurrentQueue; 