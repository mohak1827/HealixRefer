import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, Users, Clock, Shield, TrendingUp, AlertCircle,
    Bed, Stethoscope, Truck, CheckCircle, XCircle, ClipboardList,
    AlertTriangle, CheckCircle2, Building2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const STATUS_COLORS = {
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Accepted: 'bg-teal-50 text-healix-teal border-healix-teal/20',
    Rejected: 'bg-red-50 text-urgent-red border-urgent-red/20',
};

const chartData = [
    { name: 'Mon', referrals: 40 }, { name: 'Tue', referrals: 30 },
    { name: 'Wed', referrals: 55 }, { name: 'Thu', referrals: 45 },
    { name: 'Fri', referrals: 70 }, { name: 'Sat', referrals: 25 },
    { name: 'Sun', referrals: 15 },
];

const TABS = ['Overview', 'Referrals', 'Beds'];

const AdminDashboard = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [stats, setStats] = useState(null);
    const [myHospital, setMyHospital] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('Overview');
    const [processingId, setProcessingId] = useState(null);
    const [bedValues, setBedValues] = useState({ icuBeds: 0, generalBeds: 0, oxygenBeds: 0 });
    const [updatingBeds, setUpdatingBeds] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, hospitalsRes, referralsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats'),
                axios.get('http://localhost:5000/api/hospitals'),
                axios.get('http://localhost:5000/api/referrals'),
            ]);
            setStats(statsRes.data);
            const hospital = hospitalsRes.data[0];
            setMyHospital(hospital);
            if (hospital) {
                setBedValues({ icuBeds: hospital.icuBeds, generalBeds: hospital.generalBeds, oxygenBeds: hospital.oxygenBeds || 0 });
            }
            setReferrals(referralsRes.data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAccept = async (referralId) => {
        setProcessingId(referralId);
        try {
            await axios.put(`http://localhost:5000/api/referrals/${referralId}/accept`, { notes: 'Bed allocated. Please proceed.' });
            setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: 'Accepted', notes: 'Bed allocated. Please proceed.' } : r));
            addNotification(`Referral ${referralId} accepted`, 'success');
        } catch (err) {
            addNotification('Failed to accept referral', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (referralId) => {
        setProcessingId(referralId);
        try {
            await axios.put(`http://localhost:5000/api/referrals/${referralId}/reject`, { reason: 'Hospital capacity full at this time.' });
            setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: 'Rejected' } : r));
            addNotification(`Referral ${referralId} rejected`, 'warning');
        } catch (err) {
            addNotification('Failed to reject referral', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdateBeds = async () => {
        setUpdatingBeds(true);
        try {
            await axios.put('http://localhost:5000/api/admin/hospital', {
                hospitalId: myHospital?.id,
                updates: bedValues,
            });
            addNotification('Bed availability updated successfully', 'success');
        } catch (err) {
            addNotification('Failed to update beds', 'error');
        } finally {
            setUpdatingBeds(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-2 border-healix-blue/20 border-t-healix-blue rounded-full animate-spin" />
        </div>
    );

    const pendingCount = referrals.filter(r => r.status === 'Pending').length;

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-6 bg-healix-blue rounded-full" />
                        <span className="text-[10px] font-black text-healix-blue uppercase tracking-[0.3em]">Hospital Command</span>
                    </div>
                    <h1 className="text-4xl font-black text-healix-navy tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-400 text-sm font-semibold mt-1">{myHospital?.name || 'Hospital Management'}</p>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 hover:border-healix-blue/30 hover:text-healix-blue transition-all shadow-sm">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'Total Referrals', value: stats?.totalReferrals ?? 0, icon: ClipboardList, color: 'text-healix-blue', bg: 'bg-blue-50' },
                    { label: 'Pending', value: pendingCount, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', alert: pendingCount > 0 },
                    { label: 'Accepted', value: stats?.acceptedReferrals ?? 0, icon: CheckCircle2, color: 'text-healix-teal', bg: 'bg-teal-50' },
                    { label: 'ICU Available', value: bedValues.icuBeds, icon: Bed, color: bedValues.icuBeds > 3 ? 'text-healix-teal' : 'text-urgent-red', bg: bedValues.icuBeds > 3 ? 'bg-teal-50' : 'bg-red-50' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className={`healix-card p-6 bg-white ${s.alert ? 'border-amber-300/50 shadow-amber-100' : ''}`}>
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <p className="text-3xl font-black text-healix-navy">{s.value}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1">{s.label}</p>
                        {s.alert && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse absolute top-4 right-4" />}
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all relative ${tab === t ? 'bg-white text-healix-navy shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        {t}
                        {t === 'Referrals' && pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'Overview' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 healix-card p-8 bg-white">
                        <h3 className="text-lg font-black text-healix-navy mb-6">Weekly Referral Volume</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontWeight: 700 }} />
                                <Bar dataKey="referrals" fill="#2563EB" radius={[6, 6, 0, 0]} name="Referrals" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="healix-card p-8 bg-white">
                        <h3 className="text-lg font-black text-healix-navy mb-6">Bed Summary</h3>
                        <div className="space-y-5">
                            {[
                                { label: 'ICU Beds', value: bedValues.icuBeds, max: 20, color: 'bg-urgent-red', icon: Bed },
                                { label: 'General Beds', value: bedValues.generalBeds, max: 60, color: 'bg-healix-blue', icon: Users },
                                { label: 'Oxygen Beds', value: bedValues.oxygenBeds, max: 20, color: 'bg-healix-teal', icon: Activity },
                            ].map(b => (
                                <div key={b.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-wide">{b.label}</span>
                                        <span className="text-sm font-black text-healix-navy">{b.value} <span className="text-slate-300 text-xs">/ {b.max}</span></span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((b.value / b.max) * 100, 100)}%` }}
                                            transition={{ duration: 0.8 }} className={`h-full ${b.color} rounded-full`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-healix-navy rounded-2xl">
                            <p className="text-[10px] text-healix-teal font-black uppercase tracking-widest mb-1">HIGH LOAD PERIOD</p>
                            <p className="text-xs text-slate-400 font-semibold">Peak hours: 10am–2pm. Consider diverting non-critical referrals.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* REFERRALS TAB */}
            {tab === 'Referrals' && (
                <div className="healix-card p-8 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-healix-navy">Incoming Referral Requests</h2>
                        {pendingCount > 0 && (
                            <span className="text-xs font-black bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 rounded-xl">{pendingCount} pending</span>
                        )}
                    </div>

                    {referrals.length === 0 ? (
                        <div className="text-center py-20">
                            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-300 font-black text-lg">No referrals yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {referrals.map(ref => (
                                <motion.div key={ref.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    className={`p-6 rounded-2xl border transition-all ${ref.status === 'Pending' ? 'bg-amber-50/30 border-amber-200/50' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex flex-wrap gap-4 items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ref.severity === 'Critical' ? 'bg-urgent-red/10' : ref.severity === 'Moderate' ? 'bg-amber-50' : 'bg-teal-50'}`}>
                                                <AlertTriangle className={`w-5 h-5 ${ref.severity === 'Critical' ? 'text-urgent-red' : ref.severity === 'Moderate' ? 'text-amber-500' : 'text-healix-teal'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-slate-400">{ref.id}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${STATUS_COLORS[ref.status]}`}>{ref.status}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${ref.severity === 'Critical' ? 'bg-urgent-red/10 text-urgent-red' : 'bg-amber-50 text-amber-600'}`}>{ref.severity}</span>
                                                </div>
                                                <h3 className="text-lg font-black text-healix-navy">{ref.patientName}, {ref.age}yrs</h3>
                                                <p className="text-xs text-slate-500 font-semibold mt-0.5">{ref.symptoms}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    <span className="font-black">Specialist needed:</span> {ref.specialistNeeded}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    <span className="font-black">Referred by:</span> {ref.doctorName}
                                                </p>
                                                {ref.notes && (
                                                    <p className="text-xs text-healix-teal font-semibold mt-1">{ref.notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        {ref.status === 'Pending' && (
                                            <div className="flex gap-3">
                                                <button onClick={() => handleAccept(ref.id)}
                                                    disabled={processingId === ref.id}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-healix-teal text-white rounded-xl font-black text-xs uppercase tracking-wide hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-healix-teal/20">
                                                    {processingId === ref.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={15} />}
                                                    Accept
                                                </button>
                                                <button onClick={() => handleReject(ref.id)}
                                                    disabled={processingId === ref.id}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-urgent-red text-white rounded-xl font-black text-xs uppercase tracking-wide hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-urgent-red/20">
                                                    <XCircle size={15} />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {ref.status !== 'Pending' && (
                                            <span className="text-[10px] text-slate-400 font-semibold">{new Date(ref.createdAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* BEDS TAB */}
            {tab === 'Beds' && (
                <div className="healix-card p-8 bg-white">
                    <h2 className="text-xl font-black text-healix-navy mb-2">Real-Time Bed Management</h2>
                    <p className="text-sm text-slate-400 font-semibold mb-8">Update live availability — visible to all referring doctors instantly</p>
                    <div className="space-y-6 max-w-lg">
                        {[
                            { key: 'icuBeds', label: 'ICU Beds', icon: Bed, color: 'text-urgent-red', desc: 'Critical care units' },
                            { key: 'generalBeds', label: 'General Beds', icon: Users, color: 'text-healix-blue', desc: 'Standard ward beds' },
                            { key: 'oxygenBeds', label: 'Oxygen Beds', icon: Activity, color: 'text-healix-teal', desc: 'With O2 support' },
                        ].map(bed => (
                            <div key={bed.key} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <bed.icon className={`w-5 h-5 ${bed.color}`} />
                                    <div>
                                        <p className="text-sm font-black text-healix-navy">{bed.label}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">{bed.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setBedValues(prev => ({ ...prev, [bed.key]: Math.max(0, prev[bed.key] - 1) }))}
                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-black text-lg text-slate-600 hover:border-slate-300 transition-all flex items-center justify-center">−</button>
                                    <input type="number" value={bedValues[bed.key]}
                                        onChange={e => setBedValues(prev => ({ ...prev, [bed.key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                        className="w-20 text-center text-2xl font-black text-healix-navy bg-white border border-slate-200 rounded-xl py-2 outline-none focus:border-healix-teal focus:ring-4 focus:ring-healix-teal/5" />
                                    <button onClick={() => setBedValues(prev => ({ ...prev, [bed.key]: prev[bed.key] + 1 }))}
                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-black text-lg text-slate-600 hover:border-slate-300 transition-all flex items-center justify-center">+</button>
                                    <span className="text-sm text-slate-400 font-semibold">available</span>
                                </div>
                            </div>
                        ))}

                        <button onClick={handleUpdateBeds} disabled={updatingBeds}
                            className="w-full bg-healix-navy text-white font-black py-4 rounded-2xl hover:bg-healix-blue transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase shadow-xl disabled:opacity-60">
                            {updatingBeds ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={20} />}
                            Update Live Availability
                        </button>

                        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                            Last synced: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
