
export interface Vector2D {
  x: number;
  y: number;
}

export interface SpoofedZone {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
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

export type DroneControlType = 'gps' | 'sim';

export interface DroneState {
  id:string;
  actualPosition: Vector2D;
  perceivedPosition: Vector2D;
  velocity: Vector2D;
  propellerAngle: number;
  targetSpoofedZone: SpoofedZone;
  isNeutralized: boolean;
  controlType: DroneControlType;
}

export interface SatelliteState {
  position: Vector2D;
  angle: number;
  orbitRadius: number;
}

export interface Telemetry {
  closestDroneDistance: number;
  altitude: number;
  maxPositionError: number;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  activeDrones: number;
  neutralizedDrones: number;
  totalDrones: number;
}

export type SimulationStage = 'ingress' | 'detected' | 'defense_active' | 'neutralized';

export interface AlertState {
    show: boolean;
    message: string;
}
