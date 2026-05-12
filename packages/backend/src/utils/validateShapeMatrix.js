function validateShapeMatrix(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Item shape must be a non empty matrix.");
  }

  const columnLength = value[0].length;

  if (columnLength === 0) {
    throw new Error("Item shape rows must not be empty.");
  }

  const occupiedCells = [];

  for (let row = 0; row < value.length; row++) {
    if (!Array.isArray(value[row]) || value[row].length !== columnLength) {
      throw new Error("Item shape must be a rectangular matrix.");
    }

    for (let col = 0; col < value[row].length; col++) {
      const cell = value[row][col];

      if (cell !== 0 && cell !== 1) {
        throw new Error("Item shape cells must be either 0 or 1.");
      }

      if (cell === 1) {
        occupiedCells.push([row, col]);
      }
    }
  }

  if (occupiedCells.length === 0) {
    throw new Error("Item shape must contain at least one occupied cell.");
  }

  const visited = new Set();
  const stack = [occupiedCells[0]];

  const getKey = (row, col) => `${row},${col}`;

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (stack.length > 0) {
    const [row, col] = stack.pop();
    const key = getKey(row, col);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    for (const [rowChange, colChange] of directions) {
      const nextRow = row + rowChange;
      const nextCol = col + colChange;

      const isInsideMatrix =
        nextRow >= 0 &&
        nextRow < value.length &&
        nextCol >= 0 &&
        nextCol < columnLength;

      if (isInsideMatrix && value[nextRow][nextCol] === 1) {
        stack.push([nextRow, nextCol]);
      }
    }
  }

  if (visited.size !== occupiedCells.length) {
    throw new Error(
      "Item shape must be one connected shape using horizontal and vertical connections.",
    );
  }

  return true;
}

export default validateShapeMatrix;
