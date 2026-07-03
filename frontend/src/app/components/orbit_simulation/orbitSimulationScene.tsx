"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewcube,
  Sphere,
} from "@react-three/drei";
import { useRef, Suspense, createContext, useState } from "react";
import * as THREE from "three";

function IcoSphere() {
  const icoRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (icoRef?.current != null) {
      icoRef.current.rotation.x += 0.002;
      icoRef.current.rotation.y += 0.005;
    }
  });
  return (
    <mesh ref={icoRef}>
      <icosahedronGeometry args={[2, 3]} />
      <meshBasicMaterial color={0x00ff00} />
    </mesh>
  );
}

export default function () {
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
        dpr={[1, 1.5]} // Limit pixel ratio
      >
        <Suspense fallback={null}>
          <GizmoHelper alignment="top-left" margin={[80, 80]}>
            <GizmoViewcube />
          </GizmoHelper>
          <OrbitControls enableRotate makeDefault zoomSpeed={5} />
          <ambientLight intensity={0.2} />
        </Suspense>
        <Sphere args={[0.2, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[10, 64, 64]} position={[100, 0, 0]}>
          <meshBasicMaterial color="red" />
        </Sphere>
        <Sphere args={[10, 64, 64]} position={[0, 0, 100]}>
          <meshBasicMaterial color="blue" />
        </Sphere>
      </Canvas>
    </div>
  );
}
