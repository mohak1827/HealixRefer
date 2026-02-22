import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Phone, Mail, MapPin, Calendar, Droplets, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import patientService from './services/patientService';

const Dashboard = () => {
    const { user, updateUser } = useAuth();
    const [data, setData] = useState({
        profile: {
            ...user,
            gender: 'Male',
            bloodGroup: 'O+',
            email: user?.email || 'patient@healix.com',
            address: '123 Rural Road, Health Village, State',
            doctor: {
                name: 'Dr. Arjun Mehta',
                phone: '+919876543210'
            }
        },
        riskScore: 25
    });
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

            setData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    ...(summary.profile || user),
                    gender: summary.profile?.gender || prev.profile.gender,
                    bloodGroup: summary.profile?.bloodGroup || prev.profile.bloodGroup,
                    email: summary.profile?.email || prev.profile.email,
                    address: summary.profile?.address || prev.profile.address,
                    doctor: summary.profile?.doctor || prev.profile.doctor
                },
                riskScore: summary.riskScore || 25
            }));
            setEditData({
                name: (summary.profile?.name || user?.name) || '',
                age: (summary.profile?.age || user?.age) || '',
                village: (summary.profile?.village || user?.village) || '',
                contact: (summary.profile?.contact || user?.contact) || ''
            });
        } catch (err) {
            console.error('Fetch error:', err);
            setData(prev => ({ ...prev, profile: { ...prev.profile, ...user } }));
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-healix-blue/10 rounded-2xl flex items-center justify-center text-healix-blue shadow-medical ring-4 ring-healix-blue/5">
                        <Heart className="w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Patient Overview</h1>
                        <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                            Welcome, <span className="text-healix-blue font-bold">{data.profile?.name}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer group">
                        <div className="bg-white p-3 rounded-xl border border-medical-gray shadow-soft group-hover:shadow-medical transition-all">
                            <Bell className="w-5 h-5 text-gray-400 group-hover:text-healix-blue" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="medical-card p-8">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Photo & Main Info */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-32 h-32 bg-healix-blue/10 rounded-[40px] flex items-center justify-center text-healix-blue ring-8 ring-healix-blue/5 shadow-inner">
                            <User className="w-16 h-16" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-medical-dark">{data.profile?.name}</h2>
                            <p className="text-sm font-bold text-healix-teal uppercase tracking-widest mt-1">Patient ID: PR-2024-089</p>
                        </div>
                        {data.profile?.doctor ? (
                            <a
                                href={`tel:${data.profile.doctor.phone}`}
                                className="flex items-center gap-2 px-6 py-3 bg-medical-green text-white rounded-2xl font-bold shadow-lg shadow-medical-green/20 hover:scale-105 transition-all group active:scale-95"
                            >
                                <Phone className="w-4 h-4 group-hover:animate-bounce" />
                                Call Doctor
                            </a>
                        ) : (
                            <button disabled className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-2xl font-bold cursor-not-allowed">
                                <Phone className="w-4 h-4" />
                                No Doctor Assigned
                            </button>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Age
                            </p>
                            <p className="text-sm font-bold text-medical-dark bg-gray-50 px-4 py-2 rounded-xl">{data.profile?.age} Years</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Gender
                            </p>
                            <p className="text-sm font-bold text-medical-dark bg-gray-50 px-4 py-2 rounded-xl">{data.profile?.gender}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Droplets className="w-3 h-3" /> Blood Group
                            </p>
                            <p className="text-sm font-bold text-medical-dark bg-gray-50 px-4 py-2 rounded-xl">{data.profile?.bloodGroup}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="w-3 h-3" /> Contact
                            </p>
                            <p className="text-sm font-bold text-medical-dark bg-gray-50 px-4 py-2 rounded-xl">{data.profile?.contact}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email
                            </p>
                            <p className="text-sm font-bold text-medical-dark bg-gray-50 px-4 py-2 rounded-xl truncate">{data.profile?.email}</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Address
                            </p>
                            <p className="text-sm font-bold text-medical-dark bg-gray-50 px-4 py-2 rounded-xl">{data.profile?.address || data.profile?.village}</p>
                        </div>
                    </div>
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
