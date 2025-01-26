const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let patientsData = {}; // Store patient health data (patientId -> data)
const patientLabTests = new Map(); // Store lab tests for each patient

// Update CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve the static files (HTML, CSS, JS) for the doctor and patient
app.use(express.static('public'));

// Route to send current patient data to the doctor
app.get('/patients', (req, res) => {
    res.json(patientsData);
});

// Queue Types
const QueueType = {
    INITIAL: 'initial',
    TEST_RESULTS: 'test_results',
    ADDITIONAL_TESTS: 'additional_tests'
};

class PriorityQueue {
    constructor(queueType) {
        this.patients = [];
        this.queueType = queueType;
    }

    enqueue(patient) {
        this.patients.push(patient);
        this.sort();
    }

    dequeue() {
        return this.patients.shift();
    }

    sort() {
        this.patients.sort((a, b) => {
            // Primary sort by severity (1 is highest priority)
            if (a.severityLevel !== b.severityLevel) {
                return a.severityLevel - b.severityLevel;
            }
            // Secondary sort by wait time
            return a.arrivalTime - b.arrivalTime;
        });
    }

    updateWaitTimes() {
        let accumulatedTime = 0;
        this.patients.forEach((patient, index) => {
            patient.position = index + 1;
            patient.estimatedWaitTime = accumulatedTime;
            accumulatedTime += patient.estimatedVisitDuration;
        });
    }

    getProcessingTime(patient) {
        switch (this.queueType) {
            case QueueType.TEST_RESULTS:
                return patient.pendingTests.reduce((acc, test) => acc + test.estimatedDuration, 0);
            case QueueType.ADDITIONAL_TESTS:
                return patient.additionalTests.reduce((acc, test) => acc + test.estimatedDuration, 0);
            default:
                return patient.estimatedVisitDuration;
        }
    }
}

// Create separate queues for each stage
const initialQueue = new PriorityQueue(QueueType.INITIAL);
const testResultsQueue = new PriorityQueue(QueueType.TEST_RESULTS);
const additionalTestsQueue = new PriorityQueue(QueueType.ADDITIONAL_TESTS);

// Store test results and room assignments
const patientRecords = new Map();

// New API endpoints for test results and room assignments
app.post('/api/patient/:id/tests', (req, res) => {
    const { id } = req.params;
    const { tests, doctorNotes } = req.body;
    
    if (!patientRecords.has(id)) {
        patientRecords.set(id, { tests: [], notes: [], room: null });
    }
    
    const record = patientRecords.get(id);
    record.tests.push(...tests);
    if (doctorNotes) record.notes.push(doctorNotes);
    
    // Update lab tests status
    if (patientLabTests.has(id)) {
        const labTests = patientLabTests.get(id);
        tests.forEach(newTest => {
            const existingTest = labTests.find(t => t.name === newTest.type);
            if (existingTest) {
                existingTest.status = newTest.status;
                existingTest.result = newTest.result;
            }
        });
    }
    
    // Move patient to appropriate queue
    const patient = initialQueue.patients.find(p => p.id === id);
    if (patient) {
        initialQueue.patients = initialQueue.patients.filter(p => p.id !== id);
        patient.pendingTests = tests.filter(t => t.status === 'pending');
        
        if (patient.pendingTests.length > 0) {
            testResultsQueue.enqueue(patient);
        }
    }
    
    broadcastQueues();
    res.json({ success: true });
});

app.post('/api/patient/:id/room', (req, res) => {
    const { id } = req.params;
    const { roomNumber } = req.body;
    
    if (!patientRecords.has(id)) {
        patientRecords.set(id, { tests: [], notes: [], room: null });
    }
    
    const record = patientRecords.get(id);
    record.room = roomNumber;
    
    broadcastQueues();
    res.json({ success: true });
});

// Modify existing endpoints to handle multiple queues
app.get('/api/queue', (req, res) => {
    const { type = 'initial' } = req.query;
    let queue;
    
    switch (type) {
        case QueueType.TEST_RESULTS:
            queue = testResultsQueue;
            break;
        case QueueType.ADDITIONAL_TESTS:
            queue = additionalTestsQueue;
            break;
        default:
            queue = initialQueue;
    }
    
    queue.updateWaitTimes();
    const patientsWithLabTests = queue.patients.map(patient => ({
        ...patient,
        labTests: patientLabTests.get(patient.id) || []
    }));
    
    res.json({ patients: patientsWithLabTests });
});

// In your API endpoint for adding patients
app.post('/api/queue', (req, res) => {
    const { patientName, severityLevel, estimatedVisitDuration, labTests, ...patientInfo } = req.body;
    
    const patient = {
        id: Date.now().toString(),
        name: patientName,
        patientName,
        severityLevel,
        estimatedVisitDuration,
        arrivalTime: Date.now(),
        ...patientInfo
    };

    // Store lab tests separately
    if (labTests && labTests.length > 0) {
        patientLabTests.set(patient.id, labTests);
    }

    initialQueue.enqueue(patient);
    broadcastQueues();
    res.status(201).json(patient);
});

// Update the broadcast function to include lab tests
const broadcastQueues = () => {
    initialQueue.updateWaitTimes();
    const queueData = {
        initial: initialQueue.patients.map(patient => ({
            ...patient,
            name: patient.name || patient.patientName,
            labTests: patientLabTests.get(patient.id) || []
        })),
        testResults: testResultsQueue.patients.map(patient => ({
            ...patient,
            labTests: patientLabTests.get(patient.id) || []
        })),
        additionalTests: additionalTestsQueue.patients.map(patient => ({
            ...patient,
            labTests: patientLabTests.get(patient.id) || []
        }))
    };
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(queueData));
        }
    });
};

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ patients: initialQueue.patients }));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Simplify the login endpoint for testing
app.post('/api/medical/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded check for username/password
    if (username === 'username' && password === 'password') {
        res.json({
            success: true,
            token: 'test-token',
            role: 'nurse'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid username or password'
        });
    }
});

// Add endpoint to fetch lab tests for a specific patient
app.get('/api/lab-tests/:patientName', (req, res) => {
    const { patientName } = req.params;
    
    // Find patient in any queue
    const patient = [...initialQueue.patients, ...testResultsQueue.patients]
        .find(p => p.name === patientName || p.patientName === patientName);

    if (patient && patientLabTests.has(patient.id)) {
        res.json(patientLabTests.get(patient.id));
    } else {
        res.json([]);
    }
});

server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
