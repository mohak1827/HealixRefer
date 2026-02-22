import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './components/Auth/Login';
import LandingPage from './components/Landing/LandingPage';
import PatientRecommendation from './components/Landing/PatientRecommendation';
import HospitalDirectory from './components/Directory/HospitalDirectory';
import LabDirectory from './components/Directory/LabDirectory';
import LabDetails from './components/Directory/LabDetails';
import PublicHistory from './components/Directory/PublicHistory';
import Sidebar from './components/Layout/Sidebar';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import HospitalManagement from './components/Dashboard/HospitalManagement';
import AmbulancePage from './components/Ambulance/AmbulancePage';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PatientDashboard from './patient/Dashboard';
import AiAnalysis from './patient/AiAnalysis';
import Referrals from './patient/Referrals';
import MedicalVault from './patient/MedicalVault';
import Appointments from './patient/Appointments';
import Timeline from './patient/Timeline';

// Login page wrapper with a "Back to Home" button
const LoginPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-medical-gray flex items-center justify-center p-6 relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-10 left-10 btn-outline z-50 py-2 px-6"
            >
                ← Back to Home
            </button>
            <Login />
        </div>
    );
};

// Helper to get the dashboard home route based on role
const getDashboardRoute = (role) => {
    switch (role) {
        case 'User': return '/';
        case 'Patient': return '/patient/dashboard';
        case 'Doctor': return '/dashboard';
        case 'Hospital Admin': return '/dashboard';
        case 'Ambulance': return '/dashboard';
        case 'Super Admin': return '/dashboard';
        default: return '/dashboard';
    }
};

// Authenticated dashboard layout with sidebar
const DashboardLayout = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const location = useLocation();

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-light-gradient flex selection:bg-healix-teal selection:text-white">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 ml-72 p-10 min-h-screen relative">
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-healix-blue/[0.02] blur-[160px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-medical-teal/[0.02] blur-[160px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={user.role === 'Patient' ? location.pathname : activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10"
                    >
                        <Routes>
                            {user.role === 'Patient' ? (
                                <>
                                    <Route path="dashboard" element={<PatientDashboard />} />
                                    <Route path="ai-analysis" element={<AiAnalysis />} />
                                    <Route path="referrals" element={<Referrals />} />
                                    <Route path="medical-vault" element={<MedicalVault />} />
                                    <Route path="appointments" element={<Appointments />} />
                                    <Route path="timeline" element={<Timeline />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </>
                            ) : (
                                <Route path="*" element={
                                    user.role === 'Doctor' ? <DoctorDashboard activeView={activeTab === 'history' ? 'history' : 'create'} /> :
                                        user.role === 'Hospital Admin' ? <HospitalManagement activeView={activeTab} setActiveTab={setActiveTab} /> :
                                            user.role === 'Ambulance' ? <AmbulancePage activeView={activeTab === 'history' ? 'history' : activeTab === 'active' ? 'active' : 'dashboard'} /> :
                                                user.role === 'Super Admin' ? <SuperAdminDashboard /> :
                                                    <div className="p-10 text-center text-gray-400">Section Under Development</div>
                                } />
                            )}
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

const AppContent = () => {
    const { user, loading } = useAuth();

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

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={user && user.role !== 'User' ? <Navigate to={getDashboardRoute(user.role)} replace /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <LoginPage />} />
            <Route path="/hospitals" element={<HospitalDirectory />} />
            <Route path="/labs" element={<LabDirectory />} />
            <Route path="/lab/:id" element={<LabDetails />} />
            <Route path="/history" element={<PublicHistory />} />
            <Route path="/recommendation" element={<PatientRecommendation />} />

            {/* Authenticated dashboard routes */}
            <Route path="/patient/*" element={<DashboardLayout />} />
            <Route path="/dashboard" element={<DashboardLayout />} />

            {/* Catch-all: redirect to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => (
    <NotificationProvider>
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    </NotificationProvider>
);

export default App;
