import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Navigation, MapPin, Truck, AlertTriangle, CheckCircle2, Bed, Heart, Users, Clock, ArrowLeft, Building2 } from 'lucide-react';

const PatientRecommendation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [ambulanceRequested, setAmbulanceRequested] = useState(false);

    // Fallback if accessed directly without state
    if (!location.state || !location.state.bestMatch) {
        return (
            <div className="min-h-screen bg-medical-gray flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-16 h-16 text-urgent-red mb-4" />
                <h2 className="text-2xl font-black text-healix-navy mb-2">No Recommendation Found</h2>
                <p className="text-gray-500 mb-6">Return to home to use the AI Symptom Analyzer.</p>
                <button onClick={() => navigate('/')} className="btn-primary py-3 px-8 rounded-full">Go Home</button>
            </div>
        );
    }

    const { bestMatch, alternatives, matchedSpecialty, selectedLocation } = location.state;

    const handleRequestAmbulance = () => {
        try {
            const dataStr = localStorage.getItem('healix_ambulance_data');
            let data = dataStr ? JSON.parse(dataStr) : null;

            // If completely empty, we need the initial structure to avoid crashing ambulance dashboard
            if (!data) {
                data = { fleet: [], requests: [], history: [] };
            }

            const newReq = {
                id: `REQ-${Math.floor(Math.random() * 10000)}`,
                patientName: 'Emergency Patient (Self-Referral)',
                patientContact: 'App User',
                symptoms: `AI Triage: ${matchedSpecialty}`,
                urgency: 'Emergency',
                pickupLocation: `User Location (${selectedLocation})`,
                dropLocation: bestMatch.name,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };

            data.requests.push(newReq);
            localStorage.setItem('healix_ambulance_data', JSON.stringify(data));
            setAmbulanceRequested(true);
        } catch (err) {
            console.error("Failed to request ambulance", err);
        }
    };

    return (
        <div className="min-h-screen bg-medical-gray flex flex-col relative pb-20">
            {/* Nav */}
            <nav className="w-full bg-white shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-healix-navy rounded-lg flex items-center justify-center text-white font-bold">H</div>
                    <span className="text-xl font-extrabold text-healix-navy">Healix<span className="text-healix-teal font-light">Refer</span></span>
                </div>
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-healix-navy transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </nav>

            <main className="w-full max-w-5xl mx-auto px-6 py-12 flex-1">

                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm">
                        <CheckCircle2 size={14} /> AI Diagnostic Match: {matchedSpecialty}
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black text-healix-navy mb-4 leading-[1.1]">
                        Optimal Care Found
                    </h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Based on your reported symptoms and current location in <span className="font-bold text-healix-navy">{selectedLocation}</span>, we suggest proceeding to the following facility immediately.
                    </p>
                </div>

                {/* Best Match Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-8 lg:p-10 shadow-medical border-2 border-healix-teal/20 mb-10 overflow-hidden relative"
                >
                    {/* Background glow */}
                    <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-teal-50 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10 items-center">
                        <div className="w-full lg:w-1/3 shrink-0">
                            <img src={bestMatch.image} alt={bestMatch.name} className="w-full h-64 object-cover rounded-[24px] shadow-lg" />
                        </div>

                        <div className="flex-1 w-full">
                            <h2 className="text-3xl font-black text-healix-navy mb-2">{bestMatch.name}</h2>
                            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold uppercase inline-block mb-6 tracking-widest">
                                #1 Recommended
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center shadow-sm">
                                    <MapPin className="w-5 h-5 text-healix-blue mx-auto mb-1" />
                                    <div className="text-md font-black text-healix-navy">{bestMatch.distance}</div>
                                    <div className="text-[9px] uppercase font-bold text-gray-400">Distance</div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center shadow-sm">
                                    <Bed className="w-5 h-5 text-healix-teal mx-auto mb-1" />
                                    <div className="text-md font-black text-healix-navy">{bestMatch.bedsAvailable}</div>
                                    <div className="text-[9px] uppercase font-bold text-gray-400">Beds Open</div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center shadow-sm">
                                    <Users className="w-5 h-5 text-healix-navy mx-auto mb-1" />
                                    <div className="text-md font-black text-healix-navy">{bestMatch.totalDoctors}</div>
                                    <div className="text-[9px] uppercase font-bold text-gray-400">Total Doctors</div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center shadow-sm">
                                    <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <div className="text-md font-black text-healix-navy">24/7</div>
                                    <div className="text-[9px] uppercase font-bold text-gray-400">Availability</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bestMatch.name + ' ' + selectedLocation + ' Punjab')}`, '_blank')}
                                    className="flex-1 btn-primary py-4 rounded-xl shadow-lg shadow-healix-teal/20 text-sm font-bold flex justify-center items-center gap-2 bg-healix-navy hover:bg-healix-blue"
                                >
                                    <Navigation size={18} /> Get Directions
                                </button>

                                <button
                                    onClick={handleRequestAmbulance}
                                    disabled={ambulanceRequested}
                                    className={`flex-1 py-4 rounded-xl shadow-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${ambulanceRequested ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-urgent-red text-white hover:bg-red-700 shadow-urgent-red/20'}`}
                                >
                                    {ambulanceRequested ? (
                                        <><CheckCircle2 size={18} /> Ambulance Dispatched</>
                                    ) : (
                                        <><Truck size={18} /> Request Ambulance</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Alternative Options */}
                {alternatives?.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h3 className="text-xl font-black text-healix-navy mb-6 flex items-center gap-2">
                            <Building2 className="text-gray-400" /> Alternative Hospitals
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {alternatives.map((alt, i) => (
                                <div key={alt.id} className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-xl overflow-hidden">
                                        <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-healix-navy text-sm mb-1">{alt.name}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            <span><MapPin className="w-3 h-3 inline mr-0.5" /> {alt.distance}</span>
                                            <span><Bed className="w-3 h-3 inline mr-0.5 text-healix-teal" /> {alt.bedsAvailable} Beds</span>
                                        </div>
                                        <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alt.name + ' ' + selectedLocation + ' Punjab')}`, '_blank')} className="text-healix-blue text-[11px] font-bold hover:underline flex items-center gap-1">
                                            <Navigation size={12} /> Directions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </main>
        </div>
    );
};

export default PatientRecommendation;
