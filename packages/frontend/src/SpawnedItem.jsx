import React, { useState } from "react";

function SpawnedItem({ item }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(false);

  const cells = item.cells || [];

  const rows = cells.map((cell) => cell.row);
  const cols = cells.map((cell) => cell.col);

  const minRow = cells.length ? Math.min(...rows) : 0;
  const maxRow = cells.length ? Math.max(...rows) : 0;
  const minCol = cells.length ? Math.min(...cols) : 0;
  const maxCol = cells.length ? Math.max(...cols) : 0;

  const shapeRows = maxRow - minRow + 1;
  const shapeCols = maxCol - minCol + 1;

  function getMatrixCellSize() {
    const size = getComputedStyle(document.documentElement)
      .getPropertyValue("--matrix-cell-size")
      .replace("px", "");

    return Number(size) || 60;
  }

  function getMatrixSize(gridBox) {
    const styles = getComputedStyle(gridBox);

    const columns = styles.gridTemplateColumns.split(" ").length;
    const rows = styles.gridTemplateRows.split(" ").length;

    return { rows, columns };
  }

  function startDrag(e) {
    e.preventDefault();

    const itemElement = e.currentTarget;
    const rect = itemElement.getBoundingClientRect();

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragging(true);
    setMoved(true);

    function moveItem(moveEvent) {
      setPos({
        x: moveEvent.clientX - offsetX,
        y: moveEvent.clientY - offsetY,
      });
    }

    function stopDrag(upEvent) {
      setDragging(false);

      const gridBox = document.querySelector(".grid-box");

      if (gridBox) {
        const gridRect = gridBox.getBoundingClientRect();
        const cellSize = getMatrixCellSize();
        const matrixSize = getMatrixSize(gridBox);

        const nameElement = itemElement.querySelector(".spawned-shape-name");

        const nameHeight = nameElement?.offsetHeight || 0;

        const nameMargin =
          parseFloat(getComputedStyle(nameElement).marginBottom) || 0;

        const itemX = upEvent.clientX - offsetX;
        const itemY = upEvent.clientY - offsetY + nameHeight + nameMargin;

        const borderLeft =
          parseFloat(getComputedStyle(gridBox).borderLeftWidth) || 0;

        const borderTop =
          parseFloat(getComputedStyle(gridBox).borderTopWidth) || 0;

        const gridStartX = gridRect.left + borderLeft;
        const gridStartY = gridRect.top + borderTop;

        const col = Math.round((itemX - gridStartX) / cellSize);
        const row = Math.round((itemY - gridStartY) / cellSize);

        const fitsInsideMatrix =
          row >= 0 &&
          col >= 0 &&
          row + shapeRows <= matrixSize.rows &&
          col + shapeCols <= matrixSize.columns;

        if (fitsInsideMatrix) {
          setPos({
            x: gridStartX + col * cellSize,
            y: gridStartY + row * cellSize - nameHeight - nameMargin,
          });
        } else {
          setPos({
            x: upEvent.clientX - offsetX,
            y: upEvent.clientY - offsetY,
          });
        }
      } else {
        setPos({
          x: upEvent.clientX - offsetX,
          y: upEvent.clientY - offsetY,
        });
      }

      window.removeEventListener("mousemove", moveItem);
      window.removeEventListener("mouseup", stopDrag);
    }

    window.addEventListener("mousemove", moveItem);
    window.addEventListener("mouseup", stopDrag);
  }

  return (
    <div
      className="spawned-shape"
      onMouseDown={startDrag}
      style={
        moved
          ? {
              position: "fixed",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              margin: 0,
              zIndex: 99999,
              cursor: dragging ? "grabbing" : "grab",
            }
          : undefined
      }
    >
      <div className="spawned-shape-name">{item.name || "Unnamed"}</div>

      <div
        className="spawned-shape-grid"
        style={{
          gridTemplateColumns: `repeat(${shapeCols}, var(--matrix-cell-size))`,
          gridTemplateRows: `repeat(${shapeRows}, var(--matrix-cell-size))`,
        }}
      >
        {cells.map((cell, index) => (
          <div
            key={index}
            className="spawned-shape-cell filled"
            style={{
              gridColumn: cell.col - minCol + 1,
              gridRow: cell.row - minRow + 1,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default SpawnedItem;
