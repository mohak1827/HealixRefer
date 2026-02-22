import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Heart, Clock, TrendingUp, Activity, Users, Truck, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ImpactDashboard = () => {
    const metrics = [
        { label: 'Lives Saved', value: '1,247', change: '+23%', up: true, icon: Heart, color: 'text-urgent-red', desc: 'Estimated through faster referral matching' },
        { label: 'Avg Time Saved', value: '18 min', change: '-32%', up: true, icon: Clock, color: 'text-med-blue', desc: 'Per referral vs manual process' },
        { label: 'System Uptime', value: '99.97%', change: '+0.02%', up: true, icon: Activity, color: 'text-med-green', desc: 'Zero downtime in 47 days' },
        { label: 'Referrals Processed', value: '12,847', change: '+45%', up: true, icon: Users, color: 'text-primary-blue', desc: 'Since deployment 6 months ago' },
    ];

    const monthlyData = [
        { month: 'Sep', referrals: 1420, timeSaved: 12, lives: 142 },
        { month: 'Oct', referrals: 1680, timeSaved: 14, lives: 178 },
        { month: 'Nov', referrals: 1890, timeSaved: 15, lives: 201 },
        { month: 'Dec', referrals: 2100, timeSaved: 17, lives: 228 },
        { month: 'Jan', referrals: 2540, timeSaved: 18, lives: 262 },
        { month: 'Feb', referrals: 3217, timeSaved: 18, lives: 236 },
    ];

    const efficiencyMetrics = [
        { label: 'Override Rate', value: '8.2%', benchmark: '< 15%', status: 'Excellent', color: 'med-green' },
        { label: 'Avg AI Confidence', value: '91.4%', benchmark: '> 80%', status: 'Above Target', color: 'med-green' },
        { label: 'False Negative Rate', value: '1.2%', benchmark: '< 5%', status: 'Excellent', color: 'med-green' },
        { label: 'Cross-District Usage', value: '22%', benchmark: '> 10%', status: 'Active', color: 'med-blue' },
        { label: 'Doctor Satisfaction', value: '4.3/5', benchmark: '> 3.5', status: 'Good', color: 'med-green' },
        { label: 'Avg Response Time', value: '1.2s', benchmark: '< 3s', status: 'Optimal', color: 'med-green' },
    ];

    const maxRef = Math.max(...monthlyData.map(d => d.referrals));

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-primary-navy tracking-tight">Impact Measurement Dashboard</h1>
                <p className="text-slate-500 font-semibold text-sm">System-wide performance analytics • ROI tracking</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => {
                    const statusColor = m.up ? 'text-medical-teal' : 'text-coral-accent';
                    const iconColor = m.label === 'Lives Saved' ? 'text-coral-accent' :
                        m.label === 'Avg Time Saved' ? 'text-accent-purple' :
                            m.label === 'System Uptime' ? 'text-medical-teal' : 'text-primary-navy';

                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="medical-card p-8 group hover:scale-[1.05] transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-white`}>
                                    <m.icon className={`w-6 h-6 ${iconColor}`} />
                                </div>
                                <span className={`text-[10px] font-black flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 italic ${statusColor}`}>
                                    {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                    {m.change}
                                </span>
                            </div>
                            <p className="text-4xl font-black text-primary-navy tracking-tighter">{m.value}</p>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-2">{m.label}</p>
                            <p className="text-xs text-slate-400 font-medium mt-4 leading-relaxed border-t border-slate-50 pt-3">{m.desc}</p>
                        </motion.div>
                    );
                })}
            </div>

            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="medical-card p-10">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-xl font-black text-primary-navy flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-accent-purple" /> 6-Month Referral Lifecycle
                        </h2>
                        <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-widest">Aggregate volume processed through AI prioritization</p>
                    </div>
                </div>

                <div className="flex items-end gap-10 h-64 border-b border-slate-100 px-6">
                    {monthlyData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group">
                            <div className="flex items-center justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black text-primary-navy px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">{d.referrals}</span>
                            </div>
                            <motion.div initial={{ height: 0 }} animate={{ height: `${(d.referrals / maxRef) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 1, ease: "circOut" }}
                                className="w-full max-w-[60px] bg-gradient-to-t from-accent-purple/80 to-accent-purple rounded-t-2xl shadow-lg shadow-accent-purple/10 relative overflow-hidden group-hover:scale-105 transition-all">
                                <div className="absolute inset-0 bg-white/10 opacity-10"></div>
                            </motion.div>
                            <span className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest group-hover:text-primary-navy transition-all">{d.month}</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="medical-card p-10">
                <h2 className="text-xl font-black text-primary-navy mb-8 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-medical-teal" /> Network Efficiency Benchmarks
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {efficiencyMetrics.map((e, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-[24px] border border-slate-100 transition-all hover:bg-white hover:border-slate-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{e.label}</p>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${e.color === 'med-green' ? 'bg-medical-teal text-white' : 'bg-primary-navy text-white'
                                    } shadow-sm`}>{e.status}</span>
                            </div>
                            <p className="text-3xl font-black text-primary-navy tracking-tight">{e.value}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-tighter">Bench: <span className="text-primary-navy">{e.benchmark}</span></p>
                            <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5 }}
                                    className={`h-full ${e.color === 'med-green' ? 'bg-medical-teal' : 'bg-accent-purple'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>
        </div>
    );
};

export default ImpactDashboard;
