import backpackModel from "../models/backpack.js";

function getBackpacks(ownerId) {
  return backpackModel.find({ ownerId: ownerId });
}

function findBackpackById(id, ownerId) {
  return backpackModel.findOne({ _id: id, ownerId: ownerId });
}

function addBackpack(backpack) {
  const backpackToAdd = new backpackModel(backpack);
  const promise = backpackToAdd.save();

  return promise;
}

function deleteBackpackById(id, ownerId) {
  return backpackModel.findOneAndDelete({ _id: id, ownerId: ownerId });
}

async function updateBackpackById(id, ownerId, backpack) {
  const existingBackpack = await backpackModel.findOne({
    _id: id,
    ownerId: ownerId,
  });

  if (existingBackpack === null) {
    return null;
  }

  const allowedFields = [
    "name",
    "description",
    "rows",
    "cols",
    "items",
    "placements",
    "weightsum",
  ];

  for (const field of allowedFields) {
    if (backpack[field] !== undefined) {
      existingBackpack[field] = backpack[field];
    }
  }

  return existingBackpack.save();
}

export default {
  getBackpacks,
  findBackpackById,
  addBackpack,
  deleteBackpackById,
  updateBackpackById,
};
