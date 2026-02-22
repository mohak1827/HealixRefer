import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const EmergencyOverride = ({ hospital, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [authCode, setAuthCode] = useState('');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-blue/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg glass bg-white p-10 rounded-[40px] border-med-blue/20 shadow-2xl"
            >
                <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-urgent-red rounded-2xl flex items-center justify-center shadow-lg shadow-urgent-red/20">
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary-blue">Emergency Override</h2>
                            <p className="text-[10px] text-urgent-red font-black uppercase tracking-widest mt-0.5">High Authority Protocol • ID: 77492</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-primary-blue/5 rounded-full transition-all text-primary-blue/30"><X className="w-6 h-6" /></button>
                </div>

                <div className="bg-urgent-red/5 border border-urgent-red/10 p-6 rounded-3xl mb-8">
                    <div className="flex gap-3 items-start mb-3">
                        <AlertCircle className="w-5 h-5 text-urgent-red shrink-0" />
                        <p className="text-sm font-bold text-urgent-red leading-tight">CRITICAL WARNING</p>
                    </div>
                    <p className="text-xs text-primary-blue/60 leading-relaxed">
                        You are overriding the AI recommendation for <strong>{hospital.name}</strong>. This action will be logged in the permanent audit trail and requires senior clinical justification.
                    </p>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-blue/40 ml-1">Clinical Justification</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Patient is highly unstable for further transport; direct specialty contact confirmed capability..."
                            className="w-full bg-soft-bg border border-primary-blue/5 rounded-2xl px-5 py-4 outline-none focus:border-urgent-red transition-all font-medium text-sm min-h-[120px] resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-blue/40 ml-1">Senior Authority ID</label>
                        <input
                            type="password"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-soft-bg border border-primary-blue/5 rounded-2xl px-5 py-4 outline-none focus:border-urgent-red transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-primary-blue/10 text-primary-blue/60 font-bold py-5 rounded-3xl hover:bg-primary-blue/5 transition-all"
                    >
                        Abandon
                    </button>
                    <button
                        disabled={!reason || !authCode}
                        onClick={() => onConfirm(reason)}
                        className="flex-1 bg-urgent-red text-white font-bold py-5 rounded-3xl hover:bg-red-700 hover:shadow-xl hover:shadow-urgent-red/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                    >
                        <CheckCircle2 className="w-6 h-6" /> Execute Override
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EmergencyOverride;
