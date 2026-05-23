import React from "react";

function Presets({ presets = [], onSavePreset, onLoadPreset }) {
  function handleSave() {
    if (onSavePreset) {
      onSavePreset();
    }
  }

  return (
    <div className="presets">
      <div className="presets-buttons">
        <button type="button" onClick={handleSave}>
          Save
        </button>

        <button type="button">Preset</button>
      </div>

      <div className="presets-title">Presets</div>

      <div className="presets-list">
        {presets.length === 0 ? (
          <div className="preset-box">No presets yet</div>
        ) : (
          presets.map((preset, index) => (
            <button
              type="button"
              className="preset-box"
              key={index}
              onClick={() => onLoadPreset && onLoadPreset(preset)}
            >
              <div>{preset.name}</div>
              <div>
                {preset.rows} x {preset.cols}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default Presets;