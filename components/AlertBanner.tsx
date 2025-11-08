import React from 'react';
import type { AlertState } from '../types';

interface AlertBannerProps {
    alertState: AlertState;
    'on-close': () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alertState }) => {
    if (!alertState.show) return null;

    const isSuccess = alertState.message.includes('SUCCESS');
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const textColor = isSuccess ? 'text-white' : 'text-white';

    return (
        <div className={`w-full p-2 ${bgColor} ${textColor} text-center font-bold text-lg animate-pulse`}>
            {alertState.message}
        </div>
    );
};
