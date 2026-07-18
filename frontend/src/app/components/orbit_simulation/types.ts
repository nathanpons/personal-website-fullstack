import * as THREE from "three";

export interface CelestialBody {
  id: string;
  name: string;
  color: string;
  mass: number;
  radius: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}
