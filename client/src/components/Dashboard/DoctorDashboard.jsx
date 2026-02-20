import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, Shield, Clock, Navigation, CheckCircle2, AlertTriangle,
    ArrowRightCircle, Building2, Wind, Heart, ShieldAlert, WifiOff, Wifi,
    UserCircle, FileText, Dna, Send, History, ChevronRight, Star, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyOverride from '../Medical/EmergencyOverride';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const SEVERITY_COLORS = {
    Critical: { badge: 'bg-urgent-red/5 border-urgent-red/20 text-urgent-red', dot: 'bg-urgent-red' },
    Moderate: { badge: 'bg-amber-500/5 border-amber-500/20 text-amber-500', dot: 'bg-amber-500' },
    Stable: { badge: 'bg-medical-teal/5 border-medical-teal/20 text-medical-teal', dot: 'bg-medical-teal' },
};

const STATUS_COLORS = {
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Accepted: 'bg-teal-50 text-healix-teal border-healix-teal/20',
    Rejected: 'bg-red-50 text-urgent-red border-urgent-red/20',
};

const DoctorDashboard = () => {
    const { addNotification } = useNotification();
    const { user } = useAuth();
    const [hospitals, setHospitals] = useState([]);
    const [lang, setLang] = useState('en');
    const [isOffline, setIsOffline] = useState(false);
    const [activeView, setActiveView] = useState('intake'); // 'intake' | 'history'
    const [formData, setFormData] = useState({
        patientName: '', age: '', oxygen: '', heartRate: '', systolicBP: '',
        needsICU: false, specialistType: '', symptoms: ''
    });
    const [topHospitals, setTopHospitals] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [reasoning, setReasoning] = useState('');
    const [loading, setLoading] = useState(false);
    const [severity, setSeverity] = useState({ level: 'Stable', score: 0 });
    const [overrideTarget, setOverrideTarget] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [sendingReferral, setSendingReferral] = useState(false);
    const [referralSent, setReferralSent] = useState(false);

    const i18n = {
        en: { intake: "Clinical Intelligence Intake", analyze: "Scan Regional Grid", patient: "Clinical Vitals", matching: "Top Recommendations", reasoning: "AI Clinical Reasoning", reserve: "Send Referral Request", critical: "Priority 1: Critical", moderate: "Priority 2: Moderate", stable: "Priority 3: Stable" },
        hi: { intake: "नैदानिक डेटा एकत्रण", analyze: "क्षेत्रीय विश्लेषण", patient: "मरीज के विटल्स", matching: "शीर्ष अनुशंसाएं", reasoning: "AI नैदानिक तर्क", reserve: "रेफरल भेजें", critical: "प्राथमिकता 1: गंभीर", moderate: "प्राथमिकता 2: मध्यम", stable: "प्राथमिकता 3: सामान्य" }
    };
    const t = i18n[lang];

    useEffect(() => { calculateSeverity(); }, [formData.oxygen, formData.heartRate, formData.systolicBP]);

    const fetchReferrals = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/referrals');
            setReferrals(res.data);
        } catch (err) { console.error('Failed to fetch referrals', err); }
    };

    useEffect(() => { fetchReferrals(); }, []);

    const calculateSeverity = () => {
        const { oxygen, heartRate, systolicBP } = formData;
        if (!oxygen && !heartRate && !systolicBP) return;
        let score = 0;
        const o2 = parseInt(oxygen) || 98;
        if (o2 < 85) score += 10; else if (o2 < 92) score += 5;
        const hr = parseInt(heartRate) || 75;
        if (hr > 120 || hr < 50) score += 8; else if (hr > 100) score += 3;
        const bp = parseInt(systolicBP) || 120;
        if (bp < 90 || bp > 180) score += 7;
        let level = 'Stable';
        if (score >= 15) level = 'Critical';
        else if (score >= 5) level = 'Moderate';
        setSeverity({ level, score });
    };

    const generateReasoning = (rec) => {
        const reasons = [
            `AI matched ${rec.name} as optimal facility for ${severity.level.toLowerCase()} patient.`,
            `Specialist: ${formData.specialistType || 'General Care'} confirmed available.`,
            `ETA: ${rec.ambulanceETA}min — within clinical threshold for ${severity.level} cases.`,
            `ICU capacity: ${rec.icuBeds} units available. Survival index: ${rec.survivalChance}%.`
        ];
        setReasoning(reasons.join(' '));
    };

    const handleFindHospital = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setReferralSent(false);
        try {
            const res = await axios.post('http://localhost:5000/api/score', { ...formData, urgency: severity.level });
            const sorted = [...res.data].sort((a, b) => b.score - a.score);
            setTopHospitals(sorted.slice(0, 3));
            setHospitals(res.data);
            const best = sorted[0];
            setRecommendation(best);
            generateReasoning(best);
            addNotification('Grid synchronized — top 3 hospitals found', 'success');
        } catch (err) {
            addNotification('Grid sync failed. Retry.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReferral = async (hospital) => {
        if (!formData.patientName || !formData.age) {
            addNotification('Please fill patient name and age first', 'error');
            return;
        }
        setSendingReferral(true);
        try {
            const res = await axios.post('http://localhost:5000/api/referrals', {
                patientName: formData.patientName,
                age: formData.age,
                severity: severity.level,
                hospitalId: hospital.id,
                symptoms: formData.symptoms || 'Not specified',
                specialistNeeded: formData.specialistType || 'General',
            });
            addNotification(`Referral ${res.data.referral.id} sent to ${hospital.name}!`, 'success');
            setReferralSent(true);
            fetchReferrals();
        } catch (err) {
            addNotification(err.response?.data?.message || 'Failed to send referral', 'error');
        } finally {
            setSendingReferral(false);
        }
    };

    const handleOverrideExecute = (reason) => {
        setRecommendation(overrideTarget);
        setOverrideTarget(null);
        setReasoning(`[EMERGENCY OVERRIDE] Manual routing to ${overrideTarget.name}. Reason: ${reason}`);
        addNotification('Emergency Override activated', 'warning');
    };

    const sevConf = SEVERITY_COLORS[severity.level];

    return (
        <div className="space-y-8 pb-40 max-w-7xl mx-auto">
            {/* Control Bridge */}
            <div className="flex flex-wrap gap-4 justify-between items-center glass-premium p-4 rounded-[24px] border border-slate-200/50 shadow-healix-sm">
                <div className="flex items-center gap-6 divide-x divide-slate-100">
                    <div className="flex items-center gap-3 px-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-orange-400' : 'bg-healix-teal shadow-[0_0_12px_rgba(13,148,136,0.5)] animate-pulse'}`} />
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{isOffline ? 'Offline Mode' : 'Grid Active'}</span>
                        <button onClick={() => setIsOffline(!isOffline)} className="text-slate-300 hover:text-healix-teal transition-colors">
                            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                        <UserCircle size={16} className="text-healix-teal opacity-50" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex">
                        <button onClick={() => setActiveView('intake')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all flex items-center gap-1.5 ${activeView === 'intake' ? 'bg-white text-healix-teal shadow-sm' : 'text-slate-400'}`}>
                            <Dna size={12} /> Intake
                        </button>
                        <button onClick={() => { setActiveView('history'); fetchReferrals(); }} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all flex items-center gap-1.5 ${activeView === 'history' ? 'bg-white text-healix-teal shadow-sm' : 'text-slate-400'}`}>
                            <History size={12} /> Referrals {referrals.length > 0 && <span className="bg-healix-teal text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">{referrals.length}</span>}
                        </button>
                    </div>
                    <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex shadow-inner">
                        <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${lang === 'en' ? 'bg-white text-healix-teal shadow-sm' : 'text-slate-400'}`}>EN</button>
                        <button onClick={() => setLang('hi')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${lang === 'hi' ? 'bg-white text-healix-teal shadow-sm' : 'text-slate-400'}`}>हिन्दी</button>
                    </div>
                </div>
            </div>

            {/* Title */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                        <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.3em]">Doctor Portal</span>
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-healix-navy tracking-tight leading-none">
                        {activeView === 'history' ? 'My Referral History' : t.intake}
                    </h1>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-healix-sm">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">MTTF: 1.2m</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeView === 'intake' ? (
                    <motion.div key="intake" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* Patient Intake Form */}
                            <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="healix-card p-10 bg-white">
                                <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-healix-teal shadow-inner">
                                            <Dna size={24} className="animate-float" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-healix-navy leading-none mb-1">{t.patient}</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Parameter Input</p>
                                        </div>
                                    </div>
                                    <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${sevConf.badge}`}>
                                        {severity.level === 'Critical' ? t.critical : severity.level === 'Moderate' ? t.moderate : t.stable}
                                    </div>
                                </div>

                                <form onSubmit={handleFindHospital} className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-300 ml-1">Patient Name</label>
                                            <div className="relative group">
                                                <input type="text" required placeholder="Ex: John Doe" value={formData.patientName}
                                                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-healix-teal/5 transition-all font-bold text-sm text-healix-navy placeholder:text-slate-300" />
                                                <FileText size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-healix-teal transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-300 ml-1">Age</label>
                                            <input type="number" required placeholder="00" value={formData.age}
                                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-healix-teal/5 transition-all font-bold text-sm text-healix-navy placeholder:text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-300 ml-1">Symptoms</label>
                                        <input type="text" placeholder="Chest pain, shortness of breath..." value={formData.symptoms}
                                            onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-healix-teal/5 transition-all font-bold text-sm text-healix-navy placeholder:text-slate-300" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-5">
                                        {[
                                            { icon: Wind, label: 'Oxygen %', key: 'oxygen', color: 'text-healix-teal', placeholder: '98' },
                                            { icon: Heart, label: 'Heart Rate', key: 'heartRate', color: 'text-urgent-red', placeholder: '75' },
                                            { icon: Activity, label: 'Systolic BP', key: 'systolicBP', color: 'text-medical-teal', placeholder: '120' }
                                        ].map((v) => (
                                            <div key={v.key} className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 hover:border-healix-teal/20 transition-all shadow-inner group">
                                                <v.icon size={16} className={`${v.color} mb-3 group-hover:scale-125 transition-transform`} />
                                                <label className="text-[9px] uppercase font-black text-slate-300 block mb-2 tracking-widest">{v.label}</label>
                                                <input type="number" placeholder={v.placeholder} value={formData[v.key]}
                                                    onChange={e => setFormData({ ...formData, [v.key]: e.target.value })}
                                                    className="bg-transparent text-2xl font-black text-healix-navy w-full outline-none placeholder:text-slate-200" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 shadow-inner">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-50">
                                                    <Building2 size={20} className="text-healix-teal" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-healix-navy">ICU Required</h3>
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Toggle if critical</p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <input type="checkbox" checked={formData.needsICU}
                                                    onChange={e => setFormData({ ...formData, needsICU: e.target.checked })}
                                                    className="peer sr-only" id="icu-toggle" />
                                                <label htmlFor="icu-toggle" className="block w-14 h-8 bg-slate-200 rounded-full cursor-pointer transition-colors peer-checked:bg-healix-teal" />
                                                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 pointer-events-none shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {["Cardiologist", "Neurologist", "Orthopedic", "General"].map(spec => (
                                                <button key={spec} type="button"
                                                    onClick={() => setFormData({ ...formData, specialistType: spec === 'General' ? '' : spec })}
                                                    className={`py-3 px-2 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all border ${(formData.specialistType === spec || (spec === 'General' && !formData.specialistType))
                                                        ? 'bg-healix-teal border-healix-teal text-white shadow-sm scale-105'
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-healix-teal/20'
                                                        }`}>
                                                    {spec}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="btn-healix-primary w-full py-5 flex items-center justify-center gap-4 text-sm tracking-[0.1em]">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRightCircle size={22} />}
                                        {t.analyze}
                                    </button>
                                </form>
                            </motion.section>

                            {/* Recommendation Panel */}
                            <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                {topHospitals.length === 0 ? (
                                    <div className="healix-card bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center text-center p-20 min-h-[600px]">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                                            <Activity size={64} className="text-slate-100 mb-8" />
                                        </motion.div>
                                        <h3 className="text-xl font-black text-slate-300 italic tracking-tight">Awaiting Medical Data</h3>
                                        <p className="text-[10px] uppercase font-bold text-slate-300 mt-4 tracking-[0.3em]">Fill form and scan grid</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Top 3 Label */}
                                        <div className="flex items-center gap-2">
                                            <Star size={16} className="text-amber-500" />
                                            <span className="text-[10px] font-black text-healix-navy uppercase tracking-[0.2em]">AI Top 3 Recommendations</span>
                                        </div>

                                        {topHospitals.map((h, rank) => (
                                            <motion.div key={h.id}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1 }}
                                                className={`healix-card p-7 bg-white relative overflow-hidden group ${rank === 0 ? 'border-l-4 border-l-healix-teal shadow-xl shadow-healix-teal/10' : ''}`}>
                                                {rank === 0 && <div className="absolute top-3 right-3 bg-healix-teal text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Best Match</div>}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-black text-slate-300 uppercase">#{rank + 1}</span>
                                                            <span className="text-[9px] font-black text-slate-400">Score: {h.score}</span>
                                                        </div>
                                                        <h3 className={`text-xl font-black tracking-tight ${rank === 0 ? 'text-healix-navy' : 'text-slate-700'}`}>{h.name}</h3>
                                                        <p className="text-xs text-slate-400 mt-1">{h.city}</p>
                                                    </div>
                                                    <div className={`text-[9px] font-black px-3 py-1.5 rounded-full border ${h.bedAvailability ? 'bg-teal-50 text-healix-teal border-healix-teal/20' : 'bg-red-50 text-urgent-red border-urgent-red/20'}`}>
                                                        {h.bedAvailability ? 'Available' : 'Full'}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 mb-5">
                                                    {[
                                                        { label: 'ETA', value: `${h.ambulanceETA}m`, color: 'text-healix-navy' },
                                                        { label: 'ICU', value: `${h.icuBeds}`, color: 'text-medical-teal' },
                                                        { label: 'Survival', value: `${h.survivalChance}%`, color: 'text-healix-teal' },
                                                    ].map(s => (
                                                        <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                                            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{s.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {rank === 0 && reasoning && (
                                                    <div className="bg-healix-navy rounded-2xl p-5 mb-4">
                                                        <p className="text-[9px] text-healix-teal font-black uppercase tracking-[0.2em] mb-2">AI Reasoning</p>
                                                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">{reasoning}</p>
                                                    </div>
                                                )}
                                                <button onClick={() => handleSendReferral(h)} disabled={sendingReferral || referralSent}
                                                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${referralSent && rank === 0 ? 'bg-teal-50 text-healix-teal border border-healix-teal/20' : rank === 0 ? 'btn-healix-primary' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-healix-teal/30 hover:text-healix-teal hover:bg-teal-50'}`}>
                                                    {sendingReferral ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> :
                                                        referralSent && rank === 0 ? <><CheckCircle2 size={16} /> Referral Sent!</> :
                                                            <><Send size={16} /> {rank === 0 ? t.reserve : `Send to #${rank + 1}`}</>}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </motion.section>
                        </div>

                        {/* Infrastructure Grid */}
                        {hospitals.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="healix-card p-10 bg-white">
                                <div className="flex flex-wrap gap-4 items-end justify-between mb-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1.5 h-6 bg-healix-teal rounded-full" />
                                            <span className="text-[10px] font-black text-healix-teal uppercase tracking-[0.3em]">Network Intelligence</span>
                                        </div>
                                        <h3 className="text-3xl font-display font-extrabold text-healix-navy tracking-tight">Regional Infrastructure</h3>
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 border border-slate-100 px-5 py-2.5 rounded-2xl uppercase tracking-widest bg-slate-50">
                                        {hospitals.length} Nodes Active
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {hospitals.map((h) => {
                                        const inTop3 = topHospitals.find(t => t.id === h.id);
                                        return (
                                            <div key={h.id} className={`p-6 rounded-[32px] border transition-all duration-500 group relative overflow-hidden ${inTop3 ? 'bg-white border-healix-teal/30 shadow-md scale-[1.02]' : 'bg-white border-slate-100 hover:border-healix-teal/20 hover:-translate-y-1'}`}>
                                                <div className="flex justify-between items-start mb-5">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${inTop3 ? 'bg-healix-teal text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-teal-50 group-hover:text-healix-teal'}`}>
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${h.bedAvailability ? 'text-medical-teal bg-medical-teal/5 border-medical-teal/10' : 'text-urgent-red bg-urgent-red/5 border-urgent-red/10'}`}>
                                                        {h.bedAvailability ? 'Available' : 'Full'}
                                                    </div>
                                                </div>
                                                <h4 className="font-extrabold text-healix-navy text-base mb-3 truncate group-hover:text-healix-teal transition-colors">{h.name}</h4>
                                                <div className="flex gap-4 mb-5">
                                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1.5">
                                                        <Clock size={14} className="text-healix-teal opacity-50" /> {h.ambulanceETA}m
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1.5">
                                                        <Activity size={14} className="text-medical-teal opacity-50" /> {h.icuBeds} ICU
                                                    </div>
                                                </div>
                                                {!inTop3 && (
                                                    <button onClick={() => setOverrideTarget(h)}
                                                        className="w-full bg-white border-2 border-slate-100 hover:border-urgent-red hover:bg-urgent-red hover:text-white text-slate-400 font-black py-3 rounded-[20px] transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                                                        <ShieldAlert size={14} /> Emergency Override
                                                    </button>
                                                )}
                                                {inTop3 && (
                                                    <div className="w-full bg-healix-teal/10 text-healix-teal font-black py-3 rounded-[20px] text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                                                        <CheckCircle2 size={14} /> AI Recommended
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}
                    </motion.div>
                ) : (
                    /* Referral History View */
                    <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        <div className="healix-card p-8 bg-white">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-healix-navy">My Referral Requests</h2>
                                <button onClick={fetchReferrals} className="text-xs font-bold text-healix-teal border border-healix-teal/20 bg-teal-50 px-4 py-2 rounded-xl hover:bg-healix-teal hover:text-white transition-all">Refresh</button>
                            </div>
                            {referrals.length === 0 ? (
                                <div className="text-center py-20">
                                    <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-300 font-black text-lg">No referrals yet</p>
                                    <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest">Start by scanning the grid</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {referrals.map(ref => (
                                        <motion.div key={ref.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-wrap gap-4 items-center p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-healix-teal/20 transition-all">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ref.severity === 'Critical' ? 'bg-urgent-red/10' : ref.severity === 'Moderate' ? 'bg-amber-50' : 'bg-teal-50'}`}>
                                                <AlertTriangle className={`w-5 h-5 ${ref.severity === 'Critical' ? 'text-urgent-red' : ref.severity === 'Moderate' ? 'text-amber-500' : 'text-healix-teal'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[10px] font-black text-slate-400">{ref.id}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${ref.severity === 'Critical' ? 'bg-urgent-red/10 text-urgent-red' : ref.severity === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-healix-teal'}`}>{ref.severity}</span>
                                                </div>
                                                <p className="font-black text-healix-navy text-sm">{ref.patientName}, {ref.age}yrs</p>
                                                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                                    <Navigation size={10} /> {ref.hospitalName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${STATUS_COLORS[ref.status]}`}>{ref.status}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold">{new Date(ref.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {ref.notes && (
                                                <p className="w-full text-xs text-slate-400 font-semibold mt-1 pl-14">{ref.notes}</p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Override Modal */}
            <AnimatePresence>
                {overrideTarget && (
                    <EmergencyOverride
                        hospital={overrideTarget}
                        onConfirm={handleOverrideExecute}
                        onClose={() => setOverrideTarget(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorDashboard;
