import { jest } from "@jest/globals";

const saveMock = jest.fn();

const itemModelMock = jest.fn((item) => ({
  ...item,
  save: saveMock,
}));

itemModelMock.find = jest.fn();
itemModelMock.findOne = jest.fn();
itemModelMock.findOneAndDelete = jest.fn();
itemModelMock.findOneAndUpdate = jest.fn();

jest.unstable_mockModule("../src/models/item.js", () => ({
  default: itemModelMock,
}));

const itemServices = (await import("../src/services/item-services.js")).default;

describe("item-services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getItems finds items by ownerId", () => {
    itemServices.getItems("owner1");

    expect(itemModelMock.find).toHaveBeenCalledWith({
      ownerId: "owner1",
    });
  });

  test("findItemById finds one item by id and ownerId", () => {
    itemServices.findItemById("item1", "owner1");

    expect(itemModelMock.findOne).toHaveBeenCalledWith({
      _id: "item1",
      ownerId: "owner1",
    });
  });

  test("addItem creates and saves a new item", () => {
    const item = {
      name: "Handgun",
      ownerId: "owner1",
    };

    itemServices.addItem(item);

    expect(itemModelMock).toHaveBeenCalledWith(item);
    expect(saveMock).toHaveBeenCalled();
  });

  test("deleteItemById deletes one item by id and ownerId", () => {
    itemServices.deleteItemById("item1", "owner1");

    expect(itemModelMock.findOneAndDelete).toHaveBeenCalledWith({
      _id: "item1",
      ownerId: "owner1",
    });
  });

  test("updateItemById updates only allowed item fields", () => {
    const item = {
      name: "Shotgun",
      description: "Powerful weapon",
      tags: ["weapon"],
      shape: [[1, 1]],
      weight: 5,
      imageData: "image",
      ownerId: "should-not-update",
    };

    itemServices.updateItemById("item1", "owner1", item);

    expect(itemModelMock.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "item1",
        ownerId: "owner1",
      },
      {
        name: "Shotgun",
        description: "Powerful weapon",
        tags: ["weapon"],
        shape: [[1, 1]],
        weight: 5,
        imageData: "image",
      },
      {
        new: true,
        runValidators: true,
      },
    );
  });
});
