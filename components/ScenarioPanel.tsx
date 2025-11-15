import React from 'react';
import type { Scenario, DroneControlType } from '../types';

interface ScenarioPanelProps {
    scenarios: Scenario[];
    selectedScenario: Scenario | null;
    onSelect: (scenario: Scenario | null) => void;
    simulationState: 'idle' | 'running' | 'paused';
    numberOfDrones: number;
    onNumberOfDronesChange: (count: number) => void;
    droneControlType: DroneControlType;
    onControlTypeChange: (type: DroneControlType) => void;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
        <React.Fragment>
            {parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="font-bold text-cyan-300">{part}</strong> : part
            )}
        </React.Fragment>
    );
};

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({ scenarios, selectedScenario, onSelect, simulationState, numberOfDrones, onNumberOfDronesChange, droneControlType, onControlTypeChange }) => {
    const disabled = simulationState !== 'idle';

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const scenarioId = event.target.value;
        if (!scenarioId) {
            onSelect(null);
            return;
        }
        const scenario = scenarios.find(s => s.id === scenarioId);
        onSelect(scenario || null);
    };

    return (
        <div className="h-full bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 flex flex-col backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b-2 border-slate-600 pb-2 font-orbitron">1. Configure Threat</h2>
            <div className="space-y-4 flex-grow">
                <div>
                    <label className="block mb-2 font-semibold text-slate-300">Threat Scenario</label>
                    <select
                        value={selectedScenario?.id || ''}
                        onChange={handleSelectChange}
                        disabled={disabled}
                        className="w-full p-3 rounded-lg bg-slate-700 border-2 border-slate-600 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                    >
                        <option value="">-- Select a Threat Scenario --</option>
                        {scenarios.map(scenario => (
                            <option key={scenario.id} value={scenario.id}>
                                {scenario.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedScenario && (
                    <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg animate-fade-in">
                        <h3 className="font-bold text-slate-100">{selectedScenario.name}</h3>
                        <p className="text-sm text-slate-400">
                            <MarkdownRenderer text={selectedScenario.description} />
                        </p>
                    </div>
                )}

                <div className={`transition-opacity ${disabled ? 'opacity-60' : ''}`}>
                    <label className="block mb-2 font-semibold text-slate-300">Drone Control Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['gps', 'sim'] as DroneControlType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => onControlTypeChange(type)}
                                disabled={disabled}
                                className={`p-3 rounded-lg text-center font-bold border-2 transition-all ${droneControlType === type ? 'bg-cyan-800/70 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-cyan-600'} disabled:cursor-not-allowed`}
                            >
                                {type.toUpperCase()} Controlled
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={`mt-4 pt-4 border-t border-slate-600 transition-opacity ${disabled ? 'opacity-60' : ''}`}>
                <label htmlFor="drone-count" className="block mb-2 font-bold text-slate-300">Number of Drones: <span className="text-cyan-400 font-orbitron">{numberOfDrones}</span></label>
                <input
                    id="drone-count"
                    type="range"
                    min="1"
                    max="20"
                    value={numberOfDrones}
                    onChange={(e) => onNumberOfDronesChange(Number(e.target.value))}
                    disabled={disabled}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:accent-slate-500"
                />
            </div>

            {selectedScenario && simulationState === 'idle' && (
                 <div className="text-center p-2 mt-4 bg-slate-700 text-cyan-300 rounded-md border border-slate-600">
                    <p className="font-semibold">Ready to Start Simulation</p>
                </div>
            )}
        </div>
    );
};
