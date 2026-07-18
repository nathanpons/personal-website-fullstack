import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CelestialBody } from "./types";

const G = 6.6743e-11;
const TIME_STEP = 0.5; // Frame delta multiplier

export const useNBodyPhysics = (
  bodies: CelestialBody[],
  setBodies: React.Dispatch<React.SetStateAction<CelestialBody[]>>,
) => {
  setBodies((prevBodies) => {
    const newBodies = prevBodies.map((body) => ({
      ...body,
      position: body.position.clone(),
      velocity: body.velocity.clone(),
    }));

    // Calc Forces
    const forces = newBodies.map(() => new THREE.Vector3(0, 0, 0));

    for (let i = 0; i < newBodies.length; i++) {
      for (let j = 0; j < newBodies.length; j++) {
        if (i === j) continue;

        const dir = newBodies[j].position.clone().sub(newBodies[i].position);
        const distSq = dir.lengthSq();

        if (distSq === 0) continue;

        // $F = \frac{G \cdot m_1 \cdot m_2}{r^2}$
        const forceMag = (G * newBodies[i].mass * newBodies[j].mass) / distSq;
        const force = dir.normalize().multiplyScalar(forceMag);
        forces[i].add(force);
      }
    }

    // Update velocities and positions
    newBodies.forEach((body, index) => {
      // A = F/M
      const acceleration = forces[index].divideScalar(body.mass);

      body.velocity.add(acceleration.multiplyScalar(TIME_STEP));
      body.position.add(body.velocity.clone().multiplyScalar(TIME_STEP));
    });

    return newBodies;
  });
};
