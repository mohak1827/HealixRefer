import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, MapPin, CheckCircle2, Clock, AlertTriangle, Phone,
    Navigation, Activity, User, Building2, PackageCheck, Radio, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const STATUS_STEPS = ['On the way', 'Patient picked', 'Reached hospital'];

const STATUS_CONFIG = {
    'On the way': { color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
    'Patient picked': { color: 'text-healix-blue', bg: 'bg-blue-50 border-blue-200', dot: 'bg-healix-blue' },
    'Reached hospital': { color: 'text-healix-teal', bg: 'bg-teal-50 border-teal-200', dot: 'bg-healix-teal' },
};

const AmbulanceDashboard = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [available, setAvailable] = useState(true);
    const [myJobs, setMyJobs] = useState([]);
    const [pendingReferrals, setPendingReferrals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingJob, setUpdatingJob] = useState(null);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ambulance/jobs');
            setMyJobs(res.data.jobs || []);
            setPendingReferrals(res.data.pendingReferrals || []);
            const availRes = await axios.get('http://localhost:5000/api/ambulance/availability');
            setAvailable(availRes.data.available ?? true);
        } catch (err) {
            console.error('Error fetching ambulance data:', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const toggleAvailability = async () => {
        const newVal = !available;
        setAvailable(newVal);
        try {
            await axios.put('http://localhost:5000/api/ambulance/availability', { available: newVal });
            addNotification(`Status: ${newVal ? 'Available' : 'Busy'}`, newVal ? 'success' : 'warning');
        } catch (err) {
            setAvailable(!newVal);
        }
    };

    const acceptJob = async (referralId) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ambulance/jobs', { referralId });
            setMyJobs(prev => [...prev, res.data.job]);
            setPendingReferrals(prev => prev.filter(r => r.id !== referralId));
            setAvailable(false);
            addNotification('Job accepted! Navigate to patient location.', 'success');
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to accept job', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateJobStatus = async (jobId, newStatus) => {
        setUpdatingJob(jobId);
        try {
            const res = await axios.put(`http://localhost:5000/api/ambulance/jobs/${jobId}`, { status: newStatus });
            setMyJobs(prev => prev.map(j => j.id === jobId ? res.data.job : j));
            if (newStatus === 'Reached hospital') {
                setAvailable(true);
                addNotification('Job completed! Patient delivered safely.', 'success');
            } else {
                addNotification(`Status updated: ${newStatus}`, 'success');
            }
        } catch (err) {
            addNotification('Failed to update status', 'error');
        } finally {
            setUpdatingJob(null);
        }
    };

    const getNextStatus = (current) => {
        const idx = STATUS_STEPS.indexOf(current);
        return idx < STATUS_STEPS.length - 1 ? STATUS_STEPS[idx + 1] : null;
    };

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Transport Division</span>
                    </div>
                    <h1 className="text-4xl font-black text-healix-navy tracking-tight">Ambulance Hub</h1>
                    <p className="text-slate-400 text-sm font-semibold mt-1">Welcome, {user?.name}</p>
                </div>

                {/* Availability Toggle */}
                <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all cursor-pointer ${available ? 'bg-teal-50 border-healix-teal/30' : 'bg-red-50 border-urgent-red/30'}`}
                    onClick={toggleAvailability}>
                    <div className={`w-12 h-6 rounded-full transition-all relative ${available ? 'bg-healix-teal' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${available ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                    <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${available ? 'text-healix-teal' : 'text-slate-500'}`}>
                            {available ? 'Available' : 'Busy'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold">Click to toggle</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${available ? 'bg-healix-teal shadow-[0_0_8px_rgba(13,148,136,0.6)]' : 'bg-slate-300'}`} />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: 'Active Jobs', value: myJobs.filter(j => j.status !== 'Reached hospital').length, icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Completed Today', value: myJobs.filter(j => j.status === 'Reached hospital').length, icon: CheckCircle2, color: 'text-healix-teal', bg: 'bg-teal-50' },
                    { label: 'Pending Dispatch', value: pendingReferrals.length, icon: AlertTriangle, color: 'text-urgent-red', bg: 'bg-red-50' },
                ].map((stat) => (
                    <div key={stat.label} className="healix-card p-6 bg-white">
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-black text-healix-navy">{stat.value}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Active Jobs */}
            {myJobs.filter(j => j.status !== 'Reached hospital').length > 0 && (
                <div className="healix-card p-8 bg-white">
                    <h2 className="text-xl font-black text-healix-navy mb-6 flex items-center gap-3">
                        <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
                        Active Transport Jobs
                    </h2>
                    <div className="space-y-4">
                        {myJobs.filter(j => j.status !== 'Reached hospital').map(job => {
                            const conf = STATUS_CONFIG[job.status] || STATUS_CONFIG['On the way'];
                            const next = getNextStatus(job.status);
                            const stepIdx = STATUS_STEPS.indexOf(job.status);
                            return (
                                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`p-6 rounded-2xl border-2 ${conf.bg}`}>
                                    <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">{job.id}</span>
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${conf.bg} ${conf.color}`}>{job.status}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-healix-navy">{job.patientName}</h3>
                                            <p className="text-sm text-slate-500 font-semibold flex items-center gap-1 mt-1">
                                                <Building2 className="w-3.5 h-3.5" /> {job.hospital}
                                            </p>
                                        </div>
                                        {next && (
                                            <button onClick={() => updateJobStatus(job.id, next)}
                                                disabled={updatingJob === job.id}
                                                className="px-6 py-3 bg-healix-navy text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-healix-blue transition-all flex items-center gap-2 disabled:opacity-50">
                                                {updatingJob === job.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                {next}
                                            </button>
                                        )}
                                    </div>
                                    {/* Progress Steps */}
                                    <div className="flex items-center gap-2">
                                        {STATUS_STEPS.map((step, i) => (
                                            <React.Fragment key={step}>
                                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${i <= stepIdx ? conf.color : 'text-slate-300'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${i <= stepIdx ? conf.dot : 'bg-slate-200'}`} />
                                                    <span className="hidden sm:block">{step}</span>
                                                </div>
                                                {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < stepIdx ? conf.dot : 'bg-slate-200'}`} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pending Referrals — Dispatch Board */}
            <div className="healix-card p-8 bg-white">
                <h2 className="text-xl font-black text-healix-navy mb-2 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-urgent-red" />
                    Emergency Dispatch Board
                </h2>
                <p className="text-sm text-slate-400 font-semibold mb-6">Accepted referrals waiting for transport</p>

                {pendingReferrals.length === 0 ? (
                    <div className="text-center py-16">
                        <CheckCircle2 className="w-12 h-12 text-healix-teal mx-auto mb-4 opacity-30" />
                        <p className="text-slate-300 font-black text-lg">No pending dispatches</p>
                        <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest">All clear</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingReferrals.map(ref => (
                            <motion.div key={ref.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                className={`p-6 rounded-2xl border-2 flex flex-wrap gap-4 items-center justify-between ${ref.severity === 'Critical' ? 'bg-red-50 border-urgent-red/30' : ref.severity === 'Moderate' ? 'bg-amber-50 border-amber-300/30' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ref.severity === 'Critical' ? 'bg-urgent-red/10' : 'bg-amber-100'}`}>
                                        <AlertTriangle className={`w-5 h-5 ${ref.severity === 'Critical' ? 'text-urgent-red' : 'text-amber-500'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-slate-400">{ref.id}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${ref.severity === 'Critical' ? 'bg-urgent-red/10 text-urgent-red' : 'bg-amber-100 text-amber-600'}`}>{ref.severity}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-healix-navy">{ref.patientName}</h3>
                                        <p className="text-xs text-slate-500 font-semibold">{ref.symptoms}</p>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Navigation className="w-3 h-3" /> {ref.hospitalName}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => acceptJob(ref.id)} disabled={loading || !available}
                                    className="px-6 py-3 bg-urgent-red text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-urgent-red/20">
                                    <Truck className="w-4 h-4" />
                                    Accept Job
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Jobs */}
            {myJobs.filter(j => j.status === 'Reached hospital').length > 0 && (
                <div className="healix-card p-8 bg-white">
                    <h2 className="text-xl font-black text-healix-navy mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-healix-teal" />
                        Completed Transports
                    </h2>
                    <div className="space-y-3">
                        {myJobs.filter(j => j.status === 'Reached hospital').map(job => (
                            <div key={job.id} className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl border border-healix-teal/20">
                                <CheckCircle2 className="w-5 h-5 text-healix-teal" />
                                <div>
                                    <p className="font-black text-healix-navy text-sm">{job.patientName}</p>
                                    <p className="text-xs text-slate-500">Delivered to {job.hospital}</p>
                                </div>
                                <span className="ml-auto text-[10px] font-black text-healix-teal uppercase tracking-wide">Done</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AmbulanceDashboard;
