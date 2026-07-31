"use client";

import { useState } from "react";

interface ControlBarProps {
  timeScale: number;
  onTimeScaleChange: (newScale: number) => void;
  isPaused: boolean;
  onPauseToggle: (paused: boolean) => void;
  onReset: () => void;
}

export default function ControlBar({
  timeScale,
  onTimeScaleChange,
  isPaused,
  onPauseToggle,
  onReset,
}: ControlBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="control-bar">
      <div className="control-bar-header">
        <h3>Orbit Sim Controls</h3>
        <button
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "-" : "+"}
        </button>
      </div>

      {isExpanded && (
        <div className="control-bar-content">
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

          {/* Reset Camera Button */}
          <div className="control-group">
            <button className="reset-button" onClick={() => onReset()}>
              Reset Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
