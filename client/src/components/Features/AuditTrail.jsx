import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, User, Building2, CheckCircle, AlertTriangle, Search, Filter, ChevronDown } from 'lucide-react';

const auditData = [
    { id: 'REF-7742', patient: 'Ramesh K.', doctor: 'Dr. Smith', from: 'PHC Barwani', to: 'City General Hospital', severity: 'Critical', decision: 'AI Recommended', status: 'Completed', time: '14:32', date: '2026-02-19', override: false, confidence: 94 },
    { id: 'REF-7741', patient: 'Sunita D.', doctor: 'Dr. Smith', from: 'PHC Dhar', to: 'District Medical Center', severity: 'Moderate', decision: 'AI Recommended', status: 'In Transit', time: '13:15', date: '2026-02-19', override: false, confidence: 87 },
    { id: 'REF-7740', patient: 'Mohan P.', doctor: 'Dr. Gupta', from: 'CHC Khargone', to: "St. Mary's Specialty", severity: 'Critical', decision: 'Override', status: 'Completed', time: '12:48', date: '2026-02-19', override: true, confidence: 72 },
    { id: 'REF-7739', patient: 'Priya S.', doctor: 'Dr. Smith', from: 'PHC Barwani', to: 'Community Care Hospital', severity: 'Stable', decision: 'AI Recommended', status: 'Completed', time: '11:20', date: '2026-02-19', override: false, confidence: 96 },
    { id: 'REF-7738', patient: 'Ajay M.', doctor: 'Dr. Roy', from: 'PHC Sendhwa', to: 'City General Hospital', severity: 'Critical', decision: 'AI Recommended', status: 'Failed', time: '10:05', date: '2026-02-18', override: false, confidence: 91 },
    { id: 'REF-7737', patient: 'Kavita R.', doctor: 'Dr. Gupta', from: 'CHC Khargone', to: 'Rural Health Institute', severity: 'Stable', decision: 'Manual', status: 'Completed', time: '09:40', date: '2026-02-18', override: true, confidence: 65 },
    { id: 'REF-7736', patient: 'Vikram T.', doctor: 'Dr. Smith', from: 'PHC Barwani', to: 'District Medical Center', severity: 'Moderate', decision: 'AI Recommended', status: 'Completed', time: '08:15', date: '2026-02-18', override: false, confidence: 89 },
];

const AuditTrail = () => {
    const [expanded, setExpanded] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = auditData.filter(a =>
        a.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.to.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColor = (s) => s === 'Completed' ? 'med-green' : s === 'In Transit' ? 'med-blue' : 'urgent-red';
    const sevColor = (s) => s === 'Critical' ? 'urgent-red' : s === 'Moderate' ? 'warning-amber' : 'med-green';

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-primary-navy tracking-tight">Digital Referral Audit Trail</h1>
                <p className="text-slate-500 font-semibold text-sm">Complete decision transparency • HIPAA-compliant logging</p>
            </header>

            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Referrals', value: auditData.length, icon: FileText, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
                    { label: 'AI Decisions', value: auditData.filter(a => !a.override).length, icon: CheckCircle, color: 'text-medical-teal', bg: 'bg-medical-teal/10' },
                    { label: 'Overrides', value: auditData.filter(a => a.override).length, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Avg Confidence', value: `${Math.round(auditData.reduce((s, a) => s + a.confidence, 0) / auditData.length)}%`, icon: Filter, color: 'text-primary-navy', bg: 'bg-slate-100' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="medical-card p-8 group hover:scale-[1.02] transition-all">
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-6 shadow-sm border border-black/5`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</p>
                        <p className="text-3xl font-black text-primary-navy mt-1 tracking-tight">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="medical-card p-6 flex items-center gap-5 border-slate-200 shadow-sm focus-within:border-accent-purple/50 transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input type="text" placeholder="Search by patient, ID, or hospital..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-base font-bold text-primary-navy placeholder-slate-300" />
            </div>

            <div className="space-y-4">
                {filtered.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="medical-card p-6 cursor-pointer hover:border-slate-300 transition-all group overflow-hidden relative"
                        onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${a.status === 'Completed' ? 'bg-medical-teal/10 text-medical-teal' :
                                        a.status === 'In Transit' ? 'bg-accent-purple/10 text-accent-purple' :
                                            'bg-coral-accent/10 text-coral-accent'
                                    } shadow-sm border border-black/5`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-black text-primary-navy uppercase tracking-wider">{a.id}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${a.severity === 'Critical' ? 'bg-coral-accent/10 text-coral-accent border-coral-accent/20' :
                                                a.severity === 'Moderate' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-medical-teal/10 text-medical-teal border-medical-teal/20'
                                            }`}>{a.severity}</span>
                                        {a.override && <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">Override</span>}
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold mt-1.5 uppercase tracking-tight">{a.patient} • <span className="text-slate-400">{a.from}</span> <ArrowRightCircle className="w-3 h-3 inline-block mx-1 opacity-30" /> <span className="text-primary-navy">{a.to}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${a.status === 'Completed' ? 'bg-medical-teal text-white' :
                                        a.status === 'In Transit' ? 'bg-accent-purple text-white' :
                                            'bg-coral-accent text-white'
                                    }`}>{a.status}</span>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{a.date}</p>
                                    <p className="text-sm font-black text-primary-navy mt-0.5">{a.time}</p>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-500 ${expanded === a.id ? 'rotate-180 text-accent-purple' : ''}`} />
                            </div>
                        </div>

                        {expanded === a.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-4 gap-6 relative z-10">
                                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 group-hover:bg-white transition-all">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Doctor</p>
                                    <p className="text-sm font-black text-primary-navy">{a.doctor}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 group-hover:bg-white transition-all">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Decision Logic</p>
                                    <div className="flex items-center gap-2">
                                        <Brain className={`w-4 h-4 ${a.override ? 'text-orange-500' : 'text-accent-purple'}`} />
                                        <p className="text-sm font-black text-primary-navy">{a.decision}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 group-hover:bg-white transition-all">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">AI Confidence</p>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 mb-2">
                                        <div className="bg-accent-purple h-full rounded-full" style={{ width: `${a.confidence}%` }}></div>
                                    </div>
                                    <p className="text-sm font-black text-primary-navy">{a.confidence}%</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 group-hover:bg-white transition-all">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">System Stamp</p>
                                    <p className="text-sm font-black font-mono text-slate-500">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AuditTrail;
