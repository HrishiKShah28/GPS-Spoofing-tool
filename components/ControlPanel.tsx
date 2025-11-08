import React from 'react';
import type { Telemetry } from '../types';
import { TargetIcon, AltitudeIcon, ErrorIcon, ThreatIcon } from './icons';

interface ControlPanelProps {
    telemetry: Telemetry;
    isSpoofingActive: boolean;
    onActivateDefense: () => void;
    spoofingIntensity: number;
    onIntensityChange: (intensity: number) => void;
    disabled: boolean;
    isDefenseEnabled: boolean;
}

const threatStyles = {
    none: { text: 'text-green-600', border: 'border-green-400' },
    low: { text: 'text-yellow-600', border: 'border-yellow-400' },
    medium: { text: 'text-orange-600', border: 'border-orange-400' },
    high: { text: 'text-red-600', border: 'border-red-400' },
    critical: { text: 'text-red-700 animate-pulse', border: 'border-red-500' },
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
    telemetry,
    isSpoofingActive,
    onActivateDefense,
    spoofingIntensity,
    onIntensityChange,
    disabled,
    isDefenseEnabled,
}) => {
    return (
        <div className="h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">2. Defense System</h2>
                <div className={`transition-opacity duration-300 p-4 bg-gray-50 rounded-lg border border-gray-200 ${disabled ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="mb-4">
                        <button
                            onClick={onActivateDefense}
                            disabled={!isDefenseEnabled || disabled}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg"
                        >
                            {isSpoofingActive ? 'DEFENSE ACTIVE' : 'ACTIVATE DEFENSE'}
                        </button>
                         {!isSpoofingActive && !isDefenseEnabled && <p className="text-xs text-center text-gray-500 mt-2">Enabled when drone is in range.</p>}
                    </div>
                    <div>
                        <label htmlFor="intensity-slider" className="block mb-2 font-bold text-gray-700">Spoofing Intensity: {spoofingIntensity}%</label>
                        <input
                            id="intensity-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={spoofingIntensity}
                            onChange={(e) => onIntensityChange(Number(e.target.value))}
                            disabled={disabled || !isSpoofingActive}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:accent-gray-400"
                        />
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">3. Live Telemetry</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border-l-4 border-blue-400 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-sm"><TargetIcon/> Distance</div>
                        <p className="text-2xl font-bold text-gray-800">{telemetry.distanceToProtectedZone} m</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-l-4 border-purple-400 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-sm"><AltitudeIcon/> Altitude</div>
                        <p className="text-2xl font-bold text-gray-800">{telemetry.altitude} m</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-l-4 border-orange-400 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-sm"><ErrorIcon/> Pos. Error</div>
                        <p className="text-2xl font-bold text-gray-800">{telemetry.positionError} m</p>
                    </div>
                    <div className={`bg-white p-3 rounded-lg border-l-4 shadow-sm ${threatStyles[telemetry.threatLevel].border}`}>
                        <div className="flex items-center gap-2 text-gray-500 text-sm"><ThreatIcon/> Threat Level</div>
                        <p className={`text-xl font-bold uppercase ${threatStyles[telemetry.threatLevel].text}`}>{telemetry.threatLevel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
