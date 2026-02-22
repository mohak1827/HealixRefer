import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Heart, Wind, Thermometer, Brain, TrendingUp, Clock, ShieldAlert, Zap } from 'lucide-react';

const SeverityScoring = () => {
    const [vitals, setVitals] = useState({ oxygen: '', heartRate: '', systolicBP: '', temperature: '', gcs: '15' });
    const [result, setResult] = useState(null);

    const calculateSeverity = () => {
        const o2 = parseInt(vitals.oxygen) || 98;
        const hr = parseInt(vitals.heartRate) || 75;
        const bp = parseInt(vitals.systolicBP) || 120;
        const temp = parseFloat(vitals.temperature) || 98.6;
        const gcs = parseInt(vitals.gcs) || 15;

        let score = 0;
        const flags = [];

        if (o2 < 85) { score += 25; flags.push('Critical Hypoxemia Threshold'); }
        else if (o2 < 92) { score += 12; flags.push('Low Oxygen Saturation'); }

        if (hr > 130 || hr < 45) { score += 20; flags.push('Hemodynamic Instability: Heart Rate'); }
        else if (hr > 100 || hr < 55) { score += 8; flags.push('Abnormal Heart Rate Pattern'); }

        if (bp < 85 || bp > 190) { score += 20; flags.push('Critical Mean Arterial Pressure'); }
        else if (bp < 95 || bp > 160) { score += 10; flags.push('Abnormal Blood Pressure Shift'); }

        if (temp > 103 || temp < 95) { score += 15; flags.push('Extreme Thermal Variation'); }
        else if (temp > 100.4) { score += 5; flags.push('Pyrexia Detected'); }

        if (gcs <= 8) { score += 25; flags.push('Severe Neurological Impairment'); }
        else if (gcs <= 12) { score += 12; flags.push('Moderate Neurological Deficit'); }

        const level = score >= 50 ? 'Critical' : score >= 25 ? 'Moderate' : 'Stable';
        const color = level === 'Critical' ? 'urgent-red' : level === 'Moderate' ? 'warning-amber' : 'medical-teal';
        setResult({ score: Math.min(100, score), level, color, flags, timestamp: new Date().toLocaleTimeString() });
    };

    const vitalFields = [
        { key: 'oxygen', label: 'SpO2 %', icon: Wind, placeholder: '98', color: 'text-healix-teal' },
        { key: 'heartRate', label: 'Heart Rate', icon: Heart, placeholder: '75', color: 'text-urgent-red' },
        { key: 'systolicBP', label: 'Systolic BP', icon: Activity, placeholder: '120', color: 'text-medical-teal' },
        { key: 'temperature', label: 'Temp °F', icon: Thermometer, placeholder: '98.6', color: 'text-warning-amber' },
        { key: 'gcs', label: 'GCS Score', icon: Brain, placeholder: '15', color: 'text-healix-navy' },
    ];

    return (
        <div className="space-y-10 pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                        <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.3em]">Module: Triage Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-healix-navy tracking-tight leading-none">Diagnostic Severity Engine</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-3">Clinical Decision Support v4.2</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-healix-sm">
                        <Zap size={14} className="text-warning-amber" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Triage Active</span>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-10">
                <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="healix-card p-10 bg-white">
                    <h2 className="text-xl font-extrabold flex items-center gap-3 mb-10 text-healix-navy">
                        <Activity className="w-6 h-6 text-healix-teal" /> Clinical Parameter Input
                    </h2>
                    <div className="space-y-4">
                        {vitalFields.map(f => (
                            <div key={f.key} className="bg-white-soft p-6 rounded-[32px] border border-slate-100 flex items-center gap-6 focus-within:bg-white focus-within:ring-4 focus-within:ring-healix-teal/5 transition-all group shadow-inner">
                                <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-healix-sm border border-slate-50 group-focus-within:border-healix-teal/20 transition-all`}>
                                    <f.icon className={`w-6 h-6 ${f.color} group-hover:scale-110 transition-transform`} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300 block mb-1.5">{f.label}</label>
                                    <input type="number" placeholder={f.placeholder} value={vitals[f.key]}
                                        onChange={e => setVitals({ ...vitals, [f.key]: e.target.value })}
                                        className="bg-transparent text-2xl font-black text-healix-navy w-full outline-none placeholder:text-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={calculateSeverity}
                        className="btn-healix-primary w-full mt-10 py-6 flex items-center justify-center gap-4 text-sm tracking-[0.1em]">
                        <Brain size={22} /> Run Synthetic Severity Scan
                    </button>
                </motion.section>

                <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                    {!result ? (
                        <div className="healix-card flex-1 flex flex-col items-center justify-center text-center p-20 bg-slate-50/50 border-dashed border-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
                                <Activity size={64} className="text-slate-100 mb-8" />
                            </motion.div>
                            <h3 className="text-xl font-black text-slate-200 italic">Awaiting Clinical Data</h3>
                        </div>
                    ) : (
                        <div className="healix-card p-12 bg-white flex-1 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                <Activity size={200} className="text-healix-navy" />
                            </div>

                            <div className="flex items-center justify-between mb-12 border-b border-slate-50 pb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${result.level === 'Critical' ? 'bg-urgent-red' : result.level === 'Moderate' ? 'bg-warning-amber' : 'bg-medical-teal'} shadow-lg`} />
                                    <span className="text-[10px] font-black text-healix-navy uppercase tracking-[0.3em]">Synthetic Report Output</span>
                                </div>
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{result.timestamp}</span>
                            </div>

                            <div className="text-center mb-12 flex-1">
                                <div className={`inline-flex items-center justify-center w-48 h-48 rounded-[60px] bg-slate-50 shadow-inner relative mb-8`}>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                                        <motion.circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8"
                                            strokeDasharray="552.92"
                                            initial={{ strokeDashoffset: 552.92 }}
                                            animate={{ strokeDashoffset: 552.92 - (552.92 * result.score) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`${result.level === 'Critical' ? 'text-urgent-red' : result.level === 'Moderate' ? 'text-warning-amber' : 'text-medical-teal'}`} />
                                    </svg>
                                    <span className={`text-6xl font-black ${result.level === 'Critical' ? 'text-urgent-red' : result.level === 'Moderate' ? 'text-warning-amber' : 'text-medical-teal'}`}>{result.score}</span>
                                </div>
                                <p className={`text-4xl font-black uppercase tracking-tighter ${result.level === 'Critical' ? 'text-urgent-red' : result.level === 'Moderate' ? 'text-warning-amber' : 'text-medical-teal'}`}>{result.level}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{result.level === 'Critical' ? 'Immediate Intervention Required' : result.level === 'Moderate' ? 'Priority Clinical Priority' : 'Awaiting Maintenance'}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-10">
                                {result.flags.map((flag, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-inner group">
                                        <div className={`p-2 rounded-xl ${result.level === 'Critical' ? 'bg-urgent-red/10 text-urgent-red' : result.level === 'Moderate' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-medical-teal/10 text-medical-teal'}`}>
                                            <ShieldAlert size={18} />
                                        </div>
                                        <span className="text-[11px] font-black text-healix-navy uppercase tracking-widest">{flag}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-healix-navy text-white rounded-[40px] p-10 relative overflow-hidden shadow-2xl shadow-healix-navy/30">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-healix-teal opacity-10 blur-3xl" />
                                <h4 className="text-[9px] font-display font-black tracking-[0.4em] text-healix-teal mb-10 border-b border-white/5 pb-4 uppercase">AI Clinical Mandate</h4>
                                <p className="text-sm text-slate-400 font-bold leading-relaxed italic opacity-90">
                                    {result.level === 'Critical' ? 'Protocol: Immediate extraction to Level-1 Trauma node. Engage priority air transit coordination.' :
                                        result.level === 'Moderate' ? 'Protocol: Accelerated ground transport. Continuous telemetry sync with receiving infrastructure.' :
                                            'Protocol: Standard diagnostic pathway. Transfer synchronization within 240min window.'}
                                </p>
                            </div>
                        </div>
                    )}
                </motion.section>
            </div>
        </div>
    );
};

export default SeverityScoring;
