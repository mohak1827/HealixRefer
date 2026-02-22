import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Send, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const pastFeedback = [
    { id: 1, doctor: 'Dr. Smith', referral: 'REF-7742', hospital: 'City General', rating: 5, comment: 'Excellent recommendation. Patient reached ICU within 25 mins.', outcome: 'Positive', date: '2026-02-19' },
    { id: 2, doctor: 'Dr. Gupta', referral: 'REF-7740', hospital: "St. Mary's", rating: 3, comment: 'AI suggested City General but patient needed neuro specialist only at St. Marys.', outcome: 'Override Required', date: '2026-02-19' },
    { id: 3, doctor: 'Dr. Roy', referral: 'REF-7738', hospital: 'City General', rating: 2, comment: 'Hospital was at full capacity. AI did not account for recent surge.', outcome: 'Negative', date: '2026-02-18' },
    { id: 4, doctor: 'Dr. Smith', referral: 'REF-7736', hospital: 'District Medical', rating: 4, comment: 'Good match for moderate case. Transport was smooth.', outcome: 'Positive', date: '2026-02-18' },
    { id: 5, doctor: 'Dr. Patel', referral: 'REF-7735', hospital: 'Community Care', rating: 5, comment: 'Perfect recommendation. Specialist available immediately.', outcome: 'Positive', date: '2026-02-17' },
];

const FeedbackLoop = () => {
    const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: '', referralId: '' });
    const [submitted, setSubmitted] = useState(false);

    const avgRating = (pastFeedback.reduce((s, f) => s + f.rating, 0) / pastFeedback.length).toFixed(1);
    const positiveRate = Math.round((pastFeedback.filter(f => f.outcome === 'Positive').length / pastFeedback.length) * 100);

    const handleSubmit = () => {
        if (newFeedback.rating > 0 && newFeedback.comment) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            setNewFeedback({ rating: 0, comment: '', referralId: '' });
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-primary-navy tracking-tight">Smart Feedback Loop</h1>
                <p className="text-slate-500 font-semibold text-sm">Continuous AI refinement • Doctor-driven learning</p>
            </header>

            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Rating', value: `${avgRating}/5`, icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Total Reviews', value: pastFeedback.length, icon: MessageSquare, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
                    { label: 'Positive Rate', value: `${positiveRate}%`, icon: ThumbsUp, color: 'text-medical-teal', bg: 'bg-medical-teal/10' },
                    { label: 'AI Adjustments', value: 12, icon: TrendingUp, color: 'text-primary-navy', bg: 'bg-slate-100' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="medical-card p-8 group hover:scale-[1.05] transition-all">
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</p>
                        <p className="text-3xl font-black text-primary-navy mt-1 tracking-tight">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="medical-card p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-black text-primary-navy mb-8 flex items-center gap-3">
                        <Send className="w-6 h-6 text-accent-purple" /> Submit Clinical Feedback
                    </h2>

                    {submitted ? (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16">
                            <div className="w-20 h-20 bg-medical-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-medical-teal/20">
                                <CheckCircle className="w-10 h-10 text-medical-teal" />
                            </div>
                            <h3 className="text-2xl font-black text-primary-navy">Feedback Successfully Logged</h3>
                            <p className="text-sm text-slate-500 font-medium mt-3 max-w-sm mx-auto">Thank you for your contribution. The AI engine will recalibrate based on your professional validation.</p>
                        </motion.div>
                    ) : (
                        <div className="grid lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1 block mb-3">Referral Connection</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <TrendingUp className="h-4 w-4 text-slate-300" />
                                        </div>
                                        <input type="text" placeholder="e.g., REF-7742" value={newFeedback.referralId}
                                            onChange={e => setNewFeedback({ ...newFeedback, referralId: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[20px] pl-12 pr-5 py-4 outline-none focus:border-accent-purple focus:bg-white transition-all font-bold text-sm text-primary-navy placeholder-slate-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1 block mb-4">Quality Rating</label>
                                    <div className="flex gap-4 p-4 bg-slate-50 rounded-[20px] border border-slate-200 w-fit">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} onClick={() => setNewFeedback({ ...newFeedback, rating: s })}
                                                className="transition-all hover:scale-125 focus:outline-none">
                                                <Star className={`w-8 h-8 ${newFeedback.rating >= s ? 'text-orange-500 fill-orange-500 drop-shadow-sm' : 'text-slate-200 hover:text-orange-200'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1 block mb-3">Observation & Critique</label>
                                    <textarea placeholder="Describe clinical outcomes, discrepancies, or operational friction..." value={newFeedback.comment}
                                        onChange={e => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-5 outline-none focus:border-accent-purple focus:bg-white transition-all font-bold text-sm text-primary-navy placeholder-slate-300 min-h-[160px] resize-none leading-relaxed" />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleSubmit}
                                        className="bg-primary-navy text-white font-black px-12 py-5 rounded-[24px] hover:bg-accent-purple hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4 text-sm tracking-widest shadow-xl shadow-primary-navy/20 uppercase">
                                        <Send className="w-5 h-5" /> Dispatch Feedback
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.section>

            <div className="space-y-6">
                <div className="flex items-center gap-4 py-4">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <h2 className="text-sm font-black text-slate-400 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <MessageSquare className="w-5 h-5" /> Community Validations
                    </h2>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid gap-4">
                    {pastFeedback.map((f, i) => (
                        <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="medical-card p-8 hover:border-slate-300 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center font-black text-primary-navy text-xs border border-slate-200 group-hover:bg-white shadow-sm">
                                        {f.doctor.split(' ')[1][0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-base font-black text-primary-navy">{f.doctor}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200">{f.referral}</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{f.hospital} Connection</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    {Array.from({ length: 5 }, (_, j) => (
                                        <Star key={j} className={`w-4 h-4 ${j < f.rating ? 'text-orange-500 fill-orange-500' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 font-bold leading-relaxed mb-6 pl-1 border-l-2 border-slate-100 italic">"{f.comment}"</p>
                            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border shadow-sm ${f.outcome === 'Positive' ? 'bg-medical-teal text-white border-medical-teal' :
                                            f.outcome === 'Negative' ? 'bg-coral-accent text-white border-coral-accent' :
                                                'bg-orange-500 text-white border-orange-500'
                                        }`}>{f.outcome}</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">{f.date}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedbackLoop;
