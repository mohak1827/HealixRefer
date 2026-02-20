import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Building2, BarChart3, Map as MapIcon, Settings, LogOut, Activity,
    ShieldCheck, UserCircle, AlertTriangle, TrendingUp, Zap, FileText, Eye, Globe,
    Brain, MessageSquare, RefreshCw, Heart, FlaskConical, ChevronDown, Truck,
    Users, Star, ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_CONFIG = {
    'Doctor': {
        color: 'healix-teal',
        bgClass: 'bg-teal-50',
        iconColor: 'text-healix-teal',
        label: 'Rural Doctor',
    },
    'Hospital Admin': {
        color: 'healix-blue',
        bgClass: 'bg-blue-50',
        iconColor: 'text-healix-blue',
        label: 'Hospital Admin',
    },
    'Ambulance': {
        color: 'amber-500',
        bgClass: 'bg-amber-50',
        iconColor: 'text-amber-500',
        label: 'Transport Driver',
    },
    'Super Admin': {
        color: 'urgent-red',
        bgClass: 'bg-red-50',
        iconColor: 'text-urgent-red',
        label: 'Super Admin',
    },
};

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG['Doctor'];

    const menuItems = [
        // Doctor
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'map', label: 'Network Map', icon: MapIcon, roles: ['Doctor'] },
        { id: 'severity', label: 'Triage Engine', icon: AlertTriangle, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'stress', label: 'Stress Index', icon: TrendingUp, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'surge', label: 'Surge Orchestration', icon: Zap, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'audit', label: 'Audit Intelligence', icon: FileText, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'outbreak', label: 'Outbreak Radar', icon: Eye, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'crossdistrict', label: 'Universal Sync', icon: Globe, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'confidence', label: 'AI Transparency', icon: Brain, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'feedback', label: 'Clinical Feedback', icon: MessageSquare, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'selflearning', label: 'Neural Training', icon: RefreshCw, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'impact', label: 'System Impact', icon: Heart, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'labs', label: 'Diagnostics', icon: FlaskConical, roles: ['Doctor', 'Hospital Admin'] },
        { id: 'admin', label: 'Infrastructure Mgmt', icon: Building2, roles: ['Hospital Admin'] },
        { id: 'analytics', label: 'Network Analytics', icon: BarChart3, roles: ['Hospital Admin'] },
        { id: 'settings', label: 'System Config', icon: Settings, roles: ['Doctor', 'Hospital Admin'] },
        // Ambulance
        { id: 'dashboard', label: 'Job Board', icon: ClipboardList, roles: ['Ambulance'] },
        { id: 'settings', label: 'My Profile', icon: UserCircle, roles: ['Ambulance'] },
        // Super Admin
        { id: 'overview', label: 'System Overview', icon: LayoutDashboard, roles: ['Super Admin'] },
        { id: 'hospitals', label: 'Hospital Management', icon: Building2, roles: ['Super Admin'] },
        { id: 'users', label: 'User Management', icon: Users, roles: ['Super Admin'] },
        { id: 'referrals', label: 'All Referrals', icon: ClipboardList, roles: ['Super Admin'] },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['Super Admin'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex flex-col z-50">
            <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 group cursor-pointer">
                    <div className="w-10 h-10 bg-healix-navy rounded-xl flex items-center justify-center shadow-lg shadow-healix-navy/20 group-hover:rotate-6 transition-transform">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-healix-navy font-display font-black tracking-tight text-xl leading-none">Healix<span className="text-healix-teal">Refer</span></h2>
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5 block">Clinical Infrastructure</span>
                    </div>
                </div>

                {/* Role Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${roleConf.bgClass} mb-8`}>
                    <div className={`w-2 h-2 rounded-full ${roleConf.bgClass.replace('bg-', 'bg-').replace('50', '400')} animate-pulse`} />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${roleConf.iconColor}`}>{roleConf.label}</span>
                </div>

                <nav className="space-y-1">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-2">Main Controls</div>
                    {filteredItems.map((item, idx) => (
                        <button
                            key={`${item.id}-${idx}`}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${activeTab === item.id
                                ? 'bg-white-soft text-healix-teal outline outline-1 outline-healix-teal/10 shadow-sm'
                                : 'text-slate-500 hover:text-healix-navy hover:bg-slate-50'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-healix-teal' : 'group-hover:scale-110 group-hover:text-healix-teal'}`} />
                            <span className={`text-xs tracking-tight transition-all ${activeTab === item.id ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="activeTabIndicator" className="absolute left-0 w-1.5 h-6 bg-healix-teal rounded-r-full"
                                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* User Footer */}
            <div className="p-6">
                <div className="bg-slate-50 rounded-[32px] p-2 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 p-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm relative">
                            <UserCircle className={`w-7 h-7 ${roleConf.iconColor}`} />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-medical-teal border-2 border-white rounded-full shadow-sm" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-healix-navy text-sm font-black truncate">{user?.name || 'User'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest truncate ${roleConf.iconColor}`}>{user?.role}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={logout}
                        className="w-full bg-white border border-slate-100 text-slate-500 hover:bg-urgent-red hover:text-white hover:border-urgent-red py-3 rounded-[24px] transition-all flex items-center justify-center gap-2.5 text-xs font-bold">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    <ShieldCheck className="w-3.5 h-3.5 text-medical-teal opacity-60" />
                    <span>HIPAA Compliant Layer</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
