import validateShapeMatrix from "../src/utils/validateShapeMatrix.js";

describe("validateShapeMatrix", () => {
  test("returns true for a valid connected shape", () => {
    const shape = [
      [1, 1],
      [0, 1],
    ];

    expect(validateShapeMatrix(shape)).toBe(true);
  });

  test("throws an error if shape is empty", () => {
    expect(() => validateShapeMatrix([])).toThrow(
      "Item shape must be a non empty matrix.",
    );
  });

  test("throws an error if rows are not rectangular", () => {
    const shape = [[1, 0], [1]];

    expect(() => validateShapeMatrix(shape)).toThrow(
      "Item shape must be a rectangular matrix.",
    );
  });

  test("throws an error if cells are not 0 or 1", () => {
    const shape = [
      [1, 2],
      [0, 1],
    ];

    expect(() => validateShapeMatrix(shape)).toThrow(
      "Item shape cells must be either 0 or 1.",
    );
  });

  test("throws an error if shape has no occupied cells", () => {
    const shape = [
      [0, 0],
      [0, 0],
    ];

    expect(() => validateShapeMatrix(shape)).toThrow(
      "Item shape must contain at least one occupied cell.",
    );
  });

  test("throws an error if occupied cells are disconnected", () => {
    const shape = [
      [1, 0],
      [0, 1],
    ];

    expect(() => validateShapeMatrix(shape)).toThrow(
      "Item shape must be one connected shape using horizontal and vertical connections.",
    );
  });
});
