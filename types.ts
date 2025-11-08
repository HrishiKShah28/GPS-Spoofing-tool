export interface Vector2D {
  x: number;
  y: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  range: string;
  speed: number;
  altitude: number;
  defenseMethod: string;
  bestUseCase: string;
}

export interface DroneState {
  actualPosition: Vector2D;
  perceivedPosition: Vector2D;
  velocity: Vector2D;
  propellerAngle: number;
}

export interface SatelliteState {
  position: Vector2D;
  angle: number;
  orbitRadius: number;
}

export interface Telemetry {
  distanceToProtectedZone: number;
  altitude: number;
  positionError: number;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export type SimulationStage = 'ingress' | 'detected' | 'defense_active' | 'neutralized';

export interface AlertState {
    show: boolean;
    message: string;
}
