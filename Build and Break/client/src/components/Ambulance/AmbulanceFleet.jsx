import React from 'react';
import { motion } from 'framer-motion';
import { Truck, User, Phone, MapPin, Clock, Timer } from 'lucide-react';

const STATUS_COLORS = {
    Available: { bg: 'bg-teal-50', text: 'text-healix-teal', dot: 'bg-healix-teal' },
    'On Mission': { bg: 'bg-blue-50', text: 'text-healix-blue', dot: 'bg-healix-blue' },
    'Off Duty': { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
    Maintenance: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
};

const AmbulanceFleet = ({ fleet }) => {
    const totalAmbulances = fleet.length;
    const available = fleet.filter(a => a.status === 'Available').length;
    const onMission = fleet.filter(a => a.status === 'On Mission').length;

    return (
        <div className="healix-card p-6">
            {/* Header */}
            <h3 className="text-sm font-bold text-healix-navy mb-5 flex items-center gap-2 uppercase tracking-tight">
                <Truck className="w-4 h-4 text-healix-blue" /> Fleet Overview
            </h3>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                    { label: 'Total', value: totalAmbulances, color: 'text-healix-navy', bg: 'bg-slate-50' },
                    { label: 'Available', value: available, color: 'text-healix-teal', bg: 'bg-teal-50' },
                    { label: 'Active', value: onMission, color: 'text-healix-blue', bg: 'bg-blue-50' },
                ].map(stat => (
                    <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center border border-slate-100`}>
                        <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Driver List */}
            <div className="space-y-3">
                {fleet.map((amb, i) => {
                    const statusStyle = STATUS_COLORS[amb.status] || STATUS_COLORS.Available;
                    return (
                        <motion.div
                            key={amb.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-white border border-slate-100 hover:border-healix-teal/30 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 bg-healix-navy/10 rounded-xl flex items-center justify-center text-healix-navy text-xs font-black shrink-0">
                                    {amb.driverName.charAt(0)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Driver Name + Status */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-healix-navy truncate">{amb.driverName}</span>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${amb.status === 'Available' ? 'animate-pulse' : ''}`} />
                                            {amb.status}
                                        </span>
                                    </div>

                                    {/* Vehicle Info */}
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Truck className="w-3 h-3" /> {amb.vehicleNo}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {amb.contact}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1">
                                        <MapPin className="w-3 h-3 text-healix-teal" /> {amb.location}
                                    </div>

                                    {/* Estimated Free / Return Time */}
                                    {amb.status !== 'Available' && amb.estimatedFreeAt && (
                                        <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100 w-fit">
                                            <Timer className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-bold text-amber-700">
                                                {amb.status === 'On Mission' ? 'Free at' : 'Available at'}: {amb.estimatedFreeAt}
                                            </span>
                                            {amb.etaMinutes && (
                                                <span className="text-[9px] text-amber-500 font-medium">
                                                    (~{amb.etaMinutes} min)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AmbulanceFleet;
