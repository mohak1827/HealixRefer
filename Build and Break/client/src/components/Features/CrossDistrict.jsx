import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, ArrowRight, Building2, Clock, Truck, Shield, CheckCircle, Star } from 'lucide-react';

const districts = [
    { id: 'd1', name: 'Barwani', hospitals: 3, beds: 14, load: 78 },
    { id: 'd2', name: 'Khargone', hospitals: 5, beds: 28, load: 45 },
    { id: 'd3', name: 'Dhar', hospitals: 4, beds: 19, load: 62 },
    { id: 'd4', name: 'Indore', hospitals: 12, beds: 85, load: 35 },
    { id: 'd5', name: 'Ujjain', hospitals: 6, beds: 32, load: 52 },
    { id: 'd6', name: 'Dewas', hospitals: 3, beds: 16, load: 71 },
];

const crossResults = [
    { from: 'Barwani', to: 'Indore', hospital: 'Bombay Hospital Indore', distance: '145 km', eta: '2h 10m', specialties: ['Cardiology', 'Neurology', 'Oncology'], score: 94, beds: 12 },
    { from: 'Barwani', to: 'Ujjain', hospital: 'RD Gardi Medical', distance: '180 km', eta: '2h 45m', specialties: ['Trauma', 'Orthopedics'], score: 82, beds: 8 },
    { from: 'Barwani', to: 'Dhar', hospital: 'District Hospital Dhar', distance: '85 km', eta: '1h 20m', specialties: ['General', 'OB-GYN'], score: 71, beds: 5 },
];

const CrossDistrict = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('Barwani');
    const [showResults, setShowResults] = useState(false);

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-primary-navy tracking-tight">Cross-District Referral Optimization</h1>
                <p className="text-slate-500 font-semibold text-sm">Multi-region hospital matching • Beyond local boundaries</p>
            </header>

            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                {districts.map((d, i) => (
                    <motion.button key={d.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        onClick={() => { setSelectedDistrict(d.name); setShowResults(false); }}
                        className={`medical-card p-6 text-left transition-all group ${selectedDistrict === d.name ? 'border-accent-purple ring-4 ring-accent-purple/5 bg-slate-50/50' : 'hover:border-slate-300'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all ${selectedDistrict === d.name ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20' : 'bg-slate-50 text-slate-300'}`}>
                            <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className={`text-sm font-black transition-all ${selectedDistrict === d.name ? 'text-primary-navy' : 'text-slate-400 group-hover:text-primary-navy'}`}>{d.name}</h3>
                        <div className="mt-3 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Load</span>
                                <span className={d.load > 70 ? 'text-coral-accent' : d.load > 50 ? 'text-orange-500' : 'text-medical-teal'}>{d.load}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${d.load}%` }} transition={{ duration: 1 }}
                                    className={`h-1.5 rounded-full ${d.load > 70 ? 'bg-coral-accent' : d.load > 50 ? 'bg-orange-500' : 'bg-medical-teal'}`} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400/60 uppercase tracking-tighter mt-1">{d.hospitals} Facilities • {d.beds} ICU</p>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="medical-card p-12 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-45 transition-all duration-1000">
                    <Globe className="w-64 h-64 text-primary-navy" />
                </div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-accent-purple/20">
                        <Globe className="w-10 h-10 text-accent-purple animate-spin-slow" />
                    </div>
                    <h3 className="text-2xl font-black text-primary-navy tracking-tight mb-3 italic">Selected Origin: <span className="text-accent-purple not-italic">{selectedDistrict}</span></h3>
                    <p className="text-sm text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">AI will scan all connected districts for optimal referral targets, bypassing conventional administrative boundaries.</p>
                    <button onClick={() => setShowResults(true)}
                        className="bg-primary-navy text-white font-black px-12 py-5 rounded-[24px] hover:bg-accent-purple hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4 text-sm tracking-widest shadow-xl shadow-primary-navy/20 uppercase">
                        <ArrowRight className="w-5 h-5" /> Run Optimization Search
                    </button>
                </div>
            </div>

            {showResults && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center gap-4 py-4">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <h2 className="text-sm font-black text-slate-400 flex items-center gap-3 uppercase tracking-[0.2em]">
                            Found {crossResults.length} Optimized Routes
                        </h2>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>

                    <div className="grid gap-6">
                        {crossResults.map((r, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                className="medical-card p-8 group hover:border-accent-purple/30 transition-all relative overflow-hidden">
                                {i === 0 && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.3em] px-10 py-2 rotate-45 translate-x-12 -translate-y-2 shadow-lg">
                                            BEST MATCH
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border ${i === 0 ? 'bg-accent-purple text-white' : 'bg-slate-50 text-accent-purple border-slate-100'}`}>
                                            {i === 0 ? <Building2 className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-primary-navy tracking-tight">{r.hospital}</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] font-black text-accent-purple uppercase tracking-widest bg-accent-purple/5 px-3 py-1 rounded-full border border-accent-purple/10">{r.from}</span>
                                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                                <span className="text-[10px] font-black text-primary-navy uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200">{r.to}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">• {r.distance}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Trust Score</p>
                                        <div className="flex items-center gap-3 justify-end">
                                            {i === 0 && <Star className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />}
                                            <span className="text-4xl font-black text-primary-navy tracking-tighter">{r.score}<span className="text-sm">%</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-6">
                                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 transition-all group-hover:bg-white text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <Clock className="w-3 h-3" /> ETA
                                        </p>
                                        <p className="text-xl font-black text-primary-navy">{r.eta}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 transition-all group-hover:bg-white text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <Truck className="w-3 h-3" /> Distance
                                        </p>
                                        <p className="text-xl font-black text-primary-navy">{r.distance}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 transition-all group-hover:bg-white text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <Activity className="w-3 h-3" /> ICU Beds
                                        </p>
                                        <p className="text-xl font-black text-medical-teal">{r.beds}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 transition-all group-hover:bg-white text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <Shield className="w-3 h-3" /> Safety
                                        </p>
                                        <p className="text-xl font-black text-accent-purple">Verified</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3 flex-wrap border-t border-slate-100 pt-6">
                                    {r.specialties.map(s => (
                                        <span key={s} className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 px-4 py-2 rounded-xl border border-slate-200 hover:bg-accent-purple/5 hover:text-accent-purple transition-all scale-100 hover:scale-105">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CrossDistrict;
