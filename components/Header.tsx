import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center p-4 bg-white shadow-md">
            <h1 className="text-2xl md:text-4xl font-bold text-blue-600 tracking-wider">
                GPS Anti-Drone Defense System
            </h1>
            <p className="text-sm md:text-base text-gray-500">
                An Educational Simulator for GPS Spoofing Countermeasures
            </p>
        </header>
    );
};
