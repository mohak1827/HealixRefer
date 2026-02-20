import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Shield, Radio, MapPin, Clock, Users, Activity, Power, Share2, Globe, ShieldAlert } from 'lucide-react';

const SurgeMode = () => {
    const [surgeActive, setSurgeActive] = useState(false);
    const [scenario, setScenario] = useState(null);

    const scenarios = [
        { id: 'pandemic', label: 'Pandemic Surge', icon: '🦠', desc: 'Mass infection outbreak requiring distributed load balancing', beds: 240, affected: '12,400', eta: '4h' },
        { id: 'disaster', label: 'Natural Disaster', icon: '🌪', desc: 'Earthquake/flood with mass casualty triage activation', beds: 180, affected: '3,200', eta: '1h' },
        { id: 'mci', label: 'Mass Casualty Incident', icon: '🚨', desc: 'Multi-vehicle accident or industrial explosion', beds: 45, affected: '87', eta: '25m' },
        { id: 'chemical', label: 'Chemical Exposure', icon: '☢️', desc: 'Hazmat spill requiring specialized decontamination routing', beds: 30, affected: '156', eta: '45m' },
    ];

    const surgeProtocols = [
        { label: 'Emergency Bed Release', status: surgeActive ? 'Active' : 'Standby', color: surgeActive ? 'medical-teal' : 'slate-300' },
        { label: 'Cross-District Transfer', status: surgeActive ? 'Enabled' : 'Disabled', color: surgeActive ? 'medical-teal' : 'slate-300' },
        { label: 'Military Medical Support', status: surgeActive ? 'Requested' : 'Available', color: surgeActive ? 'warning-amber' : 'slate-300' },
        { label: 'Triage Override Authority', status: surgeActive ? 'Granted' : 'Restricted', color: surgeActive ? 'urgent-red' : 'slate-300' },
        { label: 'Public Alert Broadcasting', status: surgeActive ? 'Broadcasting' : 'Silent', color: surgeActive ? 'healix-blue' : 'slate-300' },
    ];

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            <header className="flex flex-wrap gap-6 justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                        <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.3em]">Module: Surge Orchestration</span>
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-healix-navy tracking-tight leading-none">Global Disaster Protocol</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-3 whitespace-nowrap">Unified Command & Control v6.0</p>
                </div>
                <button onClick={() => setSurgeActive(!surgeActive)}
                    className={`px-12 py-6 rounded-[32px] font-black flex items-center gap-4 transition-all text-[11px] tracking-[0.2em] shadow-healix-md group relative overflow-hidden ${surgeActive
                        ? 'bg-urgent-red text-white shadow-urgent-red/20'
                        : 'bg-healix-navy text-white hover:bg-healix-teal shadow-healix-navy/20'}`}>
                    <div className={`absolute inset-0 bg-white/10 transition-transform ${surgeActive ? 'scale-100' : 'scale-0'}`} />
                    <Power className={`w-5 h-5 relative z-10 ${surgeActive ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
                    <span className="relative z-10">{surgeActive ? 'DEACTIVATE EMERGENCY MODE' : 'INITIALIZE SURGE MODE'}</span>
                </button>
            </header>

            {surgeActive && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-urgent-red/10 border-2 border-urgent-red/20 p-10 rounded-[48px] flex flex-wrap items-center gap-8 shadow-2xl shadow-urgent-red/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-urgent-red opacity-[0.03] blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="w-20 h-20 bg-urgent-red rounded-3xl flex items-center justify-center shadow-xl shadow-urgent-red/30">
                        <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-black text-urgent-red text-2xl uppercase tracking-tighter mb-2">SURGE STATE ACTIVATED</h2>
                        <p className="text-sm text-urgent-red/60 font-bold uppercase tracking-widest opacity-80">Routing Logic Optimized for Mass-Casualty Throughput • All Manual Locks Disengaged</p>
                    </div>
                    <div className="ml-auto flex gap-4">
                        <div className="bg-white/50 backdrop-blur px-6 py-3 rounded-2xl border border-urgent-red/10">
                            <span className="text-[10px] font-black text-urgent-red block opacity-60">Session ID</span>
                            <span className="text-xs font-black text-healix-navy">EX-902-DELTA</span>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {scenarios.map((s) => (
                    <motion.button key={s.id} whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setScenario(s)}
                        className={`healix-card p-10 text-left transition-all relative overflow-hidden group ${scenario?.id === s.id ? 'border-healix-teal ring-8 ring-healix-teal/5 bg-white-soft' : 'bg-white hover:border-healix-teal/20'}`}>
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <Activity size={160} className="text-healix-navy" />
                        </div>
                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-4xl mb-10 shadow-inner border border-slate-100 transition-all group-hover:scale-110 group-hover:rotate-6">
                            {s.icon}
                        </div>
                        <h3 className="text-xs font-black text-healix-navy mb-3 uppercase tracking-[0.2em]">{s.label}</h3>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-8 opacity-80">{s.desc}</p>
                        <div className="flex flex-wrap gap-3 relative z-10 transition-transform group-hover:translate-x-1">
                            <span className="text-[9px] font-black bg-healix-teal/10 text-healix-teal px-4 py-2 rounded-xl uppercase tracking-widest">{s.beds} UNIT CAPACITY</span>
                            <span className="text-[9px] font-black bg-urgent-red/10 text-urgent-red px-4 py-2 rounded-xl uppercase tracking-widest">{s.affected} DELTA</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                <motion.section initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="healix-card p-12 bg-white flex flex-col shadow-healix-md">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-display font-extrabold text-healix-navy flex items-center gap-4">
                            <Shield className="w-7 h-7 text-healix-teal" /> Command Protocols
                        </h2>
                        <Share2 size={18} className="text-slate-300 cursor-pointer hover:text-healix-teal transition-colors" />
                    </div>
                    <div className="space-y-4 flex-1">
                        {surgeProtocols.map((p, i) => {
                            const isActive = p.status === 'Active' || p.status === 'Enabled' || p.status === 'Broadcasting' || p.status === 'Requested' || p.status === 'Granted';
                            return (
                                <div key={i} className={`flex items-center justify-between p-8 rounded-[40px] border transition-all duration-300 group ${isActive ? 'bg-white-soft border-healix-teal/10' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-3 h-3 rounded-full ${isActive ? (p.label.includes('Authority') ? 'bg-urgent-red shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-medical-teal shadow-[0_0_12px_rgba(16,185,129,0.5)]') : 'bg-slate-200'} animate-pulse-soft`} />
                                        <span className="font-extrabold text-sm text-healix-navy tracking-tight uppercase tracking-[0.1em]">{p.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border shadow-sm ${isActive ? 'bg-white text-healix-navy border-slate-100' : 'bg-slate-100 text-slate-300 border-slate-100'}`}>
                                        {p.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                <AnimatePresence mode="wait">
                    {scenario ? (
                        <motion.section
                            key={scenario.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="healix-card p-12 bg-healix-navy text-white relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <Radio className="w-64 h-64 text-healix-teal animate-pulse" />
                            </div>

                            <div>
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="w-3 h-3 rounded-full bg-healix-teal animate-ping" />
                                    <h2 className="text-[10px] font-display font-black text-healix-teal uppercase tracking-[0.4em]">Live Intelligence Feed</h2>
                                </div>

                                <div className="flex items-center gap-8 mb-12">
                                    <div className="w-24 h-24 bg-white/5 backdrop-blur-[40px] rounded-[40px] flex items-center justify-center text-6xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                        {scenario.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-extrabold tracking-tighter mb-4">{scenario.label}</h3>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Globe size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Global Sector Synchronized</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-white/5 backdrop-blur-[20px] rounded-[40px] border border-white/10 mb-12 shadow-inner">
                                    <p className="text-sm text-slate-300 font-bold leading-relaxed italic opacity-80">"{scenario.desc}"</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { label: 'Infrastructure', val: scenario.beds, icon: Building2, color: 'text-healix-teal' },
                                    { label: 'Delta Count', val: scenario.affected, icon: Users, color: 'text-urgent-red' },
                                    { label: 'Node Sync', val: scenario.eta, icon: Radio, color: 'text-medical-teal' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/5 text-center group hover:bg-white/10 transition-colors">
                                        <p className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] mb-4">{stat.label}</p>
                                        <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    ) : (
                        <div className="healix-card p-12 bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center text-center">
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                                <ShieldAlert size={80} className="text-slate-100 mb-10" />
                            </motion.div>
                            <h3 className="text-xl font-black text-slate-200 tracking-tight italic">Waiting for Command Override</h3>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-6 leading-relaxed">System in Maintenance Mode • Triage Active</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Generic icons stub
const Building2 = ({ className }) => <Shield className={className} />;

export default SurgeMode;
