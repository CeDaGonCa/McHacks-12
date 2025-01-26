const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let patientsData = {}; // Store patient health data (patientId -> data)

app.use(cors()); // Allow all origins

// Serve the static files (HTML, CSS, JS) for the doctor and patient
app.use(express.static('public'));

// Route to send current patient data to the doctor
app.get('/patients', (req, res) => {
    res.json(patientsData);
});

// Socket connection for real-time updates (for doctors to see health status)
io.on('connection', (socket) => {
    console.log('Doctor connected');

    // Listen for patient data updates
    socket.on('patientData', (data) => {
        // Assume data includes the patientId and health condition
        const { patientId, healthCondition, painLevel, breathing } = data;
        // Store or update the patient's data
        patientsData[patientId] = { healthCondition, painLevel, breathing };

        // Send updated patient data to all connected doctors
        io.emit('updatePatientData', patientsData);
    });

    socket.on('disconnect', () => {
        console.log('Doctor disconnected');
    });
});

server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
