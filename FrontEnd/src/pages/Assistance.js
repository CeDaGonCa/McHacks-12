import React, { useEffect } from 'react';
import './Page.css'; // Import the CSS file for page styling

const Assistance = () => {

    async function getFromBackend() {
        const response = await fetch('http://localhost:3001/patients')
        console.log('from backend: ', await response.json())
    }

    useEffect(() => {
        getFromBackend()
    }, [])

    return (
        <div className="page-content">
            <h1>Assistance Page</h1>
            <p>This is the assistance page of our application.</p>
        </div>
    );
};

export default Assistance;
