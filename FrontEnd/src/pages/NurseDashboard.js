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
    const [patientSymptoms, setPatientSymptoms] = useState(new Map()); // Store symptoms by patient name
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRegistry, setPatientRegistry] = useState(new Map()); // Store patient info by name

    useEffect(() => {
        fetchQueuedPatients(); // Initial fetch
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_SYMPTOMS') {
                // Add notification sound/visual indicator for new symptoms
                const audio = new Audio('/notification.mp3'); // Add a notification sound file
                audio.play().catch(e => console.log('Audio play failed:', e));
                
                // Update symptoms with timestamp
                setPatientSymptoms(prev => {
                    const newMap = new Map(prev);
                    const patientName = data.data.patientName;
                    const currentSymptoms = newMap.get(patientName) || [];
                    newMap.set(patientName, [
                        {
                            id: data.data.id,
                            symptoms: data.data.symptoms,
                            timestamp: data.data.timestamp,
                            isNew: true // Add flag for new symptoms
                        },
                        ...currentSymptoms
                    ]);
                    return newMap;
                });

                // Clear 'isNew' flag after 5 seconds
                setTimeout(() => {
                    setPatientSymptoms(prev => {
                        const newMap = new Map(prev);
                        const symptoms = newMap.get(data.data.patientName) || [];
                        newMap.set(data.data.patientName, symptoms.map(s => ({...s, isNew: false})));
                        return newMap;
                    });
                }, 5000);
            }
            if (data.type === 'QUEUE_UPDATE') {
                fetchQueuedPatients(); // Fetch fresh queue data instead of local update
            }
        };

        // Timer for wait time countdown
        const timer = setInterval(() => {
            setQueuedPatients(prev => {
                if (!prev || prev.length === 0) return prev; // Don't update if queue is empty

                return prev.map(patient => {
                    if (!patient.waitTime) {
                        // Initialize wait time if not set
                        return {
                            ...patient,
                            waitTime: patient.estimatedVisitDuration
                        };
                    }

                    const newWaitTime = Math.max(0, patient.waitTime - (1/60));
                    
                    if (newWaitTime === 0) {
                        movePatientToDoctor(patient);
                        return null;
                    }
                    
                    return {
                        ...patient,
                        waitTime: newWaitTime
                    };
                })
                .filter(Boolean) // Remove null entries
                .sort((a, b) => {
                    if (a.severityLevel !== b.severityLevel) {
                        return a.severityLevel - b.severityLevel;
                    }
                    return new Date(a.arrivalTime) - new Date(b.arrivalTime);
                });
            });
        }, 1000);

        return () => {
            socket.close();
            clearInterval(timer);
        };
    }, []); // Empty dependency array, but with cleanup

    useEffect(() => {
        const queueRefreshInterval = setInterval(() => {
            fetchQueuedPatients();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(queueRefreshInterval);
    }, []);

    const fetchQueuedPatients = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/queue');
            const data = await response.json();
            
            // Sort patients by severity and arrival time
            const sortedPatients = data.patients.sort((a, b) => {
                if (a.severityLevel !== b.severityLevel) {
                    return a.severityLevel - b.severityLevel;
                }
                return new Date(a.arrivalTime) - new Date(b.arrivalTime);
            });
            
            setQueuedPatients(sortedPatients);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const fetchPatientSymptoms = async (patientName) => {
        try {
            const response = await fetch(`http://localhost:3001/api/nurse/patient-symptoms/${patientName}`);
            const data = await response.json();
            setPatientSymptoms(prev => {
                const newMap = new Map(prev);
                newMap.set(patientName, data.symptoms || []);
                return newMap;
            });
        } catch (error) {
            console.error('Error fetching patient symptoms:', error);
        }
    };

    const fetchAllPatientSymptoms = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/nurse/all-patient-symptoms');
            const data = await response.json();
            const symptomsMap = new Map();
            data.symptoms.forEach(symptom => {
                const currentSymptoms = symptomsMap.get(symptom.patientName) || [];
                symptomsMap.set(symptom.patientName, [...currentSymptoms, symptom]);
            });
            setPatientSymptoms(symptomsMap);
        } catch (error) {
            console.error('Error fetching patient symptoms:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const existingPatient = queuedPatients.find(p => p.name === patientInfo.name);
        
        if (existingPatient) {
            // If patient exists, update their information
            try {
                const response = await fetch(`http://localhost:3001/api/queue/update/${existingPatient.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...patientInfo,
                        severityLevel,
                        estimatedVisitDuration,
                    }),
                });
                
                if (response.ok) {
                    // Refresh and resort queue
                    fetchQueuedPatients();
                }
            } catch (error) {
                console.error('Error updating patient:', error);
            }
        } else {
            try {
                const newPatient = {
                    ...patientInfo,
                    severityLevel,
                    estimatedVisitDuration,
                    waitTime: estimatedVisitDuration, // Set initial wait time
                    arrivalTime: new Date().toISOString(),
                };

                const response = await fetch('http://localhost:3001/api/queue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newPatient),
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
                    
                    // Update queue
                    setQueuedPatients(prev => {
                        const updatedQueue = [...prev, newPatient];
                        return updatedQueue.sort((a, b) => {
                            if (a.severityLevel !== b.severityLevel) {
                                return a.severityLevel - b.severityLevel;
                            }
                            return new Date(a.arrivalTime) - new Date(b.arrivalTime);
                        });
                    });
                }
            } catch (error) {
                console.error('Error adding patient:', error);
            }
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

    const handleReviewSymptom = async (symptomId, patientName) => {
        try {
            await fetch(`http://localhost:3001/api/nurse/review-symptom/${symptomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            // Remove the reviewed symptom from the list
            setPatientSymptoms(prev => {
                const newMap = new Map(prev);
                const currentSymptoms = newMap.get(patientName) || [];
                newMap.set(patientName, currentSymptoms.filter(symptom => symptom.id !== symptomId));
                return newMap;
            });
        } catch (error) {
            console.error('Error reviewing symptom:', error);
        }
    };

    const updatePatientInfo = (patientName, updates) => {
        setPatientRegistry(prev => {
            const newRegistry = new Map(prev);
            const currentInfo = newRegistry.get(patientName) || {};
            newRegistry.set(patientName, { ...currentInfo, ...updates });
            
            // If severity is updated, update the queue
            if (updates.severityLevel) {
                updateQueuePriority(patientName, updates.severityLevel);
            }
            
            return newRegistry;
        });
    };

    const updateQueuePriority = async (patientName, newSeverity) => {
        try {
            await fetch('http://localhost:3001/api/queue/update-priority', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName,
                    severityLevel: newSeverity
                })
            });
            
            // Update local queue order
            const updatedQueue = queuedPatients.map(patient => {
                if (patient.name === patientName) {
                    return { ...patient, severityLevel: newSeverity };
                }
                return patient;
            }).sort((a, b) => {
                if (a.severityLevel !== b.severityLevel) {
                    return a.severityLevel - b.severityLevel;
                }
                return new Date(a.arrivalTime) - new Date(b.arrivalTime);
            });
            
            setQueuedPatients(updatedQueue);
        } catch (error) {
            console.error('Error updating patient priority:', error);
        }
    };

    const handlePatientNameChange = (e) => {
        const name = e.target.value;
        
        // Check if patient already exists in queue
        const existingPatient = queuedPatients.find(p => p.name === name);
        
        if (existingPatient) {
            // If patient exists, load their information
            setPatientInfo({
                name: existingPatient.name,
                age: existingPatient.age || '',
                contactNumber: existingPatient.contactNumber || '',
                email: existingPatient.email || '',
                emergencyContact: existingPatient.emergencyContact || '',
                labTests: existingPatient.labTests || [],
            });
            setSeverityLevel(existingPatient.severityLevel);
            setEstimatedVisitDuration(existingPatient.estimatedVisitDuration);
        } else {
            // If new patient, just update the name
            setPatientInfo(prev => ({...prev, name}));
        }
    };

    const handleSeverityChange = (e) => {
        const newSeverity = Number(e.target.value);
        setSeverityLevel(newSeverity);
        
        // Update patient registry and queue if patient exists
        if (patientInfo.name) {
            updatePatientInfo(patientInfo.name, { severityLevel: newSeverity });
        }
    };

    const movePatientToDoctor = async (patient) => {
        try {
            // First add to doctor's queue
            const addResponse = await fetch('http://localhost:3001/api/doctor/queue/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId: patient.id,
                    patientInfo: {
                        name: patient.name,
                        severityLevel: patient.severityLevel,
                        labTests: patient.labTests || []
                    }
                }),
            });

            if (addResponse.ok) {
                // Then remove from nurse's queue
                const removeResponse = await fetch(`http://localhost:3001/api/queue/remove`, {
                    method: 'POST', // Changed from DELETE to POST
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        patientId: patient.id,
                        patientName: patient.name 
                    })
                });

                if (removeResponse.ok) {
                    // Update local state only after both operations succeed
                    setQueuedPatients(prev => 
                        prev.filter(p => p.id !== patient.id)
                    );
                }
            }
        } catch (error) {
            console.error('Error moving patient to doctor queue:', error);
        }
    };

    // Format time display (MM:SS)
    const formatTime = (timeInMinutes) => {
        const minutes = Math.floor(timeInMinutes);
        const seconds = Math.floor((timeInMinutes - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
                            onChange={handlePatientNameChange}
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
                        onChange={handleSeverityChange}
                    >
                        <option value={1}>1 - Most Severe (Emergency)</option>
                        <option value={2}>2 - Very Severe</option>
                        <option value={3}>3 - Severe</option>
                        <option value={4}>4 - Moderate</option>
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

            {/* Current Queue Display - Move this up for better visibility */}
            <div className="queue-section">
                <h2>Current Queue</h2>
                <div className="queue-list">
                    {queuedPatients.length > 0 ? (
                        queuedPatients.map((patient, index) => (
                            <div 
                                key={patient.id || index} 
                                className={`patient-card severity-${patient.severityLevel}`}
                            >
                                <h3>{patient.name}</h3>
                                <div className="patient-info">
                                    <p>Severity: {patient.severityLevel}</p>
                                    <p>Queue Position: {index + 1}</p>
                                    <p className="wait-time">
                                        Wait Time: {formatTime(patient.waitTime || patient.estimatedVisitDuration)}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const newSeverity = prompt(
                                            `Current severity: ${patient.severityLevel}. Enter new severity (1-5):`
                                        );
                                        if (newSeverity && !isNaN(newSeverity)) {
                                            updatePatientInfo(patient.name, {
                                                severityLevel: Number(newSeverity)
                                            });
                                        }
                                    }}
                                    className="update-severity-btn"
                                >
                                    Update Severity
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-patients">No patients in queue</p>
                    )}
                </div>
            </div>

            {/* Recent Symptoms Updates Section */}
            <div className="recent-symptoms-section">
                <h2>Recent Patient Symptoms</h2>
                {Array.from(patientSymptoms.entries()).map(([patientName, symptoms]) => (
                    <div key={patientName} className="patient-symptoms-card">
                        <div className="patient-symptoms-header">
                            <h3>{patientName}</h3>
                            <span className="symptom-count">
                                {symptoms.length} update{symptoms.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="symptoms-list">
                            {symptoms.map((symptom) => (
                                <div 
                                    key={symptom.id} 
                                    className={`symptom-entry ${symptom.isNew ? 'new-symptom' : ''}`}
                                >
                                    <div className="symptom-header">
                                        <span className="symptom-timestamp">
                                            Updated: {new Date(symptom.timestamp).toLocaleString()}
                                        </span>
                                        {symptom.isNew && (
                                            <span className="new-badge">New!</span>
                                        )}
                                    </div>
                                    <p className="symptom-text">{symptom.symptoms}</p>
                                    <button 
                                        className="review-button"
                                        onClick={() => handleReviewSymptom(symptom.id, patientName)}
                                    >
                                        Mark as Reviewed
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {Array.from(patientSymptoms.entries()).length === 0 && (
                    <p className="no-symptoms">No recent symptom updates</p>
                )}
            </div>

            {/* Show warning if patient already exists */}
            {queuedPatients.find(p => p.name === patientInfo.name) && (
                <div className="patient-exists-warning">
                    Patient already in queue. Updating existing patient information.
                </div>
            )}
        </div>
    );
};

export default NurseDashboard;
