import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, Brain, Calendar, FileBox, ArrowRight, User, AlertCircle, Sparkles, Filter, Search } from 'lucide-react';
import patientService from './services/patientService';

const EVENT_CONFIG = {
    'Referral': { icon: Activity, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    'Analysis': { icon: Brain, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
    'Appointment': { icon: Calendar, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
    'File Upload': { icon: FileBox, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' }
};

const Timeline = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        try {
            const data = await patientService.getTimeline();
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = filter === 'All' ? events : events.filter(e => e.type === filter);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-medical-dark rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark">Medical History Timeline</h1>
                        <p className="text-sm text-gray-400">Your health journey documented in chronological order.</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Referral', 'Analysis', 'Appointment', 'File Upload'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'bg-medical-dark text-white border-transparent shadow-md' : 'bg-white text-gray-400 border-medical-gray hover:border-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 h-full w-0.5 bg-medical-gray/60 rounded-full" />

                <div className="space-y-12">
                    {filteredEvents.length === 0 ? (
                        <div className="medical-card p-24 text-center border-2 border-dashed border-medical-gray flex flex-col items-center justify-center ml-16">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-soft">
                                <Activity className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-medical-dark mb-2">No History Recorded</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">
                                Your medical activities will appear here as you use the portal features.
                            </p>
                        </div>
                    ) : (
                        filteredEvents.map((event, idx) => {
                            const config = EVENT_CONFIG[event.type] || EVENT_CONFIG['Referral'];
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative pl-24 group"
                                >
                                    {/* Event Marker */}
                                    <div className="absolute left-0 top-0 w-16 h-16 bg-white rounded-2xl shadow-soft border border-medical-gray flex flex-col items-center justify-center z-10 group-hover:border-medical-blue transition-all duration-300 overflow-hidden">
                                        <div className={`w-full h-1 ${config.color.split(' ')[0]} mb-auto`} />
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mt-1">
                                            {new Date(event.date).toLocaleDateString([], { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-black text-medical-dark mb-1">
                                            {new Date(event.date).getDate()}
                                        </span>
                                    </div>

                                    {/* Connector */}
                                    <div className="absolute left-16 top-8 w-8 h-0.5 bg-medical-gray/60" />

                                    <div className="medical-card p-6 bg-white hover:border-transparent transition-all duration-300 hover:shadow-xl relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <config.icon className="w-24 h-24" />
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.color} ${config.border}`}>
                                                {event.type}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase">
                                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-medical-dark mb-2 tracking-tight group-hover:text-medical-blue transition-colors uppercase">
                                            {event.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xl">
                                            {event.description}
                                        </p>

                                        {event.metadata && (
                                            <div className="mt-6 pt-6 border-t border-medical-gray flex items-center gap-4">
                                                {event.type === 'Analysis' && event.metadata.analysis && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-300">Analysis Result:</div>
                                                        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${event.metadata.analysis.severity === 'High' ? 'text-red-500 bg-red-50' : 'text-medical-green bg-green-50'}`}>
                                                            {event.metadata.analysis.severity} Risk
                                                        </div>
                                                    </div>
                                                )}
                                                {event.type === 'Appointment' && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-medical-blue uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Booking Confirmed
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Timeline;
