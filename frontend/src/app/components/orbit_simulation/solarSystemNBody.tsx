"use client";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { CelestialBody } from "./types";
import { useNBodyPhysics } from "./useNBodyPhysics";

const INITIAL_BODIES: CelestialBody[] = [
  {
    id: "1",
    name: "Sun",
    mass: 1.989e30,
    radius: 5,
    color: "yellow",
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
  },
  {
    id: "2",
    name: "Planet A",
    mass: 5.972e24,
    radius: 1,
    color: "blue",
    position: new THREE.Vector3(20, 0, 0),
    velocity: new THREE.Vector3(0, 0, 2.5e4),
  },
];

export default function SolarSystem(): React.JSX.Element {
  const [bodies, setBodies] = useState<CelestialBody[]>(INITIAL_BODIES);
  const timeRef = useRef(0);
  // useNBodyPhysics(bodies, setBodies);

  return (
    <div className="canvas-container">
      <Canvas
        style={{ background: "black" }}
        camera={{ position: [-196, 64, 64], fov: 90, near: 0.01, far: 10000 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        dpr={[1, 1.5]} // Limit pixel ratio
      >
        <ambientLight intensity={1} />
        <pointLight position={[0, 10, 0]} intensity={2} />

        {bodies.map((body) => (
          <mesh key={body.id} position={body.position.toArray()}>
            <sphereGeometry args={[body.radius, 32, 32]} />
            <meshStandardMaterial color={body.color} />
            <Html distanceFactor={10}>
              <div
                style={{
                  color: "white",
                  background: "rgba(0,0,0,0.5)",
                  padding: "2px 5px",
                  borderRadius: "3px",
                }}
              >
                {body.name}
              </div>
            </Html>
          </mesh>
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
