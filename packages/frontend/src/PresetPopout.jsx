import { useState } from "react";

function PresetPopout({ onClose, onSave }) {
  const [presetName, setPresetName] = useState("");

  function handleSave() {
    onSave(presetName);
  }

  return (
    <div className="preset-popup-box">
      {/*
        this is kais cool button animation but it looks kind of cluttered here
        */}
      {/*
      <button type="button" className="preset-close-popup" onClick={onClose}>
        ×
      </button>
        */}
      <div className="preset-popout-content">
        <h2>Name Backpack</h2>

        <input
          className="preset-name-input"
          type="text"
          placeholder="Backpack name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
        <button
          type="button"
          className="preset-confirm-name-button"
          onClick={handleSave}
        >
          Save
        </button>

        <button
          type="button"
          className="preset-cancel-name-button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PresetPopout;
