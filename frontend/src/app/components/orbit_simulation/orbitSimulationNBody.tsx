"use client";
import React, { useCallback, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewcube,
  Trail,
} from "@react-three/drei";
import * as THREE from "three";
import { CelestialBody, SimulationProps } from "./types";
import ControlBar from "./controlBar";
import "./controlBar.css";

const G = 1;

const initialBodies: CelestialBody[] = [
  {
    id: 1,
    mass: 50,
    position: new THREE.Vector3(-3, 2, 0),
    velocity: new THREE.Vector3(0.01, 5, 0),
    color: "red",
    radius: 0.4,
  },
  {
    id: 2,
    mass: 50,
    position: new THREE.Vector3(3, -2, 0),
    velocity: new THREE.Vector3(-1, -0.02, 0.01),
    color: "cyan",
    radius: 0.2,
  },
  {
    id: 3,
    mass: 50,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0.01, -0.03, -0.01),
    color: "magenta",
    radius: 0.6,
  },
];

const ThreeBodySimulation: React.FC<SimulationProps> = ({
  isPaused,
  timeScale,
  bodies,
  setBodies,
}) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    // If paused skip all calculations
    if (isPaused || timeScale === 0) return;

    const dt = Math.min(delta, 0.1) * timeScale;

    const newBodies = bodies.map((b) => ({
      ...b,
      position: b.position.clone(),
      velocity: b.velocity.clone(),
    }));

    const forces = newBodies.map(() => new THREE.Vector3(0, 0, 0));

    for (let i = 0; i < newBodies.length; i++) {
      for (let j = 0; j < newBodies.length; j++) {
        if (i !== j) {
          const deltaVec = new THREE.Vector3().subVectors(
            newBodies[j].position,
            newBodies[i].position,
          );
          const distance = deltaVec.length();

          if (distance > 0.2) {
            const forceMagnitude =
              (G * newBodies[i].mass * newBodies[j].mass) /
              (distance * distance);
            const forceDirection = deltaVec.normalize();
            forces[i].add(forceDirection.multiplyScalar(forceMagnitude));
          }
        }
      }
    }

    newBodies.forEach((body, index) => {
      const acceleration = forces[index].divideScalar(body.mass); // a = F / m
      body.velocity.addScaledVector(acceleration, dt); // v = v + a * dt
      body.position.addScaledVector(body.velocity, dt); // x = x + v * dt

      // Directly write to the raw three.js mesh position for 60fps performance
      const mesh = meshRefs.current[index];
      if (mesh) {
        mesh.position.copy(body.position);
      }
    });

    setBodies(newBodies);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      {bodies.map((body, index) => (
        <Trail
          key={body.id}
          width={body.radius * 2} // Width of the trail ribbon
          length={12} // Number of points in the trail
          color={body.color} // Color matching the body
          attenuation={(t) => t * t} // Fade-out curve
        >
          <mesh
            ref={(el) => {
              meshRefs.current[index] = el;
            }}
            position={body.position.toArray()}
          >
            <sphereGeometry args={[body.radius, 32, 32]} />
            <meshStandardMaterial
              color={body.color}
              emissive={body.color}
              emissiveIntensity={0.3}
              roughness={0.2}
            />
          </mesh>
        </Trail>
      ))}
    </>
  );
};

export default function App() {
  const [isPaused, setIsPaused] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [bodies, setBodies] = useState<CelestialBody[]>(
    initialBodies.map((b) => ({
      ...b,
      position: b.position.clone(),
      velocity: b.velocity.clone(),
    })),
  );
  const handleReset = useCallback(() => {
    // Reset positions back to initial setup
    setBodies(
      initialBodies.map((b) => ({
        ...b,
        position: b.position.clone(),
        velocity: b.velocity.clone(),
      })),
    );
    setIsPaused(true);
  }, []);

  return (
    <div className="canvas-container">
      <ControlBar
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        isPaused={isPaused}
        onPauseToggle={setIsPaused}
        onReset={handleReset}
      />
      <Canvas
        camera={{ position: [-64, 16, 16], fov: 45 }}
        style={{ background: "#050505" }}
      >
        <GizmoHelper alignment="top-left" margin={[80, 80]}>
          <GizmoViewcube />
        </GizmoHelper>
        <ThreeBodySimulation
          isPaused={isPaused}
          timeScale={timeScale}
          bodies={bodies}
          setBodies={setBodies}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
