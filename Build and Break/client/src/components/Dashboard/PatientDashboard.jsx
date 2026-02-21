import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, User, MapPin, Phone, Building2, Truck, Clock, CheckCircle2,
    AlertTriangle, Shield, Activity, Bed, Navigation, Bell, Zap,
    ArrowRight, RefreshCw, CircleDot, ChevronRight, Info, Plus, Upload,
    Calendar, FileText, MessageSquare, PhoneCall, X, Brain, Filter, Download,
    History
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

    // New States for Advanced Features
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [referralForm, setReferralForm] = useState({
        symptoms: '',
        specialist: '',
        urgency: 'Medium',
        hospital: '',
        report: null
    });
    const [aiSymptoms, setAiSymptoms] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [activeReferrals, setActiveReferrals] = useState([]); // Local state for simulated referrals

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

    const handleReferralSubmit = (e) => {
        e.preventDefault();
        const newReferral = {
            id: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            ...referralForm,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            statusStep: 0,
            hospitalName: referralForm.hospital || 'TBD (Under Review)'
        };
        setActiveReferrals([newReferral, ...activeReferrals]);
        notify('Referral request submitted successfully', 'success');
        setIsReferralModalOpen(false);
        setReferralForm({ symptoms: '', specialist: '', urgency: 'Medium', hospital: '', report: null });
    };

    const simulateProgress = (id) => {
        setActiveReferrals(prev => prev.map(ref => {
            if (ref.id === id) {
                const nextStep = (ref.statusStep + 1) % STATUS_STEPS.length;
                return {
                    ...ref,
                    statusStep: nextStep,
                    status: STATUS_STEPS[nextStep].key,
                    lastUpdated: new Date().toISOString()
                };
            }
            return ref;
        }));
    };

    const handleAiCheck = () => {
        if (!aiSymptoms) return;
        const lowKeywords = ['mild', 'itchy', 'slight'];
        const highKeywords = ['severe', 'chest pain', 'breathing', 'unconscious', 'bleeding'];

        let level = 'Medium';
        let dept = 'General Medicine';

        if (highKeywords.some(k => aiSymptoms.toLowerCase().includes(k))) {
            level = 'High';
            dept = 'Emergency / Cardiology';
        } else if (lowKeywords.some(k => aiSymptoms.toLowerCase().includes(k))) {
            level = 'Low';
            dept = 'Outpatient Clinic';
        }

        setAiResponse({
            level,
            dept,
            recommendation: level === 'High' ? 'Immediate consultation required. Proceed to emergency.' : 'Recommended follow-up with specialist.',
            hospitalType: level === 'High' ? 'Tertiary Care Hospital' : 'Community Health Center'
        });
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
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsReferralModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-medical-blue text-white rounded-xl font-bold text-sm shadow-medical hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus className="w-5 h-5" /> Request New Referral
                    </button>
                    <div className="relative">
                        <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-3 bg-white rounded-xl border border-medical-gray shadow-soft hover:shadow-medical transition-all relative">
                            <Bell className="w-5 h-5 text-medical-dark" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>
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

                    {/* Health Risk Indicator */}
                    <div className="medical-card p-6 text-center">
                        <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-6">Health Risk Index</h3>
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-medical-gray/30" />
                                <motion.circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" initial={{ strokeDashoffset: 364.4 }} animate={{ strokeDashoffset: 364.4 * (1 - 0.65) }} className="text-amber-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-medical-dark leading-none">65%</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Moderate</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Risk calculated based on age, urgency and medical history.</p>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="medical-card p-6">
                        <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center gap-2 p-3 bg-blue-50/50 rounded-2xl border border-medical-blue/10 hover:bg-medical-blue hover:text-white transition-all group">
                                <Upload className="w-4 h-4 text-medical-blue group-hover:text-white" />
                                <span className="text-[9px] font-bold uppercase">Upload Report</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-3 bg-green-50/50 rounded-2xl border border-medical-green/10 hover:bg-medical-green hover:text-white transition-all group">
                                <Download className="w-4 h-4 text-medical-green group-hover:text-white" />
                                <span className="text-[9px] font-bold uppercase">Rx Download</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-3 bg-purple-50/50 rounded-2xl border border-purple-100 hover:bg-purple-600 hover:text-white transition-all group">
                                <MessageSquare className="w-4 h-4 text-purple-600 group-hover:text-white" />
                                <span className="text-[9px] font-bold uppercase">Contact Dr.</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all group">
                                <PhoneCall className="w-4 h-4 text-red-600 group-hover:text-white" />
                                <span className="text-[9px] font-bold uppercase">Emergency</span>
                            </button>
                        </div>
                    </div>

                    {/* Historical Records & Timeline View */}
                    <div className="medical-card p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-5 h-5 text-medical-blue" /> Smart Health Assistant
                            </h3>
                            <Brain className="w-5 h-5 text-medical-blue/30" />
                        </div>
                        <div className="space-y-4">
                            <textarea
                                value={aiSymptoms}
                                onChange={e => setAiSymptoms(e.target.value)}
                                placeholder="Describe your symptoms for AI assessment..."
                                className="w-full p-4 rounded-2xl border border-medical-gray bg-gray-50/50 text-sm focus:ring-2 focus:ring-medical-blue outline-none transition-all resize-none h-24"
                            />
                            <button onClick={handleAiCheck} className="w-full py-3 bg-medical-blue text-white rounded-xl font-bold text-xs shadow-soft hover:shadow-medical transition-all">
                                Analyze Symptoms
                            </button>
                            {aiResponse && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl border border-medical-blue/20 bg-blue-50/50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${aiResponse.level === 'High' ? 'bg-red-100 text-red-600' : 'bg-medical-green/10 text-medical-green'}`}>
                                            Risk: {aiResponse.level}
                                        </span>
                                        <span className="text-[10px] font-bold text-medical-blue uppercase">{aiResponse.dept}</span>
                                    </div>
                                    <p className="text-xs font-bold text-medical-dark leading-relaxed">{aiResponse.recommendation}</p>
                                    <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {aiResponse.hospitalType}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="medical-card p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                <History className="w-5 h-5 text-medical-green" /> Medical Timeline
                            </h3>
                            <button onClick={() => setShowFullHistory(!showFullHistory)} className="text-[10px] font-bold text-medical-blue hover:underline">
                                {showFullHistory ? 'Hide Details' : 'View Full History'}
                            </button>
                        </div>
                        <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-medical-gray/50">
                            {[
                                { date: '21 Feb', type: 'Diagnosis', title: 'Viral Symptom Panel', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { date: '15 Feb', type: 'Referral', title: 'Cardiac Consultation', icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50' },
                                { date: '10 Feb', type: 'Prescription', title: 'Anti-inflammatory Meds', icon: FileText, color: 'text-green-500', bg: 'bg-green-50' }
                            ].map((item, idx) => (
                                <div key={idx} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${item.bg} flex items-center justify-center z-10 border-2 border-white shadow-soft`}>
                                        <item.icon className={`w-3 h-3 ${item.color}`} />
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.date} • {item.type}</span>
                                    </div>
                                    <div className="text-xs font-bold text-medical-dark">{item.title}</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-medical-gray rounded-xl text-[10px] font-bold text-gray-400 uppercase hover:text-medical-blue transition-all">View Full Medical History</button>
                    </div>
                </div>

                {/* Main View: Active Tracking or Empty State */}
                <div className="space-y-8">
                    {([...(activeReferrals || []), ...(referralData?.activeReferral ? [referralData.activeReferral] : [])]).length > 0 ? (
                        ([...(activeReferrals || []), ...(referralData?.activeReferral ? [referralData.activeReferral] : [])]).map((ref) => {
                            const currentStep = ref.statusStep !== undefined ? ref.statusStep : getStatusIndex(ref.status);
                            return (
                                <div key={ref.id} className="medical-card p-8 group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-medical-blue/[0.03] -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none" />
                                    <div className="flex items-center justify-between mb-10 text-center relative z-10">
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-medical-green" /> Referral Mission Control
                                            </h3>
                                            <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">
                                                AI Optimization Active • <span className="text-medical-green">Sync: 98%</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => simulateProgress(ref.id)} className="px-4 py-1.5 bg-medical-blue/10 text-medical-blue rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-medical-blue hover:text-white transition-all shadow-sm">
                                                Simulate Progress
                                            </button>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Assigned Case</div>
                                                <div className="text-xs font-bold text-medical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{ref.id}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative mb-12">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-medical-gray -translate-y-1/2 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(currentStep + 0.5) * (100 / STATUS_STEPS.length)}%` }} className="h-full bg-medical-blue transition-all duration-1000" />
                                        </div>
                                        <div className="relative flex justify-between items-center">
                                            {STATUS_STEPS.map((s, i) => {
                                                const isActive = i <= currentStep;
                                                const isCurrent = i === currentStep;
                                                return (
                                                    <div key={s.key} className="flex flex-col items-center relative z-10 w-fit">
                                                        <motion.div animate={isCurrent ? { scale: [1, 1.2, 1], boxShadow: ['0 0 10px rgba(59,130,246,0)', '0 0 20px rgba(59,130,246,0.3)', '0 0 10px rgba(59,130,246,0)'] } : {}} transition={{ repeat: Infinity, duration: 2.5 }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isCurrent ? 'bg-medical-blue text-white border-white' : isActive ? 'bg-medical-green text-white border-white shadow-soft' : 'bg-white text-gray-200 border-medical-gray'}`}>
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

                                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                                        <div className="bg-medical-gray/30 rounded-2xl p-5 border border-medical-gray/50 flex items-center gap-4 hover:bg-white transition-all">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center border border-medical-gray/20">
                                                <Building2 className="w-6 h-6 text-medical-blue" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Destination Facility</div>
                                                <div className="text-md font-bold text-medical-dark leading-tight">{ref.hospitalName}</div>
                                                <div className="text-[10px] font-medium text-medical-blue mt-1">Ready for Admission</div>
                                            </div>
                                        </div>
                                        <div className="bg-medical-gray/30 rounded-2xl p-5 border border-medical-gray/50 flex items-center gap-4 hover:bg-white transition-all">
                                            <div className={`w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center border border-medical-gray/20 ${ref.urgency === 'High' ? 'text-red-500' : 'text-medical-blue'}`}>
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Priority Level</div>
                                                <div className={`text-md font-bold leading-tight ${ref.urgency === 'High' ? 'text-red-600' : 'text-medical-blue'}`}>{ref.urgency}</div>
                                                <div className="text-[10px] font-medium text-gray-500 mt-1">Response: ~15 mins</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
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
                                <button onClick={() => setIsReferralModalOpen(true)} className="mt-8 px-8 py-3 bg-medical-blue text-white rounded-xl font-bold text-sm shadow-medical">Initiate New Request</button>
                            </motion.div>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-2 gap-8 mt-8">
                        {/* Nearby Hospital Recommendations */}
                        <div className="medical-card p-6">
                            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-medical-blue" /> Nearby Hospitals
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'LifeCare Multispecialty', dist: '2.4km', rate: '4.8', beds: '12 available', color: 'text-medical-green' },
                                    { name: 'City General Hospital', dist: '5.1km', rate: '4.5', beds: '4 available', color: 'text-amber-500' },
                                    { name: 'Rural Health Center B', dist: '8.2km', rate: '4.2', beds: '22 available', color: 'text-medical-green' }
                                ].map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-medical-gray/20 rounded-xl hover:bg-white border border-transparent hover:border-medical-gray transition-all cursor-pointer">
                                        <div>
                                            <div className="text-xs font-bold text-medical-dark">{h.name}</div>
                                            <div className="text-[10px] font-medium text-gray-400">{h.dist} • ★ {h.rate}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[9px] font-black uppercase tracking-tighter ${h.color}`}>{h.beds}</div>
                                            <button className="text-[9px] font-bold text-medical-blue hover:underline">Refer Here</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mini Calendar Widget */}
                        <div className="medical-card p-6">
                            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-medical-green" /> Clinical Schedule
                            </h3>
                            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[8px] font-bold text-gray-400">{d}</div>)}
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className={`p-1 text-[10px] font-bold rounded-lg ${i === 20 ? 'bg-medical-blue text-white shadow-soft' : i === 24 ? 'bg-medical-green/10 text-medical-green border border-medical-green/20' : 'text-medical-dark hover:bg-medical-gray/30'}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-lg">
                                    <div className="w-1.5 h-1.5 bg-medical-blue rounded-full" />
                                    <div className="text-[10px] font-bold text-medical-dark">Today: Review AI Assessment</div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-lg">
                                    <div className="w-1.5 h-1.5 bg-medical-green rounded-full" />
                                    <div className="text-[10px] font-bold text-medical-dark">25 Feb: Specialist Follow-up</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secure Document Vault */}
                    <div className="medical-card p-8 mt-8 bg-medical-dark text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-medical-blue/10 -mr-32 -mt-32 rounded-full blur-3xl" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-medical-blue" /> Secure Medical Vault
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">End-to-End Encryption <span className="text-medical-green">ACTIVE</span></p>
                            </div>
                            <Filter className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 relative z-10">
                            {[
                                { name: 'Lab_Report_Jan.pdf', size: '2.4 MB', type: 'PDF' },
                                { name: 'X-Ray_Chest.jpg', size: '4.1 MB', type: 'IMG' },
                                { name: 'Referral_Letter.pdf', size: '1.1 MB', type: 'PDF' }
                            ].map((doc, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
                                    <FileText className="w-8 h-8 text-medical-blue mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-[11px] font-bold truncate mb-1">{doc.name}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-medium text-gray-500">{doc.size} • {doc.type}</span>
                                        <Download className="w-3 h-3 text-gray-500 group-hover:text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Manage Document Permissions</button>
                    </div>
                </div>
            </div>
            {/* Referral Modal */}
            <AnimatePresence>
                {isReferralModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReferralModalOpen(false)} className="absolute inset-0 bg-medical-dark/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="bg-medical-blue p-8 text-white relative">
                                <button onClick={() => setIsReferralModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-2xl font-bold mb-2">Request New Referral</h2>
                                <p className="text-blue-100 text-sm font-medium">Connect with specialist care across the Heallix network.</p>
                            </div>
                            <form onSubmit={handleReferralSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Symptoms & Condition</label>
                                    <textarea required value={referralForm.symptoms} onChange={e => setReferralForm({ ...referralForm, symptoms: e.target.value })} placeholder="Describe symptoms, duration and any previous treatment..." className="w-full px-5 py-3 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none transition-all h-24 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Specialist</label>
                                        <select value={referralForm.specialist} onChange={e => setReferralForm({ ...referralForm, specialist: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none appearance-none bg-white">
                                            <option value="">Select Specialty</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="General Surgery">General Surgery</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Urgency</label>
                                        <select value={referralForm.urgency} onChange={e => setReferralForm({ ...referralForm, urgency: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none appearance-none bg-white">
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Medical Reports (Optional)</label>
                                    <div className="border-2 border-dashed border-medical-gray rounded-2xl p-6 text-center hover:border-medical-blue/30 transition-all cursor-pointer group">
                                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2 group-hover:text-medical-blue transition-colors" />
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Click to upload JPG or PDF</div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-medical-blue text-white rounded-2xl font-bold shadow-medical hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
                                    Submit Referral Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientDashboard;
