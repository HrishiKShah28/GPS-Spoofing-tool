import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScenarioPanel } from './components/ScenarioPanel';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TheorySection } from './components/TheorySection';
import { Header } from './components/Header';
import { SCENARIOS, SENSITIVE_AREA, SPOOFED_ZONES, WARNING_DISTANCE, CANVAS_WIDTH, CANVAS_HEIGHT, CELL_TOWERS } from './constants';
import type { Scenario, DroneState, SatelliteState, Telemetry, Vector2D, SimulationStage, AlertState, SpoofedZone, DroneControlType } from './types';
import { RightPanel } from './components/RightPanel';
import { AlertBanner } from './components/AlertBanner';

const App: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'paused'>('idle');
    const [simulationStage, setSimulationStage] = useState<SimulationStage>('ingress');
    const [isDefenseActive, setIsDefenseActive] = useState<boolean>(false);
    const [spoofingIntensity, setSpoofingIntensity] = useState<number>(50);
    const [alertState, setAlertState] = useState<AlertState>({ show: false, message: '' });
    const [selectedSpoofedZone, setSelectedSpoofedZone] = useState<SpoofedZone>(SPOOFED_ZONES[0]);
    const [droneStates, setDroneStates] = useState<DroneState[]>([]);
    const [numberOfDrones, setNumberOfDrones] = useState<number>(1);
    const [droneControlType, setDroneControlType] = useState<DroneControlType>('gps');
    const [satellites, setSatellites] = useState<SatelliteState[]>([]);
    const [telemetry, setTelemetry] = useState<Telemetry>({
        closestDroneDistance: 0,
        altitude: 0,
        maxPositionError: 0,
        threatLevel: 'none',
        activeDrones: 0,
        neutralizedDrones: 0,
        totalDrones: 1,
    });
    
    const animationFrameId = useRef<number | null>(null);

    const haversineDistance = (pos1: Vector2D, pos2: Vector2D) => {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    };

    const resetSimulation = useCallback(() => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        setSelectedScenario(null);
        setSimulationState('idle');
        setSimulationStage('ingress');
        setIsDefenseActive(false);
        setSpoofingIntensity(50);
        setAlertState({ show: false, message: '' });
        setDroneStates([]);
        setTelemetry({ closestDroneDistance: 0, altitude: 0, maxPositionError: 0, threatLevel: 'none', activeDrones: 0, neutralizedDrones: 0, totalDrones: numberOfDrones });
        setSelectedSpoofedZone(SPOOFED_ZONES[0]);
    }, [numberOfDrones]);

    useEffect(() => {
        const initialSatellites: SatelliteState[] = Array.from({ length: 4 }, (_, i) => ({
            position: { x: 0, y: 0 },
            angle: (i * Math.PI) / 2,
            orbitRadius: 250 + i * 20,
        }));
        setSatellites(initialSatellites);
        resetSimulation();
    }, [resetSimulation]);
    
    const updateSimulation = useCallback(() => {
        if (simulationState !== 'running' || !selectedScenario) return;

        setDroneStates(prevDrones => prevDrones.map(drone => {
            if (drone.isNeutralized) return drone;

            let target: Vector2D & { radius: number };
            let updatedTargetSpoofedZone = drone.targetSpoofedZone;

            if (isDefenseActive) {
                // DEFENSE ON: Target is the nearest spoofed zone.
                let nearestZone = SPOOFED_ZONES[0];
                let minDistance = haversineDistance(drone.actualPosition, nearestZone);

                for (let i = 1; i < SPOOFED_ZONES.length; i++) {
                    const distance = haversineDistance(drone.actualPosition, SPOOFED_ZONES[i]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestZone = SPOOFED_ZONES[i];
                    }
                }
                target = nearestZone;
                updatedTargetSpoofedZone = nearestZone;
            } else {
                // DEFENSE OFF: Target is the sensitive area.
                target = SENSITIVE_AREA;
            }
            
            // UNIFIED NAVIGATION LOGIC
            let newVelocity = { x: 0, y: 0 };
            const distToTarget = haversineDistance(drone.actualPosition, target);
            if (distToTarget > target.radius / 2) {
                const direction = { x: target.x - drone.actualPosition.x, y: target.y - drone.actualPosition.y };
                const magnitude = Math.sqrt(direction.x**2 + direction.y**2);
                if (magnitude > 1) {
                    newVelocity = {
                        x: (direction.x / magnitude) * selectedScenario.speed,
                        y: (direction.y / magnitude) * selectedScenario.speed,
                    };
                }
            }
            
            // POSITION UPDATE
            const newActualPosition = { x: drone.actualPosition.x + newVelocity.x, y: drone.actualPosition.y + newVelocity.y };
            let newPerceivedPosition = { ...newActualPosition }; // Default for SIM, and for GPS when defense is off

            // GPS-SPECIFIC SPOOFING (only when defense is active)
            if (isDefenseActive && drone.controlType === 'gps') {
                const spoofVector = { x: updatedTargetSpoofedZone.x - newActualPosition.x, y: updatedTargetSpoofedZone.y - newActualPosition.y };
                const intensityFactor = spoofingIntensity / 100 * 2;
                newPerceivedPosition = {
                    x: drone.perceivedPosition.x + (newActualPosition.x - drone.actualPosition.x) + (spoofVector.x * 0.01 * intensityFactor),
                    y: drone.perceivedPosition.y + (newActualPosition.y - drone.actualPosition.y) + (spoofVector.y * 0.01 * intensityFactor),
                };
            }
            
            // NEUTRALIZATION CHECK (only when defense is active)
            let isNowNeutralized = false;
            if (isDefenseActive) {
                isNowNeutralized = haversineDistance(newActualPosition, updatedTargetSpoofedZone) < updatedTargetSpoofedZone.radius;
            }

            return {
                ...drone,
                actualPosition: newActualPosition,
                perceivedPosition: newPerceivedPosition,
                velocity: newVelocity,
                propellerAngle: (drone.propellerAngle + 0.5) % (Math.PI * 2),
                isNeutralized: isNowNeutralized,
                targetSpoofedZone: updatedTargetSpoofedZone,
            };
        }));

        setSatellites(prev => prev.map(sat => ({ ...sat, angle: (sat.angle + 0.005) % (Math.PI * 2) })));
        
        animationFrameId.current = requestAnimationFrame(updateSimulation);
    }, [simulationState, selectedScenario, isDefenseActive, spoofingIntensity]);


    useEffect(() => {
        if (simulationState === 'running') {
            animationFrameId.current = requestAnimationFrame(updateSimulation);
        } else {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        }
        return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
    }, [simulationState, updateSimulation]);

    useEffect(() => {
        if (!selectedScenario || simulationState === 'idle' || droneStates.length === 0) return;

        const activeDrones = droneStates.filter(d => !d.isNeutralized);
        const neutralizedCount = droneStates.length - activeDrones.length;
        
        if (activeDrones.length === 0 && simulationState === 'running') {
            setSimulationStage('neutralized');
            setAlertState({ show: true, message: 'SUCCESS: ALL THREATS NEUTRALIZED' });
            setSimulationState('idle'); // Stop simulation updates
            return;
        }

        let closestDist = Infinity;
        let maxError = 0;
        let maxThreatLevel: Telemetry['threatLevel'] = 'none';
        const threatOrder: Telemetry['threatLevel'][] = ['none', 'low', 'medium', 'high', 'critical'];

        activeDrones.forEach(drone => {
            const distToSensitive = haversineDistance(drone.actualPosition, SENSITIVE_AREA);
            if (distToSensitive < closestDist) closestDist = distToSensitive;
            
            const error = haversineDistance(drone.actualPosition, drone.perceivedPosition);
            if (error > maxError) maxError = error;

            let level: Telemetry['threatLevel'] = 'none';
            if (distToSensitive < WARNING_DISTANCE * 1.5) level = 'low';
            if (distToSensitive < WARNING_DISTANCE) level = 'medium';
            if (distToSensitive < SENSITIVE_AREA.radius * 1.5) level = 'high';
            if (distToSensitive < SENSITIVE_AREA.radius) level = 'critical';

            if (threatOrder.indexOf(level) > threatOrder.indexOf(maxThreatLevel)) {
                maxThreatLevel = level;
            }
        });

        if (closestDist < WARNING_DISTANCE && !isDefenseActive && simulationStage !== 'neutralized' && !alertState.show) {
            setAlertState({ show: true, message: 'WARNING: DRONE SWARM APPROACHING SENSITIVE AREA' });
        }
        
        setTelemetry({
            closestDroneDistance: Math.round(closestDist),
            altitude: selectedScenario.altitude,
            maxPositionError: Math.round(maxError),
            threatLevel: maxThreatLevel,
            activeDrones: activeDrones.length,
            neutralizedDrones: neutralizedCount,
            totalDrones: droneStates.length,
        });
        
        let currentStage: SimulationStage = 'ingress';
        if (isDefenseActive) {
            currentStage = 'defense_active';
        } else if (threatOrder.indexOf(maxThreatLevel) >= threatOrder.indexOf('high') || alertState.show) {
            currentStage = 'detected';
        }
        setSimulationStage(currentStage);

    }, [droneStates, selectedScenario, isDefenseActive, simulationState, alertState.show, simulationStage]);

    const handleScenarioSelect = (scenario: Scenario | null) => {
        if(simulationState !== 'idle') return;
        resetSimulation();
        setSelectedScenario(scenario);
    };

    const handleStart = () => {
        if (selectedScenario) {
            const newDrones = Array.from({ length: numberOfDrones }, (_, i) => {
                let startPos: Vector2D;
                const edge = Math.floor(Math.random() * 4);
                const padding = 20;
                switch (edge) {
                    case 0: // Top
                        startPos = { x: Math.random() * CANVAS_WIDTH, y: -padding };
                        break;
                    case 1: // Right
                        startPos = { x: CANVAS_WIDTH + padding, y: Math.random() * CANVAS_HEIGHT };
                        break;
                    case 2: // Bottom
                        startPos = { x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + padding };
                        break;
                    case 3: // Left
                    default:
                        startPos = { x: -padding, y: Math.random() * CANVAS_HEIGHT };
                        break;
                }
                
                const targetZone = SPOOFED_ZONES[i % SPOOFED_ZONES.length];
                return {
                    id: `drone-${i}-${Date.now()}`,
                    actualPosition: startPos,
                    perceivedPosition: startPos,
                    velocity: { x: 0, y: 0 },
                    propellerAngle: Math.random() * Math.PI * 2,
                    targetSpoofedZone: numberOfDrones > 1 ? targetZone : selectedSpoofedZone,
                    isNeutralized: false,
                    controlType: droneControlType,
                };
            });
            setDroneStates(newDrones);
            setSimulationState('running');
            setAlertState({ show: false, message: '' });
        }
    };
    const handlePause = () => setSimulationState(state => (state === 'running' ? 'paused' : 'running'));
    const handleReset = () => resetSimulation();
    const handleActivateDefense = () => {
        setIsDefenseActive(true);
        setAlertState({ show: false, message: '' });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col">
            <AlertBanner alertState={alertState} on-close={() => setAlertState({show: false, message: ''})}/>
            <Header />
            <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="lg:col-span-1">
                    <ScenarioPanel 
                        scenarios={SCENARIOS}
                        selectedScenario={selectedScenario}
                        onSelect={handleScenarioSelect}
                        simulationState={simulationState}
                        numberOfDrones={numberOfDrones}
                        onNumberOfDronesChange={setNumberOfDrones}
                        droneControlType={droneControlType}
                        onControlTypeChange={setDroneControlType}
                    />
                </div>
                <div className="lg:col-span-2 flex flex-col items-center gap-4">
                     <SimulationCanvas
                        droneStates={droneStates}
                        satellites={satellites}
                        isDefenseActive={isDefenseActive}
                        showAlert={alertState.show && simulationStage === 'detected'}
                        spoofedZones={SPOOFED_ZONES}
                        selectedSpoofedZone={selectedSpoofedZone}
                        cellTowers={CELL_TOWERS}
                        droneControlType={droneControlType}
                    />
                    <div className="flex items-center gap-4">
                        <button onClick={handleStart} disabled={!selectedScenario || simulationState !== 'idle'} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md shadow-lg transition-all text-white font-bold font-orbitron tracking-wider">START SIMULATION</button>
                        <button onClick={handlePause} disabled={simulationState === 'idle'} className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md shadow-lg transition-all text-slate-900 font-bold font-orbitron">
                            {simulationState === 'running' ? 'PAUSE' : 'RESUME'}
                        </button>
                        <button onClick={handleReset} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-md shadow-lg transition-all text-white font-bold font-orbitron">RESET</button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <RightPanel
                        selectedScenario={selectedScenario}
                        simulationState={simulationState}
                        simulationStage={simulationStage}
                        telemetry={telemetry}
                        isDefenseActive={isDefenseActive}
                        onActivateDefense={handleActivateDefense}
                        spoofingIntensity={spoofingIntensity}
                        onIntensityChange={setSpoofingIntensity}
                        isDefenseEnabled={alertState.show && !isDefenseActive}
                        spoofedZones={SPOOFED_ZONES}
                        selectedSpoofedZone={selectedSpoofedZone}
                        onSelectSpoofedZone={setSelectedSpoofedZone}
                        numberOfDrones={numberOfDrones}
                        droneControlType={droneControlType}
                    />
                </div>
            </main>
            <TheorySection />
        </div>
    );
};

export default App;