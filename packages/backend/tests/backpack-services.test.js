import { jest } from "@jest/globals";

const saveMock = jest.fn();

const backpackModelMock = jest.fn((backpack) => ({
  ...backpack,
  save: saveMock,
}));

backpackModelMock.find = jest.fn();
backpackModelMock.findOne = jest.fn();
backpackModelMock.findOneAndDelete = jest.fn();

jest.unstable_mockModule("../src/models/backpack.js", () => ({
  default: backpackModelMock,
}));

const backpackServices = (await import("../src/services/backpack-services.js"))
  .default;

describe("backpack-services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getBackpacks finds backpacks by ownerId", () => {
    backpackServices.getBackpacks("owner1");

    expect(backpackModelMock.find).toHaveBeenCalledWith({
      ownerId: "owner1",
    });
  });

  test("findBackpackById finds one backpack by id and ownerId", () => {
    backpackServices.findBackpackById("backpack1", "owner1");

    expect(backpackModelMock.findOne).toHaveBeenCalledWith({
      _id: "backpack1",
      ownerId: "owner1",
    });
  });

  test("addBackpack creates and saves a new backpack", () => {
    const backpack = {
      name: "Case",
      ownerId: "owner1",
    };

    backpackServices.addBackpack(backpack);

    expect(backpackModelMock).toHaveBeenCalledWith(backpack);
    expect(saveMock).toHaveBeenCalled();
  });

  test("deleteBackpackById deletes one backpack by id and ownerId", () => {
    backpackServices.deleteBackpackById("backpack1", "owner1");

    expect(backpackModelMock.findOneAndDelete).toHaveBeenCalledWith({
      _id: "backpack1",
      ownerId: "owner1",
    });
  });

  test("updateBackpackById returns null if backpack does not exist", async () => {
    backpackModelMock.findOne.mockResolvedValue(null);

    const result = await backpackServices.updateBackpackById(
      "backpack1",
      "owner1",
      { name: "Updated" },
    );

    expect(result).toBe(null);
  });

  test("updateBackpackById updates allowed fields and saves", async () => {
    const existingBackpack = {
      name: "Old Name",
      description: "Old description",
      rows: 4,
      cols: 4,
      items: [],
      placements: [],
      weightsum: 0,
      save: jest.fn().mockResolvedValue("saved backpack"),
    };

    backpackModelMock.findOne.mockResolvedValue(existingBackpack);

    const result = await backpackServices.updateBackpackById(
      "backpack1",
      "owner1",
      {
        name: "New Name",
        description: "New description",
        rows: 5,
        cols: 6,
        items: [{ name: "Item" }],
        placements: [{ row: 0, col: 0 }],
        weightsum: 10,
        ownerId: "should-not-update",
      },
    );

    expect(existingBackpack.name).toBe("New Name");
    expect(existingBackpack.description).toBe("New description");
    expect(existingBackpack.rows).toBe(5);
    expect(existingBackpack.cols).toBe(6);
    expect(existingBackpack.items).toEqual([{ name: "Item" }]);
    expect(existingBackpack.placements).toEqual([{ row: 0, col: 0 }]);
    expect(existingBackpack.weightsum).toBe(10);
    expect(existingBackpack.ownerId).toBeUndefined();
    expect(existingBackpack.save).toHaveBeenCalled();
    expect(result).toBe("saved backpack");
  });

  test("updateBackpackById skips fields that are undefined", async () => {
    const existingBackpack = {
      name: "Old Name",
      description: "Old description",
      save: jest.fn().mockResolvedValue("saved backpack"),
    };

    backpackModelMock.findOne.mockResolvedValue(existingBackpack);

    const result = await backpackServices.updateBackpackById(
      "backpack1",
      "owner1",
      {
        name: undefined,
        description: "New description",
      },
    );

    expect(existingBackpack.name).toBe("Old Name");
    expect(existingBackpack.description).toBe("New description");
    expect(existingBackpack.save).toHaveBeenCalled();
    expect(result).toBe("saved backpack");
  });
});
