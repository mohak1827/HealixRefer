import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, MapPin, Clock, IndianRupee, Star, Phone, ExternalLink, Filter, Search, CheckCircle } from 'lucide-react';

const labsData = [
    {
        id: 1, name: 'LifeCare Diagnostics', distance: '2.4 km', rating: 4.8, reviews: 342, address: 'MG Road, Barwani', phone: '+91 7290-XXXX', hours: '6am–10pm', tests: [
            { name: 'CBC (Complete Blood Count)', price: 250, turnaround: '2 hrs', availability: true },
            { name: 'X-Ray Chest PA', price: 450, turnaround: '30 min', availability: true },
            { name: 'CT Scan Brain', price: 3200, turnaround: '1 hr', availability: true },
            { name: 'ECG', price: 200, turnaround: '15 min', availability: true },
        ]
    },
    {
        id: 2, name: 'Metro Path Lab', distance: '3.8 km', rating: 4.5, reviews: 218, address: 'Station Road, Barwani', phone: '+91 7290-YYYY', hours: '7am–9pm', tests: [
            { name: 'CBC (Complete Blood Count)', price: 200, turnaround: '3 hrs', availability: true },
            { name: 'X-Ray Chest PA', price: 400, turnaround: '45 min', availability: true },
            { name: 'CT Scan Brain', price: 2800, turnaround: '2 hrs', availability: false },
            { name: 'ECG', price: 150, turnaround: '15 min', availability: true },
        ]
    },
    {
        id: 3, name: 'Apollo Reference Lab', distance: '5.1 km', rating: 4.9, reviews: 567, address: 'NH-3, Dhar Road', phone: '+91 7290-ZZZZ', hours: '24/7', tests: [
            { name: 'CBC (Complete Blood Count)', price: 350, turnaround: '1 hr', availability: true },
            { name: 'X-Ray Chest PA', price: 550, turnaround: '20 min', availability: true },
            { name: 'CT Scan Brain', price: 3500, turnaround: '45 min', availability: true },
            { name: 'MRI Brain', price: 6500, turnaround: '2 hrs', availability: true },
            { name: 'ECG', price: 250, turnaround: '10 min', availability: true },
        ]
    },
    {
        id: 4, name: 'SRL Diagnostics', distance: '8.2 km', rating: 4.6, reviews: 189, address: 'Civil Lines, Khargone', phone: '+91 7282-AAAA', hours: '6am–8pm', tests: [
            { name: 'CBC (Complete Blood Count)', price: 180, turnaround: '4 hrs', availability: true },
            { name: 'X-Ray Chest PA', price: 380, turnaround: '1 hr', availability: true },
            { name: 'CT Scan Brain', price: 2500, turnaround: '3 hrs', availability: true },
            { name: 'ECG', price: 120, turnaround: '15 min', availability: true },
        ]
    },
];

const NearbyLabs = () => {
    const [selectedTest, setSelectedTest] = useState('CBC (Complete Blood Count)');
    const [expandedLab, setExpandedLab] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [booked, setBooked] = useState(null);

    const allTests = [...new Set(labsData.flatMap(l => l.tests.map(t => t.name)))];

    const filteredLabs = labsData.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTestForLab = (lab) => lab.tests.find(t => t.name === selectedTest);

    const cheapest = Math.min(...labsData.map(l => getTestForLab(l)?.price || Infinity));

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-primary-navy tracking-tight">Nearby Lab & Diagnostic Intelligence</h1>
                <p className="text-slate-500 font-semibold text-sm">Price comparison • Real-time availability • Instant procurement</p>
            </header>

            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: 'Labs in Network', value: labsData.length, icon: FlaskConical, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
                    { label: 'Tests Available', value: allTests.length, icon: Filter, color: 'text-medical-teal', bg: 'bg-medical-teal/10' },
                    { label: 'Best Market Price', value: `₹${cheapest}`, icon: IndianRupee, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Nearest Facility', value: '2.4 km', icon: MapPin, color: 'text-primary-navy', bg: 'bg-slate-100' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="medical-card p-8 group hover:scale-[1.05] transition-all">
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</p>
                        <p className="text-3xl font-black text-primary-navy mt-1 tracking-tight">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="medical-card p-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 flex-1 bg-slate-50 rounded-[20px] px-6 py-4 border border-slate-200 focus-within:bg-white focus-within:border-accent-purple transition-all">
                    <Search className="w-5 h-5 text-slate-300" />
                    <input type="text" placeholder="Search facilities, areas, or specialties..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-bold text-primary-navy placeholder-slate-300" />
                </div>
                <div className="flex items-center gap-4 bg-slate-50 rounded-[20px] px-6 py-4 border border-slate-200 focus-within:bg-white focus-within:border-accent-purple transition-all min-w-[280px]">
                    <Filter className="w-5 h-5 text-slate-300" />
                    <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-black text-primary-navy cursor-pointer appearance-none">
                        {allTests.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {filteredLabs.map((lab, i) => {
                    const test = getTestForLab(lab);
                    const isCheapest = test?.price === cheapest;

                    return (
                        <motion.div key={lab.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="medical-card p-8 cursor-pointer hover:border-accent-purple/30 transition-all relative overflow-hidden group"
                            onClick={() => setExpandedLab(expandedLab === lab.id ? null : lab.id)}>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-slate-50 border border-slate-100 transition-all group-hover:scale-110 shadow-sm">
                                        <FlaskConical className="w-8 h-8 text-accent-purple" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-2xl font-black text-primary-navy tracking-tight">{lab.name}</h3>
                                            {isCheapest && <span className="text-[10px] font-black uppercase tracking-widest bg-medical-teal text-white px-4 py-1.5 rounded-full border border-medical-teal shadow-lg shadow-medical-teal/20">Economical Choice</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" /> {lab.address}
                                            </p>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                            <p className="text-xs text-primary-navy font-black tracking-widest">{lab.distance}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit ml-auto">
                                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                                        <span className="font-black text-primary-navy text-sm">{lab.rating}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">({lab.reviews})</span>
                                    </div>
                                    {test && (
                                        <div className="mt-3">
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Market Rate</p>
                                            <p className="text-3xl font-black text-primary-navy tracking-tighter">₹{test.price}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {test && (
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100 text-center transition-all group-hover:bg-white">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">TAT Speed</p>
                                        <div className="flex items-center justify-center gap-2 text-primary-navy font-black">
                                            <Clock className="w-4 h-4 text-accent-purple" />
                                            <p className="text-sm">{test.turnaround}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100 text-center transition-all group-hover:bg-white">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Ops Hours</p>
                                        <p className="text-sm font-black text-primary-navy">{lab.hours}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100 text-center transition-all group-hover:bg-white">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Kit Status</p>
                                        <div className="flex items-center justify-center gap-2 font-black">
                                            <div className={`w-2 h-2 rounded-full ${test.availability ? 'bg-medical-teal shadow-lg shadow-medical-teal/40' : 'bg-coral-accent'}`} />
                                            <p className={`text-sm ${test.availability ? 'text-medical-teal' : 'text-coral-accent'}`}>{test.availability ? 'In Stock' : 'Out of Stock'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <AnimatePresence>
                                {expandedLab === lab.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="pt-8 border-t border-slate-100 mt-4">
                                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.3em] mb-6">Full Diagnostic Catalog & Inventory</p>
                                            <div className="grid gap-4">
                                                {lab.tests.map((t, j) => (
                                                    <div key={j} className="flex items-center justify-between bg-slate-50 p-5 rounded-[24px] border border-slate-100 hover:bg-white transition-all group/item">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-3 h-3 rounded-full ${t.availability ? 'bg-medical-teal/30 group-hover/item:bg-medical-teal' : 'bg-coral-accent/30'} transition-all`} />
                                                            <div>
                                                                <span className="text-base font-black text-primary-navy tracking-tight">{t.name}</span>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t.turnaround} reporting window</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <span className="text-2xl font-black text-primary-navy">₹{t.price}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); setBooked({ lab: lab.name, test: t.name }); setTimeout(() => setBooked(null), 3000); }}
                                                                disabled={!t.availability}
                                                                className="bg-primary-navy text-white font-black px-8 py-3 rounded-xl hover:bg-accent-purple hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale text-xs uppercase tracking-widest shadow-lg shadow-primary-navy/20">
                                                                Reserve
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-6 mt-8 p-6 bg-slate-50 rounded-[24px] border border-dashed border-slate-300">
                                                <div className="flex items-center gap-3 text-primary-navy">
                                                    <Phone className="w-5 h-5 text-accent-purple" />
                                                    <span className="text-sm font-black tracking-widest uppercase">{lab.phone}</span>
                                                </div>
                                                <button className="ml-auto flex items-center gap-2 text-[10px] font-black text-accent-purple uppercase tracking-[0.2em] hover:opacity-70 transition-all">
                                                    View Digital Report <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {booked && (
                    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
                        className="fixed bottom-10 right-10 z-[200] bg-primary-navy border-4 border-medical-teal/30 text-white p-8 rounded-[32px] shadow-2xl flex items-center gap-6 max-w-md">
                        <div className="w-14 h-14 bg-medical-teal rounded-2xl flex items-center justify-center shadow-lg shadow-medical-teal/30">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">Booking Secured</p>
                            <p className="text-sm text-slate-300 font-bold mt-1">{booked.test} at {booked.lab}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NearbyLabs;
