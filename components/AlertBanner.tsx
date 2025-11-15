
import React from 'react';
import type { AlertState } from '../types';

interface AlertBannerProps {
    alertState: AlertState;
    'on-close': () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alertState }) => {
    if (!alertState.show) return null;

    const isSuccess = alertState.message.includes('SUCCESS');
    const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className={`w-full p-2 ${bgColor} text-white text-center font-bold text-lg animate-pulse font-orbitron tracking-widest`}>
            {alertState.message}
        </div>
    );
};
