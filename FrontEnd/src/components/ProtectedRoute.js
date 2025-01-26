import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('medicalStaffToken');

    if (!isAuthenticated) {
        return <Navigate to="/medical-login" />;
    }

    return children;
};

export default ProtectedRoute; 