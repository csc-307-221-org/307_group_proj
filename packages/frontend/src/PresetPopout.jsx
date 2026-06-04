import { useState } from "react";

function PresetPopout({ onClose, onSave, presetToEdit }) {
  const [presetName, setPresetName] = useState(presetToEdit?.presetName || "");

  function handleSave() {
    onSave(presetName);
  }

  return (
    <div className="preset-popup-box">
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
          {presetToEdit ? "Update" : "Save"}
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
