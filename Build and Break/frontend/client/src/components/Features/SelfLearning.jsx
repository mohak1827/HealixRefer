import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Database, RefreshCw, Zap, Target, GitBranch, ArrowUpRight } from 'lucide-react';

const learningCycles = [
    { cycle: 'Cycle 47', date: '2026-02-19', accuracy: 94.2, improvement: '+1.3%', samples: 1240, adjustments: ['Increased distance penalty for critical cases', 'Reduced specialist weight for stable vitals'] },
    { cycle: 'Cycle 46', date: '2026-02-18', accuracy: 92.9, improvement: '+0.8%', samples: 1180, adjustments: ['Added surge capacity factor', 'Refined ambulance ETA weighting'] },
    { cycle: 'Cycle 45', date: '2026-02-17', accuracy: 92.1, improvement: '+1.1%', samples: 1095, adjustments: ['Incorporated doctor feedback on override patterns', 'Updated bed availability decay model'] },
    { cycle: 'Cycle 44', date: '2026-02-16', accuracy: 91.0, improvement: '+0.5%', samples: 1020, adjustments: ['Baseline seasonal adjustment', 'Night-shift staffing correlation'] },
];

const SelfLearning = () => {
    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-healix-navy tracking-tight">Self-Learning Referral Intelligence</h1>
                <p className="text-slate-500 font-semibold text-sm">Autonomous model improvement • Outcome-driven learning</p>
            </header>

            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: 'Current Accuracy', value: '94.2%', icon: Target, color: 'text-medical-teal', bg: 'bg-medical-teal/10' },
                    { label: 'Learning Cycles', value: 47, icon: RefreshCw, color: 'text-healix-blue', bg: 'bg-healix-blue/10' },
                    { label: 'Training Samples', value: '4,535', icon: Database, color: 'text-healix-navy', bg: 'bg-slate-100' },
                    { label: 'Improvement Rate', value: '+3.7%', icon: TrendingUp, color: 'text-healix-teal', bg: 'bg-healix-teal/10' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="healix-card p-8 group hover:scale-[1.05] transition-all">
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</p>
                        <p className="text-3xl font-black text-healix-navy mt-1 tracking-tight">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="healix-card p-10">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-xl font-black text-healix-navy flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-healix-blue" /> Accuracy Evolution
                        </h2>
                        <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-widest">Model accuracy over last 4 training cycles</p>
                    </div>
                </div>

                <div className="flex items-end gap-10 h-64 border-b border-slate-100 px-6">
                    {learningCycles.slice().reverse().map((c, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${((c.accuracy - 88) / 10) * 100}%` }}
                                transition={{ delay: i * 0.15, duration: 1, ease: "circOut" }}
                                className="w-full max-w-[80px] bg-gradient-to-t from-healix-blue/80 to-healix-blue rounded-t-2xl shadow-lg shadow-healix-blue/10 relative overflow-hidden group-hover:scale-105 transition-all">
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-all"></div>
                                <div className="absolute top-4 left-0 right-0 text-center">
                                    <span className="text-xs font-black text-white drop-shadow-md">{c.accuracy}%</span>
                                </div>
                            </motion.div>
                            <span className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest group-hover:text-healix-navy transition-all">{c.cycle}</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            <div className="space-y-6">
                <div className="flex items-center gap-4 py-4">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <h2 className="text-sm font-black text-slate-400 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <GitBranch className="w-5 h-5" /> Training History Architecture
                    </h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid gap-6">
                    {learningCycles.map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="healix-card p-8 group hover:border-healix-blue/30 transition-all">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-slate-50 border border-slate-100 transition-all group-hover:scale-110 shadow-sm">
                                        <Brain className="w-8 h-8 text-healix-blue" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-healix-navy tracking-tight uppercase">{c.cycle}</h3>
                                        <p className="text-xs text-slate-400 font-semibold mt-1.5 flex items-center gap-2">
                                            {c.date} • <span className="text-healix-navy">{c.samples} samples processed</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Accuracy</p>
                                        <span className="text-3xl font-black text-healix-navy tracking-tighter">{c.accuracy}%</span>
                                    </div>
                                    <div className="bg-medical-teal/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-medical-teal/20 shadow-sm">
                                        <ArrowUpRight className="w-4 h-4 text-medical-teal" />
                                        <span className="text-sm font-black text-medical-teal">{c.improvement}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.3em] mb-4">Gradient Descent Weights & Adjustments</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {c.adjustments.map((a, j) => (
                                    <div key={j} className="flex items-center gap-4 bg-slate-50 p-4 rounded-[20px] border border-slate-100 group-hover:bg-white transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-healix-blue/5 flex items-center justify-center shrink-0">
                                            <Zap className="w-4 h-4 text-healix-blue" />
                                        </div>
                                        <span className="text-sm text-healix-navy font-bold leading-tight">{a}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelfLearning;
