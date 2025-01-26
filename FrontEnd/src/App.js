import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Assistance from "./pages/Assistance";
import Contact from "./pages/Contact";
import Games from "./pages/Games";
import PatientInfo from "./pages/PatientInfo";
import NurseDashboard from "./pages/NurseDashboard";
import MemoryMatchGame from "./pages/MemoryMatchGame"; // Import the Memory Match Game
import BreathingExerciseGame from "./pages/BreathingExerciseGame"; // Import the Breathing Exercise Game

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistance" element={<Assistance />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/memory-match" element={<MemoryMatchGame />} /> {/* Route for Memory Match Game */}
        <Route path="/games/breathing" element={<BreathingExerciseGame />} /> {/* Route for Breathing Exercise Game */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/patient-info" element={<PatientInfo />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        {/* Add routes for other pages as needed */}
      </Routes>
    </Router>
  );
}

export default App;
