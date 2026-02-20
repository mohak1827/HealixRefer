import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, Building2, Bed, Truck, Users, Zap, ShieldCheck, BarChart3, Clock } from 'lucide-react';

const StressIndex = () => {
    const [hospitals, setHospitals] = useState([
        { id: 1, name: 'City General Hospital', beds: 8, maxBeds: 20, staff: 45, maxStaff: 60, ambulances: 4, maxAmb: 6, waitTime: 22, referralsToday: 18 },
        { id: 2, name: 'District Medical Center', beds: 3, maxBeds: 12, staff: 18, maxStaff: 30, ambulances: 2, maxAmb: 3, waitTime: 45, referralsToday: 12 },
        { id: 3, name: 'Rural Health Institute', beds: 0, maxBeds: 6, staff: 8, maxStaff: 15, ambulances: 1, maxAmb: 2, waitTime: 60, referralsToday: 22 },
        { id: 4, name: "St. Mary's Specialty", beds: 12, maxBeds: 30, staff: 58, maxStaff: 80, ambulances: 5, maxAmb: 8, waitTime: 15, referralsToday: 8 },
        { id: 5, name: 'Community Care Hospital', beds: 5, maxBeds: 15, staff: 22, maxStaff: 35, ambulances: 3, maxAmb: 4, waitTime: 30, referralsToday: 14 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHospitals(prev => prev.map(h => ({
                ...h,
                beds: Math.max(0, Math.min(h.maxBeds, h.beds + Math.floor(Math.random() * 3) - 1)),
                waitTime: Math.max(5, h.waitTime + Math.floor(Math.random() * 11) - 5),
                referralsToday: h.referralsToday + (Math.random() > 0.7 ? 1 : 0),
            })));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const getStress = (h) => {
        const bedRatio = 1 - (h.beds / h.maxBeds);
        const staffRatio = 1 - (h.staff / h.maxStaff);
        const waitFactor = Math.min(1, h.waitTime / 60);
        const score = Math.round((bedRatio * 40 + staffRatio * 30 + waitFactor * 30));
        const level = score >= 70 ? 'Critical' : score >= 40 ? 'Elevated' : 'Stable';
        const color = level === 'Critical' ? 'urgent-red' : level === 'Elevated' ? 'warning-amber' : 'medical-teal';
        return { score, level, color };
    };

    const regionAvg = Math.round(hospitals.reduce((s, h) => s + getStress(h).score, 0) / hospitals.length);

    return (
        <div className="space-y-10 pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                        <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.4em]">Infrastructure Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-healix-navy tracking-tight leading-none text-gradient-primary">Regional Stress Index</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Synthetic Resource Monitoring Layer</p>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-white/50 backdrop-blur p-2 rounded-[24px] border border-slate-100 shadow-healix-sm">
                    <div className="px-5 py-2.5 rounded-2xl bg-healix-navy text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-healix-navy/10">
                        Live Stream
                    </div>
                    <div className="flex items-center gap-4 pr-4">
                        <div className="w-2 h-2 rounded-full bg-medical-teal animate-pulse" />
                        <span className="text-[10px] font-black text-healix-navy uppercase tracking-widest">Network Synchronized</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Network Load', value: `${regionAvg}%`, icon: BarChart3, color: regionAvg > 60 ? 'text-urgent-red' : 'text-medical-teal', bg: regionAvg > 60 ? 'bg-urgent-red/10' : 'bg-medical-teal/10', trend: '+2.4%' },
                    { label: 'Available Beds', value: hospitals.reduce((s, h) => s + h.beds, 0), icon: Bed, color: 'text-healix-teal', bg: 'bg-healix-teal/10', trend: '-12' },
                    { label: 'Node Transit', value: hospitals.reduce((s, h) => s + h.ambulances, 0), icon: Truck, color: 'text-warning-amber', bg: 'bg-warning-amber/10', trend: '+4' },
                    { label: 'Cumulative Syncs', value: hospitals.reduce((s, h) => s + h.referralsToday, 0), icon: Activity, color: 'text-healix-navy', bg: 'bg-healix-navy/10', trend: '+8%' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="healix-card p-8 bg-white hover:border-healix-teal/20 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                            <s.icon size={80} />
                        </div>
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/50`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">{s.label}</p>
                                <p className="text-3xl font-extrabold text-healix-navy">{s.value}</p>
                            </div>
                            <span className={`text-[10px] font-black ${s.trend.startsWith('+') ? 'text-medical-teal' : 'text-urgent-red'} flex items-center gap-1`}>
                                <TrendingUp size={10} className={s.trend.startsWith('-') ? 'rotate-180' : ''} /> {s.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {hospitals.map((h, i) => {
                    const stress = getStress(h);
                    const statusColor = stress.level === 'Critical' ? 'text-urgent-red' : stress.level === 'Elevated' ? 'text-warning-amber' : 'text-medical-teal';
                    const statusBg = stress.level === 'Critical' ? 'bg-urgent-red/5 border-urgent-red/10' : stress.level === 'Elevated' ? 'bg-warning-amber/5 border-warning-amber/10' : 'bg-medical-teal/5 border-medical-teal/10';
                    const progressBg = stress.level === 'Critical' ? 'bg-urgent-red' : stress.level === 'Elevated' ? 'bg-warning-amber' : 'bg-medical-teal';

                    return (
                        <motion.div key={h.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="healix-card p-10 bg-white group hover:border-healix-teal/10 transition-all relative overflow-hidden shadow-healix-sm">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02]">
                                <Building2 size={160} className="text-healix-navy rotate-12" />
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${statusBg} border-2 transition-all group-hover:scale-110 shadow-inner overflow-hidden relative`}>
                                        <div className={`absolute inset-0 opacity-10 ${progressBg} animate-pulse-soft`} />
                                        <Building2 className={`w-8 h-8 ${statusColor} relative z-10`} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-healix-navy tracking-tighter leading-none mb-3">{h.name}</h3>
                                        <h3 className="text-2xl font-display font-extrabold text-healix-navy tracking-tighter leading-none mb-3">{h.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Zap className={`w-3.5 h-3.5 ${statusColor} fill-current`} />
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusColor}`}>{stress.level} Phase</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-healix-teal" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Secure</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Latency Sync</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(b => (
                                                <div key={b} className={`w-1 h-3 rounded-full ${b <= 4 ? 'bg-healix-teal' : 'bg-slate-100'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`px-8 py-4 rounded-[28px] text-xl font-black ${statusBg} ${statusColor} border-2 shadow-inner min-w-[120px] text-center`}>
                                        {stress.score}%
                                    </div>
                                </div>
                            </div>

                            <div className="relative w-full bg-slate-50 rounded-full h-4 mb-12 overflow-hidden shadow-inner border border-slate-100/50">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${stress.score}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`absolute top-0 left-0 h-full rounded-full ${progressBg} shadow-[0_0_20px_rgba(0,0,0,0.1)] relative`}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg" />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                {[
                                    { label: 'Unit Vacancy', val: h.beds, max: h.maxBeds, icon: Bed, color: 'text-healix-teal' },
                                    { label: 'Personnel', val: h.staff, max: h.maxStaff, icon: Users, color: 'text-indigo-400' },
                                    { label: 'Latency Index', val: `${h.waitTime}m`, icon: Clock, color: 'text-medical-teal' },
                                    { label: 'Fleet Ready', val: h.ambulances, max: h.maxAmb, icon: Truck, color: 'text-warning-amber' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-white-soft p-6 rounded-[32px] border border-slate-100 text-center group-hover:bg-white transition-all shadow-inner hover:shadow-healix-sm">
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <stat.icon size={12} className={stat.color} />
                                            <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em]">{stat.label}</p>
                                        </div>
                                        <p className="text-2xl font-black text-healix-navy">
                                            {stat.val}
                                            {stat.max && <span className="text-[10px] text-slate-300 font-bold ml-1.5">/ {stat.max}</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default StressIndex;
