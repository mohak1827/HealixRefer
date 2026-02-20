import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    BarChart3, Users, ClipboardList, TrendingUp, CheckCircle2,
    XCircle, Clock, AlertTriangle, Activity, Globe, Shield, Building2, Star, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNotification } from '../../context/NotificationContext';

const TABS = [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'referrals', label: 'All Referrals', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const SEVERITY_COLORS = {
    Critical: '#E11D48',
    Moderate: '#F59E0B',
    Stable: '#0D9488',
};

const PIE_COLORS = ['#0D9488', '#E11D48', '#F59E0B'];

const SuperAdminDashboard = ({ activeTab: externalTab }) => {
    const { addNotification } = useNotification();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (externalTab && ['overview', 'hospitals', 'referrals', 'analytics'].includes(externalTab)) {
            setTab(externalTab);
        }
    }, [externalTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, hospsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/superadmin/stats'),
                axios.get('http://localhost:5000/api/superadmin/hospitals'),
            ]);
            setStats(statsRes.data);
            setHospitals(hospsRes.data);
        } catch (err) {
            console.error('SuperAdmin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const toggleApproval = async (hospitalId, currentApproved) => {
        try {
            await axios.put(`http://localhost:5000/api/superadmin/hospitals/${hospitalId}/approve`, { approved: !currentApproved });
            setHospitals(prev => prev.map(h => h.id === hospitalId ? { ...h, approved: !currentApproved } : h));
            addNotification(`Hospital ${!currentApproved ? 'approved' : 'suspended'}`, 'success');
        } catch (err) {
            addNotification('Failed to update hospital status', 'error');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-2 border-healix-blue/20 border-t-healix-blue rounded-full animate-spin" />
        </div>
    );

    const statusData = stats ? [
        { name: 'Accepted', value: stats.acceptedReferrals, color: '#0D9488' },
        { name: 'Rejected', value: stats.rejectedReferrals, color: '#E11D48' },
        { name: 'Pending', value: stats.pendingReferrals, color: '#F59E0B' },
    ] : [];

    const severityData = stats ? [
        { name: 'Critical', value: stats.criticalCases, fill: '#E11D48' },
        { name: 'Moderate', value: stats.moderateCases, fill: '#F59E0B' },
        { name: 'Stable', value: stats.stableCases, fill: '#0D9488' },
    ] : [];

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-urgent-red rounded-full" />
                    <span className="text-[10px] font-black text-urgent-red uppercase tracking-[0.3em]">Executive Tier</span>
                </div>
                <h1 className="text-4xl font-black text-healix-navy tracking-tight">Super Admin Panel</h1>
                <p className="text-slate-400 text-sm font-semibold mt-1">System-wide oversight and control</p>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${tab === t.id ? 'bg-white text-healix-navy shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'overview' && stats && (
                <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Referrals', value: stats.totalReferrals, icon: ClipboardList, color: 'text-healix-blue', bg: 'bg-blue-50' },
                            { label: 'Success Rate', value: `${stats.successRate}%`, icon: TrendingUp, color: 'text-healix-teal', bg: 'bg-teal-50' },
                            { label: 'Avg Transport', value: stats.avgTransportTime, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { label: 'Hospitals', value: stats.approvedHospitals, icon: Building2, color: 'text-urgent-red', bg: 'bg-red-50' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="healix-card p-6 bg-white">
                                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <p className="text-3xl font-black text-healix-navy">{stat.value}</p>
                                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Referral Status Breakdown */}
                        <div className="healix-card p-8 bg-white">
                            <h3 className="text-lg font-black text-healix-navy mb-6">Referral Status Split</h3>
                            <div className="flex items-center justify-center">
                                <PieChart width={220} height={220}>
                                    <Pie data={statusData} cx={110} cy={110} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={4}>
                                        {statusData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </div>
                            <div className="flex justify-center gap-6 mt-2">
                                {statusData.map(d => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                        <span className="text-xs font-bold text-slate-500">{d.name} ({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Emergency Case Types */}
                        <div className="healix-card p-8 bg-white">
                            <h3 className="text-lg font-black text-healix-navy mb-6">Emergency Distribution</h3>
                            <div className="space-y-4">
                                {severityData.map(d => (
                                    <div key={d.name}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs font-black uppercase tracking-wide" style={{ color: d.fill }}>{d.name}</span>
                                            <span className="text-xs font-black text-slate-600">{d.value} cases</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.totalReferrals ? (d.value / stats.totalReferrals) * 100 : 0}%` }}
                                                transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: d.fill }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="healix-card p-8 bg-white">
                        <h3 className="text-lg font-black text-healix-navy mb-6">Weekly Referral Activity</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontWeight: 700 }} />
                                <Bar dataKey="referrals" fill="#2563EB" radius={[6, 6, 0, 0]} name="Referrals" />
                                <Bar dataKey="accepted" fill="#0D9488" radius={[6, 6, 0, 0]} name="Accepted" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* HOSPITALS TAB */}
            {tab === 'hospitals' && (
                <div className="healix-card p-8 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-healix-navy">Hospital Registry</h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border">{hospitals.length} total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {['Hospital', 'City', 'ICU Beds', 'General Beds', 'Specialists', 'Status', 'Action'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {hospitals.map(h => (
                                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-healix-navy">{h.name}</td>
                                        <td className="py-4 px-4 text-slate-500 font-semibold">{h.city}</td>
                                        <td className="py-4 px-4">
                                            <span className={`font-black ${h.icuBeds > 5 ? 'text-healix-teal' : h.icuBeds > 0 ? 'text-amber-500' : 'text-urgent-red'}`}>{h.icuBeds}</span>
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-slate-600">{h.generalBeds}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {h.specialists.slice(0, 2).map(s => (
                                                    <span key={s} className="text-[9px] font-black bg-blue-50 text-healix-blue px-2 py-0.5 rounded-full">{s}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${h.approved ? 'bg-teal-50 text-healix-teal' : 'bg-red-50 text-urgent-red'}`}>
                                                {h.approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => toggleApproval(h.id, h.approved)}
                                                className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all ${h.approved ? 'bg-red-50 text-urgent-red hover:bg-urgent-red hover:text-white' : 'bg-teal-50 text-healix-teal hover:bg-healix-teal hover:text-white'}`}>
                                                {h.approved ? 'Suspend' : 'Approve'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* REFERRALS TAB */}
            {tab === 'referrals' && stats && (
                <div className="healix-card p-8 bg-white">
                    <h3 className="text-xl font-black text-healix-navy mb-6">All System Referrals</h3>
                    <div className="space-y-3">
                        {(stats.allReferrals || []).map(ref => (
                            <div key={ref.id} className="flex flex-wrap gap-4 items-center p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-healix-teal/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${ref.severity === 'Critical' ? 'bg-urgent-red/10' : ref.severity === 'Moderate' ? 'bg-amber-50' : 'bg-teal-50'}`}>
                                        <AlertTriangle className={`w-4 h-4 ${ref.severity === 'Critical' ? 'text-urgent-red' : ref.severity === 'Moderate' ? 'text-amber-500' : 'text-healix-teal'}`} />
                                    </div>
                                    <div>
                                        <p className="font-black text-healix-navy text-sm">{ref.patientName}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">{ref.doctorName}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${ref.severity === 'Critical' ? 'bg-urgent-red/10 text-urgent-red' : ref.severity === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-healix-teal'}`}>{ref.severity}</span>
                                <span className="text-xs text-slate-500 font-semibold flex-1">{ref.hospitalName}</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${ref.status === 'Accepted' ? 'bg-teal-50 text-healix-teal border-healix-teal/20' : ref.status === 'Rejected' ? 'bg-red-50 text-urgent-red border-urgent-red/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                    {ref.status}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">{new Date(ref.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ANALYTICS TAB */}
            {tab === 'analytics' && stats && (
                <div className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { label: 'Success Rate', value: `${stats.successRate}%`, desc: 'Referrals accepted', trend: '+5% vs last week', color: 'text-healix-teal' },
                            { label: 'Avg Transport', value: '24m', desc: 'Mean arrival time', trend: '-3m improvement', color: 'text-healix-blue' },
                            { label: 'Critical Cases', value: stats.criticalCases, desc: 'Requiring ICU', trend: `Total: ${stats.totalReferrals}`, color: 'text-urgent-red' },
                        ].map(m => (
                            <div key={m.label} className="healix-card p-6 bg-white">
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">{m.label}</p>
                                <p className={`text-4xl font-black ${m.color}`}>{m.value}</p>
                                <p className="text-xs text-slate-400 font-semibold mt-1">{m.desc}</p>
                                <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-wide">{m.trend}</p>
                            </div>
                        ))}
                    </div>

                    <div className="healix-card p-8 bg-white">
                        <h3 className="text-lg font-black text-healix-navy mb-6">Weekly Volume & Acceptance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontWeight: 700 }} />
                                <Bar dataKey="referrals" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Total" />
                                <Bar dataKey="accepted" fill="#0D9488" radius={[6, 6, 0, 0]} name="Accepted" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
