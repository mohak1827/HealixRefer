import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import patientService from './services/patientService';
import RiskScore from './components/RiskScore';
import SummaryCard from './components/SummaryCard';
import QuickActions from './components/QuickActions';
import ActiveReferral from './components/ActiveReferral';

const Dashboard = () => {
    const { user, updateUser } = useAuth();
    const [data, setData] = useState({ profile: user, riskScore: 25, activeReferral: null });
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ name: '', age: '', village: '', contact: '' });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const summary = await patientService.getHealthSummary();
            const referralData = await patientService.getMyReferrals();

            setData({
                profile: (summary.profile && Object.keys(summary.profile).length > 0) ? summary.profile : user,
                riskScore: summary.riskScore || 25,
                activeReferral: referralData.activeReferral || (referralData.referrals?.length > 0 ? referralData.referrals[0] : null)
            });
            setEditData({
                name: (summary.profile?.name || user?.name) || '',
                age: (summary.profile?.age || user?.age) || '',
                village: (summary.profile?.village || user?.village) || '',
                contact: (summary.profile?.contact || user?.contact) || ''
            });
        } catch (err) {
            console.error('Fetch error:', err);
            // Even if fetch fails, ensure profile is set to user info
            setData(prev => ({ ...prev, profile: user }));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await patientService.updateProfile(editData);
            if (res.success) {
                updateUser({ name: editData.name, village: editData.village, age: Number(editData.age), contact: editData.contact });
                setShowEditModal(false);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-medical-green rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-medical-green/10">
                        <Heart className="w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-medical-dark tracking-tight">Patient Overview</h1>
                        <p className="text-gray-400 font-medium text-sm mt-1">
                            Welcome back, <span className="text-medical-blue font-bold">{data.profile?.name || user?.name}</span>. Your health data is up to date.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-medical-gray shadow-soft relative cursor-pointer hover:shadow-medical transition-all">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    <SummaryCard user={data.profile} onEdit={() => setShowEditModal(true)} />
                    <RiskScore score={data.riskScore} />
                </div>

                {/* Right Column (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-5 h-5 text-medical-blue" /> Quick Navigation
                            </h3>
                        </div>
                        <QuickActions />
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                <ArrowRight className="w-5 h-5 text-medical-blue" /> Active Care Status
                            </h3>
                        </div>
                        <ActiveReferral referral={data.activeReferral} />
                    </section>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-medical-dark/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="bg-medical-blue p-8 text-white">
                                <h2 className="text-2xl font-bold">Edit Profile</h2>
                                <p className="text-blue-100 text-sm">Update your personal information.</p>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="p-8 space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.name}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl border border-medical-gray focus:ring-2 focus:ring-medical-blue outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Age</label>
                                            <input
                                                type="number"
                                                required
                                                value={editData.age}
                                                onChange={e => setEditData({ ...editData, age: e.target.value })}
                                                className="w-full px-5 py-3 rounded-2xl border border-medical-gray focus:ring-2 focus:ring-medical-blue outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Village</label>
                                            <input
                                                type="text"
                                                required
                                                value={editData.village}
                                                onChange={e => setEditData({ ...editData, village: e.target.value })}
                                                className="w-full px-5 py-3 rounded-2xl border border-medical-gray focus:ring-2 focus:ring-medical-blue outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Contact Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.contact}
                                            onChange={e => setEditData({ ...editData, contact: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl border border-medical-gray focus:ring-2 focus:ring-medical-blue outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3.5 border border-medical-gray rounded-2xl font-bold text-gray-400">Cancel</button>
                                    <button type="submit" className="flex-[2] py-3.5 bg-medical-blue text-white rounded-2xl font-bold shadow-lg">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
