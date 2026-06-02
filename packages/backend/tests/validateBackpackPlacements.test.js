import validateBackpackPlacements from "../src/utils/validateBackpackPlacements.js";

describe("validateBackpackPlacements", () => {
  test("returns true for a valid backpack placement", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          _id: "item1",
          name: "Handgun",
          shape: [[1, 1]],
        },
      ],
      placements: [
        {
          backpackItemId: "item1",
          row: 0,
          col: 0,
          rotation: 0,
        },
      ],
    };

    expect(validateBackpackPlacements(backpack)).toBe(true);
  });

  test("throws an error if rows or cols are not integers", () => {
    const backpack = {
      rows: 4.5,
      cols: 4,
      items: [],
      placements: [],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      "Backpack rows and cols must be integers.",
    );
  });

  test("throws an error if an item is missing an _id", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          name: "Knife",
          shape: [[1]],
        },
      ],
      placements: [],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      "Every backpack item must have an _id.",
    );
  });

  test("throws an error if a placement references a missing item", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          _id: "item1",
          name: "Handgun",
          shape: [[1]],
        },
      ],
      placements: [
        {
          backpackItemId: "item2",
          row: 0,
          col: 0,
        },
      ],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      "A placement references an item that does not exist in this backpack.",
    );
  });

  test("throws an error if the same item is placed twice", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          _id: "item1",
          name: "Handgun",
          shape: [[1]],
        },
      ],
      placements: [
        {
          backpackItemId: "item1",
          row: 0,
          col: 0,
        },
        {
          backpackItemId: "item1",
          row: 1,
          col: 1,
        },
      ],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      'Item "Handgun" has more than one placement.',
    );
  });

  test("throws an error if a placed item is outside the backpack", () => {
    const backpack = {
      rows: 2,
      cols: 2,
      items: [
        {
          _id: "item1",
          name: "Rifle",
          shape: [[1, 1, 1]],
        },
      ],
      placements: [
        {
          backpackItemId: "item1",
          row: 0,
          col: 0,
        },
      ],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      'Item "Rifle" is outside the backpack at row 0, col 2.',
    );
  });

  test("throws an error if two items overlap", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          _id: "item1",
          name: "Handgun",
          shape: [[1]],
        },
        {
          _id: "item2",
          name: "Ammo",
          shape: [[1]],
        },
      ],
      placements: [
        {
          backpackItemId: "item1",
          row: 0,
          col: 0,
        },
        {
          backpackItemId: "item2",
          row: 0,
          col: 0,
        },
      ],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      'Items "Handgun" and "Ammo" overlap at row 0, col 0.',
    );
  });

  test("allows valid rotated placements", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          _id: "item1",
          name: "L Shape",
          shape: [
            [1, 0],
            [1, 1],
          ],
        },
      ],
      placements: [
        {
          backpackItemId: "item1",
          row: 0,
          col: 0,
          rotation: 90,
        },
      ],
    };

    expect(validateBackpackPlacements(backpack)).toBe(true);
  });

  test("throws an error for invalid rotation", () => {
    const backpack = {
      rows: 4,
      cols: 4,
      items: [
        {
          _id: "item1",
          name: "Handgun",
          shape: [[1]],
        },
      ],
      placements: [
        {
          backpackItemId: "item1",
          row: 0,
          col: 0,
          rotation: 45,
        },
      ],
    };

    expect(() => validateBackpackPlacements(backpack)).toThrow(
      "Placement rotation must be 0, 90, 180, or 270.",
    );
  });
});
