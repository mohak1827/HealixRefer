import React from 'react';
import { motion } from 'framer-motion';
import {
    Truck, MapPin, User, Clock, Building2, Navigation,
    Phone, Timer, ArrowRight, Radio
} from 'lucide-react';

const ActiveMissions = ({ fleet, requests }) => {
    const activeMissions = fleet.filter(a => a.status === 'On Mission');

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Radio className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-healix-navy leading-tight">Active Missions</h1>
                    <p className="text-sm font-medium text-slate-400">
                        {activeMissions.length} ambulance{activeMissions.length !== 1 ? 's' : ''} currently on mission
                    </p>
                </div>
            </div>

            {/* Active Missions Grid */}
            {activeMissions.length === 0 ? (
                <div className="healix-card p-12 text-center">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8 text-healix-teal" />
                    </div>
                    <h3 className="text-lg font-bold text-healix-navy mb-2">All Clear</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        No ambulances are currently on mission. All units are available for dispatch.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {activeMissions.map((amb, i) => {
                        // Find the accepted request for this ambulance
                        const assignedReq = requests.find(r =>
                            r.status === 'Accepted' && r.assignedVehicle === amb.vehicleNo
                        );

                        return (
                            <motion.div
                                key={amb.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="healix-card p-0 overflow-hidden"
                            >
                                {/* Mission Status Bar */}
                                <div className="bg-gradient-to-r from-healix-navy to-healix-blue px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                                        <span className="text-xs font-bold text-white uppercase tracking-widest">
                                            En Route — {amb.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg">
                                        <Timer className="w-3.5 h-3.5 text-orange-300" />
                                        <span className="text-sm font-black text-white">{amb.etaMinutes} min ETA</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Left: Driver & Vehicle */}
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Driver & Vehicle</div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-healix-navy/10 rounded-xl flex items-center justify-center text-healix-navy text-sm font-black">
                                                    {amb.driverName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-healix-navy">{amb.driverName}</div>
                                                    <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                                        <Truck className="w-3 h-3" /> {amb.vehicleNo}
                                                        <span className="text-slate-300">•</span>
                                                        <Phone className="w-3 h-3" /> {amb.contact}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ETA Details */}
                                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                    <span className="text-xs font-bold text-orange-600">Estimated Timeline</span>
                                                </div>
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Departed</span>
                                                        <span className="font-bold text-healix-navy">{amb.departedAt || '—'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">ETA to Destination</span>
                                                        <span className="font-bold text-orange-600">{amb.etaMinutes} min</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Available by</span>
                                                        <span className="font-bold text-healix-teal">{amb.estimatedFreeAt}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Route */}
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Route Details</div>

                                            {/* Patient */}
                                            {assignedReq && (
                                                <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <User className="w-5 h-5 text-healix-blue" />
                                                    <div>
                                                        <div className="text-sm font-bold text-healix-navy">{assignedReq.patientName}</div>
                                                        <div className="text-[10px] text-slate-400">{assignedReq.symptoms?.substring(0, 50)}...</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Route Line */}
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-healix-teal shadow" />
                                                    <div className="w-0.5 flex-1 bg-gradient-to-b from-healix-teal to-healix-blue" />
                                                    <div className="w-3.5 h-3.5 rounded-full bg-healix-blue shadow" />
                                                </div>
                                                <div className="flex-1 space-y-4 py-0.5">
                                                    <div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pickup</div>
                                                        <div className="text-sm font-bold text-healix-navy">
                                                            {assignedReq?.pickupLocation || amb.missionPickup || amb.location}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Destination</div>
                                                        <div className="text-sm font-bold text-healix-navy">
                                                            {assignedReq?.dropLocation || amb.missionDrop || 'En route'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-5 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mission Progress</span>
                                            <span className="text-[10px] font-black text-healix-blue">{amb.progress || 60}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${amb.progress || 60}%` }}
                                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-healix-teal to-healix-blue rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActiveMissions;
