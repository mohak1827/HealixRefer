import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, MapPin, User, Clock, Building2, AlertTriangle,
    ArrowRight, Phone, Zap, CheckCircle2, Timer, Navigation, Star
} from 'lucide-react';
import { findBestAmbulance, rankAmbulances } from './locationEngine';

const URGENCY_STYLES = {
    Emergency: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    Urgent: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    Normal: { bg: 'bg-blue-50', text: 'text-healix-blue', border: 'border-blue-200', badge: 'bg-blue-100 text-healix-blue', dot: 'bg-healix-blue' },
};

const AmbulanceRequests = ({ requests, fleet = [], onAccept }) => {
    const pendingRequests = requests.filter(r => r.status === 'Pending');
    const availableCount = fleet.filter(a => a.status === 'Available').length;

    // Find the soonest-to-be-free ambulance when none are available
    const getNextAvailable = () => {
        const onMission = fleet.filter(a => a.status === 'On Mission' && a.estimatedFreeAt);
        if (onMission.length === 0) {
            const offDuty = fleet.filter(a => a.status === 'Off Duty' && a.estimatedFreeAt);
            if (offDuty.length > 0) return offDuty[0];
            return null;
        }
        return onMission.sort((a, b) => (a.etaMinutes || 99) - (b.etaMinutes || 99))[0];
    };

    const nextAvailable = availableCount === 0 ? getNextAvailable() : null;

    return (
        <div className="healix-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-md font-bold text-healix-navy flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    Incoming Requests
                </h3>
                {pendingRequests.length > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                        {pendingRequests.length} Pending
                    </span>
                )}
            </div>

            {/* No ambulance available warning */}
            {availableCount === 0 && nextAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
                >
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Timer className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-amber-800">No Ambulances Available</div>
                        <div className="text-xs text-amber-600 mt-1">
                            Next available: <span className="font-black">{nextAvailable.driverName}</span> ({nextAvailable.vehicleNo})
                            — expected free at <span className="font-black text-amber-800">{nextAvailable.estimatedFreeAt}</span>
                            {nextAvailable.etaMinutes && (
                                <span> (~{nextAvailable.etaMinutes} min remaining)</span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Request Cards */}
            {pendingRequests.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
                    <CheckCircle2 className="w-12 h-12 text-healix-teal/20 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No pending requests</p>
                    <p className="text-xs text-slate-300 mt-1">All transfer requests have been handled</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {pendingRequests.map((req, i) => {
                            const urgency = URGENCY_STYLES[req.urgency] || URGENCY_STYLES.Normal;

                            // Smart recommendation: find closest available ambulance
                            const recommendation = findBestAmbulance(fleet, req.pickupLocation);
                            const allRanked = rankAmbulances(fleet, req.pickupLocation);

                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-5 rounded-2xl border ${urgency.border} ${urgency.bg} hover:shadow-lg transition-all`}
                                >
                                    {/* Top Row */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-healix-navy bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                                            {req.id}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${urgency.badge}`}>
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${urgency.dot} mr-1.5`} />
                                            {req.urgency}
                                        </span>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                            <User className="w-5 h-5 text-healix-blue" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-healix-navy">{req.patientName}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">{req.symptoms?.substring(0, 40)}...</div>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-3 mb-4 bg-white/60 rounded-xl p-3 border border-white">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-3 h-3 rounded-full bg-healix-teal border-2 border-white shadow" />
                                            <div className="w-0.5 h-6 bg-slate-200" />
                                            <div className="w-3 h-3 rounded-full bg-healix-blue border-2 border-white shadow" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pickup</div>
                                                <div className="text-xs font-bold text-healix-navy">{req.pickupLocation}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Drop-off</div>
                                                <div className="text-xs font-bold text-healix-navy">{req.dropLocation}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ★ Recommended Driver */}
                                    {recommendation && (
                                        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="w-3.5 h-3.5 text-healix-teal fill-healix-teal" />
                                                <span className="text-[10px] font-black text-healix-teal uppercase tracking-widest">
                                                    Recommended — Nearest Unit
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-healix-navy/10 rounded-lg flex items-center justify-center text-healix-navy text-xs font-black">
                                                        {recommendation.ambulance.driverName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-healix-navy">{recommendation.ambulance.driverName}</div>
                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            {recommendation.ambulance.location}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-healix-teal">{recommendation.travelTime} min</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase">Arrival ETA</div>
                                                </div>
                                            </div>

                                            {/* Other available options */}
                                            {allRanked.length > 1 && (
                                                <div className="mt-2 pt-2 border-t border-teal-100">
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Other Options</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {allRanked.slice(1).map(opt => (
                                                            <span key={opt.ambulance.id} className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                                                                {opt.ambulance.driverName} — {opt.travelTime} min
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Contact + Accept */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {req.patientContact || 'N/A'}
                                        </div>
                                        <button
                                            onClick={() => onAccept(req.id)}
                                            disabled={availableCount === 0}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-soft flex items-center gap-2 ${availableCount === 0
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    : 'bg-healix-navy text-white hover:bg-healix-blue'
                                                }`}
                                        >
                                            <Truck className="w-3.5 h-3.5" />
                                            {availableCount === 0 ? 'No Unit Free' : `Dispatch${recommendation ? ` (${recommendation.travelTime} min)` : ''}`}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AmbulanceRequests;
