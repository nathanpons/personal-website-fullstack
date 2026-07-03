"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewcube,
  Sphere,
} from "@react-three/drei";
import { useRef, Suspense, useEffect } from "react";
import * as THREE from "three";

// Gravitational constant (scaled for visual simulation)
const G = 1;

interface Body {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
}

function GravitySphere({
  args,
  position,
  color,
  mass = 1,
  initialVelocity = new THREE.Vector3(),
}: {
  args: [number, number, number];
  position: [number, number, number];
  color: string | number;
  mass?: number;
  initialVelocity?: THREE.Vector3;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<Body | null>(null);

  // Initialize body state on mount
  useEffect(() => {
    if (meshRef.current) {
      bodyRef.current = {
        mesh: meshRef.current,
        position: new THREE.Vector3(...position),
        velocity: initialVelocity.clone(),
        mass: mass || 1,
      };

      // Register this body with the global list (only if not already registered)
      const index = bodies.findIndex((b) => b === bodyRef.current);
      if (index === -1) {
        bodies.push(bodyRef.current!);
      }
    }

    return () => {
      // Cleanup when component unmounts
      const index = bodies.indexOf(bodyRef.current);
      if (index > -1) {
        bodies.splice(index, 1);
      }
    };
  }, [position, color, mass, initialVelocity]);

  // Apply gravitational forces from all other bodies
  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body || !meshRef.current) return;

    // Calculate forces from all other spheres (filter out nulls)
    for (const otherBody of bodies.filter((b) => b !== null)) {
      if (otherBody === body) continue;

      const distanceVector = new THREE.Vector3().subVectors(
        otherBody.position,
        body.position,
      );

      const distance = distanceVector.length();

      // Skip if too close to avoid singularity
      // if (distance < 0.1) continue;

      // Newton's law of universal gravitation: F = G * m1 * m2 / r^2
      const forceMagnitude =
        (G * body.mass * otherBody.mass) / (distance * distance);

      // Normalize and apply direction to velocity
      distanceVector.normalize().multiplyScalar(forceMagnitude);

      // Add the gravitational acceleration to current velocity
      body.velocity.add(distanceVector.clone().multiplyScalar(delta));
    }

    // Update mesh position by adding velocity * delta
    if (meshRef.current && body.position) {
      const newPosition = body.position.clone();
      newPosition.add(body.velocity.clone().multiplyScalar(delta));

      // Apply the new position to the mesh
      meshRef.current.position.copy(newPosition);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={args} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Global state for all bodies - using plain array instead of useRef
let bodies: Array<Body | null> = [];

export default function OrbitSimulationScene() {
  return (
    <div className="canvas-container">
      <Canvas
        style={{ background: "black" }}
        camera={{ position: [0, 196, 0], fov: 90, near: 0.01, far: 10000 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <GizmoHelper alignment="top-left" margin={[80, 80]}>
            <GizmoViewcube />
          </GizmoHelper>
          <OrbitControls enableRotate makeDefault zoomSpeed={5} />
          <ambientLight intensity={1} />

          {/* Central white sphere */}
          <Sphere args={[0.2, 32, 32]} position={[0, 0, 0]} />

          {/* Red sphere with initial velocity */}
          <GravitySphere
            args={[10, 64, 64]}
            position={[10, 0, 0]}
            color="red"
            mass={200}
            initialVelocity={new THREE.Vector3(0.05, 0, 0)}
          />

          {/* Blue sphere with different initial velocity */}
          <GravitySphere
            args={[10, 64, 64]}
            position={[0, 0, 10]}
            color="blue"
            mass={200}
            initialVelocity={new THREE.Vector3(0.05, 0, -0.05)}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
