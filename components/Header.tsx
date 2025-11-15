
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center p-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 shadow-lg">
            <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 tracking-wider font-orbitron">
                GPS Anti-Drone Defense System
            </h1>
            <p className="text-sm md:text-base text-slate-400">
                An Educational Simulator for GPS Spoofing Countermeasures
            </p>
        </header>
    );
};
