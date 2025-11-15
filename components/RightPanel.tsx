import React from 'react';
import type { Scenario, SimulationStage, Telemetry, SpoofedZone, DroneControlType } from '../types';
import { SCENARIO_BRIEFINGS } from '../constants';
import { ControlPanel } from './ControlPanel';

interface ScenarioDetailsProps {
    scenario: Scenario;
}

const ScenarioDetails: React.FC<ScenarioDetailsProps> = ({ scenario }) => (
    <div>
        <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b-2 border-slate-600 pb-2 font-orbitron">Scenario Details</h2>
        <div className="space-y-3 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <div>
                <h3 className="font-bold text-slate-300">Drone Type</h3>
                <p className="text-slate-400">{scenario.name}</p>
            </div>
             <div>
                <h3 className="font-bold text-slate-300">Key Parameters</h3>
                <p className="text-sm text-slate-400">Range: {scenario.range} | Speed: {scenario.speed} | Altitude: {scenario.altitude}m</p>
            </div>
            <div>
                <h3 className="font-bold text-slate-300">Defense Method</h3>
                <p className="text-slate-400">{scenario.defenseMethod}</p>
            </div>
            <div>
                <h3 className="font-bold text-slate-300">Best Use Case</h3>
                <p className="text-slate-400">{scenario.bestUseCase}</p>
            </div>
        </div>
    </div>
);


interface ActiveBriefingProps {
    scenario: Scenario;
    stage: SimulationStage;
    droneControlType: DroneControlType;
}

const ActiveBriefing: React.FC<ActiveBriefingProps> = ({ scenario, stage, droneControlType }) => {
    let briefingText: string;

    if (droneControlType === 'sim') {
        const simBriefings: { [key in SimulationStage]: string } = {
            ingress: "**Status: Ingress.** A SIM-controlled drone is approaching, using the cellular network for command and control.",
            detected: "**Status: Threat Detected!** The drone has entered our signal interception range. Prepare to hijack its control link.",
            defense_active: "**Status: SIM Hijack Active.** We are overpowering the public cell tower signal. The drone is now under our control and is being redirected to the designated safe zone.",
            neutralized: "**Status: Threat Neutralized.** The drone has been successfully guided into the safe landing zone via signal hijacking."
        };
        briefingText = simBriefings[stage];
    } else {
        briefingText = SCENARIO_BRIEFINGS[scenario.id as keyof typeof SCENARIO_BRIEFINGS][stage] || "Awaiting data...";
    }
    
    const stageColors: { [key in SimulationStage]: string } = {
        ingress: 'text-blue-400',
        detected: 'text-orange-400 animate-pulse',
        defense_active: 'text-green-400',
        neutralized: 'text-purple-400',
    }

    const formatText = (text: string) => {
        return text.split('**').map((part, index) => 
            index % 2 === 1 ? <strong key={index} className={`font-bold ${stageColors[stage]}`}>{part}</strong> : part
        );
    };
    
    return (
        <div>
            <h2 className="text-xl font-bold mb-2 text-cyan-400 border-b-2 border-slate-600 pb-2 font-orbitron">Active Briefing</h2>
            <div className="bg-slate-700/50 p-4 rounded-md text-slate-300 border border-slate-600">
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
    isDefenseActive: boolean;
    onActivateDefense: () => void;
    spoofingIntensity: number;
    onIntensityChange: (intensity: number) => void;
    isDefenseEnabled: boolean;
    spoofedZones: SpoofedZone[];
    selectedSpoofedZone: SpoofedZone | null;
    onSelectSpoofedZone: (zone: SpoofedZone) => void;
    numberOfDrones: number;
    droneControlType: DroneControlType;
}

export const RightPanel: React.FC<RightPanelProps> = (props) => {
    const isMultiDrone = props.numberOfDrones > 1;

    return (
        <div className="h-full bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 flex flex-col backdrop-blur-sm">
            {!props.selectedScenario ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Select a scenario to begin.</p>
                </div>
            ) : props.simulationState === 'idle' ? (
                 <div className="flex flex-col gap-6">
                    <ScenarioDetails scenario={props.selectedScenario} />
                     <div className={isMultiDrone ? 'opacity-50' : ''}>
                        <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b-2 border-slate-600 pb-2 font-orbitron">2. Spoofed Area</h2>
                        <div className="space-y-2">
                            {props.spoofedZones.map(zone => (
                                <button
                                    key={zone.id}
                                    onClick={() => props.onSelectSpoofedZone(zone)}
                                    disabled={isMultiDrone}
                                    className={`w-full text-left p-2 rounded-lg transition-all border-2 ${
                                        props.selectedSpoofedZone?.id === zone.id
                                            ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-700'
                                            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-cyan-500'
                                    } ${isMultiDrone ? 'cursor-not-allowed' : ''}`}
                                >
                                    <p className="font-semibold text-slate-200">{zone.name}</p>
                                </button>
                            ))}
                        </div>
                        {isMultiDrone && <p className="text-xs text-slate-500 mt-2 text-center">Targets are assigned randomly for multiple drones.</p>}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full gap-6">
                    <ActiveBriefing scenario={props.selectedScenario} stage={props.simulationStage} droneControlType={props.droneControlType} />
                    <ControlPanel 
                        telemetry={props.telemetry}
                        isDefenseActive={props.isDefenseActive}
                        onActivateDefense={props.onActivateDefense}
                        spoofingIntensity={props.spoofingIntensity}
                        onIntensityChange={props.onIntensityChange}
                        disabled={false}
                        isDefenseEnabled={props.isDefenseEnabled}
                        droneControlType={props.droneControlType}
                    />
                </div>
            )}
        </div>
    );
};
