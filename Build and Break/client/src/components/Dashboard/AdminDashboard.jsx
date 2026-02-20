import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Bed, Users, CheckCircle2, XCircle, Clock, AlertTriangle,
    Activity, Save, Heart, Shield, Stethoscope, TrendingUp, Bell,
    RefreshCw, Zap, ArrowRight, User, MapPin, FileText, BarChart3, ChevronRight, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { addNotification: notify } = useNotification();
    const [hospital, setHospital] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [escalationLogs, setEscalationLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [bedForm, setBedForm] = useState({ totalBeds: 0, icuBeds: 0, availableBeds: 0 });
    const [tab, setTab] = useState('referrals');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [hospRes, refRes, resrvRes, escRes, notifRes] = await Promise.all([
                axios.get('/api/hospitals/mine'),
                axios.get('/api/referrals'),
                axios.get('/api/reservations'),
                axios.get('/api/escalation-logs'),
                axios.get('/api/notifications')
            ]);
            setHospital(hospRes.data);
            setReferrals(refRes.data);
            setReservations(resrvRes.data);
            setEscalationLogs(escRes.data);
            setNotifications(notifRes.data);
            if (hospRes.data) {
                setBedForm({ totalBeds: hospRes.data.totalBeds, icuBeds: hospRes.data.icuBeds, availableBeds: hospRes.data.availableBeds });
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleAccept = async (referralId) => {
        try {
            await axios.put(`/api/referrals/${referralId}/accept`, { notes: 'Accepted by admin' });
            notify('Referral accepted!', 'success');
            fetchData();
        } catch (err) { notify('Failed to accept', 'error'); }
    };

    const handleReject = async (referralId) => {
        try {
            await axios.put(`/api/referrals/${referralId}/reject`, { reason: 'Capacity constraints' });
            notify('Referral rejected & escalated to next hospital', 'warning');
            fetchData();
        } catch (err) { notify('Failed to reject', 'error'); }
    };

    const handleAdmit = async (referralId) => {
        try {
            await axios.put(`/api/referrals/${referralId}/admit`, { ward: 'General Ward' });
            notify('Patient admitted!', 'success');
            fetchData();
        } catch (err) { notify('Failed to admit', 'error'); }
    };

    const handleUpdateBeds = async () => {
        if (!hospital) return;
        try {
            await axios.put(`/api/hospitals/${hospital.id}/update`, bedForm);
            notify('Hospital resources updated!', 'success');
            setEditMode(false);
            fetchData();
        } catch (err) { notify('Update failed', 'error'); }
    };

    const getTimeRemaining = (deadline) => {
        const remaining = new Date(deadline).getTime() - Date.now();
        if (remaining <= 0) return { text: 'Time Expired', urgent: true };
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return { text: `${mins}m ${secs}s`, urgent: mins < 2 };
    };

    const pendingReferrals = referrals.filter(r => r.status === 'Pending');
    const acceptedReferrals = referrals.filter(r => r.status === 'Accepted' || r.status === 'In Transit' || r.status === 'Reached Hospital');
    const admittedReferrals = referrals.filter(r => r.status === 'Admitted');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-medical-blue rounded-2xl flex items-center justify-center text-white shadow-medical ring-4 ring-medical-blue/10">
                        <Building2 className="w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark tracking-tight">{hospital?.name || 'Administrator Portal'}</h1>
                        <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                            System Admin ID: <span className="text-medical-blue font-bold">ADM-{user?.id?.slice(-4) || '7822'}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-5 py-2.5 rounded-medical border border-medical-gray shadow-soft flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Status</div>
                            <div className="text-xs font-bold text-medical-green">ACTIVE SESSION</div>
                        </div>
                        <div className="w-2 h-2 bg-medical-green rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Emergency Alerts */}
            <AnimatePresence>
                {notifications.filter(n => !n.read).slice(0, 1).map(n => (
                    <motion.div key={n.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-8 p-4 rounded-medical border-2 border-red-100 bg-red-50/50 flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-red-700">{n.title}</div>
                            <div className="text-xs text-red-600 font-medium">{n.message}</div>
                        </div>
                        <button onClick={async () => { await axios.put(`/api/notifications/${n.id}/read`); fetchData(); }}
                            className="bg-red-100 p-2 rounded-lg text-red-500 hover:bg-red-200 transition-colors px-4 text-xs font-bold">Mark Read</button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                {[
                    { label: 'Total Capacity', value: hospital?.totalBeds || 0, icon: Bed, color: 'text-medical-blue', bg: 'bg-blue-50' },
                    { label: 'Available Beds', value: (hospital?.availableBeds || 0) - (hospital?.reservedBeds || 0), icon: CheckCircle2, color: 'text-medical-green', bg: 'bg-green-50' },
                    { label: 'Critical ICU', value: (hospital?.icuBeds || 0) - (hospital?.reservedICU || 0), icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Active Reservations', value: (hospital?.reservedBeds || 0) + (hospital?.reservedICU || 0), icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Inbound Queue', value: pendingReferrals.length, icon: TrendingUp, color: 'text-medical-blue', bg: 'bg-blue-50' },
                ].map(s => (
                    <div key={s.label} className="medical-card p-5 text-center transition-transform hover:-translate-y-1">
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-medical-dark">{s.value}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Action Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-medical-gray/30 p-1 rounded-2xl w-fit border border-medical-gray">
                {[
                    { id: 'referrals', label: 'Inbound Requests', icon: FileText, badge: pendingReferrals.length },
                    { id: 'resources', label: 'Resource Mgmt', icon: Bed },
                    { id: 'reservations', label: 'Allocations', icon: Shield, badge: reservations.filter(r => r.status === 'Reserved').length },
                    { id: 'escalations', label: 'Escalations', icon: Zap, badge: escalationLogs.length },
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-medical-blue shadow-soft border border-medical-gray' : 'text-gray-400 hover:text-medical-dark'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                        {t.badge > 0 && <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${tab === t.id ? 'bg-medical-blue text-white' : 'bg-red-100 text-red-600'}`}>{t.badge}</span>}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'referrals' && (
                    <motion.div key="referrals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Urgent Queue */}
                        {pendingReferrals.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Urgent Admission Queue
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pendingReferrals.length} REQUESTS</span>
                                </div>
                                {pendingReferrals.map(ref => {
                                    const timer = ref.escalationDeadline ? getTimeRemaining(ref.escalationDeadline) : null;
                                    return (
                                        <motion.div key={ref.id} className="medical-card p-6 border-2 border-medical-gray hover:border-medical-blue/30 transition-all">
                                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                                        <span className="text-xs font-bold text-medical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">#{ref.id.slice(-6)}</span>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${ref.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {ref.urgency}
                                                        </span>
                                                        {ref.delayRisk && (
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${ref.delayRisk.level === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {ref.delayRisk.level} Delay Risk
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-bold text-medical-dark mb-1">{ref.patientName} <span className="text-gray-400 font-medium">({ref.patientAge}y)</span></div>
                                                    <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-2xl">{ref.symptoms}</p>
                                                    <div className="flex flex-wrap items-center gap-6 mt-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-medical-dark">
                                                            <User className="w-4 h-4 text-medical-blue" /> Dr. {ref.doctorName}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-medical-dark">
                                                            <Clock className="w-4 h-4 text-medical-green" /> {new Date(ref.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        {ref.specialistNeeded && (
                                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                                                <Stethoscope className="w-4 h-4" /> REQ: {ref.specialistNeeded}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col justify-between items-end gap-6 border-l border-medical-gray pl-6">
                                                    {timer && (
                                                        <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${timer.urgent ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-500'}`}>
                                                            <RefreshCw className={`w-4 h-4 ${timer.urgent ? 'animate-spin' : ''}`} />
                                                            Next Escalation: {timer.text}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-3">
                                                        <button onClick={() => handleAccept(ref.id)}
                                                            className="px-6 py-3 rounded-medical bg-medical-blue text-white text-sm font-bold shadow-soft hover:bg-blue-700 transition-all flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" /> Accept & Reserve
                                                        </button>
                                                        <button onClick={() => handleReject(ref.id)}
                                                            className="px-6 py-3 rounded-medical bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2">
                                                            <XCircle className="w-4 h-4" /> Capacity Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Status Sections (Active & Admitted) */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-medical-blue uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Inbound Logistics ({acceptedReferrals.length})
                                </h3>
                                {acceptedReferrals.length === 0 ? (
                                    <div className="bg-medical-gray/30 rounded-medical p-8 text-center text-gray-400 text-xs font-bold">Queue Empty</div>
                                ) : (
                                    acceptedReferrals.map(ref => (
                                        <div key={ref.id} className="medical-card p-4 border border-medical-gray flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                                    <Truck className="w-5 h-5 text-medical-blue" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-medical-dark">{ref.patientName}</div>
                                                    <div className="text-[10px] uppercase font-bold text-medical-blue tracking-tighter">{ref.status}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleAdmit(ref.id)}
                                                className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-lg bg-medical-green text-white text-xs font-bold hover:scale-105 transition-all flex items-center gap-1 shadow-soft">
                                                <Heart className="w-3.5 h-3.5" /> Finalize Admission
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-medical-green uppercase tracking-widest flex items-center gap-2">
                                    <Heart className="w-4 h-4" /> Recently Admitted ({admittedReferrals.length})
                                </h3>
                                {admittedReferrals.length === 0 ? (
                                    <div className="bg-medical-gray/30 rounded-medical p-8 text-center text-gray-400 text-xs font-bold">No Recent Admissions</div>
                                ) : (
                                    admittedReferrals.slice(0, 4).map(ref => (
                                        <div key={ref.id} className="medical-card p-4 border border-medical-gray bg-green-50/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="w-5 h-5 text-medical-green" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-medical-dark">{ref.patientName}</div>
                                                        <div className="text-[10px] font-medium text-gray-400">Ward A-202 • Just Now</div>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase">Success ✓</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Resources Tab with Analytics */}
                {tab === 'resources' && (
                    <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="medical-card p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h3 className="text-xl font-bold text-medical-dark flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-medical-blue" /> Infrastructure Management
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium">Monitor and update real-time hospital capacity</p>
                                </div>
                                <button onClick={() => editMode ? handleUpdateBeds() : setEditMode(true)}
                                    className={`px-6 py-3 rounded-medical text-sm font-bold transition-all flex items-center gap-2 shadow-soft ${editMode ? 'bg-medical-green text-white hover:scale-105' : 'bg-medical-gray text-medical-dark border border-medical-gray'}`}>
                                    {editMode ? <><Save className="w-4 h-4" /> Commit Changes</> : <><RefreshCw className="w-4 h-4" /> Re-calibrate Assets</>}
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-10">
                                {[
                                    { label: 'Total Bed Count', key: 'totalBeds', icon: Bed, color: 'text-medical-blue', bg: 'bg-blue-100/30' },
                                    { label: 'ICU Critical Care', key: 'icuBeds', icon: Heart, color: 'text-red-500', bg: 'bg-red-100/30' },
                                    { label: 'Real-time Free Beds', key: 'availableBeds', icon: CheckCircle2, color: 'text-medical-green', bg: 'bg-green-100/30' },
                                ].map(field => (
                                    <div key={field.key} className="bg-medical-gray/30 rounded-2xl p-6 border border-medical-gray">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${field.bg}`}>
                                                <field.icon className={`w-5 h-5 ${field.color}`} />
                                            </div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.label}</label>
                                        </div>
                                        {editMode ? (
                                            <input type="number" value={bedForm[field.key]} onChange={e => setBedForm({ ...bedForm, [field.key]: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-medical-gray text-xl font-bold text-medical-dark focus:ring-2 focus:ring-medical-blue outline-none" />
                                        ) : (
                                            <div className="text-3xl font-bold text-medical-dark flex items-baseline gap-2">
                                                {hospital?.[field.key] || 0}
                                                <span className="text-xs font-bold text-gray-400 uppercase">Units</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Specialist Grid */}
                            <div className="border-t border-medical-gray pt-8">
                                <h4 className="text-xs font-bold text-medical-dark mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-medical-blue" /> Specialized Professional availability
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {hospital?.specialists?.map(s => (
                                        <div key={s} className="p-4 bg-white border border-medical-gray rounded-xl hover:border-medical-blue/30 transition-all flex flex-col justify-between h-24 shadow-soft">
                                            <div className="text-xs font-bold text-medical-dark leading-tight">{s}</div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="text-[10px] font-bold text-medical-blue bg-blue-50 px-2 py-0.5 rounded">
                                                    {hospital.specialistSlots?.[s] || 0} SLOTS
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Capacity Insights */}
                        <div className="medical-card p-8 bg-medical-dark text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-medical-blue opacity-5 -mr-10 -mt-10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <h3 className="text-md font-bold mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-medical-green" /> Operational Load Analytics
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Global Resource Occupancy</span>
                                            <span className="text-3xl font-black">{hospital ? Math.round(((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100) : 0}%</span>
                                        </div>
                                        <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${hospital ? ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100 : 0}%` }}
                                                className={`h-full rounded-full ${hospital && ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) > 0.85 ? 'bg-red-500' : 'bg-medical-green'} shadow-[0_0_15px_rgba(22,163,74,0.5)]`}
                                            />
                                        </div>
                                        <p className="text-[10px] font-medium opacity-40 italic">Calibration based on last 24h inbound referral telemetry</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Reservations Tab */}
                {tab === 'reservations' && (
                    <motion.div key="reservations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="medical-card p-8">
                            <h3 className="text-md font-bold text-medical-dark mb-8 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-medical-blue" /> AI Resource Allocation Logs
                            </h3>
                            {reservations.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Shield className="w-16 h-16 text-medical-gray mx-auto mb-4" />
                                    <p className="text-sm font-bold text-gray-400">No active reservations recorded.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {reservations.map(r => (
                                        <div key={r.id} className="p-5 rounded-medical border border-medical-gray hover:border-medical-blue/30 bg-white transition-all shadow-soft group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === 'Reserved' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Token ID</div>
                                                        <div className="text-xs font-bold text-medical-blue">{r.id.slice(-8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'Reserved' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                    {r.status}
                                                </span>
                                            </div>
                                            <div className="text-md font-bold text-medical-dark mb-4">{r.patientName}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {r.bedReserved && <span className="bg-blue-50 text-medical-blue px-2 py-1 rounded-md text-[9px] font-bold border border-blue-100 flex items-center gap-1"><Bed className="w-3 h-3" /> WARD BED</span>}
                                                {r.icuReserved && <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-[9px] font-bold border border-red-100 flex items-center gap-1"><Heart className="w-3 h-3" /> ICU UNIT</span>}
                                                {r.specialistReserved && <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-[9px] font-bold border border-indigo-100 flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {r.specialistReserved}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Escalations Tab */}
                {tab === 'escalations' && (
                    <motion.div key="escalations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="medical-card p-8 border-2 border-amber-100">
                            <h3 className="text-md font-bold text-amber-700 mb-8 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Automated Escalation Telemetry
                            </h3>
                            {escalationLogs.length === 0 ? (
                                <div className="text-center py-20 bg-amber-50/20 rounded-medical border border-amber-50">
                                    <Shield className="w-16 h-16 text-amber-100 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-amber-800/40">No system escalations detected.</p>
                                    <p className="text-[10px] text-amber-800/20 mt-1 uppercase tracking-widest font-bold">Safe Operations Status</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {escalationLogs.map(log => (
                                        <div key={log.id} className="p-6 rounded-medical bg-white border border-amber-100 shadow-soft relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">LOG-ES-{log.id.slice(-4).toUpperCase()}</span>
                                                        <span className="text-[10px] font-bold text-gray-400">• {new Date(log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm font-bold">
                                                        <span className="text-red-500">{log.fromHospitalName}</span>
                                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                                        <span className="text-medical-green">{log.toHospitalName}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                        Critical Reason: {log.reason}
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-soft hover:bg-amber-600 transition-all">
                                                    Investigate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;

