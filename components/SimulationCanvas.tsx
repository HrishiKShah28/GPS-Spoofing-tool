import React, { useRef, useEffect } from 'react';
import type { DroneState, SatelliteState, SpoofedZone, Vector2D, DroneControlType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SENSITIVE_AREA } from '../constants';

interface SimulationCanvasProps {
    droneStates: DroneState[];
    satellites: SatelliteState[];
    isDefenseActive: boolean;
    showAlert: boolean;
    spoofedZones: SpoofedZone[];
    selectedSpoofedZone: SpoofedZone;
    cellTowers: Vector2D[];
    droneControlType: DroneControlType;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ droneStates, satellites, isDefenseActive, showAlert, spoofedZones, selectedSpoofedZone, cellTowers, droneControlType }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameCount = useRef(0);

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)'; // slate-700
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    };

    const drawZones = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(SENSITIVE_AREA.x, SENSITIVE_AREA.y, SENSITIVE_AREA.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        if (showAlert) {
            const pulse = Math.abs(Math.sin(frameCount.current * 0.1));
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SENSITIVE AREA', SENSITIVE_AREA.x, SENSITIVE_AREA.y - 5);
        
        spoofedZones.forEach(zone => {
            const isSelected = zone.id === selectedSpoofedZone.id;
            ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.25)' : 'rgba(34, 211, 238, 0.1)';
            ctx.strokeStyle = isSelected ? 'rgba(34, 211, 238, 0.9)' : 'rgba(34, 211, 238, 0.5)';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.setLineDash(isSelected ? [] : [4, 4]);

            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.setLineDash([]);
            ctx.fillStyle = '#67e8f9';
            ctx.fillText(zone.name, zone.x, zone.y - 5);
        });
    };

    const drawDrone = (ctx: CanvasRenderingContext2D, { actualPosition, propellerAngle, controlType }: DroneState) => {
        ctx.save();
        ctx.translate(actualPosition.x, actualPosition.y);
        
        ctx.fillStyle = controlType === 'sim' ? '#7dd3fc' : '#f1f5f9'; // Lighter blue for SIM drones
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#0f172a'; // slate-900
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#94a3b8'; // slate-400
        const armLength = 15;
        const armAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
        
        armAngles.forEach(angle => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * armLength, Math.sin(angle) * armLength);
            ctx.stroke();
        });

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = controlType === 'sim' ? '#34d399' : '#67e8f9'; // Green props for SIM, cyan for GPS
        armAngles.forEach(angle => {
            const propX = Math.cos(angle) * armLength;
            const propY = Math.sin(angle) * armLength;
            ctx.save();
            ctx.translate(propX, propY);
            ctx.rotate(propellerAngle);
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(6, 0);
            ctx.stroke();
            ctx.restore();
        });
        ctx.restore();
    };

    const drawSpoofingElements = (ctx: CanvasRenderingContext2D, drone: DroneState) => {
        const { actualPosition, perceivedPosition, targetSpoofedZone, controlType } = drone;

        // Draw "ghost" drone and position error line for GPS drones only
        if (controlType === 'gps') {
            const positionError = Math.sqrt(Math.pow(actualPosition.x - perceivedPosition.x, 2) + Math.pow(actualPosition.y - perceivedPosition.y, 2));
            if (positionError > 1) {
                // Ghost drone at perceived position
                ctx.fillStyle = 'rgba(234, 179, 8, 0.7)'; // yellow-500
                ctx.beginPath();
                ctx.arc(perceivedPosition.x, perceivedPosition.y, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                // Dotted line between actual and perceived
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(actualPosition.x, actualPosition.y);
                ctx.lineTo(perceivedPosition.x, perceivedPosition.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw curved path to target for any redirected drone
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        const controlX = (actualPosition.x + targetSpoofedZone.x) / 2 + (targetSpoofedZone.y - actualPosition.y) * 0.2;
        const controlY = (actualPosition.y + targetSpoofedZone.y) / 2 - (targetSpoofedZone.x - actualPosition.x) * 0.2;
        ctx.beginPath();
        ctx.moveTo(actualPosition.x, actualPosition.y);
        ctx.quadraticCurveTo(controlX, controlY, targetSpoofedZone.x, targetSpoofedZone.y);
        ctx.stroke();
        ctx.setLineDash([]);
    };

    const drawGpsConnection = (ctx: CanvasRenderingContext2D, sats: SatelliteState[], drone: DroneState) => {
        sats.forEach(sat => {
            const satX = SENSITIVE_AREA.x + Math.cos(sat.angle) * sat.orbitRadius;
            const satY = SENSITIVE_AREA.y + Math.sin(sat.angle) * sat.orbitRadius;
            sat.position = { x: satX, y: satY };

            ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(satX, satY);
            ctx.lineTo(drone.perceivedPosition.x, drone.perceivedPosition.y);
            ctx.stroke();
        });
    };
    
    const drawSimConnection = (ctx: CanvasRenderingContext2D, drone: DroneState) => {
        let closestTower: Vector2D | null = null;
        let minDistance = Infinity;

        cellTowers.forEach(tower => {
            const distance = Math.sqrt((drone.actualPosition.x - tower.x)**2 + (drone.actualPosition.y - tower.y)**2);
            if(distance < minDistance){
                minDistance = distance;
                closestTower = tower;
            }
        });

        if(closestTower) {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)'; // emerald-400
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2,3]);
            ctx.beginPath();
            ctx.moveTo(closestTower.x, closestTower.y);
            ctx.lineTo(drone.actualPosition.x, drone.actualPosition.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    };

    const drawStaticSatellites = (ctx: CanvasRenderingContext2D, sats: SatelliteState[]) => {
         sats.forEach(sat => {
            const satX = SENSITIVE_AREA.x + Math.cos(sat.angle) * sat.orbitRadius;
            const satY = SENSITIVE_AREA.y + Math.sin(sat.angle) * sat.orbitRadius;
            
            ctx.save();
            ctx.translate(satX, satY);
            ctx.rotate(sat.angle + Math.PI / 2); // Orient the satellite along its orbit

            // Body
            ctx.fillStyle = '#c4b5fd'; // Light indigo
            ctx.strokeStyle = '#1e293b'; // slate-800
            ctx.lineWidth = 1;
            ctx.fillRect(-5, -3, 10, 6);
            ctx.strokeRect(-5, -3, 10, 6);

            // Solar panels
            ctx.fillStyle = '#38bdf8'; // sky-400
            ctx.fillRect(-4, -10, 8, 7);
            ctx.strokeRect(-4, -10, 8, 7);
            ctx.fillRect(-4, 3, 8, 7);
            ctx.strokeRect(-4, 3, 8, 7);
            
            // Antenna dish pointing to center
            ctx.strokeStyle = '#f1f5f9'; // slate-100
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, -7, 3, Math.PI * 0.1, Math.PI * 0.9, true); // Dish pointing away from orbit center
            ctx.stroke();

            ctx.restore();
        });
    };

    const drawTowers = (ctx: CanvasRenderingContext2D) => {
        cellTowers.forEach(tower => {
            ctx.fillStyle = '#34d399'; // emerald-400
            ctx.strokeStyle = '#042f2e';
            ctx.lineWidth = 2;

            // Simple tower shape
            ctx.beginPath();
            ctx.moveTo(tower.x - 4, tower.y);
            ctx.lineTo(tower.x + 4, tower.y);
            ctx.lineTo(tower.x, tower.y - 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Blinking light
            const pulse = Math.abs(Math.sin(frameCount.current * 0.05));
            ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.beginPath();
            ctx.arc(tower.x, tower.y - 22, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        frameCount.current++;

        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        drawGrid(ctx);
        drawZones(ctx);
        
        if (droneControlType === 'gps') {
            drawStaticSatellites(ctx, satellites);
        } else { // 'sim'
            drawTowers(ctx);
        }

        droneStates.forEach(drone => {
             if (!drone.isNeutralized) {
                if(drone.controlType === 'gps') {
                    drawGpsConnection(ctx, satellites, drone);
                } else {
                    drawSimConnection(ctx, drone);
                }

                if (isDefenseActive) {
                    drawSpoofingElements(ctx, drone);
                }
                drawDrone(ctx, drone);

                // Draw control type icon
                ctx.save();
                ctx.translate(drone.actualPosition.x + 18, drone.actualPosition.y - 18);
                
                if (drone.controlType === 'gps') {
                    // A more distinct satellite icon
                    ctx.save();
                    ctx.rotate(Math.PI / 4); // Rotate for a more dynamic look

                    // Solar panels (drawn first to be behind the body)
                    ctx.fillStyle = '#38bdf8'; // Sky blue for panels
                    ctx.strokeStyle = '#f1f5f9';
                    ctx.lineWidth = 1;
                    ctx.fillRect(-12, -2.5, 8, 5); // Left panel
                    ctx.strokeRect(-12, -2.5, 8, 5);
                    ctx.fillRect(4, -2.5, 8, 5); // Right panel
                    ctx.strokeRect(4, -2.5, 8, 5);

                    // Body
                    ctx.fillStyle = '#c4b5fd'; // Light indigo for the body
                    ctx.fillRect(-4, -4, 8, 8);
                    ctx.strokeRect(-4, -4, 8, 8);
                    
                    // Dish antenna
                    ctx.strokeStyle = '#f1f5f9';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 8, 3, 0.25 * Math.PI, 0.75 * Math.PI);
                    ctx.stroke();

                    ctx.restore(); // Restore rotation
                } else if (drone.controlType === 'sim') {
                    ctx.fillStyle = '#34d399'; // emerald
                    ctx.strokeStyle = '#0f172a'; // slate-900
                    ctx.lineWidth = 1;
                    
                    // Tower Mast
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.lineTo(-3, -5);
                    ctx.lineTo(3, -5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
        
                    // Blinking light
                    const pulse = Math.abs(Math.sin(frameCount.current * 0.05));
                    ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`; // red pulse
                    ctx.beginPath();
                    ctx.arc(0, -7, 1.5, 0, 2 * Math.PI);
                    ctx.fill();
                }
        
                ctx.restore();
            }
        });

    }, [droneStates, satellites, isDefenseActive, showAlert, spoofedZones, selectedSpoofedZone, cellTowers, droneControlType]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="bg-slate-900 rounded-lg border-2 border-slate-700 shadow-xl"
        />
    );
};