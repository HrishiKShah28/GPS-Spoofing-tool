import React from 'react';
import type { Telemetry, DroneControlType } from '../types';
import { TargetIcon, AltitudeIcon, ErrorIcon, ThreatIcon, DroneIcon } from './icons';

interface ControlPanelProps {
    telemetry: Telemetry;
    isDefenseActive: boolean;
    onActivateDefense: () => void;
    spoofingIntensity: number;
    onIntensityChange: (intensity: number) => void;
    disabled: boolean;
    isDefenseEnabled: boolean;
    droneControlType: DroneControlType;
}

const threatStyles = {
    none: { text: 'text-green-400', border: 'border-green-500' },
    low: { text: 'text-yellow-400', border: 'border-yellow-500' },
    medium: { text: 'text-orange-400', border: 'border-orange-500' },
    high: { text: 'text-red-400', border: 'border-red-500' },
    critical: { text: 'text-red-500 animate-pulse', border: 'border-red-600' },
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
    telemetry,
    isDefenseActive,
    onActivateDefense,
    spoofingIntensity,
    onIntensityChange,
    disabled,
    isDefenseEnabled,
    droneControlType,
}) => {
    const defenseType = droneControlType === 'gps' ? 'GPS Spoofer' : 'SIM Hijacker';
    const intensityLabel = droneControlType === 'gps' ? 'Spoofing Intensity' : 'Hijack Strength';
    const activateLabel = droneControlType === 'gps' ? 'ACTIVATE SPOOFER' : 'ACTIVATE HIJACK';

    return (
        <div className="h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b-2 border-slate-600 pb-2 font-orbitron">3. Defense System</h2>
                <div className={`transition-opacity duration-300 p-4 bg-slate-700/50 rounded-lg border border-slate-600 ${disabled ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="mb-4">
                        <button
                            onClick={onActivateDefense}
                            disabled={!isDefenseEnabled || disabled}
                            className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all text-lg font-orbitron tracking-wider"
                        >
                            {isDefenseActive ? 'DEFENSE ACTIVE' : activateLabel}
                        </button>
                         {!isDefenseActive && !isDefenseEnabled && <p className="text-xs text-center text-slate-500 mt-2">Enabled when drone is in range.</p>}
                    </div>
                    <div>
                        <label htmlFor="intensity-slider" className="block mb-2 font-bold text-slate-300">{intensityLabel}: <span className="text-cyan-400">{spoofingIntensity}%</span></label>
                        <input
                            id="intensity-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={spoofingIntensity}
                            onChange={(e) => onIntensityChange(Number(e.target.value))}
                            disabled={disabled || isDefenseActive}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:accent-slate-500"
                        />
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b-2 border-slate-600 pb-2 font-orbitron">4. Live Telemetry</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-cyan-500 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><DroneIcon/> Drones</div>
                        <p className="text-2xl font-bold text-slate-100 font-orbitron">{telemetry.activeDrones} <span className="text-base text-slate-400">/ {telemetry.totalDrones}</span></p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-blue-500 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><TargetIcon/> Closest</div>
                        <p className="text-2xl font-bold text-slate-100 font-orbitron">{telemetry.closestDroneDistance}<span className="text-base text-slate-400"> m</span></p>
                    </div>
                     <div className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-purple-500 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><AltitudeIcon/> Altitude</div>
                        <p className="text-2xl font-bold text-slate-100 font-orbitron">{telemetry.altitude}<span className="text-base text-slate-400"> m</span></p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-orange-500 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><ErrorIcon/> Max Error</div>
                        <p className="text-2xl font-bold text-slate-100 font-orbitron">{telemetry.maxPositionError}<span className="text-base text-slate-400"> m</span></p>
                    </div>
                    <div className={`col-span-2 bg-slate-700/50 p-3 rounded-lg border-l-4 shadow-sm ${threatStyles[telemetry.threatLevel].border}`}>
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><ThreatIcon/> Threat Level</div>
                        <p className={`text-xl font-bold uppercase ${threatStyles[telemetry.threatLevel].text} font-orbitron`}>{telemetry.threatLevel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};