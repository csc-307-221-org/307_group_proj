import validateShapeMatrix from "./validateShapeMatrix.js";

function getIdString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return value.toString();
}

function rotateShapeMatrix(shape, rotation) {
  if (rotation === 0) {
    return shape;
  }

  if (rotation === 90) {
    return shape[0].map((_, col) => shape.map((row) => row[col]).reverse());
  }

  if (rotation === 180) {
    return shape.map((row) => [...row].reverse()).reverse();
  }

  if (rotation === 270) {
    return shape[0].map((_, col) =>
      shape.map((row) => row[row.length - 1 - col]),
    );
  }

  throw new Error("Placement rotation must be 0, 90, 180, or 270.");
}

function validateBackpackPlacements(backpack) {
  const rows = backpack.rows;
  const cols = backpack.cols;
  const items = backpack.items || [];
  const placements = backpack.placements || [];

  if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
    throw new Error("Backpack rows and cols must be integers.");
  }

  const itemsById = new Map();

  for (const item of items) {
    const itemId = getIdString(item._id);

    if (itemId === null) {
      throw new Error("Every backpack item must have an _id.");
    }

    validateShapeMatrix(item.shape);
    itemsById.set(itemId, item);
  }

  const placedItemIds = new Set();
  const occupiedCells = new Map();

  for (const placement of placements) {
    const itemId = getIdString(placement.backpackItemId);

    if (itemId === null) {
      throw new Error("Every placement must have a backpackItemId.");
    }

    const item = itemsById.get(itemId);

    if (!item) {
      throw new Error(
        "A placement references an item that does not exist in this backpack.",
      );
    }

    if (placedItemIds.has(itemId)) {
      throw new Error(`Item "${item.name}" has more than one placement.`);
    }

    placedItemIds.add(itemId);

    const startRow = placement.row;
    const startCol = placement.col;

    if (!Number.isInteger(startRow) || !Number.isInteger(startCol)) {
      throw new Error("Placement row and col must be integers.");
    }

    const rotatedShape = rotateShapeMatrix(item.shape, placement.rotation ?? 0);

    for (let shapeRow = 0; shapeRow < rotatedShape.length; shapeRow++) {
      for (
        let shapeCol = 0;
        shapeCol < rotatedShape[shapeRow].length;
        shapeCol++
      ) {
        if (rotatedShape[shapeRow][shapeCol] !== 1) {
          continue;
        }

        const backpackRow = startRow + shapeRow;
        const backpackCol = startCol + shapeCol;

        const isOutsideBackpack =
          backpackRow < 0 ||
          backpackRow >= rows ||
          backpackCol < 0 ||
          backpackCol >= cols;

        if (isOutsideBackpack) {
          throw new Error(
            `Item "${item.name}" is outside the backpack at row ${backpackRow}, col ${backpackCol}.`,
          );
        }

        const cellKey = `${backpackRow},${backpackCol}`;
        const existingItem = occupiedCells.get(cellKey);

        if (existingItem) {
          throw new Error(
            `Items "${existingItem.name}" and "${item.name}" overlap at row ${backpackRow}, col ${backpackCol}.`,
          );
        }

        occupiedCells.set(cellKey, {
          itemId,
          name: item.name,
        });
      }
    }
  }

  return true;
}

export default validateBackpackPlacements;
