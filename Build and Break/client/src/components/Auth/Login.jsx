import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, Activity, ArrowRight, User, ChevronDown, CheckCircle2, Building2, Truck, Star, Heart, Stethoscope, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
    { value: 'User', label: 'User', subtitle: 'Explore & Book Services', icon: User, color: 'purple' },
    { value: 'Patient', label: 'Patient', subtitle: 'Track your referral', icon: Heart, color: 'emerald' },
    { value: 'Doctor', label: 'Local Doctor (PHC)', subtitle: 'Create & manage referrals', icon: Stethoscope, color: 'blue' },
    { value: 'Hospital Admin', label: 'Hospital Admin', subtitle: 'Manage hospital resources', icon: Building2, color: 'teal' },
    { value: 'Ambulance', label: 'Ambulance Driver', subtitle: 'Transport patients', icon: Truck, color: 'orange' },
];

const DEMO_CREDENTIALS = [
    { role: 'User', email: 'user@healix.ai', password: 'password123', icon: User, label: 'USER' },
    { role: 'Patient', email: 'patient@healix.ai', password: 'password123', icon: Heart, label: 'PATIENT' },
    { role: 'Doctor', email: 'doctor@healix.ai', password: 'password123', icon: Stethoscope, label: 'DOCTOR' },
    { role: 'Hospital Admin', email: 'admin@healix.ai', password: 'password123', icon: Building2, label: 'HOSPITAL ADMIN' },
    { role: 'Ambulance', email: 'ambulance@healix.ai', password: 'password123', icon: Truck, label: 'AMBULANCE' },
];

const Login = () => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('User');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password, role);
                setSuccess('Registration successful! You can now sign in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message || 'Login failed. Check your credentials.');
        }
        setLoading(false);
    };

    const fillDemo = (demo) => {
        setEmail(demo.email);
        setPassword(demo.password);
        setError('');
    };

    const selectedRole = ROLES.find(r => r.value === role);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-center py-12"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-healix-teal rounded-xl flex items-center justify-center text-white font-black text-xl">H</div>
                    <span className="text-xl font-extrabold text-medical-dark">Healix<span className="text-healix-teal">Refer</span></span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em]">AI Rural Healthcare System</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-2xl">
                {/* Tab Toggle */}
                <div className="flex mb-8 bg-gray-50 rounded-2xl p-1.5">
                    {['SIGN IN', 'REGISTER'].map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => { setIsLogin(i === 0); setError(''); setSuccess(''); }}
                            className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all ${(isLogin && i === 0) || (!isLogin && i === 1)
                                ? 'bg-white shadow-sm text-healix-teal'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name (Register only) */}
                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-medical-dark placeholder:text-gray-400 focus:outline-none focus:border-healix-teal/50 focus:ring-2 focus:ring-healix-teal/20 transition-all" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-medical-dark placeholder:text-gray-400 focus:outline-none focus:border-healix-teal/50 focus:ring-2 focus:ring-healix-teal/20 transition-all" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-medical-dark placeholder:text-gray-400 focus:outline-none focus:border-healix-teal/50 focus:ring-2 focus:ring-healix-teal/20 transition-all" />
                        </div>
                    </div>

                    {/* Role Selector (Register only) */}
                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                                <div className="relative">
                                    <button type="button" onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-medical-dark flex items-center justify-between hover:border-healix-teal/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            {selectedRole && <selectedRole.icon className="w-4 h-4 text-healix-teal" />}
                                            <span>{selectedRole?.label || 'Select Role'}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showRoleDropdown && (
                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[100]">
                                                {ROLES.map(r => (
                                                    <button key={r.value} type="button" onClick={() => { setRole(r.value); setShowRoleDropdown(false); }}
                                                        className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold hover:bg-teal-50 transition-all ${role === r.value ? 'bg-teal-50 text-healix-teal' : 'text-gray-600'}`}>
                                                        <r.icon className="w-4 h-4" />
                                                        <div className="text-left">
                                                            <div>{r.label}</div>
                                                            <div className="text-[10px] text-slate-500 font-bold">{r.subtitle}</div>
                                                        </div>
                                                        {role === r.value && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error / Success */}
                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-xs font-bold text-red-400 bg-red-900/20 border border-red-800/30 py-2 px-4 rounded-xl flex items-center gap-2">
                            ⚠️ {error}
                        </motion.p>
                    )}
                    {success && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-xs font-bold text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 py-2 px-4 rounded-xl flex items-center gap-2">
                            ✅ {success}
                        </motion.p>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="w-full py-4 bg-healix-teal text-white rounded-xl font-black text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-teal-600 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" /> {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</>}
                    </button>
                </form>
            </div>

        </motion.div>
    );
};

export default Login;
