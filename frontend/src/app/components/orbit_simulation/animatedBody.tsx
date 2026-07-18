import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { Sphere } from "@react-three/drei";
import { CelestialBody } from "./types";

const animatedBody = forwardRef<THREE.Mesh, CelestialBody>(
  ({ id, name, color = "blue", mass, radius, position, velocity }, ref) => {
    const bodyRef = useRef<THREE.Mesh>(null);
    return (
      <>
        <Sphere />
      </>
    );
  },
);
