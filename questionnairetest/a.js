const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let patientsData = {}; // Store patient health data (patientId -> data)

app.use(cors()); // Allow all origins
app.use(express.json());

// Serve the static files (HTML, CSS, JS) for the doctor and patient
app.use(express.static('public'));

// Route to send current patient data to the doctor
app.get('/patients', (req, res) => {
    res.json(patientsData);
});

// Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.patients = [];
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
}

const queue = new PriorityQueue();

// Broadcast queue updates to all connected clients
const broadcastQueue = () => {
    queue.updateWaitTimes();
    const queueData = JSON.stringify({ patients: queue.patients });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(queueData);
        }
    });
};

// API Endpoints
app.post('/api/queue', (req, res) => {
    const { patientName, severityLevel, estimatedVisitDuration } = req.body;
    const patient = {
        id: Date.now().toString(),
        name: patientName,
        severityLevel,
        estimatedVisitDuration,
        arrivalTime: Date.now(),
    };
    queue.enqueue(patient);
    broadcastQueue();
    res.status(201).json(patient);
});

app.get('/api/queue', (req, res) => {
    queue.updateWaitTimes();
    res.json({ patients: queue.patients });
});

app.get('/api/queue/:name', (req, res) => {
    const patient = queue.patients.find(p => p.name === req.params.name);
    if (patient) {
        res.json(patient);
    } else {
        res.status(404).json({ error: 'Patient not found' });
    }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ patients: queue.patients }));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
