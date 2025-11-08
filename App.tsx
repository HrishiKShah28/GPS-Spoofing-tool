import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScenarioPanel } from './components/ScenarioPanel';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TheorySection } from './components/TheorySection';
import { Header } from './components/Header';
import { SCENARIOS, PROTECTED_ZONE, SAFE_ZONE, DRONE_START_POS, WARNING_DISTANCE } from './constants';
import type { Scenario, DroneState, SatelliteState, Telemetry, Vector2D, SimulationStage, AlertState } from './types';
import { RightPanel } from './components/RightPanel';
import { AlertBanner } from './components/AlertBanner';

const App: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'paused'>('idle');
    const [simulationStage, setSimulationStage] = useState<SimulationStage>('ingress');
    const [isSpoofingActive, setIsSpoofingActive] = useState<boolean>(false);
    const [spoofingIntensity, setSpoofingIntensity] = useState<number>(50);
    const [alertState, setAlertState] = useState<AlertState>({ show: false, message: '' });
    const [droneState, setDroneState] = useState<DroneState>({
        actualPosition: { ...DRONE_START_POS },
        perceivedPosition: { ...DRONE_START_POS },
        velocity: { x: 0, y: 0 },
        propellerAngle: 0,
    });
    const [satellites, setSatellites] = useState<SatelliteState[]>([]);
    const [telemetry, setTelemetry] = useState<Telemetry>({
        distanceToProtectedZone: 0,
        altitude: 0,
        positionError: 0,
        threatLevel: 'none',
    });
    
    const animationFrameId = useRef<number | null>(null);

    const haversineDistance = (pos1: Vector2D, pos2: Vector2D) => {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    };

    const resetSimulation = useCallback(() => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        // Keep selectedScenario to show details, but reset everything else
        setSelectedScenario(null);
        setSimulationState('idle');
        setSimulationStage('ingress');
        setIsSpoofingActive(false);
        setSpoofingIntensity(50);
        setAlertState({ show: false, message: '' });
        setDroneState({
            actualPosition: { ...DRONE_START_POS },
            perceivedPosition: { ...DRONE_START_POS },
            velocity: { x: 0, y: 0 },
            propellerAngle: 0,
        });
        setTelemetry({ distanceToProtectedZone: 0, altitude: 0, positionError: 0, threatLevel: 'none' });
    }, []);

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

        setDroneState(prev => {
            const target = isSpoofingActive ? SAFE_ZONE : PROTECTED_ZONE;
            
            const direction = {
                x: target.x - prev.actualPosition.x,
                y: target.y - prev.actualPosition.y,
            };
            const magnitude = Math.sqrt(direction.x**2 + direction.y**2);
            
            let newVelocity = { x: 0, y: 0 };
            const stopDistance = isSpoofingActive ? SAFE_ZONE.radius : PROTECTED_ZONE.radius;

            if (magnitude > stopDistance) {
                newVelocity = {
                    x: (direction.x / magnitude) * selectedScenario.speed,
                    y: (direction.y / magnitude) * selectedScenario.speed,
                };
            }

            const newActualPosition = {
                x: prev.actualPosition.x + newVelocity.x,
                y: prev.actualPosition.y + newVelocity.y,
            };

            // Keep perceived position for visual effect
            let newPerceivedPosition = { ...newActualPosition };
            if (isSpoofingActive) {
                const spoofVector = {
                    x: SAFE_ZONE.x - newActualPosition.x,
                    y: SAFE_ZONE.y - newActualPosition.y,
                };
                const intensityFactor = spoofingIntensity / 100 * 2;
                newPerceivedPosition = {
                    x: prev.perceivedPosition.x + (newActualPosition.x - prev.actualPosition.x) + (spoofVector.x * 0.01 * intensityFactor),
                    y: prev.perceivedPosition.y + (newActualPosition.y - prev.actualPosition.y) + (spoofVector.y * 0.01 * intensityFactor),
                };
            }
            
            return {
                actualPosition: newActualPosition,
                perceivedPosition: newPerceivedPosition,
                velocity: newVelocity,
                propellerAngle: (prev.propellerAngle + 0.5) % (Math.PI * 2),
            };
        });

        setSatellites(prev => prev.map(sat => ({ ...sat, angle: (sat.angle + 0.005) % (Math.PI * 2) })));
        
        animationFrameId.current = requestAnimationFrame(updateSimulation);
    }, [simulationState, selectedScenario, isSpoofingActive, spoofingIntensity]);


    useEffect(() => {
        if (simulationState === 'running') {
            animationFrameId.current = requestAnimationFrame(updateSimulation);
        } else {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        }
        return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
    }, [simulationState, updateSimulation]);

    useEffect(() => {
        if (!selectedScenario || simulationState === 'idle') return;

        const distToProtected = haversineDistance(droneState.actualPosition, PROTECTED_ZONE);
        const distToSafe = haversineDistance(droneState.actualPosition, SAFE_ZONE);
        const error = haversineDistance(droneState.actualPosition, droneState.perceivedPosition);
        
        if (distToProtected < WARNING_DISTANCE && !isSpoofingActive && simulationStage !== 'neutralized' && !alertState.show) {
            setAlertState({ show: true, message: 'WARNING: DRONE APPROACHING PROTECTED AREA' });
        }

        let level: Telemetry['threatLevel'] = 'none';
        if (distToProtected < WARNING_DISTANCE * 1.5) level = 'low';
        if (distToProtected < WARNING_DISTANCE) level = 'medium';
        if (distToProtected < PROTECTED_ZONE.radius * 1.5) level = 'high';
        if (distToProtected < PROTECTED_ZONE.radius) level = 'critical';

        setTelemetry({
            distanceToProtectedZone: Math.round(distToProtected),
            altitude: selectedScenario.altitude,
            positionError: Math.round(error),
            threatLevel: level,
        });
        
        let currentStage: SimulationStage = 'ingress';
        if (distToSafe < SAFE_ZONE.radius) {
            currentStage = 'neutralized';
            setAlertState({ show: true, message: 'SUCCESS: THREAT NEUTRALIZED' });
        } else if (isSpoofingActive) {
            currentStage = 'defense_active';
        } else if (level === 'high' || level === 'critical' || alertState.show) {
            currentStage = 'detected';
        }
        setSimulationStage(currentStage);

    }, [droneState, selectedScenario, isSpoofingActive, simulationState, alertState.show, simulationStage]);

    const handleScenarioSelect = (scenario: Scenario) => {
        if(simulationState !== 'idle') return;
        resetSimulation();
        setSelectedScenario(scenario);
    };

    const handleStart = () => {
        if (selectedScenario) {
            setSimulationState('running');
            setAlertState({ show: false, message: '' });
        }
    };
    const handlePause = () => setSimulationState(state => (state === 'running' ? 'paused' : 'running'));
    const handleReset = () => resetSimulation();
    const handleActivateDefense = () => setIsSpoofingActive(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800 font-sans flex flex-col">
            <AlertBanner alertState={alertState} on-close={() => setAlertState({show: false, message: ''})}/>
            <Header />
            <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="lg:col-span-1">
                    <ScenarioPanel 
                        scenarios={SCENARIOS}
                        selectedScenario={selectedScenario}
                        onSelect={handleScenarioSelect}
                        simulationState={simulationState}
                    />
                </div>
                <div className="lg:col-span-2 flex flex-col items-center gap-4">
                     <SimulationCanvas
                        droneState={droneState}
                        satellites={satellites}
                        isSpoofingActive={isSpoofingActive}
                        showAlert={alertState.show && simulationStage === 'detected'}
                    />
                    <div className="flex items-center gap-4">
                        <button onClick={handleStart} disabled={!selectedScenario || simulationState !== 'idle'} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md shadow-lg transition-all text-white font-bold">START SIMULATION</button>
                        <button onClick={handlePause} disabled={simulationState === 'idle'} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md shadow-lg transition-all text-gray-900 font-bold">
                            {simulationState === 'running' ? 'PAUSE' : 'RESUME'}
                        </button>
                        <button onClick={handleReset} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-md shadow-lg transition-all text-white font-bold">RESET</button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <RightPanel
                        selectedScenario={selectedScenario}
                        simulationState={simulationState}
                        simulationStage={simulationStage}
                        telemetry={telemetry}
                        isSpoofingActive={isSpoofingActive}
                        onActivateDefense={handleActivateDefense}
                        spoofingIntensity={spoofingIntensity}
                        onIntensityChange={setSpoofingIntensity}
                        isDefenseEnabled={alertState.show && !isSpoofingActive}
                    />
                </div>
            </main>
            <TheorySection />
        </div>
    );
};

export default App;
