import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Activity, Building2, Bed, Heart, Users, Truck, Shield,
    TrendingUp, AlertTriangle, Clock, Zap, MapPin, ArrowRight, RefreshCw,
    CheckCircle2, XCircle, Eye, Bell, Globe, Target, Cpu, ShieldAlert,
    LayoutDashboard, Database, ActivitySquare, Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const { addNotification: notify } = useNotification();
    const [analytics, setAnalytics] = useState(null);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/api/analytics');
            setAnalytics(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (loading || !analytics) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    const { statusCounts, severityCounts, hospitalPerformance, timeline, predictions, regions, ambulanceStats } = analytics;

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-medical-dark rounded-2xl flex items-center justify-center text-white shadow-medical ring-4 ring-medical-dark/10">
                        <Cpu className="w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Health Command Center</h1>
                        <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                            Super Admin Pulse • <span className="text-medical-blue font-bold">{user?.name}</span> • Global Oversight
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAnalytics} className="bg-white px-5 py-2.5 rounded-medical border border-medical-gray shadow-soft flex items-center gap-3 hover:border-medical-blue/30 transition-all group">
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Last Sync</div>
                            <div className="text-xs font-bold text-medical-blue uppercase">Live Feed Active</div>
                        </div>
                        <RefreshCw className="w-4 h-4 text-medical-blue group-active:rotate-180 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-medical-gray/30 p-1.5 rounded-2xl w-fit border border-medical-gray/50">
                {[
                    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                    { id: 'hospitals', label: 'Facility Metrics', icon: Building2 },
                    { id: 'heatmap', label: 'Geospatial Flow', icon: Globe },
                    { id: 'predictions', label: 'AI Forecasting', icon: ShieldAlert },
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-medical-blue shadow-soft border border-medical-gray' : 'text-gray-400 hover:text-medical-dark'}`}>
                        <t.icon className={`w-4 h-4 ${tab === t.id ? 'text-medical-blue' : 'text-gray-300'}`} /> {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* OVERVIEW TAB */}
                {tab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { label: 'Active Referrals', value: analytics.totalReferrals, icon: Radio, color: 'text-medical-blue', bg: 'bg-blue-50/50' },
                                { label: 'Regional Beds', value: analytics.availableBeds, sub: `/${analytics.totalBeds}`, icon: Bed, color: 'text-medical-green', bg: 'bg-green-50/50' },
                                { label: 'ICU Threshold', value: analytics.availableICU, sub: `/${analytics.totalICU}`, icon: Heart, color: 'text-red-500', bg: 'bg-red-50/50' },
                                { label: 'Escalations', value: analytics.totalEscalations, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                                { label: 'Logistics Fleet', value: ambulanceStats.active, sub: `/${ambulanceStats.total}`, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                            ].map(s => (
                                <div key={s.label} className="medical-card p-5 group hover:border-medical-blue/20 transition-all">
                                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <s.icon className={`w-5 h-5 ${s.color}`} />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-medical-dark">{s.value}</span>
                                        {s.sub && <span className="text-xs font-bold text-gray-300">{s.sub}</span>}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Referral Status Distribution */}
                            <div className="medical-card p-8">
                                <h3 className="text-sm font-bold text-medical-dark mb-8 flex items-center gap-2">
                                    <ActivitySquare className="w-5 h-5 text-medical-blue" /> Referral Pipeline Analysis
                                </h3>
                                <div className="space-y-5">
                                    {Object.entries(statusCounts).map(([status, count], i) => {
                                        const maxCount = Math.max(...Object.values(statusCounts), 1);
                                        const colors = {
                                            Pending: 'bg-amber-400', Accepted: 'bg-medical-blue', Rejected: 'bg-red-400',
                                            'In Transit': 'bg-indigo-500', 'Reached Hospital': 'bg-purple-500',
                                            Admitted: 'bg-medical-green', Completed: 'bg-medical-dark'
                                        };
                                        return (
                                            <div key={status} className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-gray-400">{status}</span>
                                                    <span className="text-medical-dark">{count} Cases</span>
                                                </div>
                                                <div className="h-2 bg-medical-gray rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className={`h-full rounded-full ${colors[status] || 'bg-gray-300'}`} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Severity Distribution */}
                            <div className="medical-card p-8">
                                <h3 className="text-sm font-bold text-medical-dark mb-8 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-red-500" /> Triage Severity Matrix
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(severityCounts).map(([level, count]) => {
                                        const configs = {
                                            Critical: { bg: 'bg-red-50/50', text: 'text-red-600', border: 'border-red-100', icon: '🔴' },
                                            'High Priority': { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', icon: '🟠' },
                                            Moderate: { bg: 'bg-blue-50/50', text: 'text-medical-blue', border: 'border-blue-100', icon: '🔵' },
                                            Stable: { bg: 'bg-green-50/50', text: 'text-medical-green', border: 'border-green-100', icon: '🟢' },
                                        };
                                        const c = configs[level] || configs.Stable;
                                        return (
                                            <div key={level} className={`${c.bg} ${c.border} border-2 rounded-2xl p-5 group hover:scale-[1.02] transition-transform`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-lg">{c.icon}</span>
                                                    <span className={`text-2xl font-bold ${c.text}`}>{count}</span>
                                                </div>
                                                <div className={`text-[10px] font-bold ${c.text} uppercase tracking-widest`}>{level}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Trend Bar Chart */}
                        <div className="medical-card p-8">
                            <h3 className="text-sm font-bold text-medical-dark mb-8 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-medical-green" /> System Load Evolution
                            </h3>
                            <div className="flex items-end justify-between gap-4 h-48 px-4">
                                {timeline.map((day, i) => {
                                    const maxVal = Math.max(...timeline.map(d => d.referrals), 1);
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                            <div className="w-full relative group">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(day.referrals / maxVal) * 100}%` }}
                                                    transition={{ duration: 1, delay: i * 0.05 }}
                                                    className="w-full bg-medical-blue/20 hover:bg-medical-blue transition-colors rounded-t-xl relative border-x border-t border-medical-blue/30 group cursor-pointer min-h-[4px]"
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-medical-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-medical whitespace-nowrap">
                                                        {day.referrals} Referrals
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{day.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* HOSPITALS TAB */}
                {tab === 'hospitals' && (
                    <motion.div key="hospitals" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="medical-card p-8">
                            <h3 className="text-sm font-bold text-medical-dark mb-10 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-medical-blue" /> Facility Performance Assessment
                            </h3>
                            <div className="grid gap-6">
                                {hospitalPerformance?.sort((a, b) => b.score - a.score).map((h, i) => (
                                    <div key={h.id} className="p-6 rounded-3xl border border-medical-gray bg-white hover:border-medical-blue/30 transition-all group shadow-soft hover:shadow-medical">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-soft ${i === 0 ? 'bg-medical-green text-white' : i === 1 ? 'bg-medical-blue text-white' : 'bg-medical-gray text-gray-400'}`}>
                                                    #{i + 1}
                                                </div>
                                                <div>
                                                    <div className="text-md font-bold text-medical-dark group-hover:text-medical-blue transition-colors">{h.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                        <MapPin className="w-3.5 h-3.5" /> {h.city} • Integrated Node
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-center bg-medical-gray/30 px-6 py-2 rounded-2xl">
                                                    <div className="text-xl font-bold text-medical-dark leading-none">{h.score}</div>
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Health Score</div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    {[
                                                        { label: 'Ref', val: h.totalReferrals, bg: 'bg-blue-50', text: 'text-medical-blue' },
                                                        { label: 'Acc', val: h.accepted, bg: 'bg-green-50', text: 'text-medical-green' },
                                                        { label: 'Beds', val: h.availableBeds, bg: 'bg-teal-50', text: 'text-teal-600' },
                                                        { label: 'ICU', val: h.icuAvailable, bg: 'bg-red-50', text: 'text-red-500' }
                                                    ].map(stat => (
                                                        <div key={stat.label} className={`${stat.bg} px-3 py-1.5 rounded-xl text-center min-w-[50px]`}>
                                                            <div className={`text-xs font-bold ${stat.text}`}>{stat.val}</div>
                                                            <div className="text-[8px] font-extrabold text-gray-400 uppercase">{stat.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-medical-gray rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${h.load}%` }} transition={{ duration: 1 }}
                                                    className={`h-full rounded-full ${h.load > 85 ? 'bg-red-500' : h.load > 60 ? 'bg-amber-400' : 'bg-medical-green'}`} />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest min-w-[80px] text-right ${h.load > 85 ? 'text-red-600' : 'text-gray-400'}`}>Load: {h.load}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* HEATMAP TAB */}
                {tab === 'heatmap' && (
                    <motion.div key="heatmap" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="medical-card p-8">
                            <h3 className="text-sm font-bold text-medical-dark mb-10 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-medical-blue" /> Geospatial Referral Intensity Map
                            </h3>

                            <div className="relative bg-medical-dark rounded-3xl h-[400px] overflow-hidden mb-8 border border-medical-dark/20 shadow-inner group">
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={`v-${i}`} className="absolute bg-white h-full w-[1px]" style={{ left: `${i * 5}%` }} />
                                    ))}
                                    {[...Array(20)].map((_, i) => (
                                        <div key={`h-${i}`} className="absolute bg-white w-full h-[1px]" style={{ top: `${i * 5}%` }} />
                                    ))}
                                </div>

                                {regions.map((r, i) => {
                                    const positions = [
                                        { left: '45%', top: '40%' }, { left: '70%', top: '30%' },
                                        { left: '20%', top: '60%' }, { left: '80%', top: '65%' },
                                        { left: '30%', top: '25%' }, { left: '60%', top: '75%' },
                                    ];
                                    const pos = positions[i] || { left: '50%', top: '50%' };
                                    const intensity = Math.min(1, r.emergencies / 8);
                                    return (
                                        <div key={r.name} className="absolute group/pin cursor-pointer" style={pos}>
                                            <motion.div
                                                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                                className="absolute inset-0 rounded-full"
                                                style={{ width: 60 + r.emergencies * 6, height: 60 + r.emergencies * 6, marginLeft: -(30 + r.emergencies * 3), marginTop: -(30 + r.emergencies * 3), backgroundColor: intensity > 0.6 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)' }}
                                            />
                                            <div className="relative w-8 h-8 rounded-2xl flex items-center justify-center -ml-4 -mt-4 border-2 border-white/20 backdrop-blur-md transition-transform group-hover/pin:scale-125 shadow-2xl"
                                                style={{ backgroundColor: intensity > 0.6 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)' }}>
                                                <span className="text-[10px] font-bold text-white leading-none">{r.emergencies}</span>
                                            </div>
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-medical opacity-0 group-hover/pin:opacity-100 transition-all whitespace-nowrap z-50">
                                                <div className="text-[10px] font-bold text-medical-dark">{r.name}</div>
                                                <div className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{r.referrals} Active Units</div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="absolute top-6 left-6 flex flex-col gap-3">
                                    <div className="bg-medical-dark/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Global Scan: Processing</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {regions.sort((a, b) => b.emergencies - a.emergencies).map(r => (
                                    <div key={r.name} className="flex items-center justify-between p-4 rounded-2xl bg-medical-gray/30 border border-medical-gray/50 group hover:border-medical-blue/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-soft text-medical-blue group-hover:scale-110 transition-transform">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-medical-dark uppercase tracking-tighter">{r.name}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${r.emergencies > 5 ? 'bg-red-100 text-red-600' : 'bg-medical-blue/10 text-medical-blue'}`}>
                                            {r.emergencies} CRITICAL
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PREDICTIONS TAB */}
                {tab === 'predictions' && (
                    <motion.div key="predictions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className={`medical-card p-8 border-2 ${predictions.bedShortageRisk === 'High' ? 'border-red-200 bg-red-50/10' : 'border-medical-green/20'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-soft ${predictions.bedShortageRisk === 'High' ? 'bg-red-500 text-white' : 'bg-medical-green text-white'}`}>
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resource Exhaustion Risk</div>
                                <div className={`text-2xl font-bold ${predictions.bedShortageRisk === 'High' ? 'text-red-600' : 'text-medical-green'}`}>
                                    {predictions.bedShortageRisk} Priority
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2 font-medium">Predictive model estimates capacity limits within 12 hours based on ingress flow.</p>
                            </div>

                            <div className="medical-card p-8 border-2 border-amber-200 bg-amber-50/10">
                                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Anticipated Emergencies (24h)</div>
                                <div className="text-2xl font-bold text-amber-600">{predictions.predictedEmergencies24h} Probable</div>
                                <p className="text-[11px] text-gray-400 mt-2 font-medium">Peak Surge identified at <span className="text-amber-600 font-bold">{predictions.peakHourPrediction}</span> based on historical seasonality.</p>
                            </div>

                            <div className="medical-card p-8 border-2 border-medical-blue/20">
                                <div className="w-12 h-12 bg-medical-blue text-white rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                                    <Database className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ICU Reliability Index</div>
                                <div className="text-2xl font-bold text-medical-blue">
                                    {predictions.icuCrunchIn48h ? 'Critical Threshold' : 'Stable Reserve'}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2 font-medium">AI cross-verification indicates {predictions.icuCrunchIn48h ? 'high' : 'low'} probability of saturation within 48h.</p>
                            </div>
                        </div>

                        <div className="medical-card p-8">
                            <h3 className="text-sm font-bold text-medical-dark mb-10 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-medical-blue" /> Logistical Throughput Metrics
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Avg Ingress Lag', value: predictions.avgResponseTime, icon: Clock, color: 'text-medical-blue', bg: 'bg-blue-50' },
                                    { label: 'Transfer Latency', value: predictions.avgTransferTime, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                    { label: 'Fleet Avg ETA', value: `${ambulanceStats.avgETA} min`, icon: Target, color: 'text-medical-green', bg: 'bg-green-50' },
                                    { label: 'Mission Success', value: '98.4%', icon: CheckCircle2, color: 'text-medical-dark', bg: 'bg-gray-100' },
                                ].map(m => (
                                    <div key={m.label} className={`${m.bg} rounded-2xl p-6 group hover:scale-[1.05] transition-transform cursor-pointer shadow-soft`}>
                                        <m.icon className={`w-6 h-6 ${m.color} mb-4`} />
                                        <div className="text-xl font-bold text-medical-dark leading-none">{m.value}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Escalations List */}
                        <div className="medical-card p-8">
                            <h3 className="text-sm font-bold text-medical-dark mb-8 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" /> Automated Referral Escalations
                            </h3>
                            {analytics.escalationLogs?.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.escalationLogs.map(log => (
                                        <div key={log.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-2xl bg-white border border-medical-gray hover:border-amber-200 transition-all shadow-soft group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-medical-dark">Case Ref: {log.referralId}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-red-500 truncate max-w-[150px]">{log.fromHospitalName}</span>
                                                        <ArrowRight className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] font-bold text-medical-green truncate max-w-[150px]">{log.toHospitalName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 lg:mt-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-medical-gray/30 px-4 py-2 rounded-xl">
                                                Escalated {new Date(log.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-medical-gray/20 rounded-3xl border border-dashed border-medical-gray">
                                    <Shield className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active escalations recorded</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SuperAdminDashboard;
