import { useState } from "react";

function PresetPopout({ onClose, onSave }) {
  const [presetName, setPresetName] = useState("");

  function handleSave() {
    onSave(presetName);
  }

  return (
    <div className="white-popup-box">
      {/*
        this is kais cool button animation but it looks kind of cluttered here
        */}
      <button type="button" className="close-popup" onClick={onClose}>
        ×
      </button>

      <div className="popout-content">
        <h1>Name Backpack</h1>

        <input
          className="name-input"
          type="text"
          placeholder="Preset ${presets.length + 1}"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
        <button
          type="button"
          className="confirm-name-button"
          onClick={handleSave}
        >
          Save
        </button>

        <button type="button" className="cancel-name-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PresetPopout;
