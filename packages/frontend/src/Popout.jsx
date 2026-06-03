import { useState } from "react";

function Popout({ onClose, onSave, itemToEdit }) {
  const rows = 3;
  const cols = 3;

  function shapeToCells(shape) {
    if (!Array.isArray(shape)) {
      return [];
    }

    return shape.flatMap((rowArray, row) =>
      rowArray
        .map((value, col) => (value === 1 ? { row, col } : null))
        .filter(Boolean),
    );
  }

  const [clickedCells, setClickedCells] = useState(
    itemToEdit ? shapeToCells(itemToEdit.shape) : [],
  );

  const [itemName, setItemName] = useState(itemToEdit?.name || "");
  const [description, setDescription] = useState(itemToEdit?.description || "");
  const [itemWeight, setItemWeight] = useState(
    itemToEdit?.weight !== undefined ? String(itemToEdit.weight) : "",
  );
  const [imageData, setImageData] = useState(itemToEdit?.imageData || "");

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

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 500;

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedImageData = canvas.toDataURL("image/jpeg", 0.7);
        setImageData(compressedImageData);
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  }

  function cellsToShape(cells, rows, cols) {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) =>
        cells.some((cell) => cell.row === row && cell.col === col) ? 1 : 0,
      ),
    );
  }

  function handleSave() {
    const numericWeight = Number(itemWeight);

    const savedItem = {
      name: itemName,
      description: description,
      imageData: imageData,
      tags: itemToEdit?.tags || [],
      weight: Number.isFinite(numericWeight) ? Math.max(0, numericWeight) : 0,
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

        <input
          className="weight-input"
          type="number"
          min="0"
          step="0.1"
          placeholder="Item weight"
          value={itemWeight}
          onChange={(e) => setItemWeight(e.target.value)}
        />

        <label className="image-picker-label">
          Choose Image
          <input
            className="image-picker-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {imageData && (
          <img className="image-preview" src={imageData} alt="Item preview" />
        )}

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
          {itemToEdit ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default Popout;
