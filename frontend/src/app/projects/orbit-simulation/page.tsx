"use client";
import dynamic from "next/dynamic";

// Disable SSR for the 3D component
const OrbitSimulationScene = dynamic(
  () => import("@/app/components/orbit_simulation/orbitSimulationNBody"),
  {
    ssr: false,
  },
);

export default function Home() {
  return <OrbitSimulationScene />;
}
