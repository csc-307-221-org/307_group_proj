import React, { useState } from "react";

function Popout({ onClose }) {
  const rows = 3;
  const cols = 3;

  const [clickedCells, setClickedCells] = useState([]);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");

  function handleCellClick(index) {
    if (clickedCells.includes(index)) {
      setClickedCells(clickedCells.filter((cell) => cell !== index));
    } else {
      setClickedCells([...clickedCells, index]);
    }
  }

  function handleSave() {
    const savedItem = {
      name: itemName,
      description: description,
      cells: clickedCells,
    };

    console.log(savedItem);
  }

  return (
    <div className="white-popup-box">
      <button type="button" className="close-popup" onClick={onClose}>
        ×
      </button>

      <div className="popout-content">
        <input
          className="name-input"
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <div className="middle-row">
          <div className="popout-grid">
            {Array.from({ length: rows * cols }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  clickedCells.includes(index)
                    ? "popout-cell selected"
                    : "popout-cell"
                }
                onClick={() => handleCellClick(index)}
              ></button>
            ))}
          </div>

          <textarea
            className="description-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="save-item-button"
          onClick={handleSave}
          onClick={onClose}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default Popout;