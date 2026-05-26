import { useState } from "react";

function SpawnedItem({ item, onDelete }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(false);

  const cells = item.cells || [];

  const minRow = cells.length ? Math.min(...cells.map((cell) => cell.row)) : 0;
  const maxRow = cells.length ? Math.max(...cells.map((cell) => cell.row)) : 0;
  const minCol = cells.length ? Math.min(...cells.map((cell) => cell.col)) : 0;
  const maxCol = cells.length ? Math.max(...cells.map((cell) => cell.col)) : 0;

  const shapeRows = maxRow - minRow + 1;
  const shapeCols = maxCol - minCol + 1;

  function getCellSize() {
    return (
      Number(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--matrix-cell-size")
          .replace("px", ""),
      ) || 60
    );
  }

  function getGridSize(gridBox) {
    const styles = getComputedStyle(gridBox);

    return {
      rows: styles.gridTemplateRows.split(" ").length,
      cols: styles.gridTemplateColumns.split(" ").length,
    };
  }

  function isTouching(rect1, rect2) {
    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  }

  function startDrag(e) {
    e.preventDefault();

    const itemElement = e.currentTarget;
    const startRect = itemElement.getBoundingClientRect();

    const offsetX = e.clientX - startRect.left;
    const offsetY = e.clientY - startRect.top;

    setPos({
      x: startRect.left,
      y: startRect.top,
    });

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

      const finalX = upEvent.clientX - offsetX;
      const finalY = upEvent.clientY - offsetY;

      const itemRect = {
        left: finalX,
        top: finalY,
        right: finalX + itemElement.offsetWidth,
        bottom: finalY + itemElement.offsetHeight,
      };

      const deleteBox = document.querySelector(".delete-box");

      if (
        deleteBox &&
        isTouching(itemRect, deleteBox.getBoundingClientRect())
      ) {
        onDelete(item);
        cleanup();
        return;
      }

      const gridBox = document.querySelector(".grid-box");

      if (!gridBox) {
        setPos({ x: finalX, y: finalY });
        cleanup();
        return;
      }

      const gridRect = gridBox.getBoundingClientRect();
      const gridStyles = getComputedStyle(gridBox);
      const cellSize = getCellSize();
      const gridSize = getGridSize(gridBox);

      const nameElement = itemElement.querySelector(".spawned-shape-name");
      const nameHeight = nameElement?.offsetHeight || 0;
      const nameMargin =
        parseFloat(getComputedStyle(nameElement).marginBottom) || 0;

      const gridStartX =
        gridRect.left + (parseFloat(gridStyles.borderLeftWidth) || 0);

      const gridStartY =
        gridRect.top + (parseFloat(gridStyles.borderTopWidth) || 0);

      const shapeX = finalX;
      const shapeY = finalY + nameHeight + nameMargin;

      const col = Math.round((shapeX - gridStartX) / cellSize);
      const row = Math.round((shapeY - gridStartY) / cellSize);

      const fits =
        row >= 0 &&
        col >= 0 &&
        row + shapeRows <= gridSize.rows &&
        col + shapeCols <= gridSize.cols;

      if (fits) {
        setPos({
          x: gridStartX + col * cellSize,
          y: gridStartY + row * cellSize - nameHeight - nameMargin,
        });
      } else {
        setPos({ x: finalX, y: finalY });
      }

      cleanup();
    }

    function cleanup() {
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
              left: pos.x,
              top: pos.y,
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
          />
        ))}
      </div>
    </div>
  );
}

export default SpawnedItem;
