import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, MapPin, User, Clock, CheckCircle2, ArrowRight, Building2,
    Navigation, Phone, AlertTriangle, RefreshCw, Zap, Activity,
    CircleDot, Bell, Shield, Info, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const STATUS_FLOW = ['Assigned', 'On the Way', 'Reached', 'Completed'];

const AmbulanceDashboard = () => {
    const { user } = useAuth();
    const { addNotification: notify } = useNotification();
    const [data, setData] = useState({ assignments: [], availableReferrals: [] });
    const [gpsData, setGpsData] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [assignRes, notifRes] = await Promise.all([
                axios.get('/api/ambulance/assignments'),
                axios.get('/api/notifications')
            ]);
            setData(assignRes.data);
            setNotifications(notifRes.data);

            for (const a of assignRes.data.assignments) {
                if (a.status !== 'Completed') {
                    try {
                        const gpsRes = await axios.get(`/api/ambulance/gps/${a.id}`);
                        if (gpsRes.data) {
                            setGpsData(prev => ({ ...prev, [a.id]: gpsRes.data }));
                        }
                    } catch (e) { }
                }
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleAcceptTransfer = async (referralId) => {
        try {
            await axios.post('/api/ambulance/accept', { referralId });
            notify('Transfer accepted! GPS tracking started.', 'success');
            fetchData();
        } catch (err) { notify('Failed to accept transfer', 'error'); }
    };

    const handleUpdateStatus = async (assignmentId, newStatus) => {
        try {
            await axios.put(`/api/ambulance/status/${assignmentId}`, { status: newStatus });
            notify(`Status updated: ${newStatus}`, 'success');
            fetchData();
        } catch (err) { notify('Failed to update status', 'error'); }
    };

    const getNextStatus = (current) => {
        const idx = STATUS_FLOW.indexOf(current);
        return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Assigned': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Clock };
            case 'On the Way': return { bg: 'bg-blue-50', text: 'text-medical-blue', border: 'border-blue-100', icon: Truck };
            case 'Reached': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: MapPin };
            case 'Completed': return { bg: 'bg-green-50', text: 'text-medical-green', border: 'border-green-100', icon: CheckCircle2 };
            default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', icon: CircleDot };
        }
    };

    const activeAssignment = data.assignments.find(a => a.status !== 'Completed');
    const completedAssignments = data.assignments.filter(a => a.status === 'Completed');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-medical-blue rounded-2xl flex items-center justify-center text-white shadow-medical">
                        <Truck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark leading-tight">Emergency Logistics</h1>
                        <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            Veh: <span className="text-medical-blue font-bold">{user?.vehicleNo || 'PF-042'}</span> • {user?.name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white border border-medical-gray px-4 py-2 rounded-medical shadow-soft flex items-center gap-3">
                        <div className="w-2 h-2 bg-medical-green rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-medical-dark tracking-tight uppercase">System Online</span>
                    </div>
                </div>
            </div>

            {/* Emergency Broadcasts */}
            <AnimatePresence>
                {notifications.filter(n => !n.read).slice(0, 1).map(n => (
                    <motion.div key={n.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="mb-6 p-4 rounded-medical bg-red-50 border border-red-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-red-700">{n.title}</div>
                            <div className="text-xs text-red-600 font-medium">{n.message}</div>
                        </div>
                        <button onClick={async () => { await axios.put(`/api/notifications/${n.id}/read`); fetchData(); }}
                            className="p-2 hover:bg-red-100 rounded-full text-red-400 transition-colors">✕</button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Main Content Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Active Mission or Available Pool */}
                <div className="lg:col-span-2 space-y-6">
                    {activeAssignment ? (
                        <>
                            {/* Mission Control Card */}
                            <div className="medical-card p-8 border-2 border-medical-blue/20">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-md font-bold text-medical-dark flex items-center gap-2">
                                        <Navigation className="w-5 h-5 text-medical-blue" /> Live Mission Tracking
                                    </h3>
                                    <div className="px-3 py-1 bg-medical-blue/10 text-medical-blue text-[10px] font-bold rounded-full uppercase tracking-widest border border-medical-blue/20">
                                        Mission ID: {activeAssignment.id}
                                    </div>
                                </div>

                                {/* Modernized GPS Map */}
                                <div className="relative bg-[#0F172A] rounded-2xl h-80 overflow-hidden mb-8 shadow-2xl border border-white/5">
                                    {/* Map Grid */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                                    {/* Path Visualization */}
                                    <svg className="absolute inset-0 w-full h-full">
                                        <path d="M 80 240 Q 180 220 280 180 Q 380 120 480 80" stroke="#334155" strokeWidth="6" fill="none" strokeLinecap="round" />
                                        <motion.path d="M 80 240 Q 180 220 280 180 Q 380 120 480 80" stroke="#16A34A" strokeWidth="6" fill="none" strokeLinecap="round"
                                            initial={{ pathLength: 0 }} animate={{ pathLength: (gpsData[activeAssignment.id]?.progress || 0) / 100 }} transition={{ duration: 1.5 }} />
                                    </svg>

                                    {/* Pickup Visual */}
                                    <div className="absolute left-[10%] top-[70%] text-center">
                                        <div className="w-10 h-10 bg-medical-green rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.4)] border-4 border-slate-900 group cursor-help">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="mt-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold text-white border border-white/10">{activeAssignment.pickupLocation}</div>
                                    </div>

                                    {/* Drop visual */}
                                    <div className="absolute left-[85%] top-[20%] text-center">
                                        <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] border-4 border-slate-900">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="mt-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold text-white border border-white/10">{activeAssignment.hospitalName}</div>
                                    </div>

                                    {/* Ambulance Marker */}
                                    <motion.div
                                        animate={{
                                            left: `${10 + (gpsData[activeAssignment.id]?.progress || 0) * 0.77}%`,
                                            bottom: `${20 + (gpsData[activeAssignment.id]?.progress || 0) * 0.55}%`
                                        }}
                                        transition={{ duration: 2 }}
                                        className="absolute z-50 transform -translate-x-1/2 -translate-y-1/2"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-medical-blue">
                                                <Truck className="w-6 h-6 text-medical-blue" />
                                            </div>
                                            <div className="absolute -inset-2 bg-medical-blue/20 rounded-full animate-ping -z-10" />
                                        </div>
                                    </motion.div>

                                    {/* Overlays */}
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg p-3">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Speed Performance</div>
                                            <div className="text-2xl font-black text-white">{gpsData[activeAssignment.id]?.speed || '00'} <span className="text-xs font-medium text-gray-500">km/h</span></div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 right-6 bg-medical-green/90 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white">
                                        <div className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Est. Time Remaining</div>
                                        <div className="text-2xl font-black">{gpsData[activeAssignment.id]?.etaMinutes || '0'} <span className="text-xs">MIN</span></div>
                                    </div>
                                </div>

                                {/* Mission Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Patient Name', value: activeAssignment.patientName, icon: User, color: 'text-medical-blue' },
                                        { label: 'Target Facility', value: activeAssignment.hospitalName, icon: Building2, color: 'text-medical-blue' },
                                        { label: 'Current Progress', value: `${gpsData[activeAssignment.id]?.progress || 0}%`, icon: Activity, color: 'text-medical-green' },
                                        { label: 'Mission Status', value: activeAssignment.status, icon: CircleDot, color: getStatusStyle(activeAssignment.status).text },
                                    ].map(stat => (
                                        <div key={stat.label} className="bg-medical-gray/50 border border-medical-gray rounded-medical p-4">
                                            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-tighter">{stat.label}</div>
                                            <div className="text-sm font-bold text-medical-dark truncate">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Control Actions & Flow */}
                            <div className="medical-card p-8">
                                <h3 className="text-md font-bold text-medical-dark mb-6 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-medical-blue" /> Mission Status Control
                                </h3>

                                <div className="flex flex-wrap items-center gap-3 mb-8">
                                    {STATUS_FLOW.map((s, i) => {
                                        const idx = STATUS_FLOW.indexOf(activeAssignment.status);
                                        const isActive = i <= idx;
                                        const isCurrent = i === idx;
                                        const style = getStatusStyle(s);

                                        return (
                                            <React.Fragment key={s}>
                                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${isCurrent ? `${style.bg} ${style.text} ${style.border} ring-2 ring-current ring-offset-2` : isActive ? `${style.bg} ${style.text} ${style.border}` : 'bg-medical-gray text-gray-400 border-medical-gray'}`}>
                                                    {isActive ? <CheckCircle2 className="w-4 h-4" /> : <CircleDot className="w-4 h-4" />}
                                                    {s}
                                                </div>
                                                {i < STATUS_FLOW.length - 1 && <ArrowRight className={`w-4 h-4 ${isActive ? 'text-medical-blue' : 'text-medical-gray'}`} />}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {getNextStatus(activeAssignment.status) && (
                                    <button onClick={() => handleUpdateStatus(activeAssignment.id, getNextStatus(activeAssignment.status))}
                                        className="w-full py-4 rounded-medical bg-medical-blue text-white font-bold text-md shadow-medical hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                        <ArrowRight className="w-6 h-6" /> Transition to: {getNextStatus(activeAssignment.status)}
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="medical-card p-12 text-center border-2 border-dashed border-medical-gray">
                            <Truck className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-medical-dark mb-2">No Active Mission</h3>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">You are currently on standby. New transfer requests from hospitals will appear in your queue.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Available Queue & History */}
                <div className="space-y-6">
                    {/* Available Pool */}
                    <div className="medical-card p-6">
                        <h3 className="text-sm font-bold text-medical-dark mb-5 flex items-center gap-2 uppercase tracking-tight">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Pending Dispatch
                        </h3>
                        {data.availableReferrals.length === 0 ? (
                            <div className="bg-medical-gray/50 rounded-medical p-8 text-center border border-medical-gray">
                                <CheckCircle2 className="w-8 h-8 text-medical-green/30 mx-auto mb-3" />
                                <p className="text-xs font-bold text-gray-400">Queue Clear</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.availableReferrals.map(ref => (
                                    <motion.div key={ref.id} className="p-4 rounded-medical border border-medical-gray bg-white hover:border-medical-blue transition-all" whileHover={{ x: 3 }}>
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-[10px] font-bold text-medical-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{ref.id}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ref.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
                                                {ref.urgency}
                                            </span>
                                        </div>
                                        <div className="text-sm font-bold text-medical-dark mb-2">{ref.patientName}</div>
                                        <div className="flex flex-col gap-1.5 mb-4">
                                            <div className="text-[10px] font-medium text-gray-400 flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-medical-green" /> {ref.patientVillage || 'Base Point'}
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-400 flex items-center gap-2">
                                                <Building2 className="w-3 h-3 text-medical-blue" /> {ref.hospitalName}
                                            </div>
                                        </div>
                                        <button onClick={() => handleAcceptTransfer(ref.id)}
                                            className="w-full py-2 bg-medical-dark text-white rounded-medical text-xs font-bold hover:bg-medical-blue transition-all shadow-soft flex items-center justify-center gap-2">
                                            <Truck className="w-3.5 h-3.5" /> Accept Mission
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {completedAssignments.length > 0 && (
                        <div className="medical-card p-6">
                            <h3 className="text-sm font-bold text-medical-dark mb-4 flex items-center gap-2 uppercase tracking-tight">
                                <Activity className="w-4 h-4 text-medical-green" /> Recent Log
                            </h3>
                            <div className="space-y-3">
                                {completedAssignments.slice(0, 3).map(a => (
                                    <div key={a.id} className="p-3 rounded-medical bg-medical-gray/30 border border-medical-gray">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-medical-dark truncate max-w-[120px]">{a.patientName}</span>
                                            <span className="text-[9px] font-bold text-medical-green uppercase tracking-tighter bg-green-50 px-2 py-0.5 rounded">Delivered ✓</span>
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-medium">{a.hospitalName}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Contacts */}
                    <div className="bg-medical-blue rounded-medical p-6 text-white shadow-medical">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Support Hotline</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-medium opacity-80">Command Center</div>
                                <div className="text-md font-bold text-white">1800-419-8666</div>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold transition-all border border-white/20">
                            Emergency Protocols
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmbulanceDashboard;

