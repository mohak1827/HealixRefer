import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Building2, Clock, CheckCircle2, Truck, Shield, Heart, AlertTriangle } from 'lucide-react';

const STATUS_STEPS = [
    { key: 'Pending', label: 'Requested', icon: Clock, color: 'text-amber-500' },
    { key: 'Accepted', label: 'Accepted', icon: CheckCircle2, color: 'text-blue-500' },
    { key: 'In Transit', label: 'En Route', icon: Truck, color: 'text-indigo-600' },
    { key: 'Reached Hospital', label: 'Reached', icon: Building2, color: 'text-purple-600' },
    { key: 'Admitted', label: 'Admitted', icon: Heart, color: 'text-medical-green' },
];

const ActiveReferral = ({ referral }) => {
    if (!referral) return (
        <div className="medical-card p-12 text-center border-2 border-dashed border-medical-gray bg-gray-50/30">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-soft mx-auto mb-6 border border-medical-gray">
                <Shield className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-lg font-bold text-medical-dark mb-2">No Active Referrals</h3>
            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">
                Your health is our priority. Any active specialist referrals will appear here for tracking.
            </p>
        </div>
    );

    const currentIndex = STATUS_STEPS.findIndex(s => s.key === referral.status);
    const activeStep = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="medical-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-medical-blue/[0.03] -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-5 h-5 text-medical-blue" /> Active Referral Tracking
                    </h3>
                    <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">
                        Case ID: <span className="text-medical-blue font-bold">{referral.id}</span>
                    </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${referral.urgency === 'High' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                    {referral.urgency} Priority
                </div>
            </div>

            <div className="relative mb-12 px-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-medical-gray/50 -translate-y-1/2 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(activeStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                        className="h-full bg-medical-blue transition-all duration-1000"
                    />
                </div>
                <div className="relative flex justify-between items-center">
                    {STATUS_STEPS.map((s, i) => {
                        const isActive = i <= activeStep;
                        const isCurrent = i === activeStep;
                        return (
                            <div key={s.key} className="flex flex-col items-center relative z-10">
                                <motion.div
                                    animate={isCurrent ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 15px rgba(59,130,246,0.3)', '0 0 0px rgba(59,130,246,0)'] } : {}}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${isCurrent ? 'bg-medical-blue text-white border-white' : isActive ? 'bg-medical-green text-white border-white shadow-soft' : 'bg-white text-gray-200 border-medical-gray'}`}
                                >
                                    <s.icon className={`w-5 h-5 ${isCurrent || isActive ? '' : 'opacity-40'}`} />
                                </motion.div>
                                <div className={`mt-3 text-[9px] font-black uppercase tracking-tighter text-center transition-colors duration-500 ${isCurrent ? 'text-medical-blue' : isActive ? 'text-medical-dark' : 'text-gray-300'}`}>
                                    {s.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-medical-gray/20 rounded-2xl p-4 border border-medical-gray/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center border border-medical-gray/20">
                        <Building2 className="w-5 h-5 text-medical-blue" />
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Destination</div>
                        <div className="text-sm font-bold text-medical-dark">{referral.hospitalName}</div>
                    </div>
                </div>
                <div className="bg-medical-gray/20 rounded-2xl p-4 border border-medical-gray/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center border border-medical-gray/20">
                        <Clock className="w-5 h-5 text-medical-blue" />
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Last Updated</div>
                        <div className="text-sm font-bold text-medical-dark">{new Date(referral.updatedAt || referral.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveReferral;
