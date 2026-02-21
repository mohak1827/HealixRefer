import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RiskScore = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setDisplayScore(score), 500);
        return () => clearTimeout(timeout);
    }, [score]);

    const getColor = (s) => {
        if (s >= 70) return 'text-red-500';
        if (s >= 40) return 'text-amber-500';
        return 'text-medical-green';
    };

    const getBgColor = (s) => {
        if (s >= 70) return 'bg-red-50';
        if (s >= 40) return 'bg-amber-50';
        return 'bg-green-50';
    };

    const getStatus = (s) => {
        if (s >= 70) return 'High Risk';
        if (s >= 40) return 'Moderate';
        return 'Low Risk';
    };

    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    return (
        <div className={`medical-card p-8 text-center flex flex-col items-center justify-center ${getBgColor(score)}/30`}>
            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-6">Health Risk Index</h3>
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200" />
                    <motion.circle
                        cx="80" cy="80" r={radius}
                        stroke="currentColor" strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={getColor(score)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-4xl font-black leading-none ${getColor(score)}`}
                    >
                        {score}%
                    </motion.span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">{getStatus(score)}</span>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-6 max-w-[200px]">
                Dynamically calculated based on medical history, age, and recent symptoms.
            </p>
        </div>
    );
};

export default RiskScore;
