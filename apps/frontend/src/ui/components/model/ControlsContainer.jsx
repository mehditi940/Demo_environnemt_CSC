import React from "react";
import "../../styles/components/ControlsContainer.css";

const ControlsContainer = ({ parts, partSettings, onTogglePart, onOpacityChange }) => {
  return (
    <div className="controls-container">
      {parts.map((part, index) => {
        const settings = partSettings[part.name] || { visible: true, opacity: 1.0 };
        return (
          <div key={index} className="control-group">
            <label>
              <input
                type="checkbox"
                checked={settings.visible}
                onChange={(e) => onTogglePart(part.name, e.target.checked)}
              />
              {part.name}
            </label>
            <label>
              <input
                type="range"
                className="slider"
                min="0"
                max="1"
                step="0.01"
                value={settings.opacity}
                onChange={(e) => onOpacityChange(part.name, parseFloat(e.target.value))}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default ControlsContainer;
