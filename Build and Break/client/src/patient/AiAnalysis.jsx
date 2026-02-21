import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, AlertCircle, CheckCircle2, ArrowRight, Activity, Sparkles, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import patientService from './services/patientService';

const AiAnalysis = () => {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim() || loading) return;
        setLoading(true);
        try {
            const data = await patientService.analyzeSymptoms(symptoms);
            setResult(data);
        } catch (err) {
            console.error('Analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'High': return 'bg-red-50 text-red-600 border-red-100';
            case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-20"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Brain className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-medical-dark">AI Health Analysis</h1>
                    <p className="text-sm text-gray-400">Advanced clinical assessment powered by Healix Intelligence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Area */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="medical-card p-8 bg-white/50 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sparkles className="w-20 h-20 text-indigo-600" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Describe Symptoms</h3>
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Example: I've been having persistent chest pain and mild dizziness for the last 2 hours. It feels heavy..."
                            className="w-full h-48 p-5 rounded-3xl border border-medical-gray focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none text-medical-dark font-medium leading-relaxed"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={!symptoms.trim() || loading}
                            className={`w-full mt-6 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${!symptoms.trim() || loading ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {loading ? (
                                <Activity className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> Analyze with Healix AI
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4 items-start">
                        <AlertCircle className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            This analysis is for guidance only and does not replace professional medical diagnosis.
                            In case of emergency, please contact your local emergency services immediately.
                        </p>
                    </div>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="medical-card p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-medical-gray bg-gray-50/20 h-full min-h-[400px]"
                            >
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-soft">
                                    <Activity className="w-10 h-10 text-gray-200" />
                                </div>
                                <h4 className="text-medical-dark font-bold mb-2">Awaiting Diagnosis</h4>
                                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Input your symptoms to generate an AI assessment report.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="medical-card p-8 space-y-8 bg-white border-2 border-indigo-50"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> AI Report
                                    </h3>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getSeverityStyles(result.severity)}`}>
                                        {result.severity} Severity
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Recommended Care</div>
                                        <div className="text-sm font-bold text-medical-dark leading-relaxed">{result.recommendation}</div>
                                    </div>

                                    <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Risk Score</div>
                                            <div className="text-lg font-black text-indigo-600">{result.riskScore}%</div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Suggested Specialist</div>
                                            <div className="text-sm font-bold text-medical-dark">{result.specialist}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    {result.severity === 'High' ? (
                                        <button
                                            onClick={() => navigate('/patient/referrals')}
                                            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-all active:scale-95"
                                        >
                                            <ShieldAlert className="w-5 h-5" /> Request Urgent Referral
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/patient/referrals')}
                                            className="w-full py-4 bg-medical-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition-all active:scale-95"
                                        >
                                            <ArrowRight className="w-5 h-5" /> Explore Facilities
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default AiAnalysis;
