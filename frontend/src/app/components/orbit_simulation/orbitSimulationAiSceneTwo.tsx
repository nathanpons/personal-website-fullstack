import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useSimulationStore } from "./bodies";

// const CelestialBodies = () => {
//   const bodies = useSimulationStore((state) => state.bodies);
//   const updateBodies = useSimulationStore((state) => state.updateBodies);

//   // useFrame executes the numerical integration every render loop
//   useFrame(() => {
//     updateBodies();
//   });

//   return bodies.map((body, index) => (
//     <mesh key={index} position={body.pos}>
//       <sphereGeometry args={[body.radius, 32, 32]} />
//       <meshStandardMaterial
//         color={body.color}
//         emissive={body.color}
//         emissiveIntensity={0.2}
//       />
//     </mesh>
//   ));
// };

// export const SimulationCanvas = () => {
//   return (
//     <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
//       <Canvas camera={{ position: [0, 0, 300], fov: 60 }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[0, 0, 0]} intensity={10} />
//         <Stars />
//         <CelestialBodies />
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// };
