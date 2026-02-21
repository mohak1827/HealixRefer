import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './components/Landing/LandingPage';
import Sidebar from './components/Layout/Sidebar';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AmbulancePage from './components/Ambulance/AmbulancePage';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardContent = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="relative mb-8">
                <div className="w-24 h-24 border-2 border-healix-blue/10 border-t-healix-blue rounded-[32px] animate-spin" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-healix-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
            </div>
            <p className="text-[10px] font-black text-healix-navy uppercase tracking-[0.4em] animate-pulse">Initializing Healix Intelligence</p>
        </div>
    );

    if (!user) return <LandingPage />;

    const renderDashboard = () => {
        switch (user.role) {
            case 'Patient': return <PatientDashboard />;
            case 'Doctor': return <DoctorDashboard activeView={activeTab === 'history' ? 'history' : 'create'} />;
            case 'Hospital Admin': return <AdminDashboard />;
            case 'Ambulance': return <AmbulancePage activeView={activeTab === 'history' ? 'history' : activeTab === 'active' ? 'active' : 'dashboard'} />;
            case 'Super Admin': return <SuperAdminDashboard />;
            default: return <PatientDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-light-gradient flex selection:bg-healix-teal selection:text-white">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 ml-72 p-10 min-h-screen relative">
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-healix-blue/[0.02] blur-[160px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-medical-teal/[0.02] blur-[160px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="relative z-10">
                        {renderDashboard()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

const App = () => (
    <NotificationProvider>
        <AuthProvider>
            <DashboardContent />
        </AuthProvider>
    </NotificationProvider>
);

export default App;
