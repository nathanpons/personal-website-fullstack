import { create } from "zustand";

// G constant for scaling
export const G = 6.6743e-11;

export const useSimulationStore = create((set) => ({
  timeStep: 0.1,
  bodies: [
    {
      name: "Sun",
      mass: 1.989e30,
      pos: [0, 0, 0],
      vel: [0, 0, 0],
      color: "yellow",
      radius: 10,
    },
    {
      name: "Earth",
      mass: 5.972e24,
      pos: [1.496e11, 0, 0],
      vel: [0, 29780, 0],
      color: "blue",
      radius: 3,
    },
    {
      name: "Moon",
      mass: 7.342e22,
      pos: [1.5e11, 0, 0],
      vel: [0, 30800, 0],
      color: "gray",
      radius: 1,
    },
  ],
  updateBodies: () =>
    set((state: { bodies: any[]; timeStep: any }) => {
      // 1. Clone mutable states
      const bodies = state.bodies.map((b) => ({ ...b }));
      const dt = state.timeStep;

      // 2. Calculate Forces
      const forces = bodies.map(() => [0, 0, 0]);
      for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;

          const p1 = bodies[i].pos;
          const p2 = bodies[j].pos;

          const dx = p2[0] - p1[0];
          const dy = p2[1] - p1[1];
          const dz = p2[2] - p1[2];

          const distSq = dx * dx + dy * dy + dz * dz;
          const dist = Math.sqrt(distSq);

          if (dist === 0) continue;

          // F = G * (m1 * m2) / r^2
          const forceMag =
            (G * bodies[i].mass * bodies[j].mass) / (distSq + 1e9); // Softening to prevent extreme gravity

          // Add directional force
          forces[i][0] += (forceMag * dx) / dist;
          forces[i][1] += (forceMag * dy) / dist;
          forces[i][2] += (forceMag * dz) / dist;
        }
      }

      // 3. Update Velocities and Positions
      bodies.forEach((body, i) => {
        // a = F / m
        const ax = forces[i][0] / body.mass;
        const ay = forces[i][1] / body.mass;
        const az = forces[i][2] / body.mass;

        // v = v + a * dt
        body.vel[0] += ax * dt;
        body.vel[1] += ay * dt;
        body.vel[2] += az * dt;

        // p = p + v * dt
        body.pos[0] += body.vel[0] * dt;
        body.pos[1] += body.vel[1] * dt;
        body.pos[2] += body.vel[2] * dt;
      });

      return { bodies };
    }),
}));
