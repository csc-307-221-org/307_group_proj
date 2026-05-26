import React from "react";

function Presets({ presets = [], onSavePreset, onDeletePreset, onLoadPreset }) {
  function handleSave() {
    if (onSavePreset) {
      onSavePreset();
    }
  }

  function handleDelete(index) {
    if (onDeletePreset) {
      onDeletePreset(index);
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
            <React.Fragment key={index}>
              <button
                type="button"
                className="preset-box"
                onClick={() => onLoadPreset && onLoadPreset(preset)}
              >
                <div>{preset.name}</div>
                <div>
                  {preset.rows} x {preset.cols}
                </div>
              </button>
              <button
                type="button"
                className="preset-delete"
                onClick={() => handleDelete(index)}
              >
                delete
              </button>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

export default Presets;
