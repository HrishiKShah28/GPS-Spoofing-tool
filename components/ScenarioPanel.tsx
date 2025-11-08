import React from 'react';
import type { Scenario } from '../types';
import { WifiIcon, BluetoothIcon, SatelliteIcon, GeoFenceIcon } from './icons';

interface ScenarioPanelProps {
    scenarios: Scenario[];
    selectedScenario: Scenario | null;
    onSelect: (scenario: Scenario) => void;
    simulationState: 'idle' | 'running' | 'paused';
}

const iconMap: { [key: string]: React.ReactNode } = {
    bluetooth: <BluetoothIcon className="w-8 h-8 text-blue-500" />,
    wifi: <WifiIcon className="w-8 h-8 text-green-500" />,
    satellite: <SatelliteIcon className="w-8 h-8 text-purple-500" />,
    geofence: <GeoFenceIcon className="w-8 h-8 text-yellow-500" />,
};

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({ scenarios, selectedScenario, onSelect, simulationState }) => {
    const disabled = simulationState !== 'idle';

    return (
        <div className="h-full bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">1. Select Threat Scenario</h2>
            <div className="space-y-3 flex-grow">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => onSelect(scenario)}
                        disabled={disabled}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 border-2 ${
                            selectedScenario?.id === scenario.id
                                ? 'bg-green-50 border-green-400 shadow-md ring-2 ring-green-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-blue-400'
                        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div>{iconMap[scenario.id]}</div>
                            <div>
                                <h3 className="font-bold text-gray-900">{scenario.name}</h3>
                                <p className="text-sm text-gray-600">{scenario.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            {selectedScenario && simulationState === 'idle' && (
                 <div className="text-center p-2 mt-4 bg-blue-100 text-blue-800 rounded-md">
                    <p className="font-semibold">Ready to Start Simulation</p>
                </div>
            )}
        </div>
    );
};
