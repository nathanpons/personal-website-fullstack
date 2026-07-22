"use client";
// import React, { useRef, useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Html } from "@react-three/drei";
// import * as THREE from "three";
// import { CelestialBody } from "./types";
// import { useNBodyPhysics } from "./useNBodyPhysics";

// const INITIAL_BODIES: CelestialBody[] = [
//   {
//     id: "1",
//     name: "Sun",
//     mass: 1.989e30,
//     radius: 5,
//     color: "yellow",
//     position: new THREE.Vector3(0, 0, 0),
//     velocity: new THREE.Vector3(0, 0, 0),
//   },
//   {
//     id: "2",
//     name: "Planet A",
//     mass: 5.972e24,
//     radius: 1,
//     color: "blue",
//     position: new THREE.Vector3(20, 0, 0),
//     velocity: new THREE.Vector3(0, 0, 2.5e4),
//   },
// ];

// export default function SolarSystem(): React.JSX.Element {
//   const [bodies, setBodies] = useState<CelestialBody[]>(INITIAL_BODIES);
//   const timeRef = useRef(0);
//   // useNBodyPhysics(bodies, setBodies);

//   return (
//     <div className="canvas-container">
//       <Canvas
//         style={{ background: "black" }}
//         camera={{ position: [-196, 64, 64], fov: 90, near: 0.01, far: 10000 }}
//         gl={{
//           antialias: true,
//           powerPreference: "high-performance",
//           alpha: false,
//         }}
//         dpr={[1, 1.5]} // Limit pixel ratio
//       >
//         <ambientLight intensity={1} />
//         <pointLight position={[0, 10, 0]} intensity={2} />

//         {bodies.map((body) => (
//           <mesh key={body.id} position={body.position.toArray()}>
//             <sphereGeometry args={[body.radius, 32, 32]} />
//             <meshStandardMaterial color={body.color} />
//             <Html distanceFactor={10}>
//               <div
//                 style={{
//                   color: "white",
//                   background: "rgba(0,0,0,0.5)",
//                   padding: "2px 5px",
//                   borderRadius: "3px",
//                 }}
//               >
//                 {body.name}
//               </div>
//             </Html>
//           </mesh>
//         ))}

//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewcube } from "@react-three/drei";
import * as THREE from "three";

// Define the structure of each celestial body
interface CelestialBody {
  id: number;
  mass: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: string;
  radius: number;
}

const G = 1; // Gravitational constant

const ThreeBodySimulation: React.FC = () => {
  // Initial state setup with type safety
  const [bodies, setBodies] = useState<CelestialBody[]>([
    {
      id: 1,
      mass: 50,
      pos: new THREE.Vector3(-3, 2, 0),
      vel: new THREE.Vector3(0.01, 0.05, 0),
      color: "red",
      radius: 0.4,
    },
    {
      id: 2,
      mass: 50,
      pos: new THREE.Vector3(3, -2, 0),
      vel: new THREE.Vector3(-1, -0.02, 0.01),
      color: "cyan",
      radius: 0.4,
    },
    {
      id: 3,
      mass: 50,
      pos: new THREE.Vector3(0, 0, 0),
      vel: new THREE.Vector3(0.01, -0.03, -0.01),
      color: "magenta",
      radius: 0.6,
    },
  ]);

  // Typed ref array for the 3D meshes
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    // Clamp delta to prevent massive physics jumps on frame drops
    const dt = Math.min(delta, 0.1);

    // Deep copy structures to keep state immutability
    const newBodies = bodies.map((b) => ({
      ...b,
      pos: b.pos.clone(),
      vel: b.vel.clone(),
    }));

    // Initialize an array of zeroed force vectors
    const forces = newBodies.map(() => new THREE.Vector3(0, 0, 0));

    // Calculate Gravitational forces between all distinct pairs
    for (let i = 0; i < newBodies.length; i++) {
      for (let j = 0; j < newBodies.length; j++) {
        if (i !== j) {
          const deltaVec = new THREE.Vector3().subVectors(
            newBodies[j].pos,
            newBodies[i].pos,
          );
          const distance = deltaVec.length();

          // Smooth gravity at ultra-short distances to avoid infinite force singularities
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

    // Apply forces to update velocities and positions
    newBodies.forEach((body, index) => {
      const acceleration = forces[index].divideScalar(body.mass); // a = F / m
      body.vel.addScaledVector(acceleration, dt); // v = v + a * dt
      body.pos.addScaledVector(body.vel, dt); // x = x + v * dt

      // Directly write to the raw three.js mesh position for 60fps performance
      const mesh = meshRefs.current[index];
      if (mesh) {
        mesh.position.copy(body.pos);
      }
    });

    // Save calculation data back into state
    setBodies(newBodies);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      {bodies.map((body, index) => (
        <mesh
          key={body.id}
          ref={(el) => {
            meshRefs.current[index] = el;
          }}
          position={body.pos.toArray()}
        >
          <sphereGeometry args={[body.radius, 32, 32]} />
          <meshStandardMaterial
            color={body.color}
            emissive={body.color}
            emissiveIntensity={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
    </>
  );
};

export default function App() {
  return (
    <Canvas
      camera={{ position: [-64, 16, 16], fov: 45 }}
      style={{ width: "100vw", height: "100vh", background: "#050505" }}
    >
      <GizmoHelper alignment="top-left" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
      <ThreeBodySimulation />
      <OrbitControls />
    </Canvas>
  );
}
