import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './components/Auth/Login';
import LandingPage from './components/Landing/LandingPage';
import Sidebar from './components/Layout/Sidebar';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AmbulanceDashboard from './components/Dashboard/AmbulanceDashboard';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import RegionalMap from './components/Medical/RegionalMap';
import SeverityScoring from './components/Features/SeverityScoring';
import StressIndex from './components/Features/StressIndex';
import SurgeMode from './components/Features/SurgeMode';
import AuditTrail from './components/Features/AuditTrail';
import OutbreakDetection from './components/Features/OutbreakDetection';
import CrossDistrict from './components/Features/CrossDistrict';
import ConfidenceScore from './components/Features/ConfidenceScore';
import FeedbackLoop from './components/Features/FeedbackLoop';
import SelfLearning from './components/Features/SelfLearning';
import ImpactDashboard from './components/Features/ImpactDashboard';
import NearbyLabs from './components/Features/NearbyLabs';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardContent = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        if (user) {
            axios.get('http://localhost:5000/api/hospitals').then(res => setHospitals(res.data)).catch(() => { });
        }
    }, [user]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="relative mb-8">
                <div className="w-24 h-24 border-2 border-healix-blue/10 border-t-healix-blue rounded-[32px] animate-spin-slow shadow-healix-sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-healix-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
            </div>
            <p className="text-[10px] font-black text-healix-navy uppercase tracking-[0.4em] animate-pulse">Initializing Healix Intelligence</p>
        </div>
    );

    if (!user) return <LandingPage />;

    // Separate routes for Ambulance and Super Admin - they have their own simplified shell
    if (user.role === 'Ambulance') {
        return (
            <div className="min-h-screen bg-light-gradient flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 ml-72 p-10 min-h-screen">
                    <AmbulanceDashboard />
                </main>
            </div>
        );
    }

    if (user.role === 'Super Admin') {
        return (
            <div className="min-h-screen bg-light-gradient flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 ml-72 p-10 min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                            <SuperAdminDashboard activeTab={activeTab} />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        );
    }

    const renderPage = () => {
        switch (activeTab) {
            case 'dashboard':
                return user.role === 'Doctor' ? <DoctorDashboard /> : <AdminDashboard />;
            case 'map':
                return <div className="h-[750px] w-full"><RegionalMap hospitals={hospitals} /></div>;
            case 'severity':
                return <SeverityScoring />;
            case 'stress':
                return <StressIndex />;
            case 'surge':
                return <SurgeMode />;
            case 'audit':
                return <AuditTrail />;
            case 'outbreak':
                return <OutbreakDetection />;
            case 'crossdistrict':
                return <CrossDistrict />;
            case 'confidence':
                return <ConfidenceScore />;
            case 'feedback':
                return <FeedbackLoop />;
            case 'selflearning':
                return <SelfLearning />;
            case 'impact':
                return <ImpactDashboard />;
            case 'labs':
                return <NearbyLabs />;
            case 'admin':
                return <AdminDashboard />;
            case 'analytics':
                return (
                    <div className="healix-card p-20 bg-white flex flex-col items-center justify-center text-center relative overflow-hidden h-[600px]">
                        <h2 className="text-3xl font-extrabold text-healix-navy tracking-tighter mb-4">Deep Analytics Hub</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-md">Synthetic utilization trends and regional performance metrics. Restricted to executive oversight tier.</p>
                        <div className="mt-10 px-8 py-4 rounded-2xl bg-healix-navy/5 border border-healix-navy/10 text-healix-navy text-[10px] font-black uppercase tracking-widest">
                            Authorization Required
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="healix-card p-20 bg-white flex flex-col items-center justify-center text-center relative overflow-hidden h-[600px]">
                        <h2 className="text-3xl font-extrabold text-healix-navy tracking-tighter mb-4">Core Preferences</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Global platform configuration and regional node mapping settings.</p>
                        <div className="mt-10 w-64 h-1 bg-slate-50 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="h-full bg-healix-blue" />
                        </div>
                    </div>
                );
            default:
                return user.role === 'Doctor' ? <DoctorDashboard /> : <AdminDashboard />;
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
                        {renderPage()}
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
