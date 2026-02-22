import React, { useState } from 'react';
import { MapPin, Navigation, Info, ShieldAlert, Cpu, Activity, Zap, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegionalMap = ({ hospitals, recommendedId }) => {
    const [selected, setSelected] = useState(null);

    // Simulated coordinates for a 100x100 grid
    const hCoords = [
        { id: 1, x: 20, y: 30 },
        { id: 2, x: 70, y: 20 },
        { id: 3, x: 10, y: 80 },
        { id: 4, x: 80, y: 70 },
        { id: 5, x: 50, y: 50 },
    ];

    const patientPos = { x: 40, y: 75 };

    return (
        <div className="relative w-full h-full bg-[#f8fafc] rounded-[48px] overflow-hidden border border-slate-100 shadow-inner">
            {/* Tactical Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Compass / Orientation */}
            <div className="absolute top-10 right-10 z-10 opacity-20">
                <Compass size={120} className="text-healix-navy spin-slow" />
            </div>

            {/* Legend - Tactical Style */}
            <div className="absolute top-8 left-8 z-20 space-y-3">
                <div className="bg-white/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white shadow-healix-sm flex items-center gap-3 text-[9px] font-black text-healix-navy uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-healix-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Optimal Route
                </div>
                <div className="bg-white/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white shadow-healix-sm flex items-center gap-3 text-[9px] font-black text-healix-navy uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-medical-teal shadow-[0_0_8px_rgba(20,184,166,0.5)]" /> Facility Node
                </div>
                <div className="bg-white/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white shadow-healix-sm flex items-center gap-3 text-[9px] font-black text-healix-navy uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-urgent-red shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" /> Origin Point
                </div>
            </div>

            {/* Tactical Routing Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>
                <AnimatePresence>
                    {recommendedId && (
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            d={`M ${patientPos.x}% ${patientPos.y}% L 50% 60% L ${hCoords.find(h => h.id === recommendedId)?.x}% ${hCoords.find(h => h.id === recommendedId)?.y}%`}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="4"
                            strokeDasharray="12 8"
                            filter="url(#glow)"
                            className="drop-shadow-2xl"
                        />
                    )}
                </AnimatePresence>
            </svg>

            {/* Origin Point (Patient) */}
            <motion.div
                style={{ left: `${patientPos.x}%`, top: `${patientPos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            >
                <div className="relative group cursor-help">
                    <div className="absolute inset-0 bg-urgent-red/30 rounded-full animate-ping scale-[4] opacity-50" />
                    <div className="absolute inset-0 bg-urgent-red/20 rounded-full animate-pulse scale-[2.5]" />
                    <div className="w-8 h-8 bg-urgent-red border-4 border-white rounded-[14px] flex items-center justify-center shadow-2xl rotate-45 transform transition-transform group-hover:scale-110">
                        <Navigation className="w-4 h-4 text-white -rotate-45" />
                    </div>
                </div>
            </motion.div>

            {/* Facility Nodes (Hospitals) */}
            {hCoords.map((h) => {
                const data = hospitals.find(ho => ho.id === h.id);
                const isRecommended = recommendedId === h.id;

                return (
                    <motion.div
                        key={h.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: h.id * 0.1, type: "spring", stiffness: 200 }}
                        style={{ left: `${h.x}%`, top: `${h.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                        onMouseEnter={() => setSelected(h.id)}
                        onMouseLeave={() => setSelected(null)}
                    >
                        <div className="relative">
                            {isRecommended && (
                                <div className="absolute inset-0 bg-healix-blue/30 rounded-full animate-pulse-soft scale-[3]" />
                            )}
                            <div className={`
                                w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-500 border-2
                                ${isRecommended
                                    ? 'bg-healix-blue border-white shadow-2xl shadow-healix-blue/40 scale-110'
                                    : 'bg-white border-slate-100 text-slate-300 hover:scale-110 hover:border-healix-blue/30 hover:text-healix-blue hover:shadow-healix-lg'}
                            `}>
                                <MapPin className={`w-5 h-5 ${isRecommended ? 'text-white' : ''}`} />
                            </div>
                        </div>

                        {/* Premium Tooltip */}
                        <AnimatePresence>
                            {selected === h.id && data && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-64 bg-white/95 backdrop-blur-2xl p-6 rounded-[32px] border border-white shadow-2xl pointer-events-none z-50 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                                        <Cpu size={60} className="text-healix-navy" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${data.bedAvailability ? 'bg-medical-teal' : 'bg-urgent-red'} animate-pulse`} />
                                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${data.bedAvailability ? 'text-medical-teal' : 'text-urgent-red'}`}>
                                                {data.bedAvailability ? 'Operational' : 'Critical Load'}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-extrabold text-healix-navy leading-tight mb-4 tracking-tighter">{data.name}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                                <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">ICU NODES</p>
                                                <p className="text-sm font-black text-healix-navy">{data.icuBeds}</p>
                                            </div>
                                            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                                <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">LATENCY</p>
                                                <p className="text-sm font-black text-healix-navy">{data.ambulanceETA}<span className="text-[9px] ml-0.5">m</span></p>
                                            </div>
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-[8px] font-black text-healix-blue uppercase tracking-widest">Neural Match</span>
                                            <div className="flex items-center gap-2">
                                                <Zap size={10} className="text-healix-blue" />
                                                <span className="text-xs font-black text-healix-navy">{data.score || 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}

            {/* tactical status panel */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] lg:w-[450px]">
                <div className="bg-healix-navy/95 backdrop-blur-2xl px-10 py-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10">
                        <Activity size={120} className="text-healix-blue" />
                    </div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-healix-blue/20 flex items-center justify-center border border-healix-blue/30 shadow-inner">
                                <ShieldAlert size={18} className="text-healix-blue" />
                            </div>
                            <div>
                                <h5 className="text-white text-sm font-black tracking-tight leading-none mb-1.5">Spatial Intelligence Scan</h5>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-medical-teal animate-pulse" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Grid Status: Optimal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-relaxed font-bold opacity-80 uppercase tracking-widest relative z-10">
                        Analyzing 5 regional nodes for real-time throughput. Synthetic matching enabled.
                    </p>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`w-1 h-3 rounded-full ${i <= 5 ? 'bg-healix-blue' : 'bg-white/5'}`} />
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-healix-blue uppercase tracking-[0.4em] animate-pulse">Scanning Live Data</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegionalMap;
