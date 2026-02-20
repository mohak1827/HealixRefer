import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, MapPin, AlertTriangle, Activity, Thermometer, Bug, Bell, Share2, Scan, Radiation, ShieldAlert } from 'lucide-react';

const OutbreakDetection = () => {
    const [alerts, setAlerts] = useState([
        { id: 1, type: 'Dengue Cluster', region: 'Barwani Block', cases: 47, trend: '+18%', risk: 'High', detected: '2 hours ago' },
        { id: 2, type: 'Respiratory Illness', region: 'Khargone District', cases: 128, trend: '+32%', risk: 'Critical', detected: '45 min ago' },
        { id: 3, type: 'Gastroenteritis', region: 'Dhar Tehsil', cases: 23, trend: '+8%', risk: 'Moderate', detected: '6 hours ago' },
    ]);

    const [timelineData] = useState([
        { week: 'W1', dengue: 12, respiratory: 45, gastro: 8 },
        { week: 'W2', dengue: 18, respiratory: 52, gastro: 11 },
        { week: 'W3', dengue: 25, respiratory: 67, gastro: 14 },
        { week: 'W4', dengue: 34, respiratory: 89, gastro: 18 },
        { week: 'W5', dengue: 47, respiratory: 128, gastro: 23 },
    ]);

    const maxVal = Math.max(...timelineData.flatMap(d => [d.dengue, d.respiratory, d.gastro]));

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                        <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.4em]">Surveillance Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-healix-navy tracking-tight leading-none text-gradient-primary">Regional Pathogen Scan</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Predictive Bio-Analytics v3.5</p>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-healix-sm flex items-center gap-3">
                        <Scan size={14} className="text-healix-teal" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orbital Scan: Active</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {alerts.map((a, i) => {
                    const colorClass = a.risk === 'Critical' ? 'text-urgent-red' : a.risk === 'High' ? 'text-warning-amber' : 'text-medical-teal';
                    const bgClass = a.risk === 'Critical' ? 'bg-urgent-red/10' : a.risk === 'High' ? 'bg-warning-amber/10' : 'bg-medical-teal/10';
                    const borderClass = a.risk === 'Critical' ? 'border-urgent-red/20' : a.risk === 'High' ? 'border-warning-amber/20' : 'border-medical-teal/20';

                    return (
                        <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className={`healix-card p-10 bg-white group hover:border-healix-teal/10 transition-all border-l-[6px] ${a.risk === 'Critical' ? 'border-l-urgent-red' : a.risk === 'High' ? 'border-l-warning-amber' : 'border-l-medical-teal'} shadow-healix-sm overflow-hidden relative`}>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Radiation size={80} />
                            </div>

                            <div className="flex items-center gap-5 mb-8 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${borderClass} border shadow-inner transition-transform group-hover:scale-110`}>
                                    <Bug className={`w-7 h-7 ${colorClass}`} />
                                </div>
                                <div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${colorClass}`}>{a.risk} Delta</span>
                                    <h3 className="text-xl font-extrabold text-healix-navy tracking-tighter mt-1 leading-none">{a.type}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-8 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-fit">
                                <MapPin size={12} className="text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{a.region}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white-soft p-6 rounded-[32px] border border-slate-100 shadow-inner group-hover:bg-white transition-all">
                                    <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] mb-2">Incidence</p>
                                    <p className="text-3xl font-black text-healix-navy">{a.cases}</p>
                                </div>
                                <div className="bg-white-soft p-6 rounded-[32px] border border-slate-100 shadow-inner group-hover:bg-white transition-all">
                                    <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] mb-2">Trend Velocity</p>
                                    <p className={`text-3xl font-black ${colorClass}`}>{a.trend}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-3 relative z-10">
                                <div className={`w-2 h-2 rounded-full ${a.risk === 'Critical' ? 'bg-urgent-red' : 'bg-medical-teal'} animate-pulse`} />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SYNCHRONIZED {a.detected}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.section initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="healix-card p-12 bg-white relative overflow-hidden shadow-healix-md">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                    <TrendingUp size={240} className="text-healix-navy" />
                </div>

                <div className="flex flex-wrap justify-between items-start gap-6 mb-16 relative z-10">
                    <div>
                        <h2 className="text-2xl font-display font-extrabold text-healix-navy flex items-center gap-4">
                            <TrendingUp className="w-7 h-7 text-healix-teal" /> Synthetic Trend Propagation
                        </h2>
                        <p className="text-[10px] text-slate-400 font-black mt-3 uppercase tracking-[0.3em]">Temporal Cluster Logic • 5-Week Observation Window</p>
                    </div>
                </div>

                <div className="flex items-end gap-6 h-80 mb-16 pl-8 border-l-2 border-slate-50 relative z-10">
                    {timelineData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                            <div className="flex items-end gap-2 w-full justify-center h-full">
                                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.dengue / maxVal) * 100}%` }}
                                    transition={{ delay: i * 0.1, duration: 1, ease: "circOut" }}
                                    className="w-4 lg:w-6 bg-warning-amber/80 rounded-t-xl shadow-lg relative cursor-help group/val"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-healix-navy text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/val:opacity-100 transition-opacity">D:{d.dengue}</div>
                                </motion.div>
                                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.respiratory / maxVal) * 100}%` }}
                                    transition={{ delay: i * 0.1 + 0.1, duration: 1, ease: "circOut" }}
                                    className="w-4 lg:w-6 bg-urgent-red/80 rounded-t-xl shadow-lg relative cursor-help group/val"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-healix-navy text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/val:opacity-100 transition-opacity">R:{d.respiratory}</div>
                                </motion.div>
                                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.gastro / maxVal) * 100}%` }}
                                    transition={{ delay: i * 0.1 + 0.2, duration: 1, ease: "circOut" }}
                                    className="w-4 lg:w-6 bg-healix-teal/80 rounded-t-xl shadow-lg relative cursor-help group/val"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-healix-navy text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/val:opacity-100 transition-opacity">G:{d.gastro}</div>
                                </motion.div>
                            </div>
                            <span className="text-[10px] font-black text-slate-300 group-hover:text-healix-teal transition-all uppercase tracking-widest">{d.week}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-12 py-10 border-t border-slate-50 bg-slate-50/30 rounded-b-[48px]">
                    {[
                        { label: 'Dengue Pattern', color: 'bg-warning-amber' },
                        { label: 'Respiratory Load', color: 'bg-urgent-red' },
                        { label: 'Gastro Velocity', color: 'bg-healix-teal' }
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-healix-sm">
                            <div className={`w-3.5 h-3.5 rounded-full ${l.color} shadow-sm animate-pulse-soft`} />
                            <span className="text-[10px] font-black text-healix-navy uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="healix-card p-12 bg-healix-navy text-white relative overflow-hidden shadow-2xl shadow-healix-navy/20">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Bell size={120} className="text-healix-blue animate-pulse-soft" />
                </div>

                <h2 className="text-2xl font-display font-extrabold mb-12 flex items-center gap-4 relative z-10">
                    <ShieldAlert className="w-7 h-7 text-healix-teal" /> Machine Intelligence Directives
                </h2>

                <div className="space-y-6 relative z-10">
                    {[
                        { msg: 'Respiratory illness cluster in Khargone exceeds epidemic threshold. IDSP notification recommended.', severity: 'Critical', conf: 92 },
                        { msg: 'Dengue pattern in Barwani consistent with seasonal outbreak. Pre-position vector control teams.', severity: 'High', conf: 85 },
                        { msg: 'Gastroenteritis trend stable but warrants monitoring of water supply sources in Dhar.', severity: 'Moderate', conf: 78 },
                    ].map((p, i) => (
                        <div key={i} className="flex flex-col lg:flex-row items-center gap-8 bg-white/5 backdrop-blur-[20px] p-8 rounded-[40px] border border-white/10 hover:bg-white/10 transition-all group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${p.severity === 'Critical' ? 'bg-urgent-red/20 text-urgent-red' :
                                p.severity === 'High' ? 'bg-warning-amber/20 text-warning-amber' :
                                    'bg-medical-teal/20 text-medical-teal'
                                } border border-white/10 shadow-xl group-hover:scale-110 transition-transform`}>
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <p className="text-lg font-bold text-slate-100 tracking-tight leading-relaxed italic opacity-90 mb-6 lg:mb-0">"{p.msg}"</p>
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-3 min-w-[200px]">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border ${p.severity === 'Critical' ? 'bg-urgent-red text-white border-white/10' :
                                        p.severity === 'High' ? 'bg-warning-amber text-white border-white/10' :
                                            'bg-medical-teal text-white border-white/10'
                                        }`}>{p.severity}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Conf: {p.conf}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${p.conf}%` }} transition={{ duration: 1.2 }}
                                        className="h-full bg-healix-teal shadow-[0_0_12px_rgba(13,148,136,0.5)]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>
        </div>
    );
};

export default OutbreakDetection;
