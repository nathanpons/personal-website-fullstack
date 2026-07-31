import * as THREE from "three";

export interface CelestialBody {
  id: number;
  name?: string;
  color: string;
  mass: number;
  radius: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export interface SimulationProps {
  isPaused: boolean;
  timeScale: number;
  bodies: CelestialBody[];
  setBodies: React.Dispatch<React.SetStateAction<CelestialBody[]>>;
}
