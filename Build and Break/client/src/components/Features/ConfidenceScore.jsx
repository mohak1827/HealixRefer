import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, AlertTriangle, Info, TrendingUp, Shield, Database, Cpu, Fingerprint, Network, ChevronRight } from 'lucide-react';

const referrals = [
    { id: 'REF-7742', patient: 'Ramesh K.', hospital: 'City General Hospital', confidence: 94, factors: { vitals: 96, distance: 88, beds: 100, specialist: 92 }, recommendation: 'High Confidence Match', risk: 'Stable' },
    { id: 'REF-7741', patient: 'Sunita D.', hospital: 'District Medical Center', confidence: 87, factors: { vitals: 82, distance: 95, beds: 85, specialist: 78 }, recommendation: 'Validated Recommendation', risk: 'Minimal' },
    { id: 'REF-7740', patient: 'Mohan P.', hospital: "St. Mary's Specialty", confidence: 72, factors: { vitals: 90, distance: 42, beds: 75, specialist: 95 }, recommendation: 'Secondary Option — Active', risk: 'Moderate' },
    { id: 'REF-7739', patient: 'Priya S.', hospital: 'Community Care Hospital', confidence: 96, factors: { vitals: 98, distance: 94, beds: 95, specialist: 97 }, recommendation: 'Precision Match: Verified', risk: 'Stable' },
    { id: 'REF-7738', patient: 'Ajay M.', hospital: 'City General Hospital', confidence: 58, factors: { vitals: 92, distance: 65, beds: 20, specialist: 88 }, recommendation: 'Alert: Unit Stress Detected', risk: 'Critical' },
];

const ConfidenceScore = () => {
    const avgConf = Math.round(referrals.reduce((s, r) => s + r.confidence, 0) / referrals.length);

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                        <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.4em]">Neural Trust Ecosystem</span>
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-healix-navy tracking-tight leading-none text-gradient-primary">Explainable AI Interface</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Transparent Clinical Decision Support v2.1</p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-healix-sm flex items-center gap-3">
                        <Fingerprint size={14} className="text-healix-teal" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model: HEALIX-N4-PHI</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Network Confidence', value: `${avgConf}%`, icon: Brain, color: 'text-healix-teal', bg: 'bg-healix-teal/10', trend: 'Optimal' },
                    { label: 'Validated Nodes', value: referrals.filter(r => r.confidence >= 85).length, icon: CheckCircle, color: 'text-medical-teal', bg: 'bg-medical-teal/10', trend: 'Stable' },
                    { label: 'Low Delta Review', value: referrals.filter(r => r.confidence < 65).length, icon: AlertTriangle, color: 'text-urgent-red', bg: 'bg-urgent-red/10', trend: 'Action Reqd' },
                    { label: 'Inference Engine', value: 'HEALIX-Ω', icon: Network, color: 'text-healix-navy', bg: 'bg-healix-navy/10', trend: '99.9% Up' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="healix-card p-8 bg-white group hover:border-healix-teal/20 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <s.icon size={80} />
                        </div>
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/50 relative overflow-hidden`}>
                            <s.icon className={`w-6 h-6 ${s.color} relative z-10`} />
                        </div>
                        <div>
                            <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1.5">{s.label}</p>
                            <p className="text-3xl font-extrabold text-healix-navy tracking-tighter mb-4">{s.value}</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${s.trend === 'Action Reqd' ? 'bg-urgent-red' : 'bg-medical-teal'}`} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${s.trend === 'Action Reqd' ? 'text-urgent-red' : 'text-slate-400'}`}>{s.trend}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-6">
                {referrals.map((r, i) => {
                    const colorClass = r.confidence >= 85 ? 'text-medical-teal' : r.confidence >= 70 ? 'text-amber-500' : 'text-urgent-red';
                    const bgClass = r.confidence >= 85 ? 'bg-medical-teal/5' : r.confidence >= 70 ? 'bg-amber-500/5' : 'bg-urgent-red/5';
                    const borderClass = r.confidence >= 85 ? 'border-medical-teal/10' : r.confidence >= 70 ? 'border-amber-500/10' : 'border-urgent-red/10';
                    const glowClass = r.confidence >= 85 ? 'shadow-medical-teal/5' : r.confidence >= 70 ? 'shadow-amber-500/5' : 'shadow-urgent-red/5';

                    return (
                        <motion.div key={r.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className={`healix-card p-10 bg-white group hover:border-healix-teal/10 transition-all relative overflow-hidden shadow-healix-sm ${glowClass}`}>
                            <div className="absolute -bottom-10 -right-10 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity">
                                <Brain size={200} />
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12 relative z-10">
                                <div className="flex items-center gap-10">
                                    <div className={`w-28 h-28 rounded-[40px] flex flex-col items-center justify-center ${bgClass} ${borderClass} border-2 shadow-inner transition-all group-hover:scale-110 relative overflow-hidden`}>
                                        <div className={`absolute top-0 right-0 p-2 ${colorClass} opacity-20`}>
                                            <Cpu size={14} />
                                        </div>
                                        <span className={`text-3xl font-black ${colorClass} tracking-tighter`}>{r.confidence}%</span>
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${colorClass} opacity-60 mt-1`}>Trust</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black text-healix-teal bg-healix-teal/5 px-3 py-1 rounded-lg border border-healix-teal/10 tracking-widest">{r.id}</span>
                                            <h3 className="text-2xl font-display font-extrabold text-healix-navy tracking-tighter">{r.patient}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Database size={12} className="opacity-40" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest italic">{r.hospital}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl ${bgClass} border-2 ${borderClass}`}>
                                                <div className={`w-2 h-2 rounded-full ${r.confidence >= 85 ? 'bg-medical-teal' : r.confidence >= 70 ? 'bg-amber-500' : 'bg-urgent-red'} animate-pulse`} />
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colorClass}`}>{r.recommendation}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Status Protocol</p>
                                        <p className={`text-xs font-black uppercase tracking-[0.2em] ${colorClass}`}>{r.risk} Condition</p>
                                    </div>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${borderClass} bg-white shadow-healix-sm cursor-pointer hover:scale-110 transition-transform`}>
                                        <ChevronRight className={colorClass} size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                                {Object.entries(r.factors).map(([key, val]) => {
                                    const factorColor = val >= 85 ? 'text-medical-teal' : val >= 70 ? 'text-amber-500' : 'text-urgent-red';
                                    const factorBg = val >= 85 ? 'bg-medical-teal' : val >= 70 ? 'bg-amber-500' : 'bg-urgent-red';

                                    return (
                                        <div key={key} className="bg-white-soft p-8 rounded-[40px] border border-slate-100/50 group-hover:bg-white transition-all shadow-inner hover:shadow-healix-sm flex flex-col justify-between h-full">
                                            <div className="flex justify-between items-center mb-6">
                                                <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.3em]">{key}</p>
                                                <span className={`text-xs font-black ${factorColor} tracking-tighter`}>{val}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner relative mt-auto">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1.2, delay: i * 0.1 }}
                                                    className={`h-full rounded-full ${factorBg} shadow-sm relative`}>
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse-soft" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConfidenceScore;
