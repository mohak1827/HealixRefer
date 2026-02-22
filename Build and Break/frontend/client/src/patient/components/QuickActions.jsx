import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Activity, FileBox, Calendar, Clock, ArrowRight } from 'lucide-react';

const QuickActions = () => {
    const actions = [
        { title: 'AI Analysis', desc: 'Assess symptoms', icon: Brain, path: '/patient/ai-analysis', color: 'bg-indigo-50 text-indigo-600', hover: 'hover:bg-indigo-600' },
        { title: 'Referrals', desc: 'Track specialist care', icon: Activity, path: '/patient/referrals', color: 'bg-blue-50 text-blue-600', hover: 'hover:bg-blue-600' },
        { title: 'Medical Vault', desc: 'Manage your files', icon: FileBox, path: '/patient/medical-vault', color: 'bg-emerald-50 text-emerald-600', hover: 'hover:bg-emerald-600' },
        { title: 'Appointments', desc: 'Schedule a visit', icon: Calendar, path: '/patient/appointments', color: 'bg-purple-50 text-purple-600', hover: 'hover:bg-purple-600' }
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.path}
                    className="group relative bg-white p-5 rounded-3xl border border-medical-gray hover:border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                    <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-transparent group-hover:text-current`}>
                        <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-medical-dark group-hover:text-medical-blue transition-colors">{action.title}</h4>
                        <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{action.desc}</p>
                    </div>
                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-4 h-4 text-medical-blue" />
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default QuickActions;
