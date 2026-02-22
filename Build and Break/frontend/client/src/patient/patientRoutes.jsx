import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import MedicalHistory from './MedicalHistory';
import MedicalVault from './MedicalVault';

const PatientRoutes = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="medical-vault" element={<MedicalVault />} />
            <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
        </Routes>
    );
};

export default PatientRoutes;
