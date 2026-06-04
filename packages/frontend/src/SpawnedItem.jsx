import { useState, useEffect } from "react";
import { putItemInPlace } from "./PutinPlace";

function SpawnedItem({
  item,
  onDelete,
  onFirstDrag,
  onPlaceItem,
  onRemoveItemFromMatrix,
  onCanPlaceItem,
  placedItems,
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(() => Boolean(item.hasBeenDragged));

  const cells = item.cells || [];

  const minRow = cells.length ? Math.min(...cells.map((cell) => cell.row)) : 0;
  const maxRow = cells.length ? Math.max(...cells.map((cell) => cell.row)) : 0;
  const minCol = cells.length ? Math.min(...cells.map((cell) => cell.col)) : 0;
  const maxCol = cells.length ? Math.max(...cells.map((cell) => cell.col)) : 0;

  const shapeRows = maxRow - minRow + 1;
  const shapeCols = maxCol - minCol + 1;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoved(Boolean(item.hasBeenDragged));
  }, [item.renderedId, item.hasBeenDragged]);

  useEffect(() => {
    function snap() {
      putItemInPlace(item, placedItems, setPos);
    }

    snap();

    window.addEventListener("resize", snap);
    window.addEventListener("scroll", snap, true);
    document.addEventListener("scroll", snap, true);

    return () => {
      window.removeEventListener("resize", snap);
      window.removeEventListener("scroll", snap, true);
      document.removeEventListener("scroll", snap, true);
    };
  }, [item, placedItems]);

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

    let didMove = false;
    let replacementSpawned = moved;
    const wasAlreadyMoved = moved;

    if (wasAlreadyMoved && onRemoveItemFromMatrix) {
      onRemoveItemFromMatrix(item);
    }

    setPos({
      x: startRect.left,
      y: startRect.top,
    });

    setDragging(true);

    function getItemRect(x, y) {
      return {
        left: x,
        top: y,
        right: x + itemElement.offsetWidth,
        bottom: y + itemElement.offsetHeight,
      };
    }

    function getDeleteBox() {
      return document.querySelector(".delete-box");
    }

    function setDeleteBoxHighlight(isActive) {
      const deleteBox = getDeleteBox();

      if (!deleteBox) {
        return;
      }

      deleteBox.classList.toggle("delete-box-active", isActive);
    }

    function moveItem(moveEvent) {
      didMove = true;

      const nextX = moveEvent.clientX - offsetX;
      const nextY = moveEvent.clientY - offsetY;

      if (!replacementSpawned) {
        onFirstDrag?.(item);
        replacementSpawned = true;
        setMoved(true);
      }

      setPos({
        x: nextX,
        y: nextY,
      });

      const deleteBox = getDeleteBox();

      if (!deleteBox) {
        return;
      }

      const isOverDeleteBox = isTouching(
        getItemRect(nextX, nextY),
        deleteBox.getBoundingClientRect(),
      );

      setDeleteBoxHighlight(isOverDeleteBox);
    }

    function stopDrag(upEvent) {
      setDragging(false);

      if (!didMove) {
        cleanup();
        return;
      }

      const finalX = upEvent.clientX - offsetX;
      const finalY = upEvent.clientY - offsetY;

      const itemRect = getItemRect(finalX, finalY);
      const deleteBox = getDeleteBox();

      const shouldDelete =
        deleteBox && isTouching(itemRect, deleteBox.getBoundingClientRect());

      if (shouldDelete) {
        if (onRemoveItemFromMatrix) {
          onRemoveItemFromMatrix(item);
        }

        onDelete?.(item);
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

      if (!isTouching(itemRect, gridRect)) {
        setPos({ x: finalX, y: finalY });
        cleanup();
        return;
      }

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

      if (!fits) {
        setPos({ x: finalX, y: finalY });
        cleanup();
        return;
      }

      const spotIsOpen = onCanPlaceItem ? onCanPlaceItem(item, row, col) : true;

      if (!spotIsOpen) {
        alert("That spot already has an item.");

        setPos({
          x: finalX,
          y: finalY,
        });

        cleanup();
        return;
      }

      setPos({
        x: gridStartX + col * cellSize,
        y: gridStartY + row * cellSize - nameHeight - nameMargin,
      });

      if (onPlaceItem) {
        onPlaceItem(item, row, col);
      }

      cleanup();
    }

    function cleanup() {
      setDeleteBoxHighlight(false);
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
              transform: "scale(1)",
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
        {cells.map((cell, index) => {
          const row = cell.row - minRow;
          const col = cell.col - minCol;

          const imageStyle = item.imageData
            ? {
                backgroundImage: `url(${item.imageData})`,
                backgroundSize: `${shapeCols * 100}% ${shapeRows * 100}%`,
                backgroundPosition: `${
                  shapeCols === 1 ? 0 : (col / (shapeCols - 1)) * 100
                }% ${shapeRows === 1 ? 0 : (row / (shapeRows - 1)) * 100}%`,
              }
            : {};

          return (
            <div
              key={index}
              className="spawned-shape-cell filled"
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
                ...imageStyle,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default SpawnedItem;
