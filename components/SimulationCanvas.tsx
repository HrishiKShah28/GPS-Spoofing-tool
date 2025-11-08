import React, { useRef, useEffect } from 'react';
import type { DroneState, SatelliteState, Vector2D } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PROTECTED_ZONE, SAFE_ZONE } from '../constants';

interface SimulationCanvasProps {
    droneState: DroneState;
    satellites: SatelliteState[];
    isSpoofingActive: boolean;
    showAlert: boolean;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ droneState, satellites, isSpoofingActive, showAlert }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameCount = useRef(0);

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = '#e5e7eb'; // light gray
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
        // Protected Zone (Red)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(PROTECTED_ZONE.x, PROTECTED_ZONE.y, PROTECTED_ZONE.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Pulsing alert border
        if (showAlert) {
            const pulse = Math.abs(Math.sin(frameCount.current * 0.1));
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PROTECTED', PROTECTED_ZONE.x, PROTECTED_ZONE.y - 5);
        
        // Safe Diversion Zone (Green)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(SAFE_ZONE.x, SAFE_ZONE.y, SAFE_ZONE.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillText('SAFE ZONE', SAFE_ZONE.x, SAFE_ZONE.y - 5);
    };

    const drawDrone = (ctx: CanvasRenderingContext2D, { actualPosition, propellerAngle }: DroneState) => {
        ctx.save();
        ctx.translate(actualPosition.x, actualPosition.y);
        
        ctx.fillStyle = '#2563eb'; // Blue body
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 15, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#9ca3af'; // Gray arms
        const armLength = 20;
        const armAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
        
        armAngles.forEach(angle => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * armLength, Math.sin(angle) * armLength);
            ctx.stroke();
        });

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3b82f6'; // Blue propellers
        armAngles.forEach(angle => {
            const propX = Math.cos(angle) * armLength;
            const propY = Math.sin(angle) * armLength;
            ctx.save();
            ctx.translate(propX, propY);
            ctx.rotate(propellerAngle);
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(8, 0);
            ctx.stroke();
            ctx.restore();
        });

        ctx.restore();
    };

    const drawSpoofingElements = (ctx: CanvasRenderingContext2D, { actualPosition, perceivedPosition }: DroneState) => {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'; // orange
        ctx.beginPath();
        ctx.arc(perceivedPosition.x, perceivedPosition.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(actualPosition.x, actualPosition.y);
        ctx.lineTo(perceivedPosition.x, perceivedPosition.y);
        ctx.stroke();

        // Draw predictive path to safe zone
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        const controlX = (actualPosition.x + SAFE_ZONE.x) / 2 + (SAFE_ZONE.y - actualPosition.y) * 0.2;
        const controlY = (actualPosition.y + SAFE_ZONE.y) / 2 - (SAFE_ZONE.x - actualPosition.x) * 0.2;
        ctx.beginPath();
        ctx.moveTo(actualPosition.x, actualPosition.y);
        ctx.quadraticCurveTo(controlX, controlY, SAFE_ZONE.x, SAFE_ZONE.y);
        ctx.stroke();

        ctx.setLineDash([]);
    };

    const drawSatellites = (ctx: CanvasRenderingContext2D, sats: SatelliteState[], dronePos: Vector2D) => {
        sats.forEach(sat => {
            const satX = PROTECTED_ZONE.x + Math.cos(sat.angle) * sat.orbitRadius;
            const satY = PROTECTED_ZONE.y + Math.sin(sat.angle) * sat.orbitRadius;
            sat.position = { x: satX, y: satY };

            ctx.fillStyle = '#a855f7'; // purple
            ctx.beginPath();
            ctx.arc(satX, satY, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(satX, satY);
            ctx.lineTo(dronePos.x, dronePos.y);
            ctx.stroke();
        });
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        frameCount.current++;

        ctx.fillStyle = '#e0f2fe'; // light blue-gray
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        drawGrid(ctx);
        drawZones(ctx);
        drawSatellites(ctx, satellites, droneState.perceivedPosition);
        if (isSpoofingActive) {
            drawSpoofingElements(ctx, droneState);
        }
        drawDrone(ctx, droneState);
    }, [droneState, satellites, isSpoofingActive, showAlert]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="bg-white rounded-lg border-2 border-gray-200 shadow-xl"
        />
    );
};
