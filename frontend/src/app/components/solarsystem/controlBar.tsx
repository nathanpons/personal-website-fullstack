"use client";

import { useState } from "react";
import { planetData } from "./planetData";

interface ControlBarProps {
  timeScale: number;
  onTimeScaleChange: (newScale: number) => void;
  selectedPlanet: string | null;
  onPlanetSelect: (planetId: string | null) => void;
  showOrbits: boolean;
  onShowOrbitsToggle: (show: boolean) => void;
  isPaused: boolean;
  onPauseToggle: (paused: boolean) => void;
}

export default function ControlBar({
  timeScale,
  onTimeScaleChange,
  selectedPlanet,
  onPlanetSelect,
  showOrbits,
  onShowOrbitsToggle,
  isPaused,
  onPauseToggle,
}: ControlBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const planetOptions = [
    { id: null, name: "Free View" },
    // Add planets from planetData
    ...Object.entries(planetData).flatMap(([id, data]) => {
      const options = [{ id, name: data.name }];

      // Add satellites if they exist on a planet
      if (data.satellites) {
        Object.entries(data.satellites).forEach(([satId, satData]) => {
          options.push({ id: satId, name: satData.name });
        });
      }

      return options;
    }),
  ];

  return (
    <div className="control-bar">
      <div className="control-bar-header">
        <h3>Solar System Controls</h3>
        <button
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "-" : "+"}
        </button>
      </div>

      {isExpanded && (
        <div className="control-bar-content">
          {/* Planet Selection */}
          <div className="control-group">
            <label htmlFor="planet-select">Focus Planet:</label>
            <select
              id="planet-select"
              value={selectedPlanet || ""}
              onChange={(e) => onPlanetSelect(e.target.value || null)}
            >
              {planetOptions.map((planet) => (
                <option key={planet.id || "free"} value={planet.id || ""}>
                  {planet.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Scale */}
          <div className="control-group">
            <label htmlFor="time-scale">
              Time Scale: {timeScale.toFixed(2)}x
            </label>
            <input
              id="time-scale"
              type="range"
              min="0"
              max="10"
              step="0.01"
              value={timeScale}
              onChange={(e) => onTimeScaleChange(parseFloat(e.target.value))}
            />
            <div className="range-labels">
              <span>0x</span>
              <span>10x</span>
            </div>
          </div>

          {/* Pause/Play */}
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={isPaused}
                onChange={(e) => onPauseToggle(e.target.checked)}
              />
              Pause Simulation
            </label>
          </div>

          {/* Show Orbits */}
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => onShowOrbitsToggle(e.target.checked)}
              />
              Show Orbit Lines
            </label>
          </div>

          {/* Reset Camera Button */}
          <div className="control-group">
            <button
              className="reset-button"
              onClick={() => onPlanetSelect(null)}
            >
              Reset Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
