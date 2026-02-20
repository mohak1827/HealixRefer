import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, Activity, ArrowRight, User, ChevronDown, CheckCircle2, Building2, Truck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
    { value: 'Doctor', label: 'Doctor', subtitle: 'Rural Clinic', icon: Activity, color: 'healix-teal' },
    { value: 'Hospital Admin', label: 'Hospital Admin', subtitle: 'City Hospital', icon: Building2, color: 'healix-blue' },
    { value: 'Ambulance', label: 'Ambulance', subtitle: 'Transport Team', icon: Truck, color: 'amber-500' },
    { value: 'Super Admin', label: 'Super Admin', subtitle: 'System Oversight', icon: Star, color: 'urgent-red' },
];

const DEMO_CREDS = {
    'Doctor': { email: 'doctor@healix.ai', password: 'password123' },
    'Hospital Admin': { email: 'admin@healix.ai', password: 'password123' },
    'Ambulance': { email: 'ambulance@healix.ai', password: 'password123' },
    'Super Admin': { email: 'superadmin@healix.ai', password: 'password123' },
};

const Hospital2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 6v4" /><path d="M14 14h-4" /><path d="M14 18h-4" /><path d="M14 8h-4" />
        <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
        <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
    </svg>
);

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Doctor');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await register(name, email, password, role);
            setSuccess('Account created! You can now log in.');
            setMode('login');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (roleKey) => {
        const creds = DEMO_CREDS[roleKey];
        setEmail(creds.email);
        setPassword(creds.password);
        setRole(roleKey);
        setMode('login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-healix-blue/5 blur-[150px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-healix-teal/5 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-healix-navy rounded-[20px] flex items-center justify-center shadow-2xl shadow-healix-navy/30 mb-5">
                        <Activity className="w-8 h-8 text-healix-teal" />
                    </div>
                    <h1 className="text-3xl font-black text-healix-navy tracking-tighter">
                        Healix<span className="text-healix-teal">Refer</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">AI Rural Healthcare System</p>
                </motion.div>

                {/* Card */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="healix-card p-8">

                    {/* Mode Toggle */}
                    <div className="flex bg-slate-50 rounded-2xl p-1 mb-8 border border-slate-100">
                        {['login', 'register'].map(m => (
                            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-healix-teal shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={mode} initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                            {mode === 'login' ? (
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                                placeholder="doctor@healix.ai"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-healix-teal focus:bg-white transition-all text-sm font-bold text-healix-navy placeholder-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-healix-teal focus:bg-white transition-all text-sm font-bold text-healix-navy placeholder-slate-300" />
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-urgent-red/10 border border-urgent-red/20 p-3 rounded-xl flex items-center gap-3">
                                            <Shield className="w-4 h-4 text-urgent-red flex-shrink-0" />
                                            <p className="text-urgent-red text-xs font-bold">{error}</p>
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-healix-teal/10 border border-healix-teal/20 p-3 rounded-xl flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-healix-teal flex-shrink-0" />
                                            <p className="text-healix-teal text-xs font-bold">{success}</p>
                                        </motion.div>
                                    )}
                                    <button type="submit" disabled={loading}
                                        className="w-full bg-healix-navy text-white font-black py-4 rounded-2xl hover:bg-healix-blue transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase shadow-xl shadow-healix-navy/20 disabled:opacity-60">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Sign In</>}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                                placeholder="Dr. Arjun Sharma"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-healix-teal focus:bg-white transition-all text-sm font-bold text-healix-navy placeholder-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Role</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ROLES.map(r => (
                                                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                                                    className={`p-3 rounded-2xl border text-left transition-all ${role === r.value ? 'border-healix-teal bg-healix-teal/5 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                                                    <r.icon className={`w-4 h-4 mb-1 ${role === r.value ? 'text-healix-teal' : 'text-slate-400'}`} />
                                                    <p className={`text-[10px] font-black uppercase tracking-wide ${role === r.value ? 'text-healix-teal' : 'text-slate-500'}`}>{r.label}</p>
                                                    <p className="text-[9px] text-slate-400 font-semibold">{r.subtitle}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-healix-teal focus:bg-white transition-all text-sm font-bold text-healix-navy placeholder-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                                placeholder="min 6 characters"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:border-healix-teal focus:bg-white transition-all text-sm font-bold text-healix-navy placeholder-slate-300" />
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-urgent-red/10 border border-urgent-red/20 p-3 rounded-xl flex items-center gap-3">
                                            <Shield className="w-4 h-4 text-urgent-red flex-shrink-0" />
                                            <p className="text-urgent-red text-xs font-bold">{error}</p>
                                        </motion.div>
                                    )}
                                    <button type="submit" disabled={loading}
                                        className="w-full bg-healix-teal text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase shadow-xl disabled:opacity-60">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Create Account</>}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Demo Credentials */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="mt-6 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3 text-center">Quick Demo Login</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ROLES.map(r => (
                            <button key={r.value} onClick={() => fillDemo(r.value)}
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-healix-teal/5 border border-slate-100 hover:border-healix-teal/20 transition-all group">
                                <r.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-healix-teal transition-colors" />
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-healix-teal uppercase tracking-wide">{r.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
