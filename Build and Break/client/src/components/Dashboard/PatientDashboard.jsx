import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, User, MapPin, Phone, Building2, Truck, Clock, CheckCircle2,
    AlertTriangle, Shield, Activity, Bed, Navigation, Bell, Zap,
    ArrowRight, RefreshCw, CircleDot, ChevronRight, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const STATUS_STEPS = [
    { key: 'Pending', label: 'Referral Sent', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { key: 'Accepted', label: 'Hospital Accepted', icon: CheckCircle2, color: 'text-medical-blue', bg: 'bg-blue-50' },
    { key: 'In Transit', label: 'Ambulance En Route', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { key: 'Reached Hospital', label: 'Reached Hospital', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'Admitted', label: 'Patient Admitted', icon: Heart, color: 'text-medical-green', bg: 'bg-green-50' },
    { key: 'Completed', label: 'Case Finalized', icon: Shield, color: 'text-medical-dark', bg: 'bg-gray-100' },
];

const PatientDashboard = () => {
    const { user } = useAuth();
    const { addNotification: notify } = useNotification();
    const [profile, setProfile] = useState(null);
    const [referralData, setReferralData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', age: '', village: '', contact: '' });
    const [gpsData, setGpsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, referralRes, notifRes] = await Promise.all([
                axios.get('/api/patients/profile'),
                axios.get('/api/patients/my-referral'),
                axios.get('/api/notifications')
            ]);
            setProfile(profileRes.data);
            setReferralData(referralRes.data);
            setNotifications(notifRes.data);

            if (profileRes.data) {
                setProfileForm({ name: profileRes.data.name, age: profileRes.data.age, village: profileRes.data.village, contact: profileRes.data.contact });
            } else {
                setProfileForm({ name: user?.name || '', age: user?.age || '', village: user?.village || '', contact: user?.contact || '' });
            }

            if (referralRes.data?.ambulance) {
                try {
                    const gpsRes = await axios.get(`/api/ambulance/gps/${referralRes.data.ambulance.id}`);
                    setGpsData(gpsRes.data);
                } catch (e) { }
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSaveProfile = async () => {
        try {
            await axios.post('/api/patients/register', profileForm);
            notify('Medical profile updated successfully', 'success');
            setEditProfile(false);
            fetchData();
        } catch (err) {
            notify('Failed to sync profile updates', 'error');
        }
    };

    const getStatusIndex = (status) => STATUS_STEPS.findIndex(s => s.key === status);
    const activeRef = referralData?.activeReferral;
    const currentStepIdx = activeRef ? getStatusIndex(activeRef.status) : -1;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header / Intro Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-medical-green rounded-2xl flex items-center justify-center text-white shadow-medical ring-4 ring-medical-green/10">
                        <Heart className="w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Patient Health Portal</h1>
                        <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                            Welcome back, <span className="text-medical-blue font-bold">{user?.name}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-5 py-2.5 rounded-medical border border-medical-gray shadow-soft flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Status</div>
                            <div className="text-xs font-bold text-medical-green uppercase">Authorized User</div>
                        </div>
                        <div className="w-2 h-2 bg-medical-green rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {notifications.filter(n => !n.read).slice(0, 1).map(n => (
                    <motion.div key={n.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-8 p-4 rounded-medical border border-medical-blue/20 bg-blue-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center text-white">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-medical-dark">{n.title}</div>
                            <div className="text-xs text-gray-500 font-medium">{n.message}</div>
                        </div>
                        <button onClick={async () => { await axios.put(`/api/notifications/${n.id}/read`); fetchData(); }}
                            className="text-xs font-bold text-medical-blue hover:text-blue-700 decoration-2 transition-all">Dismiss</button>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Profile & Secondary Info */}
                <div className="space-y-8">
                    <div className="medical-card p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-medical-blue/5 -mr-8 -mt-8 rounded-full blur-2xl" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4 text-medical-blue" /> Personal File
                            </h3>
                            <button onClick={() => setEditProfile(!editProfile)}
                                className="px-3 py-1.5 rounded-lg border border-medical-gray text-[10px] font-bold text-gray-400 hover:text-medical-blue hover:border-medical-blue/30 transition-all uppercase">
                                {editProfile ? 'Cancel' : 'Update Info'}
                            </button>
                        </div>

                        {editProfile ? (
                            <div className="space-y-4 relative z-10">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Full Legal Name</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Age</label>
                                        <input type="number" value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Contact</label>
                                        <input value={profileForm.contact} onChange={e => setProfileForm({ ...profileForm, contact: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Residential Village</label>
                                    <input value={profileForm.village} onChange={e => setProfileForm({ ...profileForm, village: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none" />
                                </div>
                                <button onClick={handleSaveProfile} className="w-full py-3 mt-4 rounded-medical bg-medical-blue text-white text-xs font-bold shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Save Profile Identity
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4 p-4 bg-medical-gray/30 rounded-2xl border border-medical-gray/50">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center text-medical-dark font-bold text-lg">
                                        {(profileForm.name[0] || user?.name?.[0] || 'P')}
                                    </div>
                                    <div>
                                        <div className="text-md font-bold text-medical-dark">{profile?.name || user?.name || 'Incomplete Profile'}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Patient ID: 399-282</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    {[
                                        { icon: Heart, label: 'Age Group', value: `${profile?.age || user?.age || '—'} Years` },
                                        { icon: MapPin, label: 'Origin', value: profile?.village || user?.village || 'Not Set' },
                                        { icon: Phone, label: 'Emergency Contact', value: profile?.contact || user?.contact || '—' }
                                    ].map(f => (
                                        <div key={f.label} className="flex items-center justify-between p-3 bg-white border border-medical-gray rounded-xl group hover:border-medical-blue/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <f.icon className="w-4 h-4 text-gray-300 group-hover:text-medical-blue transition-colors" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{f.label}</span>
                                            </div>
                                            <span className="text-xs font-bold text-medical-dark">{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Historical Records */}
                    {referralData?.referrals?.length > 0 && (
                        <div className="medical-card p-6">
                            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-medical-green" /> Referral History
                            </h3>
                            <div className="space-y-3">
                                {referralData.referrals.map(ref => (
                                    <div key={ref.id} className="p-3 bg-white border border-medical-gray rounded-xl hover:shadow-soft transition-all cursor-pointer">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-medical-blue uppercase tracking-tighter">Case #{ref.id.slice(-6)}</span>
                                            <span className="text-[9px] font-bold text-gray-400">{new Date(ref.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs font-bold text-medical-dark truncate mb-1">{ref.hospitalName}</div>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${ref.status === 'Completed' ? 'bg-medical-green/10 text-medical-green' : 'bg-amber-100 text-amber-700'}`}>
                                                {ref.status}
                                            </span>
                                            <ChevronRight className="w-3 h-3 text-gray-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main View: Active Tracking or Empty State */}
                <div className="lg:col-span-2 space-y-8">
                    {activeRef ? (
                        <>
                            {/* Mission Status Tracker */}
                            <div className="medical-card p-8">
                                <div className="flex items-center justify-between mb-10 text-center">
                                    <div className="text-left">
                                        <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-medical-green" /> Referral Mission Control
                                        </h3>
                                        <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">Global Sync Status: <span className="text-medical-green">ACTIVE</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Assigned Case</div>
                                        <div className="text-xs font-bold text-medical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">TXN-{activeRef.id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </div>

                                <div className="relative mb-12">
                                    {/* Progress line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-medical-gray -translate-y-1/2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(currentStepIdx + 1) * (100 / STATUS_STEPS.length)}%` }}
                                            className="h-full bg-medical-blue transition-all duration-1000"
                                        />
                                    </div>

                                    <div className="relative flex justify-between items-center">
                                        {STATUS_STEPS.map((s, i) => {
                                            const isActive = i <= currentStepIdx;
                                            const isCurrent = i === currentStepIdx;
                                            return (
                                                <div key={s.key} className="flex flex-col items-center relative z-10 w-fit">
                                                    <motion.div
                                                        animate={isCurrent ? { scale: [1, 1.2, 1], boxShadow: ['0 0 10px rgba(59,130,246,0)', '0 0 20px rgba(59,130,246,0.3)', '0 0 10px rgba(59,130,246,0)'] } : {}}
                                                        transition={{ repeat: Infinity, duration: 2.5 }}
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isCurrent ? 'bg-medical-blue text-white border-white' : isActive ? 'bg-medical-green text-white border-white shadow-soft' : 'bg-white text-gray-200 border-medical-gray'}`}>
                                                        <s.icon className={`w-5 h-5 ${isCurrent || isActive ? '' : 'opacity-50'}`} />
                                                    </motion.div>
                                                    <div className={`mt-4 text-[9px] font-black uppercase tracking-tighter w-20 text-center transition-colors duration-500 ${isCurrent ? 'text-medical-blue' : isActive ? 'text-medical-dark' : 'text-gray-300'}`}>
                                                        {s.label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-medical-gray/30 rounded-2xl p-5 border border-medical-gray/50 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-medical-blue" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Destination Facility</div>
                                            <div className="text-md font-bold text-medical-dark leading-tight">{activeRef.hospitalName}</div>
                                            <div className="text-[10px] font-medium text-medical-blue mt-1">Ready for Admission</div>
                                        </div>
                                    </div>
                                    <div className="bg-medical-gray/30 rounded-2xl p-5 border border-medical-gray/50 flex items-center gap-4">
                                        <div className={`w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center ${activeRef.urgency === 'Emergency' ? 'text-red-500' : 'text-medical-blue'}`}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Priority Classification</div>
                                            <div className={`text-md font-bold leading-tight ${activeRef.urgency === 'Emergency' ? 'text-red-600' : 'text-medical-blue'}`}>{activeRef.urgency}</div>
                                            <div className="text-[10px] font-medium text-gray-500 mt-1">AI Optimized Routing Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resource Allocations */}
                            {referralData?.reservation && (
                                <div className="medical-card p-8 border-2 border-medical-green/20 bg-green-50/5">
                                    <h3 className="text-sm font-bold text-medical-dark mb-8 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-medical-green" /> Allocated Medical Assets
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {referralData.reservation.bedReserved && (
                                            <div className="bg-white rounded-2xl p-6 border border-medical-gray shadow-soft hover:shadow-medical transition-all text-center">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-medical-blue mx-auto mb-4">
                                                    <Bed className="w-5 h-5" />
                                                </div>
                                                <div className="text-xl font-bold text-medical-dark leading-none mb-1">{referralData.reservation.bedNumber || 'WARD_01'}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Bed Slot</div>
                                            </div>
                                        )}
                                        {referralData.reservation.icuReserved && (
                                            <div className="bg-white rounded-2xl p-6 border border-medical-gray shadow-soft hover:shadow-medical transition-all text-center">
                                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-4">
                                                    <Heart className="w-5 h-5" />
                                                </div>
                                                <div className="text-xl font-bold text-medical-dark leading-none mb-1">{referralData.reservation.icuSlot || 'ICU_A'}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Critical ICU Unit</div>
                                            </div>
                                        )}
                                        {referralData.reservation.specialistReserved && (
                                            <div className="bg-white rounded-2xl p-6 border border-medical-gray shadow-soft hover:shadow-medical transition-all text-center">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="text-md font-bold text-medical-dark leading-none mb-2 truncate px-2">{referralData.reservation.specialistReserved}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialist Sync @ {referralData.reservation.specialistSlotTime}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Logistics Real-time tracking */}
                            {referralData?.ambulance && (
                                <div className="medical-card p-8 group">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                            <Navigation className="w-5 h-5 text-medical-blue" /> Real-time Logistics Stream
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1 text-right">Unit ID</div>
                                                <div className="text-xs font-bold text-medical-blue">{referralData.ambulance.vehicleNo}</div>
                                            </div>
                                            <div className="w-3 h-3 bg-medical-green rounded-full ring-4 ring-medical-green/10 animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Advanced Map Mockup */}
                                    <div className="relative h-64 bg-medical-dark rounded-3xl overflow-hidden mb-8 border border-medical-dark/20 shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                                            {[...Array(15)].map((_, i) => (
                                                <div key={`v-${i}`} className="absolute bg-white/20 h-full w-[1px]" style={{ left: `${i * 6.66}%` }} />
                                            ))}
                                            {[...Array(15)].map((_, i) => (
                                                <div key={`h-${i}`} className="absolute bg-white/20 w-full h-[1px]" style={{ top: `${i * 6.66}%` }} />
                                            ))}
                                        </div>

                                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                            <motion.path
                                                d="M 100 200 L 400 100"
                                                stroke="#3B82F6"
                                                strokeWidth="4"
                                                strokeDasharray="10 6"
                                                fill="transparent"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                            />
                                        </svg>

                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <div className="bg-medical-dark/80 backdrop-blur-md border border-white/10 p-2 rounded-xl flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-medical-green" />
                                                <span className="text-[9px] font-bold text-white uppercase">Sensing Active</span>
                                            </div>
                                        </div>

                                        <div className="absolute left-[20%] bottom-[20%] flex flex-col items-center">
                                            <div className="w-6 h-6 bg-medical-blue/20 rounded-full flex items-center justify-center border-2 border-medical-blue animate-pulse">
                                                <div className="w-2 h-2 bg-medical-blue rounded-full" />
                                            </div>
                                            <span className="mt-2 text-[8px] font-bold text-white bg-medical-blue px-2 py-0.5 rounded-full uppercase">Origin</span>
                                        </div>

                                        <div className="absolute right-[20%] top-[20%] flex flex-col items-center">
                                            <Building2 className="w-8 h-8 text-white relative z-10" />
                                            <div className="w-12 h-12 bg-white/10 rounded-full absolute -top-2 animate-ping" />
                                            <span className="mt-2 text-[8px] font-bold text-white bg-medical-green px-2 py-0.5 rounded-full uppercase">Med-Center</span>
                                        </div>

                                        <motion.div
                                            animate={{
                                                left: `${20 + (gpsData?.progress || 0) * 0.60}%`,
                                                top: `${80 - (gpsData?.progress || 0) * 0.60}%`
                                            }}
                                            transition={{ duration: 2.5, ease: 'linear' }}
                                            className="absolute -translate-x-1/2 -translate-y-1/2"
                                        >
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-medical-blue rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] rotate-45 border-2 border-white/20">
                                                    <Truck className="w-7 h-7 -rotate-45" />
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="bg-medical-dark/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Velocity</div>
                                                        <div className="text-md font-bold text-white">{gpsData?.speed || '0'} <span className="text-[10px] text-gray-500 font-medium tracking-normal">km/h</span></div>
                                                    </div>
                                                    <div className="h-8 w-[1px] bg-white/10" />
                                                    <div>
                                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Traverse</div>
                                                        <div className="text-md font-bold text-white">{gpsData?.progress || 0}%</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-bold text-medical-green uppercase bg-medical-green/10 px-3 py-1.5 rounded-full border border-medical-green/20">Operational</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-medical-gray text-center hover:border-medical-blue/30 transition-all">
                                            <Clock className="w-5 h-5 text-medical-blue mx-auto mb-3" />
                                            <div className="text-2xl font-bold text-medical-dark leading-none">{gpsData?.etaMinutes || '12'}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Est. Remaining</div>
                                        </div>
                                        <div className="bg-green-50/50 rounded-2xl p-6 border border-medical-gray text-center hover:border-medical-green/30 transition-all">
                                            <Zap className="w-5 h-5 text-medical-green mx-auto mb-3" />
                                            <div className="text-2xl font-bold text-medical-dark leading-none">{gpsData?.progress || 0}%</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Mission Progress</div>
                                        </div>
                                        <div className="bg-medical-gray/30 rounded-2xl p-6 border border-medical-gray text-center transition-all">
                                            <Info className="w-5 h-5 text-gray-400 mx-auto mb-3" />
                                            <div className="text-lg font-bold text-medical-dark leading-none truncate uppercase tracking-tighter">{referralData.ambulance.status}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Unit Status</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="medical-card p-24 text-center border-2 border-dashed border-medical-gray bg-gray-50/50">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-soft mb-8 border border-medical-gray">
                                    <Shield className="w-12 h-12 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-medical-dark mb-4">No Active Referral Missions</h3>
                                <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                                    System is currently monitoring for new health directives. Your clinical logs will appear here when a referral process is initiated.
                                </p>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
