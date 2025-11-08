import React from 'react';
import type { Scenario, SimulationStage, Telemetry } from '../types';
import { SCENARIO_BRIEFINGS } from '../constants';
import { ControlPanel } from './ControlPanel';

interface ScenarioDetailsProps {
    scenario: Scenario;
}

const ScenarioDetails: React.FC<ScenarioDetailsProps> = ({ scenario }) => (
    <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">Scenario Details</h2>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
                <h3 className="font-bold text-gray-700">Drone Type</h3>
                <p className="text-gray-600">{scenario.name}</p>
            </div>
             <div>
                <h3 className="font-bold text-gray-700">Key Parameters</h3>
                <p className="text-sm text-gray-600">Range: {scenario.range} | Speed: {scenario.speed} | Altitude: {scenario.altitude}m</p>
            </div>
            <div>
                <h3 className="font-bold text-gray-700">Defense Method</h3>
                <p className="text-gray-600">{scenario.defenseMethod}</p>
            </div>
            <div>
                <h3 className="font-bold text-gray-700">Best Use Case</h3>
                <p className="text-gray-600">{scenario.bestUseCase}</p>
            </div>
        </div>
    </div>
);


interface ActiveBriefingProps {
    scenario: Scenario;
    stage: SimulationStage;
}

const ActiveBriefing: React.FC<ActiveBriefingProps> = ({ scenario, stage }) => {
    const briefingText = SCENARIO_BRIEFINGS[scenario.id as keyof typeof SCENARIO_BRIEFINGS][stage] || "Awaiting data...";
    
    const stageColors: { [key in SimulationStage]: string } = {
        ingress: 'text-blue-600',
        detected: 'text-orange-600 animate-pulse',
        defense_active: 'text-green-600',
        neutralized: 'text-purple-600',
    }

    const formatText = (text: string) => {
        return text.split('**').map((part, index) => 
            index % 2 === 1 ? <strong key={index} className={`font-bold ${stageColors[stage]}`}>{part}</strong> : part
        );
    };
    
    return (
        <div>
            <h2 className="text-xl font-bold mb-2 text-gray-800 border-b-2 border-gray-200 pb-2">Active Briefing</h2>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700 border border-gray-200">
                <p className="whitespace-pre-line">{formatText(briefingText)}</p>
            </div>
        </div>
    );
};

interface RightPanelProps {
    selectedScenario: Scenario | null;
    simulationState: 'idle' | 'running' | 'paused';
    simulationStage: SimulationStage;
    telemetry: Telemetry;
    isSpoofingActive: boolean;
    onActivateDefense: () => void;
    spoofingIntensity: number;
    onIntensityChange: (intensity: number) => void;
    isDefenseEnabled: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = (props) => {
    return (
        <div className="h-full bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            {!props.selectedScenario ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Select a scenario to begin.</p>
                </div>
            ) : props.simulationState === 'idle' ? (
                <ScenarioDetails scenario={props.selectedScenario} />
            ) : (
                <div className="flex flex-col h-full gap-6">
                    <ActiveBriefing scenario={props.selectedScenario} stage={props.simulationStage} />
                    <ControlPanel 
                        telemetry={props.telemetry}
                        isSpoofingActive={props.isSpoofingActive}
                        onActivateDefense={props.onActivateDefense}
                        spoofingIntensity={props.spoofingIntensity}
                        onIntensityChange={props.onIntensityChange}
                        // FIX: The `ControlPanel` is only rendered when `simulationState` is not 'idle',
                        // so this comparison was always false and caused a type error. The panel should not be disabled in this state.
                        disabled={false}
                        isDefenseEnabled={props.isDefenseEnabled}
                    />
                </div>
            )}
        </div>
    );
};
