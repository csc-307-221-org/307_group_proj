import React, { useState } from "react";

function Popout({ onClose, onSave }) {
  const rows = 3;
  const cols = 3;

  const [clickedCells, setClickedCells] = useState([]);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");

  function handleCellClick(row, col) {
    const cell = { row: row, col: col };

    const alreadyClicked = clickedCells.some(
      (clickedCell) => clickedCell.row === row && clickedCell.col === col,
    );

    if (alreadyClicked) {
      setClickedCells(
        clickedCells.filter(
          (clickedCell) => clickedCell.row !== row || clickedCell.col !== col,
        ),
      );
    } else {
      setClickedCells([...clickedCells, cell]);
    }
  }

  function cellsToShape(cells, rows, cols) {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) =>
        cells.some((cell) => cell.row === row && cell.col === col) ? 1 : 0,
      ),
    );
  }

  function handleSave() {
    const savedItem = {
      name: itemName,
      description: description,
      tags: [],
      weight: 0,
      shape: cellsToShape(clickedCells, rows, cols),
    };

    onSave(savedItem);
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
            {Array.from({ length: rows * cols }).map((_, index) => {
              const row = Math.floor(index / cols);
              const col = index % cols;

              const selected = clickedCells.some(
                (cell) => cell.row === row && cell.col === col,
              );

              return (
                <button
                  key={index}
                  type="button"
                  className={selected ? "popout-cell selected" : "popout-cell"}
                  onClick={() => handleCellClick(row, col)}
                ></button>
              );
            })}
          </div>

          <textarea
            className="description-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="button" className="save-item-button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}

export default Popout;
