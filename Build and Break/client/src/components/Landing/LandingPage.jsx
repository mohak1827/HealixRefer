import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Login from '../Auth/Login';

const LandingPage = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openAuth = (mode) => {
        setAuthMode(mode);

        setShowLogin(true);
    };

    if (showLogin) {
        return (
            <div className="min-h-screen bg-medical-gray flex items-center justify-center p-6 relative">
                <button
                    onClick={() => setShowLogin(false)}
                    className="absolute top-10 left-10 btn-outline z-50 py-2 px-6"
                >
                    ← Back to Home
                </button>
                <Login initialIsLogin={authMode === 'login'} />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-4 bg-white shadow-soft' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-healix-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
                        <span className="text-xl font-extrabold tracking-tight text-healix-navy">Healix<span className="text-healix-teal">Refer</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-sm font-medium text-gray-600 hover:text-medical-blue">How it Works</a>
                        <a href="#about" className="text-sm font-medium text-gray-600 hover:text-medical-blue">About</a>
                        <button onClick={() => openAuth('login')} className="text-sm font-bold text-healix-navy hover:text-healix-blue transition-colors">
                            Sign In
                        </button>
                        <button onClick={() => openAuth('register')} className="bg-healix-navy text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-healix-blue transition-all shadow-md">
                            Register
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-medical-gray/30 -z-10 rounded-l-[100px]" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl lg:text-6xl font-bold text-medical-dark leading-tight mb-6">
                            AI-Powered <br />
                            <span className="text-healix-teal">Healthcare Referral</span> <br />
                            Intelligence System
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                            Empowering rural clinics with real-time hospital coordination, bed availability tracking, and AI-driven referral optimization.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => openAuth('register')} className="bg-healix-navy text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-healix-blue transition-all shadow-xl flex items-center gap-2 group">
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => openAuth('login')} className="bg-white text-healix-navy px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest border-2 border-slate-100 hover:border-healix-blue/20 transition-all shadow-sm">
                                Clinical Sign In
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200"
                                alt="Modern Healthcare"
                                className="w-full h-[500px] object-cover"
                            />
                        </div>
                        {/* Status Card Overlay */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-medical-gray max-w-[200px]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-3 h-3 bg-medical-green rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-gray-400 uppercase">Live Capacity</span>
                            </div>
                            <div className="text-2xl font-bold text-medical-dark">124 Beds</div>
                            <div className="text-xs text-medical-blue font-medium mt-1">Available across 5 hospitals</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-medical-gray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-healix-navy mb-4">Why Choose HealixRefer?</h2>
                        <div className="w-20 h-1.5 bg-medical-green mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: '⚡', title: 'Instant Referrals', desc: 'Securely transfer patient data to multi-specialty hospitals in seconds.' },
                            { icon: '📍', title: 'GPS Tracking', desc: 'Real-time ambulance tracking to ensure timely arrival and patient safety.' },
                            { icon: '🤖', title: 'AI Optimization', desc: 'Smarter hospital suggestions based on distance, equipment, and current load.' },
                        ].map((f, i) => (
                            <div key={i} className="medical-card p-8 bg-white">
                                <div className="text-4xl mb-6">{f.icon}</div>
                                <h3 className="text-xl font-bold text-medical-dark mb-3">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Language Selection / Rural Friendly */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-block px-4 py-1.5 bg-green-50 text-medical-green rounded-full text-xs font-bold mb-6">
                        RURAL-FRIENDLY INTERFACE
                    </div>
                    <h2 className="text-4xl font-bold text-medical-dark mb-8">Simple. Accessible. Multi-language.</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        Designed for doctors and health workers in remote areas. Large icons, clear fonts, and support for local languages.
                    </p>
                    <div className="flex justify-center gap-4">
                        {['English', 'हिन्दी', 'বাংলা', 'मराठी'].map((lang) => (
                            <button key={lang} className="px-6 py-2 border border-medical-gray rounded-full text-sm font-semibold hover:border-medical-green hover:text-medical-green transition-colors">
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-medical-gray bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-healix-navy rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
                        <span className="text-lg font-bold text-healix-navy">Healix<span className="text-healix-teal">Refer</span></span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-gray-500">
                        <a href="#" className="hover:text-medical-blue">Emergency</a>
                        <a href="#" className="hover:text-medical-blue">Hospitals</a>
                        <a href="#" className="hover:text-medical-blue">Ambulance</a>
                        <a href="#" className="hover:text-medical-blue">Privacy Policy</a>
                    </div>
                    <div className="text-sm text-gray-400">
                        © 2026 Healix Healthcare Intelligence. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

