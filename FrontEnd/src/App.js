import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Assistance from './pages/Assistance'; // Import the Assistance page
import Contact from './pages/Contact'; // Import the Contact page
import Games from './pages/Games'; // Import the Games page
import PatientInfo from './pages/PatientInfo'; // Import the PatientInfo page
import NurseDashboard from './pages/NurseDashboard'; // Import the NurseDashboard page
// ...import other pages...

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/assistance" element={<Assistance />} /> {/* Added route for Assistance page */}
                <Route path="/games" element={<Games />} /> {/* Added route for Games page */}
                <Route path="/contact" element={<Contact />} /> {/* Added route for Contact page */}
                <Route path="/patient-info" element={<PatientInfo />} /> {/* Added route for PatientInfo page */}
                <Route path="/nurse-dashboard" element={<NurseDashboard />} /> {/* Added route for NurseDashboard page */}
                {/* Add routes for other pages */}
                {/* <Route path="/about" element={<About />} /> */}
                {/* <Route path="/contact" element={<Contact />} /> */}
            </Routes>
        </Router>
    );
}

export default App;
