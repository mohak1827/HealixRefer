import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope, User, FileText, AlertTriangle, CheckCircle2, Clock,
    Send, Building2, MapPin, Activity, Heart, TrendingUp, Shield,
    Upload, Zap, ArrowRight, Info, BarChart3, Bed, CircleDot,
    Navigation, Filter, Star, Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
    suggestHospitals, classifySeverity, createReferral,
    getReferrals, LOCATION_LIST
} from './referralEngine';

const SPECIALISTS = ['General', 'Cardiologist', 'Neurologist', 'Orthopedic', 'Pulmonologist', 'General Surgeon'];

const DoctorDashboard = ({ activeView }) => {
    const { user } = useAuth();
    const { addNotification: notify } = useNotification();
    const [view, setView] = useState(activeView === 'history' ? 'history' : 'create');
    const [referrals, setReferrals] = useState([]);
    const [form, setForm] = useState({
        patientName: '', patientAge: '', patientVillage: '', patientContact: '',
        symptoms: '', urgency: 'Normal', specialistNeeded: '', needsICU: false,
        notes: '', medicalReport: '', patientLocation: ''
    });
    const [aiResult, setAiResult] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reservationResult, setReservationResult] = useState(null);
    const [severityResult, setSeverityResult] = useState(null);
    const [distFilter, setDistFilter] = useState('all'); // 'all' | 'near' | 'mid'

    useEffect(() => { setView(activeView === 'history' ? 'history' : 'create'); }, [activeView]);
    useEffect(() => { setReferrals(getReferrals()); }, []);

    const handleGenerateAI = () => {
        if (!form.patientName || !form.symptoms) {
            notify('Please fill patient name and symptoms', 'error');
            return;
        }
        if (!form.patientLocation) {
            notify('Please select patient location for accurate recommendations', 'error');
            return;
        }
        setLoading(true);

        // Small timeout to show loading animation
        setTimeout(() => {
            const result = suggestHospitals({
                symptoms: form.symptoms,
                urgency: form.urgency,
                specialistNeeded: form.specialistNeeded,
                needsICU: form.needsICU,
                patientLocation: form.patientLocation,
            });
            const severity = classifySeverity(form.symptoms, form.urgency, form.needsICU, form.specialistNeeded);

            setAiResult(result);
            setSeverityResult(severity);
            if (result.bestMatch) setSelectedHospital(result.bestMatch);
            setStep(2);
            setLoading(false);
        }, 800);
    };

    const handleConfirmReferral = () => {
        if (!selectedHospital) return;
        setLoading(true);

        setTimeout(() => {
            const res = createReferral({
                form, hospital: selectedHospital, severity: severityResult,
                doctorName: user?.name || 'Doctor'
            });
            setReservationResult(res);
            setStep(3);
            notify('Referral confirmed! Resources auto-reserved.', 'success');
            setReferrals(getReferrals());
            setLoading(false);
        }, 600);
    };

    const resetForm = () => {
        setForm({ patientName: '', patientAge: '', patientVillage: '', patientContact: '', symptoms: '', urgency: 'Normal', specialistNeeded: '', needsICU: false, notes: '', medicalReport: '', patientLocation: '' });
        setAiResult(null);
        setSelectedHospital(null);
        setStep(1);
        setReservationResult(null);
        setSeverityResult(null);
        setDistFilter('all');
    };

    const getRiskColor = (level) => {
        if (level === 'Low') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
        if (level === 'Medium') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' };
    };

    // Filter suggestions by distance
    const filteredSuggestions = (aiResult?.suggestions || []).filter(h => {
        if (distFilter === 'near') return h.distance <= 20;
        if (distFilter === 'mid') return h.distance <= 50;
        return true;
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-medical-blue/10 rounded-xl flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-medical-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark">{view === 'history' ? 'Referral History' : 'Doctor Dashboard'}</h1>
                        <p className="text-sm text-gray-400 font-medium">{user?.phcName || 'Primary Health Center'} • {user?.name}</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'create' ? (
                    <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {/* Step Indicator */}
                        <div className="flex items-center gap-4 mb-8">
                            {[{ n: 1, label: 'Patient Details' }, { n: 2, label: 'AI Analysis' }, { n: 3, label: 'Confirmed' }].map((s, i) => (
                                <React.Fragment key={s.n}>
                                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-medical text-xs font-bold transition-all ${step >= s.n ? 'bg-medical-green text-white shadow-soft' : 'bg-medical-gray text-gray-400'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= s.n ? 'bg-white text-medical-green' : 'bg-gray-200 text-gray-500'}`}>{s.n}</span>
                                        {s.label}
                                    </div>
                                    {i < 2 && <ArrowRight className={`w-5 h-5 ${step > s.n ? 'text-medical-green' : 'text-gray-200'}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* STEP 1: Patient Form */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="medical-card p-8">
                                    <h3 className="text-md font-bold text-medical-dark mb-6 flex items-center gap-2">
                                        <User className="w-5 h-5 text-medical-blue" /> Patient Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name *</label>
                                            <input placeholder="Enter patient name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Age</label>
                                            <input placeholder="Enter age" type="number" value={form.patientAge} onChange={e => setForm({ ...form, patientAge: e.target.value })}
                                                className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Village / Locality</label>
                                            <input placeholder="Enter village" value={form.patientVillage} onChange={e => setForm({ ...form, patientVillage: e.target.value })}
                                                className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Contact Number</label>
                                            <input placeholder="Enter phone" value={form.patientContact} onChange={e => setForm({ ...form, patientContact: e.target.value })}
                                                className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* ★ Patient Location (GPS/Area selector) */}
                                <div className="medical-card p-8 border-2 border-medical-blue/20">
                                    <h3 className="text-md font-bold text-medical-dark mb-4 flex items-center gap-2">
                                        <Navigation className="w-5 h-5 text-medical-blue" /> Patient Location <span className="text-urgent-red">*</span>
                                        <span className="ml-auto text-[10px] font-bold text-medical-blue bg-blue-50 px-3 py-1 rounded-full">Drives hospital recommendations</span>
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-4">Nearest hospitals will be computed from this location using real coordinates.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {LOCATION_LIST.map(loc => (
                                            <button key={loc} onClick={() => setForm({ ...form, patientLocation: loc })}
                                                className={`px-4 py-2.5 rounded-medical text-xs font-bold transition-all border-2 ${form.patientLocation === loc
                                                    ? 'bg-medical-blue text-white border-medical-blue shadow-soft'
                                                    : 'bg-white text-gray-500 border-medical-gray hover:border-medical-blue/30 hover:text-medical-blue'
                                                    }`}>
                                                <MapPin className="w-3 h-3 inline mr-1" />{loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="medical-card p-8">
                                    <h3 className="text-md font-bold text-medical-dark mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-medical-green" /> Medical Details
                                    </h3>
                                    <div className="space-y-1 mb-6">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Symptoms & Initial Diagnosis *</label>
                                        <textarea placeholder="Describe symptoms clearly..." value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })}
                                            rows={3} className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 transition-all" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Urgency Level</label>
                                            <div className="flex gap-3">
                                                {['Normal', 'Emergency'].map(u => (
                                                    <button key={u} onClick={() => setForm({ ...form, urgency: u })}
                                                        className={`flex-1 py-3 rounded-medical text-xs font-bold transition-all border-2 ${form.urgency === u
                                                            ? u === 'Emergency' ? 'bg-urgent-red border-urgent-red text-white shadow-soft' : 'bg-medical-blue border-medical-blue text-white shadow-soft'
                                                            : 'bg-white border-medical-gray text-gray-400 hover:border-medical-blue/30 hover:text-medical-blue'}`}>
                                                        {u === 'Emergency' && <AlertTriangle className="w-3 h-3 inline mr-1" />}{u}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Specialist Required</label>
                                            <select value={form.specialistNeeded} onChange={e => setForm({ ...form, specialistNeeded: e.target.value })}
                                                className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue transition-all bg-white cursor-pointer">
                                                <option value="">Select Category</option>
                                                {SPECIALISTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-medical-gray/30 p-4 rounded-medical border border-medical-gray/50">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={form.needsICU} onChange={e => setForm({ ...form, needsICU: e.target.checked })}
                                                className="w-5 h-5 rounded border-medical-gray text-medical-blue focus:ring-medical-blue/20" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-medical-dark">Requires ICU Facility</span>
                                                <span className="text-[10px] text-gray-400">Mark if patient needs ventilator or critical support</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="medical-card p-8">
                                    <h3 className="text-md font-bold text-medical-dark mb-6 flex items-center gap-2">
                                        <Upload className="w-5 h-5 text-gray-400" /> Medical Reports & Evidence
                                    </h3>
                                    <div className="border-2 border-dashed border-medical-gray rounded-medical p-8 text-center hover:border-medical-green/40 transition-all cursor-pointer bg-medical-gray/10 group"
                                        onClick={() => setForm({ ...form, medicalReport: 'clinical_report_2026.pdf' })}>
                                        {form.medicalReport ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-12 h-12 bg-medical-green/10 rounded-full flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-medical-green" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-medical-dark">{form.medicalReport}</div>
                                                    <div className="text-[10px] text-medical-green font-bold">Successfully Attached ✓</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-medical-green transition-colors" />
                                                <p className="text-sm font-bold text-gray-600">Attached clinical reports & images</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Supports PDF, JPG, PNG (Simulated Upload)</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-6">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Additional Clinical Notes</label>
                                        <textarea placeholder="Any other relevant details..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                            rows={2} className="w-full px-4 py-3 rounded-medical border border-medical-gray text-sm font-medium focus:outline-none focus:border-medical-blue transition-all" />
                                    </div>
                                </div>

                                <button onClick={handleGenerateAI} disabled={loading}
                                    className="w-full py-5 rounded-medical bg-medical-green text-white font-bold text-md shadow-medical hover:bg-green-700 transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 select-none outline-none relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Sequencing Clinical Data...</span>
                                        </div>
                                    ) : (
                                        <><Zap className="w-5 h-5 animate-pulse" /> Analyze Case with AI Intelligence</>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: AI Review */}
                        {step === 2 && aiResult && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* AI Severity Classification */}
                                {severityResult && (
                                    <div className="medical-card p-6 border-2" style={{ borderColor: severityResult.color + '40' }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-md font-bold text-medical-dark flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" style={{ color: severityResult.color }} /> AI Severity Classification
                                            </h3>
                                            <div className="px-5 py-2 rounded-full text-xs font-bold text-white shadow-soft" style={{ backgroundColor: severityResult.color }}>
                                                {severityResult.level} Case
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severity Score</span>
                                                <span className="text-sm font-bold" style={{ color: severityResult.color }}>{severityResult.score}/100</span>
                                            </div>
                                            <div className="h-3 bg-medical-gray rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${severityResult.score}%` }} transition={{ duration: 1 }}
                                                    className="h-full rounded-full" style={{ backgroundColor: severityResult.color }} />
                                            </div>
                                        </div>
                                        {severityResult.reasons?.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {severityResult.reasons.map((r, i) => (
                                                    <span key={i} className="px-3 py-1 rounded-full text-[10px] font-bold bg-medical-gray text-gray-600 border border-gray-200">{r}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Location & Distance Filter */}
                                <div className="medical-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-md font-bold text-medical-dark flex items-center gap-2">
                                            <Filter className="w-5 h-5 text-medical-blue" /> Location Filter
                                            <span className="text-xs font-medium text-gray-400 ml-2">
                                                Patient at <span className="text-medical-blue font-bold">{form.patientLocation}</span>
                                            </span>
                                        </h3>
                                        <span className="text-xs font-bold text-gray-400">{filteredSuggestions.length} hospitals found</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'near', label: 'Nearby (< 20 km)', icon: '📍' },
                                            { id: 'mid', label: 'Within 50 km', icon: '🗺️' },
                                            { id: 'all', label: 'All Locations', icon: '🌐' },
                                        ].map(f => (
                                            <button key={f.id} onClick={() => setDistFilter(f.id)}
                                                className={`px-4 py-2 rounded-medical text-xs font-bold transition-all border-2 ${distFilter === f.id
                                                    ? 'bg-medical-blue text-white border-medical-blue shadow-soft'
                                                    : 'bg-white text-gray-500 border-medical-gray hover:border-medical-blue/30'
                                                    }`}>
                                                {f.icon} {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>


                                {/* Best Hospital Suggestion */}
                                {selectedHospital && (
                                    <div className="medical-card p-8 border-2 border-medical-green/30 bg-green-50/5">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="px-3 py-1 bg-medical-green text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-soft">
                                                <Star className="w-3 h-3 inline mr-1" />AI Optimized Choice
                                            </div>
                                        </div>
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-medical-dark mb-1">{selectedHospital.name}</h3>
                                                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-medical-blue" /> {selectedHospital.city} • {selectedHospital.distance} km away
                                                    <span className="text-medical-blue font-bold">• ~{selectedHospital.travelTime} min travel</span>
                                                </div>
                                            </div>
                                            <div className="bg-white border-2 border-medical-green rounded-2xl p-4 text-center shadow-medical">
                                                <div className="text-3xl font-black text-medical-green">{selectedHospital.score}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Match Score</div>
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div className="bg-medical-green/10 border border-medical-green/20 rounded-medical p-4 mb-6">
                                            <p className="text-sm font-semibold text-green-800 leading-relaxed">
                                                💡 <span className="text-medical-green font-bold">Why this hospital?</span> {selectedHospital.reasonString}
                                            </p>
                                        </div>

                                        {/* Stats Grid — Beds, ICU, Doctors, Survival */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-white rounded-medical p-4 text-center shadow-soft border border-medical-gray">
                                                <Bed className="w-5 h-5 text-medical-blue mx-auto mb-2" />
                                                <div className="text-lg font-bold text-medical-dark">{selectedHospital.effectiveBeds}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Beds Free</div>
                                            </div>
                                            <div className="bg-white rounded-medical p-4 text-center shadow-soft border border-medical-gray">
                                                <Heart className="w-5 h-5 text-urgent-red mx-auto mb-2" />
                                                <div className="text-lg font-bold text-medical-dark">{selectedHospital.effectiveICU}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">ICU Units</div>
                                            </div>
                                            <div className="bg-white rounded-medical p-4 text-center shadow-soft border border-medical-gray">
                                                <UsersIcon className="w-5 h-5 text-medical-green mx-auto mb-2" />
                                                <div className="text-lg font-bold text-medical-dark">
                                                    {Object.values(selectedHospital.specialistSlots || {}).reduce((a, b) => a + b, 0)}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Doctor Slots</div>
                                            </div>
                                            <div className="bg-white rounded-medical p-4 text-center shadow-soft border border-medical-gray">
                                                <TrendingUp className="w-5 h-5 text-medical-green mx-auto mb-2" />
                                                <div className="text-lg font-bold text-medical-dark">{selectedHospital.survivalChance}%</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Survival Rank</div>
                                            </div>
                                        </div>

                                        {/* Available specialists */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedHospital.specialists?.map(s => (
                                                <span key={s} className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${s === form.specialistNeeded ? 'bg-medical-blue text-white shadow-soft' : 'bg-medical-gray text-gray-500 border border-gray-200'}`}>
                                                    {s} {selectedHospital.specialistSlots?.[s] ? `(${selectedHospital.specialistSlots[s]} avail)` : ''}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Equipment */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedHospital.equipment?.map(eq => (
                                                <span key={eq} className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
                                                    {eq}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Options */}
                                {filteredSuggestions.length > 1 && (
                                    <div className="medical-card p-8">
                                        <h3 className="text-md font-bold text-medical-dark mb-6 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-medical-blue" /> Alternative Hospital Options
                                            <span className="text-xs font-medium text-gray-400 ml-2">Ranked by proximity + availability</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {filteredSuggestions.filter(h => h.id !== selectedHospital?.id).slice(0, 5).map((h, idx) => (
                                                <button key={h.id} onClick={() => setSelectedHospital(h)}
                                                    className={`w-full flex items-center justify-between p-5 rounded-medical border-2 transition-all text-left hover:shadow-soft ${selectedHospital?.id === h.id ? 'border-medical-blue bg-blue-50/50' : 'border-medical-gray bg-white'}`}>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-bold text-gray-300">#{idx + 2}</span>
                                                            <span className="text-md font-bold text-medical-dark">{h.name}</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-3 flex-wrap">
                                                            <span><MapPin className="w-3 h-3 inline" /> {h.city} • {h.distance} km</span>
                                                            <span><Bed className="w-3 h-3 inline" /> {h.effectiveBeds} beds</span>
                                                            <span><Heart className="w-3 h-3 inline" /> {h.effectiveICU} ICU</span>
                                                            <span><UsersIcon className="w-3 h-3 inline" /> {h.specialists.length} specialties</span>
                                                            <span><Clock className="w-3 h-3 inline" /> ~{h.travelTime} min</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 shrink-0 ml-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getRiskColor(h.delayRisk.level).bg} ${getRiskColor(h.delayRisk.level).text}`}>
                                                            {h.delayRisk.level} Risk
                                                        </span>
                                                        <div className="text-xl font-black text-medical-blue">{h.score}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-medical border-2 border-medical-gray text-sm font-bold text-gray-400 hover:border-medical-blue/30 hover:text-medical-blue transition-all">
                                        ← Back to Form
                                    </button>
                                    <button onClick={handleConfirmReferral} disabled={loading}
                                        className="flex-[2] py-4 rounded-medical bg-medical-blue text-white font-bold text-md shadow-soft hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Confirm & Reserve Resources</>}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Confirmed */}
                        {step === 3 && reservationResult && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                <div className="medical-card p-10 text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                                        className="w-24 h-24 bg-medical-green/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-medical">
                                        <CheckCircle2 className="w-12 h-12 text-medical-green" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-medical-dark mb-2">Referral Confirmed & Synchronized</h2>
                                    <p className="text-gray-400 font-medium mb-10">Resources have been successfully allocated at {reservationResult.reservation?.hospitalName}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-10 text-left">
                                        <div className="bg-medical-blue/10 border border-medical-blue/20 rounded-medical p-5">
                                            <div className="text-[10px] font-bold text-medical-blue uppercase tracking-widest mb-1">Referral Reference</div>
                                            <div className="text-xl font-black text-medical-blue">{reservationResult.referral?.id}</div>
                                        </div>
                                        <div className="bg-medical-green/10 border border-medical-green/20 rounded-medical p-5">
                                            <div className="text-[10px] font-bold text-medical-green uppercase tracking-widest mb-1">Reservation ID</div>
                                            <div className="text-xl font-black text-medical-green">{reservationResult.reservation?.id}</div>
                                        </div>
                                    </div>

                                    {reservationResult.reservation && (
                                        <div className="bg-medical-gray/30 border border-medical-gray rounded-medical p-8 text-left max-w-lg mx-auto">
                                            <h4 className="text-sm font-bold text-medical-dark mb-5 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-medical-green" /> Resource Allocation Voucher
                                            </h4>
                                            <div className="space-y-4">
                                                {reservationResult.reservation.bedReserved && (
                                                    <div className="flex items-center justify-between py-2 border-b border-white">
                                                        <span className="text-gray-500 font-medium text-sm">General Bed</span>
                                                        <span className="font-bold text-medical-dark bg-white px-3 py-1 rounded-lg border border-medical-gray shadow-soft"># {reservationResult.reservation.bedNumber || 'ALLOCATED'}</span>
                                                    </div>
                                                )}
                                                {reservationResult.reservation.icuReserved && (
                                                    <div className="flex items-center justify-between py-2 border-b border-white">
                                                        <span className="text-gray-500 font-medium text-sm">ICU Ventilator Unit</span>
                                                        <span className="font-black text-urgent-red bg-red-50 px-3 py-1 rounded-lg border border-red-100">URGENT RESERVED</span>
                                                    </div>
                                                )}
                                                {reservationResult.reservation.specialistReserved && (
                                                    <div className="flex items-center justify-between py-2 border-b border-white">
                                                        <span className="text-gray-500 font-medium text-sm">Specialist On-Call</span>
                                                        <span className="font-bold text-medical-blue">{reservationResult.reservation.specialistReserved}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between py-2 border-b border-white">
                                                    <span className="text-gray-500 font-medium text-sm">Target Hospital</span>
                                                    <span className="font-bold text-medical-dark">{reservationResult.reservation.hospitalName}</span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-gray-500 font-medium text-sm">System Status</span>
                                                    <span className="font-bold text-medical-green bg-green-100 px-4 py-1 rounded-full text-[10px] uppercase">Active & Secure ✓</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={resetForm} className="mt-10 px-10 py-4 rounded-medical bg-medical-dark text-white font-bold text-sm shadow-soft hover:-translate-y-1 transition-all">
                                        Prepare Another Referral
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="space-y-4">
                            {referrals.length === 0 ? (
                                <div className="medical-card p-16 text-center">
                                    <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-gray-400">No active or historical referrals found.</p>
                                </div>
                            ) : (
                                referrals.map(ref => (
                                    <motion.div key={ref.id} className="medical-card p-6" whileHover={{ y: -3 }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className="text-xs font-bold text-medical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">ID: {ref.id}</span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ref.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {ref.urgency}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ref.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : ref.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ref.status === 'Rejected' ? 'bg-red-100 text-red-700' : ref.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-medical-gray text-medical-dark'}`}>
                                                        {ref.status}
                                                    </span>
                                                    {ref.delayRisk && (
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRiskColor(ref.delayRisk.level).bg} ${getRiskColor(ref.delayRisk.level).text}`}>
                                                            {ref.delayRisk.level} Risk
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-lg font-bold text-medical-dark">{ref.patientName} <span className="text-gray-400 font-medium">({ref.patientAge}y)</span></div>
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-1">{ref.symptoms}</p>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-medical-dark">
                                                        <Building2 className="w-4 h-4 text-medical-green" /> {ref.hospitalName}
                                                    </div>
                                                    {ref.escalationHistory?.length > 0 && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                            🔄 Escalated {ref.escalationHistory.length}x
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-bold text-medical-dark bg-medical-gray/50 px-3 py-2 rounded-medical border border-medical-gray">
                                                    {new Date(ref.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                    <div className="text-[10px] text-gray-400 font-medium mt-0.5">{new Date(ref.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorDashboard;
