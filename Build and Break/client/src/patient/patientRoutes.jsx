import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import AiAnalysis from './AiAnalysis';
import Referrals from './Referrals';
import MedicalVault from './MedicalVault';
import Appointments from './Appointments';
import Timeline from './Timeline';

const PatientRoutes = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ai-analysis" element={<AiAnalysis />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="medical-vault" element={<MedicalVault />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
        </Routes>
    );
};

export default PatientRoutes;
