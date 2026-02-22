import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    History, User, MapPin, Building2, Clock, CheckCircle2,
    ArrowRight, Calendar, Search, Filter
} from 'lucide-react';

const AmbulanceHistory = ({ history }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = history.filter(h =>
        h.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.dropLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="healix-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-md font-bold text-healix-navy flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <History className="w-4 h-4 text-healix-blue" />
                    </div>
                    Transport History
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                    {history.length} Total
                </span>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                    type="text"
                    placeholder="Search patient, location..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-healix-navy placeholder:text-slate-300 focus:outline-none focus:border-healix-teal/30 focus:ring-2 focus:ring-healix-teal/10 transition-all"
                />
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                    <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No transport history found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredHistory.map((h, i) => (
                        <motion.div
                            key={h.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="p-4 rounded-xl bg-white border border-slate-100 hover:border-healix-teal/30 hover:shadow-sm transition-all"
                        >
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-healix-teal/10 rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-healix-teal" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-healix-navy">{h.patientName}</div>
                                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {h.date}
                                        </div>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-healix-teal text-[9px] font-black rounded-full border border-teal-100">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                            </div>

                            {/* Route Display */}
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-healix-teal" />
                                    <div className="w-0.5 h-4 bg-slate-200" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-healix-blue" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-healix-teal" />
                                        <span className="text-xs font-semibold text-healix-navy">{h.pickupLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-3 h-3 text-healix-blue" />
                                        <span className="text-xs font-semibold text-healix-navy">{h.dropLocation}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400">Duration</div>
                                    <div className="text-xs font-black text-healix-navy">{h.duration}</div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                                <span>Driver: <span className="text-healix-navy font-bold">{h.driverName}</span></span>
                                <span>Vehicle: <span className="text-healix-navy font-bold">{h.vehicleNo}</span></span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AmbulanceHistory;
