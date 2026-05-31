// packages/frontend/src/putItemInPlace.js

export function putItemInPlace(item, placedItems, setPos) {
  const gridBox = document.querySelector(".grid-box");

  if (!gridBox || !item || !placedItems) return;

  let found = null;

  placedItems.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell?.fullItem?.renderedId === item.renderedId) {
        found = {
          row: rowIndex - cell.itemPiece.row,
          col: colIndex - cell.itemPiece.col,
        };
      }
    });
  });

  if (!found) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const cellSize =
    parseFloat(rootStyle.getPropertyValue("--matrix-cell-size")) || 60;

  const gridRect = gridBox.getBoundingClientRect();
  const gridStyle = getComputedStyle(gridBox);

  const borderLeft = parseFloat(gridStyle.borderLeftWidth) || 0;
  const borderTop = parseFloat(gridStyle.borderTopWidth) || 0;

  const gap =
    parseFloat(gridStyle.gap) ||
    parseFloat(gridStyle.rowGap) ||
    parseFloat(gridStyle.columnGap) ||
    0;

  const SNAP_Y_OFFSET = 30;

  setPos({
    x: gridRect.left + borderLeft + found.col * (cellSize + gap),
    y: gridRect.top + borderTop + found.row * (cellSize + gap) - SNAP_Y_OFFSET,
  });
}