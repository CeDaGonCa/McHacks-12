import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Assistance from "./pages/Assistance";
import Contact from "./pages/Contact";
import Games from "./pages/Games";
import PatientInfo from "./pages/PatientInfo";
import NurseDashboard from "./pages/NurseDashboard";
import BreathingGame from './components/games/BreathingGame';
import MemoryMatch from './components/games/MemoryMatch';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistance" element={<Assistance />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/breathing" element={<BreathingGame />} />
        <Route path="/games/memory-match" element={<MemoryMatch />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/patient-info" element={<PatientInfo />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        {/* Add routes for other pages as needed */}
      </Routes>
    </Router>
  );
}

export default App;
