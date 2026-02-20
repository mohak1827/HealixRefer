import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from '../Auth/Login';

const LandingPage = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: '🚨', title: 'Neural Triage Engine', desc: 'Real-time severity scoring (Stable, Moderate, Critical) using multi-parameter vital analysis.', tag: 'AI Powered', color: '#0D9488' }, // Teal
        { icon: '🧠', title: 'Self-Learning Algorithms', desc: 'Continuous model recalibration based on clinical outcomes and specialist feedback loops.', tag: 'ML Ops', color: '#2563EB' }, // Blue
        { icon: '📊', title: 'Infrastructure Pulse', desc: 'Live monitoring of ICU beds, staff ratios, and equipment availability across the regional network.', tag: 'Live Data', color: '#0F172A' }, // Navy
        { icon: '🌪', title: 'Surge Orchestration', desc: 'Automated emergency referral logic for pandemics and mass casualty events.', tag: 'Disaster Ready', color: '#14B8A6' }, // Light Teal
        { icon: '🔮', title: 'Outbreak Intelligence', desc: 'Predictive pattern recognition to identify early-stage clusters before they escalate.', tag: 'Predictive AI', color: '#0EA5E9' }, // Sky
        { icon: '🌍', title: 'Universal Connectivity', desc: 'Seamless cross-district referrals with instant specialty matching and ETA optimization.', tag: 'Cloud Native', color: '#6366F1' },
    ];

    if (showLogin) {
        return (
            <div className="min-h-screen bg-light-gradient flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-healix-teal/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <button
                    onClick={() => setShowLogin(false)}
                    className="absolute top-10 left-10 btn-healix-outline z-50 py-3 px-6 text-sm"
                >
                    ← Return Home
                </button>
                <Login />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen selection:bg-healix-teal/10 selection:text-healix-teal font-sans">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 glass-premium' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-healix-navy rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-healix-navy/20 group-hover:rotate-12 transition-transform">H</div>
                        <span className="text-xl font-display font-extrabold tracking-tight text-healix-navy">Healix<span className="text-healix-teal">Refer</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        {['Features', 'Intelligence', 'Impact', 'Network'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-500 hover:text-healix-blue transition-colors">{item}</a>
                        ))}
                        <button onClick={() => setShowLogin(true)} className="btn-healix-primary py-3 px-8 text-sm">
                            Launch Platform
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-healix-blue/[0.03] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-medical-teal/[0.03] blur-[150px] rounded-full translate-y-1/2 -translate-x-1/4" />

                <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-healix-teal/5 rounded-full border border-healix-teal/10 mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-healix-teal animate-pulse" />
                            <span className="text-xs font-bold text-healix-teal uppercase tracking-widest">v2.0 AI-Driven Infrastructure</span>
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-display font-extrabold text-healix-navy leading-[1.05] mb-8">
                            Referral chaos, <br />
                            <span className="text-gradient">orchestrated by AI.</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-xl">
                            The world's most advanced triage and referral optimization system for clinical networks. Secure, intelligent, and designed to save lives.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => setShowLogin(true)} className="btn-healix-primary">
                                Get Started Free
                            </button>
                            <button className="btn-healix-outline">
                                View Technical Whitepaper
                            </button>
                        </div>

                        <div className="mt-16 grid grid-cols-3 gap-8">
                            {[
                                { val: '14.2m', label: 'Processing Speed' },
                                { val: '99.9%', label: 'Decision Accuracy' },
                                { val: '24/7', label: 'Network Uptime' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-2xl font-black text-healix-navy">{stat.val}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="relative z-10 p-4 bg-white rounded-[40px] shadow-2xl shadow-healix-navy/10 border border-slate-100 animate-float">
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200"
                                alt="Dashboard Preview"
                                className="rounded-[32px] w-full object-cover aspect-[4/3]"
                            />
                            <div className="absolute -bottom-10 -right-10 glass-premium p-6 rounded-3xl border border-slate-100 shadow-xl max-w-[240px]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-urgent-red/10 rounded-xl flex items-center justify-center text-urgent-red font-bold">🚨</div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400">CRITICAL TRIAGE</div>
                                        <div className="text-sm font-black text-healix-navy">Patient: #4429</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '85%' }}
                                            transition={{ duration: 1.5, delay: 1 }}
                                            className="h-full bg-urgent-red"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                        <span>CONFIDENCE</span>
                                        <span>85%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-healix-blue/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-medical-teal/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-healix-bg/30">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-black text-healix-blue uppercase tracking-[0.3em] mb-4">Core Intelligence</h2>
                        <h3 className="text-5xl font-extrabold text-healix-navy mb-6">Designed for clinical excellence.</h3>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            Beyond simple referral tracking. We provide a neural layer for your healthcare infrastructure to optimize patient flow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="healix-card p-10 hover:border-healix-teal/20"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h4 className="text-xl font-bold text-healix-navy mb-4">{f.title}</h4>
                                <p className="text-slate-500 leading-relaxed mb-8 text-sm">{f.desc}</p>
                                <span className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {f.tag}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Deep Dive */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="healix-card bg-healix-navy p-12 lg:p-24 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-healix-teal/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
                        <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h3 className="text-4xl lg:text-5xl font-black text-white mb-8 leading-tight">
                                    Universal network visibility in <span className="text-healix-teal">real-time.</span>
                                </h3>
                                <p className="text-healix-slate text-lg mb-10 leading-relaxed">
                                    Every node in your clinical network at your fingertips. Integrated geospatial analysis, infrastructure stress indexing, and specialty matching.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        'Multi-district hospital synchronization',
                                        'Real-time ambulance telemetry integration',
                                        'Secure HIPAA-compliant audit trails'
                                    ].map(item => (
                                        <div key={item} className="flex items-center gap-4 text-white font-semibold">
                                            <div className="w-6 h-6 rounded-full bg-healix-blue/20 flex items-center justify-center text-healix-blue">✓</div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-white shadow-3xl rounded-[40px] p-2">
                                    <img
                                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
                                        alt="Infrastructure monitoring"
                                        className="rounded-[32px] w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="max-w-3xl mx-auto px-8 relative z-10">
                    <h2 className="text-4xl lg:text-6xl font-black text-healix-navy mb-8">
                        The future of triage <br />is here.
                    </h2>
                    <p className="text-slate-500 text-xl mb-12">
                        Join 200+ hospitals delivering superior clinical outcomes with Healix.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <button onClick={() => setShowLogin(true)} className="btn-healix-primary py-5 px-12">
                            Deploy Healix Now
                        </button>
                        <button className="btn-healix-outline py-5 px-12">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-healix-navy rounded-lg flex items-center justify-center text-white font-black text-lg">H</div>
                                <span className="text-xl font-display font-extrabold tracking-tight text-healix-navy">Healix<span className="text-healix-teal">Refer</span></span>
                            </div>
                            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                                Redefining the technology layer of healthcare infrastructure. Building intelligent systems for high-stakes environments.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-healix-navy mb-6">Product</h5>
                            <ul className="space-y-4 text-sm font-semibold text-slate-500">
                                <li><a href="#" className="hover:text-healix-blue">Features</a></li>
                                <li><a href="#" className="hover:text-healix-blue">Security</a></li>
                                <li><a href="#" className="hover:text-healix-blue">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-healix-navy mb-6">Company</h5>
                            <ul className="space-y-4 text-sm font-semibold text-slate-500">
                                <li><a href="#" className="hover:text-healix-blue">About</a></li>
                                <li><a href="#" className="hover:text-healix-blue">Clinical Trials</a></li>
                                <li><a href="#" className="hover:text-healix-blue">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-50 pt-10">
                        <div className="text-xs font-bold text-slate-400">© 2026 HEALIX HEALTH TECHNOLOGIES INC. ALL RIGHTS RESERVED.</div>
                        <div className="flex gap-8">
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-healix-blue">PRIVACY</a>
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-healix-blue">COMPLIANCE</a>
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-healix-blue">SECURITY</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
